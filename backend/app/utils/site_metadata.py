"""
Utility functions to extract website metadata and suggest categories based on site content.
"""
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import re
from typing import Dict, Any, Optional, List, Tuple
import logging
from sqlalchemy.orm import Session
from app.models.category import Category

logger = logging.getLogger(__name__)

async def fetch_site_metadata(url: str) -> Dict[str, Any]:
    """
    Fetch metadata from a website including title, description, and keywords.
    
    Args:
        url: The URL to fetch metadata from
        
    Returns:
        A dictionary containing metadata fields
    """
    metadata = {
        "title": None,
        "description": None,
        "keywords": [],
        "error": None
    }
    
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, timeout=10.0)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Try to get title
            if soup.title:
                metadata["title"] = soup.title.string.strip()
            
            # Try to get description from meta tags
            description_meta = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
            if description_meta and description_meta.get("content"):
                metadata["description"] = description_meta["content"].strip()
            
            # Try to get keywords from meta tags
            keywords_meta = soup.find("meta", attrs={"name": "keywords"})
            if keywords_meta and keywords_meta.get("content"):
                keywords = [k.strip() for k in keywords_meta["content"].split(",")]
                metadata["keywords"] = keywords
            
            # If no metadata found, try to extract some content
            if not metadata["description"]:
                # Try to get first paragraph with meaningful content
                paragraphs = soup.find_all('p')
                for p in paragraphs:
                    text = p.text.strip()
                    if len(text) > 50:  # Only consider paragraphs with substantial content
                        metadata["description"] = text[:300] + "..." if len(text) > 300 else text
                        break
        
    except Exception as e:
        logger.error(f"Error fetching metadata for {url}: {str(e)}")
        metadata["error"] = str(e)
        
        # Try to get at least a title from the URL
        if not metadata["title"]:
            parsed_url = urlparse(url)
            path_parts = parsed_url.path.split('/')
            repo_name = next((part for part in reversed(path_parts) if part), '')
            if repo_name:
                # Convert kebab-case or snake_case to words
                title = re.sub(r'[-_]', ' ', repo_name).title()
                metadata["title"] = title
    
    return metadata


def suggest_category(db: Session, list_id: int, url: str, description: Optional[str] = None) -> Tuple[Optional[int], float]:
    """
    Suggest a category for a new link based on the URL and description.
    
    Args:
        db: Database session
        list_id: The awesome list ID
        url: The URL of the project
        description: Optional description of the project
        
    Returns:
        A tuple containing (suggested_category_id, confidence_score)
    """
    # Get all categories for this list
    categories = db.query(Category).filter(Category.list_id == list_id).all()
    if not categories:
        return None, 0.0
    
    # Extract domain and path components from URL
    parsed_url = urlparse(url)
    domain = parsed_url.netloc.lower()
    path_components = [p.lower() for p in parsed_url.path.split('/') if p]
    
    # Keywords to match from the URL and description
    keywords = set()
    
    # Add domain keywords
    domain_parts = domain.split('.')
    keywords.update(domain_parts)
    
    # Add path keywords
    for component in path_components:
        # Split on non-alphanumeric chars and add as keywords
        parts = re.split(r'[^a-zA-Z0-9]', component)
        keywords.update([p.lower() for p in parts if p])
    
    # Add description keywords if available
    if description:
        # Extract meaningful words (longer than 3 chars)
        desc_words = re.findall(r'\b[a-zA-Z]{4,}\b', description.lower())
        keywords.update(desc_words)
    
    # Score each category
    best_category_id = None
    best_score = 0.0
    
    for category in categories:
        score = 0.0
        
        # Split category name into keywords
        category_keywords = set(re.split(r'[^a-zA-Z0-9]', category.name.lower()))
        category_keywords = {k for k in category_keywords if len(k) > 2}  # Only meaningful words
        
        # Calculate match score
        for keyword in keywords:
            if keyword in category.name.lower():
                score += 1.0
            elif any(keyword in ck for ck in category_keywords):
                score += 0.5
        
        # Normalize score based on number of keywords
        normalized_score = score / max(1, len(keywords))
        
        if normalized_score > best_score:
            best_score = normalized_score
            best_category_id = category.id
    
    return best_category_id, min(best_score, 1.0)  # Cap confidence at 1.0
