"""
AI-powered repository categorization and summarization.
Supports both OpenAI and Ollama as backends for AI processing.
"""
import os
import re
import requests
import logging
from typing import List, Dict, Any, Tuple, Optional, Union
import json
import base64
from urllib.parse import urlparse

# OpenAI imports - will be imported conditionally to support environments without this dependency
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

logger = logging.getLogger(__name__)

class AICategorizer:
    """
    AI-powered categorization and summarization of repositories.
    """
    
    def __init__(self, 
                 api_key: Optional[str] = None, 
                 model: str = "gpt-3.5-turbo",
                 use_ollama: bool = False,
                 ollama_base_url: str = "http://localhost:11434",
                 ollama_model: str = "llama3"):
        """
        Initialize the AI categorizer.
        
        Args:
            api_key: OpenAI API key (not needed if using Ollama)
            model: OpenAI model to use (default: gpt-3.5-turbo)
            use_ollama: Whether to use Ollama instead of OpenAI
            ollama_base_url: Base URL for Ollama API
            ollama_model: Ollama model to use
        """
        self.use_ollama = use_ollama
        
        if not use_ollama:
            if not OPENAI_AVAILABLE:
                raise ImportError("OpenAI package is not installed. Please install it with 'pip install openai'")
            
            # Configure OpenAI
            self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
            if not self.api_key:
                raise ValueError("OpenAI API key is required when not using Ollama")
            
            self.model = model
            self.client = openai.OpenAI(api_key=self.api_key)
        else:
            # Configure Ollama
            self.ollama_base_url = ollama_base_url
            self.ollama_model = ollama_model
    
    def fetch_github_readme(self, github_url: str) -> str:
        """
        Fetch README content from a GitHub repository URL.
        
        Args:
            github_url: URL to a GitHub repository
            
        Returns:
            String containing the README content
        """
        # Parse the GitHub URL to extract owner and repo
        parsed_url = urlparse(github_url)
        path_parts = parsed_url.path.strip('/').split('/')
        
        if len(path_parts) < 2:
            raise ValueError(f"Invalid GitHub URL: {github_url}")
        
        owner, repo = path_parts[0], path_parts[1]
        
        # Use GitHub API to fetch README content
        api_url = f"https://api.github.com/repos/{owner}/{repo}/readme"
        headers = {}
        
        # Add GitHub token if available for higher rate limits
        github_token = os.environ.get("GITHUB_TOKEN")
        if github_token:
            headers["Authorization"] = f"token {github_token}"
        
        response = requests.get(api_url, headers=headers)
        
        if response.status_code != 200:
            raise Exception(f"Failed to fetch README: {response.status_code} - {response.text}")
        
        # Decode content from base64
        content = response.json().get("content", "")
        decoded_content = base64.b64decode(content).decode("utf-8")
        
        return decoded_content
    
    def _clean_readme(self, readme_content: str) -> str:
        """
        Clean up README content to extract the most relevant information.
        
        Args:
            readme_content: Raw README content
            
        Returns:
            Cleaned README content
        """
        # Remove markdown links but keep the text
        cleaned = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', readme_content)
        
        # Remove badges
        cleaned = re.sub(r'!\[[^\]]*\]\([^)]+\)', '', cleaned)
        
        # Remove HTML comments
        cleaned = re.sub(r'<!--[\s\S]*?-->', '', cleaned)
        
        # Remove code blocks - optional, depending on importance to categorization
        cleaned = re.sub(r'```[\s\S]*?```', '', cleaned)
        
        # Truncate to a reasonable length to stay within token limits
        if len(cleaned) > 4000:
            cleaned = cleaned[:4000] + "..."
            
        return cleaned
    
    def categorize_with_openai(self, readme_content: str, category_structure: Dict[str, List[str]]) -> Dict[str, Any]:
        """
        Categorize repository and generate summary using OpenAI.
        
        Args:
            readme_content: Repository README content
            category_structure: Dictionary of categories and subcategories
            
        Returns:
            Dictionary with category, subcategory, and summary
        """
        cleaned_content = self._clean_readme(readme_content)
        
        # Format the category structure for the prompt
        category_text = ""
        for category, subcategories in category_structure.items():
            subcategory_text = ", ".join([f'"{sub}"' for sub in subcategories]) if subcategories else "No subcategories"
            category_text += f'"{category}": [{subcategory_text}]\n'
        
        # Create the prompt
        prompt = f"""
        You are an expert at categorizing GitHub repositories. Based on the following README content, 
        please suggest a category and subcategory from the structure below. Also provide a short summary (1-2 sentences).
        
        Category Structure:
        {category_text}
        
        README Content:
        {cleaned_content}
        
        Output your response in JSON format with these keys:
        - category: The main category from the provided structure
        - subcategory: The subcategory from the provided structure under the selected category (can be null if none match)
        - summary: A concise 1-2 sentence summary of what this repository is about
        """
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "system", "content": "You are a helpful assistant that categorizes GitHub repositories."},
                     {"role": "user", "content": prompt}],
            temperature=0.2
        )
        
        result_text = response.choices[0].message.content.strip()
        
        # Extract the JSON from the response
        try:
            result_json = json.loads(result_text)
            return result_json
        except json.JSONDecodeError:
            # If the response isn't valid JSON, try to extract it using regex
            json_match = re.search(r'\{[\s\S]+\}', result_text)
            if json_match:
                try:
                    result_json = json.loads(json_match.group(0))
                    return result_json
                except json.JSONDecodeError:
                    pass
            
            # If all else fails, return a structured response
            return {
                "category": None,
                "subcategory": None,
                "summary": "Failed to generate summary and categories."
            }
    
    def categorize_with_ollama(self, readme_content: str, category_structure: Dict[str, List[str]]) -> Dict[str, Any]:
        """
        Categorize repository and generate summary using Ollama.
        
        Args:
            readme_content: Repository README content
            category_structure: Dictionary of categories and subcategories
            
        Returns:
            Dictionary with category, subcategory, and summary
        """
        cleaned_content = self._clean_readme(readme_content)
        
        # Format the category structure for the prompt
        category_text = ""
        for category, subcategories in category_structure.items():
            subcategory_text = ", ".join([f'"{sub}"' for sub in subcategories]) if subcategories else "No subcategories"
            category_text += f'"{category}": [{subcategory_text}]\n'
        
        # Create the prompt
        prompt = f"""
        You are an expert at categorizing GitHub repositories. Based on the following README content, 
        please suggest a category and subcategory from the structure below. Also provide a short summary (1-2 sentences).
        
        Category Structure:
        {category_text}
        
        README Content:
        {cleaned_content}
        
        Output your response in JSON format with these keys:
        - category: The main category from the provided structure
        - subcategory: The subcategory from the provided structure under the selected category (can be null if none match)
        - summary: A concise 1-2 sentence summary of what this repository is about
        """
        
        # Make API call to Ollama
        response = requests.post(
            f"{self.ollama_base_url}/api/generate",
            json={
                "model": self.ollama_model,
                "prompt": prompt,
                "stream": False
            }
        )
        
        if response.status_code != 200:
            logger.error(f"Ollama API error: {response.status_code} - {response.text}")
            return {
                "category": None,
                "subcategory": None,
                "summary": "Failed to generate summary and categories."
            }
        
        result_text = response.json().get("response", "")
        
        # Extract the JSON from the response
        try:
            result_json = json.loads(result_text)
            return result_json
        except json.JSONDecodeError:
            # If the response isn't valid JSON, try to extract it using regex
            json_match = re.search(r'\{[\s\S]+\}', result_text)
            if json_match:
                try:
                    result_json = json.loads(json_match.group(0))
                    return result_json
                except json.JSONDecodeError:
                    pass
            
            # If all else fails, return a structured response
            return {
                "category": None,
                "subcategory": None,
                "summary": "Failed to generate summary and categories."
            }
    
    def categorize_repository(self, 
                             github_url: str, 
                             category_structure: Dict[str, List[str]]) -> Dict[str, Any]:
        """
        Fetch README from a GitHub repository URL and categorize it.
        
        Args:
            github_url: URL to a GitHub repository
            category_structure: Dictionary of categories and subcategories
            
        Returns:
            Dictionary with suggested category, subcategory, and summary
        """
        try:
            readme_content = self.fetch_github_readme(github_url)
            
            if self.use_ollama:
                return self.categorize_with_ollama(readme_content, category_structure)
            else:
                return self.categorize_with_openai(readme_content, category_structure)
                
        except Exception as e:
            logger.error(f"Error categorizing repository: {str(e)}")
            return {
                "category": None,
                "subcategory": None,
                "summary": f"Error processing repository: {str(e)}"
            }
