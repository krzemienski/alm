from typing import List, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.project import Project
from app.schemas.project import (
    Project as ProjectSchema,
    ProjectCreate,
    ProjectUpdate,
)
from app.services.project_service import (
    get_projects,
    get_project,
    create_project,
    update_project,
    delete_project,
)

router = APIRouter()


@router.get("/", response_model=List[ProjectSchema])
def read_projects(
    list_id: int = None,
    category_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve projects with optional filtering by list_id and category_id.
    """
    return get_projects(
        db=db, list_id=list_id, category_id=category_id, skip=skip, limit=limit
    )


@router.post("/", response_model=ProjectSchema, status_code=status.HTTP_201_CREATED)
def create_new_project(
    project_in: ProjectCreate, db: Session = Depends(get_db)
) -> Any:
    """
    Create a new project.
    """
    try:
        # Create project and return the model instance
        project = create_project(db=db, project_in=project_in)
        
        # Manually convert to dict to avoid schema validation issues 
        return {
            "id": project.id,
            "list_id": project.list_id,
            "category_id": project.category_id,
            "title": project.title,
            "url": project.url,
            "description": project.description,
            "project_metadata": {} if project.project_metadata is None else project.project_metadata,
            "created_at": project.created_at,
            "updated_at": project.updated_at
        }
    except Exception as e:
        db.rollback()
        import traceback
        error_detail = f"Failed to create project: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create project: {str(e)}"
        )


@router.get("/{project_id}", response_model=ProjectSchema)
def read_project(project_id: int, db: Session = Depends(get_db)) -> Any:
    """
    Get a specific project by ID.
    """
    project = get_project(db=db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found",
        )
    return project


@router.put("/{project_id}", response_model=ProjectSchema)
def update_existing_project(
    project_id: int, project_in: ProjectUpdate, db: Session = Depends(get_db)
) -> Any:
    """
    Update an existing project.
    """
    project = get_project(db=db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found",
        )
    return update_project(db=db, project=project, project_in=project_in)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_project(project_id: int, db: Session = Depends(get_db)) -> None:
    """
    Delete a project.
    """
    project = get_project(db=db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found",
        )
    delete_project(db=db, project_id=project_id)
