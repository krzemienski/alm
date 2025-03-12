"""
Service for AI-powered categorization of repositories.
"""
import os
import logging
from typing import List, Dict, Any, Optional, Union
import json
import asyncio
import concurrent.futures

from app.utils.ai_categorizer import AICategorizer
from app.utils.site_metadata import fetch_site_metadata
from app.models.category import Category
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class AICategorization:
    """
    Service for AI-powered categorization operations.
    """

    def __init__(self, db: Session):
        """
        Initialize the service.

        Args:
            db: Database session
        """
        self.db = db

        # Initialize AI categorizer with OpenAI by default
        # Users can switch to Ollama in the API
        self.ai_categorizer = AICategorizer(
            api_key=os.environ.get("OPENAI_API_KEY"),
            model=os.environ.get("OPENAI_MODEL", "gpt-3.5-turbo")
        )

    def _get_category_structure(self, awesome_list_id: int) -> Dict[str, List[str]]:
        """
        Get the category structure for an awesome list.

        Args:
            awesome_list_id: ID of the awesome list

        Returns:
            Dictionary mapping category names to lists of subcategory names
        """
        # Get all main categories for this awesome list
        main_categories = self.db.query(Category).filter(
            Category.list_id == awesome_list_id,
            Category.parent_category_id == None
        ).all()

        category_structure = {}

        for main_category in main_categories:
            # Get subcategories for this main category
            subcategories = self.db.query(Category).filter(
                Category.parent_category_id == main_category.id
            ).all()

            # Add to structure
            category_structure[main_category.name] = [sub.name for sub in subcategories]

        return category_structure

    async def process_url(self, url: str, awesome_list_id: int, use_ollama: bool = False) -> Dict[str, Any]:
        """
        Process a single URL with AI categorization.

        Args:
            url: URL to process
            awesome_list_id: ID of the awesome list
            use_ollama: Whether to use Ollama instead of OpenAI

        Returns:
            Dictionary with metadata, suggested category, and summary
        """
        try:
            # Get category structure
            category_structure = self._get_category_structure(awesome_list_id)

            # Get metadata
            metadata = await fetch_site_metadata(url)

            # Configure AI categorizer based on preference
            if use_ollama != self.ai_categorizer.use_ollama:
                # Reconfigure if the setting changed
                if use_ollama:
                    self.ai_categorizer = AICategorizer(
                        use_ollama=True,
                        ollama_base_url=os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434"),
                        ollama_model=os.environ.get("OLLAMA_MODEL", "llama3")
                    )
                else:
                    self.ai_categorizer = AICategorizer(
                        api_key=os.environ.get("OPENAI_API_KEY"),
                        model=os.environ.get("OPENAI_MODEL", "gpt-3.5-turbo")
                    )

            # Run AI categorization in a thread pool to avoid blocking
            with concurrent.futures.ThreadPoolExecutor() as executor:
                ai_result = await asyncio.get_event_loop().run_in_executor(
                    executor,
                    self.ai_categorizer.categorize_repository,
                    url,
                    category_structure
                )

            # Combine metadata and AI results
            result = {
                "url": url,
                "metadata": metadata,
                "category": ai_result.get("category"),
                "subcategory": ai_result.get("subcategory"),
                "summary": ai_result.get("summary")
            }

            return result
        except Exception as e:
            logger.error(f"Error processing URL {url}: {str(e)}")
            return {
                "url": url,
                "error": str(e),
                "metadata": {"title": url, "description": "Failed to fetch metadata"},
                "category": None,
                "subcategory": None,
                "summary": None
            }

    async def process_batch_urls(self, urls: List[str], awesome_list_id: int, use_ollama: bool = False) -> List[Dict[str, Any]]:
        """
        Process multiple URLs with AI categorization.

        Args:
            urls: List of URLs to process
            awesome_list_id: ID of the awesome list
            use_ollama: Whether to use Ollama instead of OpenAI

        Returns:
            List of dictionaries with metadata, suggested categories, and summaries
        """
        # Process URLs concurrently
        tasks = []
        for url in urls:
            tasks.append(self.process_url(url, awesome_list_id, use_ollama))

        # Wait for all tasks to complete
        results = await asyncio.gather(*tasks)

        return results
