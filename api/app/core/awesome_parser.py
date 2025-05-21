import re
import time
import httpx
import subprocess
import tempfile
from typing import Dict, List, Tuple, Any, Optional
import os
from urllib.parse import urlparse

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.awesome_list import AwesomeList, Category, Item
from app.core.event_logger import emit_event

logger = structlog.get_logger()

# Regex patterns for parsing
TITLE_PATTERN = r"^#\s+(.+)$"
DESCRIPTION_PATTERN = r"^([^#\n][^\n]+)(?:\n|$)"
CATEGORY_PATTERN = r"^##\s+(.+)$"
SUBCATEGORY_PATTERN = r"^###\s+(.+)$"
ITEM_PATTERN = r"^\s*-\s+\[(.+?)\]\((.+?)\)(?:\s+-\s+(.+?))?$"


async def parse_repo_url(repo_url: str) -> Tuple[str, str, str]:
    """Parse GitHub repo URL into owner, repo, and raw README URL"""
    # Extract owner and repo from URL
    parsed_url = urlparse(repo_url)
    path_parts = parsed_url.path.strip("/").split("/")

    if len(path_parts) < 2 or parsed_url.netloc != "github.com":
        raise ValueError("Invalid GitHub repository URL")

    owner = path_parts[0]
    repo = path_parts[1]
    branch = "master"  # Default to master branch

    # Construct the raw content URL
    raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/refs/heads/{branch}/README.md"

    return owner, repo, raw_url


async def fetch_readme(raw_url: str, request_id: str) -> str:
    """Fetch README content from GitHub"""
    start_time = time.time()
    await emit_event(
        "import:start",
        detail={"url": raw_url},
        request_id=request_id
    )

    async with httpx.AsyncClient() as client:
        response = await client.get(raw_url)
        response.raise_for_status()
        content = response.text

    await emit_event(
        "import:download",
        detail={"size_bytes": len(content)},
        request_id=request_id,
        start_time=start_time
    )

    return content


async def validate_awesome_list(content: str, temp_dir: str, request_id: str) -> bool:
    """Validate README content with awesome-lint and awesome_bot"""
    # Create temporary README file
    readme_path = os.path.join(temp_dir, "README.md")
    with open(readme_path, "w") as f:
        f.write(content)

    # Run awesome-lint
    lint_start_time = time.time()
    lint_result = subprocess.run(
        ["awesome-lint", readme_path],
        capture_output=True,
        text=True
    )

    lint_success = lint_result.returncode == 0
    await emit_event(
        "validate:lint",
        status="ok" if lint_success else "error",
        detail={
            "success": lint_success,
            "output": lint_result.stdout if lint_success else lint_result.stderr
        },
        request_id=request_id,
        start_time=lint_start_time
    )

    if not lint_success:
        return False

    # Run awesome_bot for link checking
    link_start_time = time.time()
    link_result = subprocess.run(
        ["awesome_bot", readme_path, "--allow-redirect", "--allow-ssl"],
        capture_output=True,
        text=True
    )

    link_success = link_result.returncode == 0
    await emit_event(
        "validate:links",
        status="ok" if link_success else "error",
        detail={
            "success": link_success,
            "output": link_result.stdout
        },
        request_id=request_id,
        start_time=link_start_time
    )

    return link_success


async def parse_awesome_list(
    content: str,
    repo_url: str,
    owner: str,
    repo: str,
    request_id: str,
    db: AsyncSession
) -> Tuple[AwesomeList, int, int]:
    """Parse README content into database models"""
    start_time = time.time()

    lines = content.split("\n")
    title = ""
    description = ""

    # Extract title and description
    for line in lines:
        title_match = re.match(TITLE_PATTERN, line)
        if title_match:
            title = title_match.group(1).strip()
            continue

        if title and not description:
            desc_match = re.match(DESCRIPTION_PATTERN, line)
            if desc_match:
                description = desc_match.group(1).strip()
                break

    # Create awesome list record
    awesome_list = AwesomeList(
        title=title,
        description=description,
        repo_url=repo_url,
        owner=owner,
        repo=repo
    )
    db.add(awesome_list)
    await db.flush()  # Get the ID

    # Parse categories, subcategories, and items
    current_category = None
    current_subcategory = None
    cat_order = 0
    subcat_order = 0
    item_order = 0

    item_count = 0
    category_count = 0

    for line in lines:
        # Check for category
        cat_match = re.match(CATEGORY_PATTERN, line)
        if cat_match:
            name = cat_match.group(1).strip()
            current_category = Category(
                name=name,
                list_id=awesome_list.id,
                order=cat_order
            )
            cat_order += 1
            category_count += 1
            db.add(current_category)
            await db.flush()

            # Reset subcategory and item order
            current_subcategory = None
            subcat_order = 0
            item_order = 0
            continue

        # Check for subcategory
        subcat_match = re.match(SUBCATEGORY_PATTERN, line)
        if subcat_match and current_category:
            name = subcat_match.group(1).strip()
            current_subcategory = Category(
                name=name,
                list_id=awesome_list.id,
                parent_id=current_category.id,
                order=subcat_order
            )
            subcat_order += 1
            category_count += 1
            db.add(current_subcategory)
            await db.flush()

            # Reset item order
            item_order = 0
            continue

        # Check for item
        item_match = re.match(ITEM_PATTERN, line)
        if item_match:
            name = item_match.group(1).strip()
            url = item_match.group(2).strip()
            description = item_match.group(3).strip() if item_match.group(3) else ""

            # Determine parent category
            parent_category = current_subcategory if current_subcategory else current_category

            if parent_category:
                item = Item(
                    name=name,
                    url=url,
                    description=description,
                    category_id=parent_category.id,
                    list_id=awesome_list.id,
                    order=item_order
                )
                item_order += 1
                item_count += 1
                db.add(item)

    await db.commit()

    await emit_event(
        "import:parse",
        detail={
            "items": item_count,
            "categories": category_count
        },
        request_id=request_id,
        start_time=start_time
    )

    return awesome_list, item_count, category_count


async def import_awesome_list(
    repo_url: str,
    request_id: str,
    db: AsyncSession
) -> Dict[str, Any]:
    """Import an awesome list from GitHub"""
    owner, repo, raw_url = await parse_repo_url(repo_url)

    # Fetch README content
    content = await fetch_readme(raw_url, request_id)

    # Create temp directory for validation
    with tempfile.TemporaryDirectory() as temp_dir:
        # Validate the awesome list
        is_valid = await validate_awesome_list(content, temp_dir, request_id)

        if not is_valid:
            raise ValueError("Awesome list validation failed. Please check the event logs for details.")

    # Parse and store the awesome list
    awesome_list, item_count, category_count = await parse_awesome_list(
        content, repo_url, owner, repo, request_id, db
    )

    # Return import results
    return {
        "list_id": awesome_list.id,
        "title": awesome_list.title,
        "item_count": item_count,
        "category_count": category_count
    }
