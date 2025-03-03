import re
import markdown
from bs4 import BeautifulSoup
from typing import Dict, List, Any, Optional


def parse_awesome_list(markdown_content: str) -> Dict[str, Any]:
    """
    Parse an awesome list in Markdown format.
    
    Returns a structured dictionary with the title, description, and categories.
    Each category contains subcategories and projects.
    """
    # Convert markdown to HTML for better parsing
    html_content = markdown.markdown(markdown_content)
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Extracted data structure
    result = {
        "title": "",
        "description": "",
        "categories": []
    }
    
    # Get the title (first h1)
    h1 = soup.find('h1')
    if h1:
        result["title"] = h1.get_text().strip()
        
        # Get the description (paragraph after h1)
        description_elem = h1.find_next('p')
        if description_elem:
            result["description"] = description_elem.get_text().strip()
    
    # Process categories
    current_category = None
    current_subcategory = None
    
    for element in soup.find_all(['h2', 'h3', 'ul']):
        # Main category (h2)
        if element.name == 'h2':
            current_category = {
                "name": element.get_text().strip(),
                "subcategories": [],
                "projects": []
            }
            result["categories"].append(current_category)
            current_subcategory = None
        
        # Subcategory (h3)
        elif element.name == 'h3' and current_category is not None:
            current_subcategory = {
                "name": element.get_text().strip(),
                "projects": []
            }
            current_category["subcategories"].append(current_subcategory)
        
        # List of projects (ul)
        elif element.name == 'ul':
            # Parse each list item
            for li in element.find_all('li'):
                # Extract project link and description
                link = li.find('a')
                if link:
                    project = {
                        "title": link.get_text().strip(),
                        "url": link.get('href', ''),
                        "description": ""
                    }
                    
                    # Get description (text after link)
                    description_text = li.get_text()
                    if '-' in description_text:
                        description_text = description_text.split('-', 1)[1].strip()
                    project["description"] = description_text
                    
                    # Add project to the current subcategory or category
                    if current_subcategory is not None:
                        current_subcategory["projects"].append(project)
                    elif current_category is not None:
                        current_category["projects"].append(project)
    
    return result


def parse_github_url(url: str) -> Optional[Dict[str, str]]:
    """
    Parse a GitHub URL to extract owner and repo.
    """
    # Match github.com/owner/repo or github.com/owner/repo/
    pattern = r'github\.com/([^/]+)/([^/#?]+)'
    match = re.search(pattern, url)
    
    if match:
        return {
            "owner": match.group(1),
            "repo": match.group(2)
        }
    
    return None
