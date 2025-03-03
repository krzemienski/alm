from typing import List, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.awesome_list import AwesomeList
from app.schemas.awesome_list import (
    AwesomeList as AwesomeListSchema,
    AwesomeListCreate,
    AwesomeListUpdate,
    AwesomeListImport,
    AwesomeListExport,
)
from app.services.awesome_list_service import (
    get_awesome_lists,
    get_awesome_list,
    create_awesome_list,
    update_awesome_list,
    delete_awesome_list,
    import_awesome_list,
    export_awesome_list,
)

router = APIRouter()


@router.get("/", response_model=List[AwesomeListSchema])
def read_awesome_lists(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> Any:
    """
    Retrieve all awesome lists.
    """
    return get_awesome_lists(db=db, skip=skip, limit=limit)


@router.post("/", response_model=AwesomeListSchema, status_code=status.HTTP_201_CREATED)
def create_new_awesome_list(
    awesome_list_in: AwesomeListCreate, db: Session = Depends(get_db)
) -> Any:
    """
    Create a new awesome list.
    """
    return create_awesome_list(db=db, awesome_list_in=awesome_list_in)


@router.get("/{list_id}", response_model=AwesomeListSchema)
def read_awesome_list(list_id: int, db: Session = Depends(get_db)) -> Any:
    """
    Get a specific awesome list by ID.
    """
    awesome_list = get_awesome_list(db=db, list_id=list_id)
    if not awesome_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Awesome list with ID {list_id} not found",
        )
    return awesome_list


@router.put("/{list_id}", response_model=AwesomeListSchema)
def update_existing_awesome_list(
    list_id: int, awesome_list_in: AwesomeListUpdate, db: Session = Depends(get_db)
) -> Any:
    """
    Update an existing awesome list.
    """
    awesome_list = get_awesome_list(db=db, list_id=list_id)
    if not awesome_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Awesome list with ID {list_id} not found",
        )
    return update_awesome_list(db=db, awesome_list=awesome_list, awesome_list_in=awesome_list_in)


@router.delete("/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_awesome_list(list_id: int, db: Session = Depends(get_db)) -> None:
    """
    Delete an awesome list.
    """
    awesome_list = get_awesome_list(db=db, list_id=list_id)
    if not awesome_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Awesome list with ID {list_id} not found",
        )
    delete_awesome_list(db=db, list_id=list_id)


@router.post("/import", response_model=AwesomeListSchema)
def import_from_github(
    import_data: AwesomeListImport, db: Session = Depends(get_db)
) -> Any:
    """
    Import an awesome list from GitHub.
    """
    try:
        print(f"Import request received for: {import_data.repository_url}")
        return import_awesome_list(db=db, repository_url=import_data.repository_url)
    except Exception as e:
        import traceback
        error_detail = f"Failed to import awesome list: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to import awesome list: {str(e)}",
        )


@router.post("/{list_id}/export", status_code=status.HTTP_200_OK)
def export_to_github(
    list_id: int, export_data: AwesomeListExport, db: Session = Depends(get_db)
) -> Any:
    """
    Export an awesome list to GitHub.
    """
    awesome_list = get_awesome_list(db=db, list_id=list_id)
    if not awesome_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Awesome list with ID {list_id} not found",
        )
    
    from app.services.markdown_generator import generate_readme
    
    try:
        # Generate README content
        readme_content = generate_readme(db, awesome_list)
        
        # For testing purposes, just return the content
        preview_content = readme_content[:500] + "..." if len(readme_content) > 500 else readme_content
        return {
            "message": "README.md generated successfully (testing mode)",
            "commit_url": None,
            "preview": preview_content
        }
    except Exception as e:
        import traceback
        error_detail = f"Failed to export awesome list: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to export awesome list: {str(e)}",
        )
