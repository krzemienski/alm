from typing import List, Optional, Dict
from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


def get_projects(
    db: Session,
    list_id: Optional[int] = None,
    category_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100
) -> List[Project]:
    """
    Retrieve projects with optional filtering by list_id and category_id.
    """
    query = db.query(Project)

    if list_id is not None:
        query = query.filter(Project.list_id == list_id)

    if category_id is not None:
        query = query.filter(Project.category_id == category_id)

    return query.offset(skip).limit(limit).all()


def get_project(db: Session, project_id: int) -> Optional[Project]:
    """
    Get a specific project by ID.
    """
    return db.query(Project).filter(Project.id == project_id).first()


def create_project(db: Session, project_in: ProjectCreate) -> Project:
    """
    Create a new project.
    """
    db_project = Project(
        list_id=project_in.list_id,
        category_id=project_in.category_id,
        title=project_in.title,
        url=str(project_in.url),
        description=project_in.description,
        project_metadata={} if project_in.project_metadata is None else project_in.project_metadata,
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def create_project_from_import(
    db: Session,
    list_id: int,
    category_id: int,
    title: str,
    url: str,
    description: str
) -> Project:
    """
    Create a new project during import process.
    """
    db_project = Project(
        list_id=list_id,
        category_id=category_id,
        title=title,
        url=url,
        description=description,
        project_metadata={},  # Initialize with empty dict to avoid validation errors
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def update_project(
    db: Session, project: Project, project_in: ProjectUpdate
) -> Project:
    """
    Update a project.
    """
    update_data = project_in.dict(exclude_unset=True)

    for field, value in update_data.items():
        if field == "url" and value is not None:
            value = str(value)
        elif field == "metadata":
            field = "project_metadata"
        setattr(project, field, value)

    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project_id: int) -> None:
    """
    Delete a project.
    """
    db_project = db.query(Project).filter(Project.id == project_id).first()
    db.delete(db_project)
    db.commit()
