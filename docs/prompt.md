# Awesome List Manager (alm) Project Prompt

## Project Title
Awesome List Manager (alm)

## Project Overview
The Awesome List Manager (alm) is a web application designed to generate, manage, and maintain “awesome lists” — curated repositories hosted on GitHub that follow a strict Markdown README specification. An awesome list is a repository that organizes projects (or resources) into categories—with optional subcategories—where each project entry includes a title, URL, and description. The application provides an administrative panel for users to import an existing awesome list via a GitHub URL, explore and edit its contents, and then export an updated, linted, and valid README file back to GitHub. The project supports REST API endpoints for CRUD operations, integrates tools to validate links and the list format, and is fully containerized for self-hosted deployment.

## Key References & Resources
- **Awesome List Concept:**
  - [Awesome – by sindresorhus](https://github.com/sindresorhus/awesome)
- **Example Awesome Lists:**
  - [Awesome iOS – vsouza](https://github.com/vsouza/awesome-ios)
  - [Frontend Dev Bookmarks – dypsilon](https://github.com/dypsilon/frontend-dev-bookmarks#readme)
- **Awesome List Tooling:**
  - [awesome-lint](https://github.com/sindresorhus/awesome-lint)
  - [awesome_bot](https://github.com/dkhamsing/awesome_bot)
- **Functional Testing Artifact:**
  - [Awesome Video – krzemienski](https://github.com/krzemienski/awesome-video)

---

## Detailed Requirements

### 1. Understanding the Awesome List Specification

Based on research from the provided references, an awesome list must adhere to a consistent Markdown structure and style. The key guidelines include:

- **Header & Description:**
  - The README must start with a single top-level header (using `#`) that serves as the list title (typically containing the word “Awesome”).
  - Immediately following the title, there should be a concise description outlining the purpose and scope of the list.

- **Table of Contents (Optional):**
  - A table of contents can be included to facilitate navigation through different sections/categories.

- **Categories & Subcategories:**
  - The content is divided into sections using secondary headers (`##`) for main categories.
  - **Subcategories:** Within a main category, one or more subcategories can be defined using tertiary headers (`###`). These subcategories help further organize related projects or resources within a broader category.
  - Consistency in formatting is key. Each level of category should follow similar styling and be clearly distinguishable.

- **List Items (Projects):**
  - Each project entry should be a bullet point (using `*` or `-`) following a consistent format:
    - **Format:**
      `* [Project Name](Project_URL) - Short description of the project.`
  - Each entry must include:
    - A clickable link to the project/resource.
    - A brief, clear description.
    - Optionally, additional metadata such as badges or contributor information.

- **Curation & Consistency:**
  - The list should be manually curated—only high-quality, relevant projects are included.
  - Consistent punctuation, spacing, and formatting must be maintained throughout the document.

- **Validation & Linting:**
  - Integrate functionality similar to [awesome-lint](https://github.com/sindresorhus/awesome-lint) to enforce the spec and style guidelines.
  - Use [awesome_bot](https://github.com/dkhamsing/awesome_bot) to ensure all hyperlinks are valid and responsive.

### 2. User Workflows & Administrative Panel
- **Importing an Awesome List:**
  - Users enter the GitHub URL of an existing awesome list.
  - The system scrapes and imports the README content into a structured database, parsing out main categories, nested subcategories, and individual project entries.

- **Managing the List:**
  - **Viewing:** Display a dark-themed, responsive UI that visualizes the hierarchical structure (categories, subcategories, and projects) of the awesome list.
  - **Editing:** Enable users to modify existing entries, including the project’s title, URL, description, and assigned category or subcategory.
  - **Adding New Entries:**
    - Allow users to add new projects by providing a URL.
    - Automatically scrape metadata (e.g., title, description) from the URL.
    - Suggest an appropriate category or subcategory based on existing data or allow users to create a new one.
  - **Deleting/Modifying:** Provide full CRUD operations through the administrative interface.

- **Syncing Changes:**
  - Provide a “Publish” or “Update” action that exports the current state of the database into a properly formatted Markdown README following the awesome list spec.
  - Commit and push the updated README file to the user’s GitHub repository (with proper OAuth or token-based authorization).

### 3. Backend API & Database

#### Backend Technology:
- **Language & Framework:** Python using Flask or FastAPI.
- **REST API Endpoints:**
  - **Import Endpoint:** Accepts a GitHub URL, scrapes, and parses the awesome list.
  - **CRUD Endpoints:** For adding, updating, and deleting projects (list items) and categories/subcategories.
  - **Export Endpoint:** Generates a Markdown README from the current state of the database.
  - **Validation Endpoint:** Optionally integrates link-checking and linting (per awesome_bot and awesome-lint standards).

#### Database Schema:
- **AwesomeList Table:**
  Stores metadata for the entire awesome list.
  - `id` (primary key)
  - `title` (string)
  - `description` (text)
  - `repository_url` (string)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

- **Category Table:**
  Organizes projects into main categories and nested subcategories.
  - `id` (primary key)
  - `list_id` (foreign key referencing AwesomeList)
  - `name` (string)
  - `parent_category_id` (nullable; self-referencing foreign key for subcategories. If null, this is a main category. Otherwise, it is a subcategory of the category referenced by `parent_category_id`.)
  - `order` (integer for custom ordering)

- **Project (Item) Table:**
  Contains details of individual projects.
  - `id` (primary key)
  - `list_id` (foreign key referencing AwesomeList)
  - `category_id` (foreign key referencing Category; can point to either a main category or a subcategory)
  - `title` (string)
  - `url` (string)
  - `description` (text)
  - `metadata` (JSON or text, for additional scraped data)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

### 4. Frontend Application & Layout

#### Frontend Technology:
- **Framework:** Next.js with Material Design components.
- **Theme & Responsiveness:** Use a dark theme with a focus on mobile responsiveness and intuitive navigation.

#### Potential Layout & UI Components:
- **Header:**
  Contains branding (logo and project title) and navigation options.
- **Sidebar Navigation:**
  Displays a hierarchical list of main categories and their nested subcategories for quick access.
- **Main Content Area:**
  - Displays a dashboard view of the awesome list, showing projects organized under each main category and its subcategories.
  - Includes interactive elements for editing or adding new project entries.
  - Provides real-time status indicators (e.g., sync status with GitHub).
- **Footer:**
  May include additional links (e.g., documentation, support) and copyright information.

- **Admin Panel Features:**
  - **Import Section:** A form to input the GitHub URL for an awesome list.
  - **List Management:** Tables or card layouts to view and modify project entries along with their associated categories or subcategories.
  - **Publish/Sync Button:** Triggers the export process and GitHub update.
  - **Validation Feedback:** Notifications or alerts showing the results of link checks and linting.

### 5. GitHub Integration
- Support OAuth or token-based authorization to interact with a user’s GitHub repository.
- Allow users to select a repository for the awesome list and push updates (commit and push the generated README file).

### 6. Deployment & Containerization
- **Containerization:** The entire project should be containerized using Docker.
  - Separate Dockerfiles for the backend and frontend.
  - A Docker Compose configuration to orchestrate the full stack.
- **Deployment Instructions:** Provide detailed guidance for running the project locally and deploying in a production environment.

### 7. Testing & Functional Validation

#### Testing:
- Include unit and integration tests for all API endpoints and UI components.
- Ensure thorough error handling and input validations, particularly when scraping external URLs and interacting with GitHub.

#### Functional Testing Artifact:
- Use the [Awesome Video](https://github.com/krzemienski/awesome-video) repository as the artifact for functional testing across all operations. This repository will serve as the test case for importing, editing, validating, and exporting awesome lists, ensuring that all functionality meets the specification.

### 8. Coding & Documentation Standards
- All code must be fully production-ready with no placeholders.
- Follow idiomatic and consistent formatting (PEP 8 for Python, Next.js best practices for frontend).
- Include comprehensive documentation with a README and inline comments only when necessary.
- Break long explanations or code outputs into manageable segments for easier review and integration.

---

## Additional Instructions for the AI Code Generator
- **Full Project Scope:** Generate the complete solution covering the frontend, backend, database schema, and deployment configuration.
- **Modular Code Generation:** Ensure each component (API endpoints, UI components, database models) is produced as a fully formed module/file that integrates seamlessly.
- **Error Handling & Validation:** Include robust error handling and input validations, particularly when scraping external URLs and interacting with GitHub.
- **Testing:** Where feasible, incorporate tests for API endpoints and UI components.
- **Deployment Instructions:** Provide clear, step-by-step instructions for running the project locally and deploying in a containerized environment.
