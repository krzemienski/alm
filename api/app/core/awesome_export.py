import time
from typing import List, Optional, Dict, Any

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.awesome_list import AwesomeList, Category, Item
from app.core.event_logger import emit_event


async def get_awesome_list_with_data(list_id: str, db: AsyncSession) -> Optional[AwesomeList]:
    """Get awesome list with all related data"""
    result = await db.execute(select(AwesomeList).where(AwesomeList.id == list_id))
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
    categories = result.scalars().all()

    # Get subcategories for each category
    for category in categories:
        result = await db.execute(
            select(Category).where(
                Category.parent_id == category.id
            ).order_by(Category.order)
        )
        category.subcategories = result.scalars().all()

        # Get items for the category
        result = await db.execute(
            select(Item).where(
                Item.category_id == category.id
            ).order_by(Item.order)
        )
        category.items = result.scalars().all()

        # Get items for each subcategory
        for subcategory in category.subcategories:
            result = await db.execute(
                select(Item).where(
                    Item.category_id == subcategory.id
                ).order_by(Item.order)
            )
            subcategory.items = result.scalars().all()

    awesome_list.categories = categories
    return awesome_list


async def generate_markdown(awesome_list: AwesomeList, request_id: str) -> str:
    """Generate markdown from awesome list data"""
    start_time = time.time()

    markdown = f"# {awesome_list.title}\n\n"

    if awesome_list.description:
        markdown += f"{awesome_list.description}\n\n"

    # Add table of contents
    markdown += "## Contents\n\n"

    for i, category in enumerate(awesome_list.categories):
        markdown += f"- [{category.name}](#{category.name.lower().replace(' ', '-')})\n"

    markdown += "\n"

    # Add categories, subcategories, and items
    for category in awesome_list.categories:
        markdown += f"## {category.name}\n\n"

        if category.description:
            markdown += f"{category.description}\n\n"

        # Add category items
        for item in category.items:
            if item.description:
                markdown += f"- [{item.name}]({item.url}) - {item.description}\n"
            else:
                markdown += f"- [{item.name}]({item.url})\n"

        if category.items:
            markdown += "\n"

        # Add subcategories
        for subcategory in category.subcategories:
            markdown += f"### {subcategory.name}\n\n"

            if subcategory.description:
                markdown += f"{subcategory.description}\n\n"

            # Add subcategory items
            for item in subcategory.items:
                if item.description:
                    markdown += f"- [{item.name}]({item.url}) - {item.description}\n"
                else:
                    markdown += f"- [{item.name}]({item.url})\n"

            if subcategory.items:
                markdown += "\n"

    await emit_event(
        "export:generate",
        detail={
            "size_bytes": len(markdown),
            "categories": len(awesome_list.categories)
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
