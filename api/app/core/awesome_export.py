import time
from typing import List, Optional, Dict, Any

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.awesome_list import AwesomeList, Category, Item
from app.core.event_logger import emit_event


async def get_awesome_list_with_data(list_id: str, db: AsyncSession) -> Optional[AwesomeList]:
    """Get awesome list with all related data"""
    # Use selectinload to efficiently load all related data in one query
    result = await db.execute(
        select(AwesomeList)
        .where(AwesomeList.id == list_id)
        .options(
            selectinload(AwesomeList.categories)
        )
    )
    awesome_list = result.scalars().first()

    if not awesome_list:
        return None

    # Get top-level categories
    result = await db.execute(
        select(Category).where(
            and_(
                Category.list_id == list_id,
                Category.parent_id.is_(None)
            )
        ).order_by(Category.order)
    )
    top_categories = result.scalars().all()

    # Process each category separately to avoid relationship issues
    processed_categories = []

    for category in top_categories:
        # Get subcategories
        subcat_result = await db.execute(
            select(Category).where(
                Category.parent_id == category.id
            ).order_by(Category.order)
        )
        subcategories = subcat_result.scalars().all()

        # Get items for this category
        items_result = await db.execute(
            select(Item).where(
                Item.category_id == category.id
            ).order_by(Item.order)
        )
        items = items_result.scalars().all()

        # Create a new instance for the response to avoid SQLAlchemy relationship issues
        cat_dict = {
            "id": category.id,
            "name": category.name,
            "description": category.description,
            "list_id": category.list_id,
            "parent_id": category.parent_id,
            "order": category.order,
            "items": [],
            "subcategories": []
        }

        # Add items
        for item in items:
            cat_dict["items"].append({
                "id": item.id,
                "name": item.name,
                "url": item.url,
                "description": item.description,
                "category_id": item.category_id,
                "list_id": item.list_id,
                "order": item.order
            })

        # Process subcategories
        for subcat in subcategories:
            # Get items for this subcategory
            subcat_items_result = await db.execute(
                select(Item).where(
                    Item.category_id == subcat.id
                ).order_by(Item.order)
            )
            subcat_items = subcat_items_result.scalars().all()

            # Create subcategory dict
            subcat_dict = {
                "id": subcat.id,
                "name": subcat.name,
                "description": subcat.description,
                "list_id": subcat.list_id,
                "parent_id": subcat.parent_id,
                "order": subcat.order,
                "items": []
            }

            # Add subcategory items
            for item in subcat_items:
                subcat_dict["items"].append({
                    "id": item.id,
                    "name": item.name,
                    "url": item.url,
                    "description": item.description,
                    "category_id": item.category_id,
                    "list_id": item.list_id,
                    "order": item.order
                })

            cat_dict["subcategories"].append(subcat_dict)

        processed_categories.append(cat_dict)

    # Create a new awesome_list object for the response
    awesome_list_dict = {
        "id": awesome_list.id,
        "title": awesome_list.title,
        "description": awesome_list.description,
        "repo_url": awesome_list.repo_url,
        "owner": awesome_list.owner,
        "repo": awesome_list.repo,
        "categories": processed_categories
    }

    return awesome_list_dict


async def generate_markdown(awesome_list: Dict[str, Any], request_id: str) -> str:
    """Generate markdown from awesome list data"""
    start_time = time.time()

    markdown = f"# {awesome_list['title']}\n\n"

    if awesome_list['description']:
        markdown += f"{awesome_list['description']}\n\n"

    # Add table of contents
    markdown += "## Contents\n\n"

    for category in awesome_list['categories']:
        markdown += f"- [{category['name']}](#{category['name'].lower().replace(' ', '-')})\n"

    markdown += "\n"

    # Add categories, subcategories, and items
    for category in awesome_list['categories']:
        markdown += f"## {category['name']}\n\n"

        if category['description']:
            markdown += f"{category['description']}\n\n"

        # Add category items
        for item in category['items']:
            if item['description']:
                markdown += f"- [{item['name']}]({item['url']}) - {item['description']}\n"
            else:
                markdown += f"- [{item['name']}]({item['url']})\n"

        if category['items']:
            markdown += "\n"

        # Add subcategories
        for subcategory in category['subcategories']:
            markdown += f"### {subcategory['name']}\n\n"

            if subcategory['description']:
                markdown += f"{subcategory['description']}\n\n"

            # Add subcategory items
            for item in subcategory['items']:
                if item['description']:
                    markdown += f"- [{item['name']}]({item['url']}) - {item['description']}\n"
                else:
                    markdown += f"- [{item['name']}]({item['url']})\n"

            if subcategory['items']:
                markdown += "\n"

    await emit_event(
        "export:generate",
        detail={
            "size_bytes": len(markdown),
            "categories": len(awesome_list['categories'])
        },
        request_id=request_id,
        start_time=start_time
    )

    return markdown


async def export_awesome_list(list_id: str, request_id: str, db: AsyncSession) -> str:
    """Export an awesome list to markdown"""
    awesome_list = await get_awesome_list_with_data(list_id, db)

    if not awesome_list:
        raise ValueError(f"Awesome list with ID {list_id} not found")

    markdown = await generate_markdown(awesome_list, request_id)
    return markdown
