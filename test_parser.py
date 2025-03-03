import sys
import requests
from pprint import pprint
import sys
sys.path.append('/Users/nick/Desktop/alm')
from backend.app.services.markdown_parser import parse_awesome_list

# URL of the README.md file
url = "https://raw.githubusercontent.com/krzemienski/awesome-video/refs/heads/master/README.md"

# Fetch the content
response = requests.get(url)
if response.status_code == 200:
    # Parse the content
    readme_content = response.text
    try:
        parsed_data = parse_awesome_list(readme_content)
        print("Title:", parsed_data["title"])
        print("Description:", parsed_data["description"])
        print("Number of categories:", len(parsed_data["categories"]))
        
        # Print first category and its projects
        if parsed_data["categories"]:
            first_category = parsed_data["categories"][0]
            print(f"\nFirst category: {first_category['name']}")
            print(f"Number of projects: {len(first_category.get('projects', []))}")
            print(f"Number of subcategories: {len(first_category.get('subcategories', []))}")
    except Exception as e:
        print(f"Error parsing the markdown: {str(e)}")
else:
    print(f"Failed to fetch the README.md: {response.status_code}")
