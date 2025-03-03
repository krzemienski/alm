from typing import List, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
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


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_new_project(
    project_in: Dict[str, Any] = Body(...), db: Session = Depends(get_db)
) -> Any:
    """
    Create a new project.
    """
    try:
        # Manual validation
        required_fields = ["list_id", "category_id", "title", "url"]
        for field in required_fields:
            if field not in project_in:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Missing required field: {field}"
                )
        
        # Create project
        db_project = Project(
            list_id=project_in["list_id"],
            category_id=project_in["category_id"],
            title=project_in["title"],
            url=project_in["url"],
            description=project_in.get("description"),
            project_metadata=project_in.get("project_metadata", {})
        )
        
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        
        # Convert to dict to avoid schema validation
        return {
            "id": db_project.id,
            "list_id": db_project.list_id,
            "category_id": db_project.category_id,
            "title": db_project.title,
            "url": db_project.url,
            "description": db_project.description,
            "project_metadata": {} if db_project.project_metadata is None else db_project.project_metadata,
            "created_at": db_project.created_at,
            "updated_at": db_project.updated_at
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


@router.put("/{project_id}", status_code=status.HTTP_200_OK)
def update_existing_project(
    project_id: int, project_update: Dict[str, Any] = Body(...), db: Session = Depends(get_db)
) -> Any:
    """
    Update an existing project.
    """
    try:
        # Find the project
        project = get_project(db=db, project_id=project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID {project_id} not found",
            )
        
        # Update fields if provided
        if "title" in project_update:
            project.title = project_update["title"]
        
        if "url" in project_update:
            project.url = project_update["url"]
            
        if "description" in project_update:
            project.description = project_update["description"]
            
        if "category_id" in project_update:
            project.category_id = project_update["category_id"]
            
        if "project_metadata" in project_update:
            project.project_metadata = project_update["project_metadata"]
        
        # Commit changes
        db.commit()
        db.refresh(project)
        
        # Convert to dict to avoid schema validation
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
        error_detail = f"Failed to update project: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update project: {str(e)}"
        )


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
