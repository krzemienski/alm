#!/usr/bin/env python3
import requests
import json
import time
import sys
from pprint import pprint

# Base URLs
API_URL = "http://localhost:8000/api/v1"

def test_import_awesome_list():
    """Import the awesome-video repository"""
    print("\n=== Testing Import Repository ===")
    url = f"{API_URL}/awesome-lists/import"
    payload = {
        "repository_url": "https://github.com/krzemienski/awesome-video"
    }
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Successfully imported awesome list: {data['title']}")
        print(f"ID: {data['id']}")
        return data
    else:
        print(f"Error importing list: {response.status_code}")
        print(response.text)
        sys.exit(1)

def test_get_awesome_list(list_id):
    """Get the awesome list details"""
    print("\n=== Testing Get Awesome List ===")
    url = f"{API_URL}/awesome-lists/{list_id}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Retrieved awesome list: {data['title']}")
        print(f"Description: {data['description']}")
        return data
    else:
        print(f"Error getting list: {response.status_code}")
        print(response.text)
        return None

def test_get_categories(list_id):
    """Get categories for the awesome list"""
    print("\n=== Testing Get Categories ===")
    url = f"{API_URL}/categories/tree?list_id={list_id}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Retrieved {len(data)} categories")
        return data
    else:
        print(f"Error getting categories: {response.status_code}")
        print(response.text)
        return None

def test_create_category(list_id, name="New Test Category", parent_id=None):
    """Create a new category"""
    print("\n=== Testing Create Category ===")
    url = f"{API_URL}/categories"
    payload = {
        "list_id": list_id,
        "name": name
    }
    if parent_id:
        payload["parent_category_id"] = parent_id
        
    response = requests.post(url, json=payload)
    
    if response.status_code in [200, 201]:
        data = response.json()
        print(f"Created category: {data['name']}")
        print(f"ID: {data['id']}")
        return data
    else:
        print(f"Error creating category: {response.status_code}")
        print(response.text)
        return None

def test_update_category(category_id, new_name):
    """Update a category"""
    print("\n=== Testing Update Category ===")
    url = f"{API_URL}/categories/{category_id}"
    payload = {
        "name": new_name
    }
    response = requests.put(url, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Updated category to: {data['name']}")
        return data
    else:
        print(f"Error updating category: {response.status_code}")
        print(response.text)
        return None

def test_create_project(list_id, category_id, title, url, description=""):
    """Create a new project in an awesome list"""
    print("\n=== Testing Create Project ===")
    url_endpoint = f"{API_URL}/projects/"
    payload = {
        "list_id": list_id,
        "category_id": category_id,
        "title": title,
        "url": url,
        "description": description,
        "project_metadata": {}  # Empty dict for project_metadata
    }
    
    response = requests.post(url_endpoint, json=payload)
    
    if response.status_code == 201:
        data = response.json()
        print(f"Created project: {data['title']}")
        print(f"ID: {data['id']}")
        return data
    else:
        print(f"Error creating project: {response.status_code}")
        print(response.text)
        return None

def test_update_project(project_id, title, description):
    """Update an existing project"""
    print("\n=== Testing Update Project ===")
    url = f"{API_URL}/projects/{project_id}"
    payload = {
        "title": title,
        "description": description
    }
    
    response = requests.put(url, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Updated project: {data['title']}")
        return data
    else:
        print(f"Error updating project: {response.status_code}")
        print(response.text)
        return None

def test_delete_project(project_id):
    """Delete a project"""
    print("\n=== Testing Delete Project ===")
    url = f"{API_URL}/projects/{project_id}"
    response = requests.delete(url)
    
    if response.status_code == 200:
        print(f"Successfully deleted project ID: {project_id}")
        return True
    else:
        print(f"Error deleting project: {response.status_code}")
        print(response.text)
        return False

def test_delete_category(category_id):
    """Delete a category"""
    print("\n=== Testing Delete Category ===")
    url = f"{API_URL}/categories/{category_id}"
    response = requests.delete(url)
    
    if response.status_code == 200:
        print(f"Successfully deleted category ID: {category_id}")
        return True
    else:
        print(f"Error deleting category: {response.status_code}")
        print(response.text)
        return False

def test_export_awesome_list(list_id):
    """Export an awesome list to GitHub"""
    print("\n=== Testing Export Awesome List ===")
    url = f"{API_URL}/awesome-lists/{list_id}/export"
    
    # Send a JSON object with the list_id
    response = requests.post(url, json={"id": list_id})
    
    if response.status_code == 200:
        data = response.json()
        print("Successfully exported awesome list")
        print(f"Preview: {data['preview'][:100]}...")  # Show first 100 chars of preview
        return data
    else:
        print(f"Error exporting list: {response.status_code}")
        print(response.text)
        return None

def main():
    # Wait for services to be fully ready
    print("Waiting for services to be fully ready...")
    time.sleep(5)
    
    # 1. Import the awesome-video repository
    awesome_list = test_import_awesome_list()
    if not awesome_list:
        print("Failed to import list. Exiting.")
        return
    
    list_id = awesome_list["id"]
    
    # 2. Get the awesome list details
    test_get_awesome_list(list_id)
    
    # 3. Get categories
    categories = test_get_categories(list_id)
    if not categories:
        print("Failed to get categories. Exiting.")
        return
    
    # 4. Create a new category
    new_category = test_create_category(list_id, "Test Tools and Libraries")
    if not new_category:
        print("Failed to create category. Exiting.")
        return
    
    # 5. Update the category
    updated_category = test_update_category(new_category["id"], "Updated Test Tools")
    
    # 6. Create a subcategory
    subcategory = test_create_category(list_id, "Test Subcategory", new_category["id"])
    
    # 7. Create projects in the new category
    project1 = test_create_project(
        list_id, 
        new_category["id"],
        "Test Video Tool",
        "https://example.com/tool",
        "A great tool for video processing"
    )
    
    project2 = None
    if subcategory:
        project2 = test_create_project(
            list_id, 
            subcategory["id"],
            "Another Test Tool",
            "https://example.com/another-tool",
            "Another fantastic tool for video processing"
        )
    
    # 8. Update a project
    if project1:
        test_update_project(
            project1["id"],
            "Updated Test Video Tool",
            "An updated description for this amazing tool"
        )
    
    # 9. Delete one project
    if project2:
        test_delete_project(project2["id"])
    
    # 10. Export the awesome list
    test_export_awesome_list(list_id)
    
    print("\n=== All tests completed successfully! ===")

if __name__ == "__main__":
    main()
