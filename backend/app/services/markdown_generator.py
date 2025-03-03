from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.models.awesome_list import AwesomeList
from app.models.category import Category
from app.models.project import Project


def generate_readme(db: Session, awesome_list: AwesomeList) -> str:
    """
    Generate a README markdown file from an awesome list.
    """
    markdown_content = []
    
    # Add title
    markdown_content.append(f"# {awesome_list.title}")
    
    # Add description
    if awesome_list.description:
        markdown_content.append("")
        markdown_content.append(awesome_list.description)
    
    # Add table of contents
    markdown_content.append("")
    markdown_content.append("## Contents")
    markdown_content.append("")
    
    # Get all top-level categories
    top_categories = db.query(Category).filter(
        Category.list_id == awesome_list.id,
        Category.parent_category_id == None
    ).order_by(Category.order).all()
    
    # Add categories to table of contents
    for category in top_categories:
        markdown_content.append(f"- [{category.name}](#{category.name.lower().replace(' ', '-')})")
        
        # Get subcategories for the current category
        subcategories = db.query(Category).filter(
            Category.list_id == awesome_list.id,
            Category.parent_category_id == category.id
        ).order_by(Category.order).all()
        
        # Add subcategories to table of contents
        for subcategory in subcategories:
            markdown_content.append(f"  - [{subcategory.name}](#{subcategory.name.lower().replace(' ', '-')})")
    
    # Generate content for each category
    for category in top_categories:
        markdown_content.append("")
        markdown_content.append(f"## {category.name}")
        markdown_content.append("")
        
        # Get projects directly in this category
        category_projects = db.query(Project).filter(
            Project.list_id == awesome_list.id,
            Project.category_id == category.id
        ).all()
        
        # Add projects in this category
        for project in category_projects:
            markdown_content.append(f"* [{project.title}]({project.url}) - {project.description}")
        
        # Get subcategories
        subcategories = db.query(Category).filter(
            Category.list_id == awesome_list.id,
            Category.parent_category_id == category.id
        ).order_by(Category.order).all()
        
        # Add content for each subcategory
        for subcategory in subcategories:
            markdown_content.append("")
            markdown_content.append(f"### {subcategory.name}")
            markdown_content.append("")
            
            # Get projects in this subcategory
            subcategory_projects = db.query(Project).filter(
                Project.list_id == awesome_list.id,
                Project.category_id == subcategory.id
            ).all()
            
            # Add projects in this subcategory
            for project in subcategory_projects:
                markdown_content.append(f"* [{project.title}]({project.url}) - {project.description}")
    
    # Add license and contribute section as per awesome list guidelines
    markdown_content.append("")
    markdown_content.append("## License")
    markdown_content.append("")
    markdown_content.append("[![CC0](https://i.creativecommons.org/p/zero/1.0/88x31.png)](https://creativecommons.org/publicdomain/zero/1.0/)")
    
    # Join all lines
    return "\n".join(markdown_content)
