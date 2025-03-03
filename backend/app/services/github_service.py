from typing import Dict, Any, List
import os
import tempfile
import subprocess
from github import Github
from github.GithubException import GithubException

from app.core.config import settings


def validate_repository(owner: str, repo: str) -> Dict[str, Any]:
    """
    Validate if a GitHub repository exists and can be accessed.
    """
    try:
        g = Github(settings.GITHUB_ACCESS_TOKEN) if settings.GITHUB_ACCESS_TOKEN else Github()
        repository = g.get_repo(f"{owner}/{repo}")
        
        return {
            "name": repository.name,
            "full_name": repository.full_name,
            "description": repository.description,
            "url": repository.html_url,
            "stars": repository.stargazers_count,
            "forks": repository.forks_count,
            "owner": {
                "login": repository.owner.login,
                "avatar_url": repository.owner.avatar_url,
            }
        }
    except GithubException as e:
        raise ValueError(f"GitHub repository not found or access denied: {str(e)}")
    except Exception as e:
        raise ValueError(f"Failed to validate repository: {str(e)}")


def check_links(owner: str, repo: str) -> Dict[str, Any]:
    """
    Check all links in a repository's README using awesome_bot.
    """
    try:
        # Create a temporary directory to clone the repository
        with tempfile.TemporaryDirectory() as temp_dir:
            # Clone the repository
            repo_url = f"https://github.com/{owner}/{repo}.git"
            subprocess.run(["git", "clone", "--depth=1", repo_url, temp_dir], check=True)
            
            # Check if README.md exists
            readme_path = os.path.join(temp_dir, "README.md")
            if not os.path.exists(readme_path):
                raise ValueError("README.md not found in the repository")
            
            # Run awesome_bot (assumes it's installed)
            try:
                result = subprocess.run(
                    ["awesome_bot", "--allow-redirect", readme_path],
                    capture_output=True,
                    text=True,
                    check=False
                )
                
                # Parse the output
                output_lines = result.stdout.splitlines()
                error_lines = result.stderr.splitlines()
                
                success = result.returncode == 0
                issues = []
                
                # Parse issues if there are any
                if not success:
                    for line in output_lines:
                        if "Issues :" in line:
                            issue_count = line.split("Issues :")[1].strip()
                        elif " → " in line and "http" in line:
                            issues.append(line.strip())
                
                return {
                    "success": success,
                    "issues": issues,
                    "output": output_lines
                }
            except subprocess.CalledProcessError as e:
                raise ValueError(f"Failed to run awesome_bot: {str(e)}")
    except Exception as e:
        raise ValueError(f"Failed to check links: {str(e)}")


def lint_readme(owner: str, repo: str) -> Dict[str, Any]:
    """
    Lint README of a repository using awesome-lint.
    """
    try:
        # Create a temporary directory to clone the repository
        with tempfile.TemporaryDirectory() as temp_dir:
            # Clone the repository
            repo_url = f"https://github.com/{owner}/{repo}.git"
            subprocess.run(["git", "clone", "--depth=1", repo_url, temp_dir], check=True)
            
            # Run awesome-lint (assumes it's installed)
            try:
                result = subprocess.run(
                    ["npx", "awesome-lint"],
                    cwd=temp_dir,
                    capture_output=True,
                    text=True,
                    check=False
                )
                
                # Parse the output
                output_lines = result.stdout.splitlines()
                error_lines = result.stderr.splitlines()
                
                success = result.returncode == 0
                issues = []
                
                # Parse issues if there are any
                if not success:
                    for line in output_lines:
                        if line.strip():
                            issues.append(line.strip())
                
                return {
                    "success": success,
                    "issues": issues,
                    "output": output_lines
                }
            except subprocess.CalledProcessError as e:
                raise ValueError(f"Failed to run awesome-lint: {str(e)}")
    except Exception as e:
        raise ValueError(f"Failed to lint README: {str(e)}")
