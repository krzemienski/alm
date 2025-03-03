from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.github_service import (
    validate_repository,
    check_links,
    lint_readme,
)

router = APIRouter()


@router.get("/validate/{owner}/{repo}", response_model=Dict[str, Any])
def validate_github_repository(
    owner: str, repo: str, db: Session = Depends(get_db)
) -> Any:
    """
    Validate if a GitHub repository exists and can be accessed.
    """
    try:
        result = validate_repository(owner=owner, repo=repo)
        return {"success": True, "repository": result}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to validate repository: {str(e)}",
        )


@router.get("/check-links/{owner}/{repo}", response_model=Dict[str, Any])
def check_repository_links(
    owner: str, repo: str, db: Session = Depends(get_db)
) -> Any:
    """
    Check all links in a repository's README using awesome_bot.
    """
    try:
        result = check_links(owner=owner, repo=repo)
        return {"success": True, "results": result}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to check links: {str(e)}",
        )


@router.get("/lint/{owner}/{repo}", response_model=Dict[str, Any])
def lint_repository_readme(
    owner: str, repo: str, db: Session = Depends(get_db)
) -> Any:
    """
    Lint README of a repository using awesome-lint.
    """
    try:
        result = lint_readme(owner=owner, repo=repo)
        return {"success": True, "results": result}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to lint README: {str(e)}",
        )
