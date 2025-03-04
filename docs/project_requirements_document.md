# Awesome List Manager (alm) – Project Requirements Document

## 1. Project Overview

The Awesome List Manager (alm) is a web application that helps users generate, manage, and maintain “awesome lists” – curated repositories on GitHub that follow a strict Markdown README specification. The app is built to import existing awesome lists via a GitHub URL, parse their content into a structured format (with main categories, subcategories, and project entries), and then allow the user to edit, add, or remove items through a clean, dark-themed administrative panel. Once the list is updated, the app exports a linted, compliant Markdown README back to GitHub.

The goal of the project is to ensure that awesome lists remain high quality and consistent in style by automating tasks such as linting and link checking through tools like awesome-lint and awesome_bot. The key objectives are to simplify the management of these lists, provide real-time validation and error feedback, and offer easy GitHub integration for syncing changes. Success will be measured by ease of use, reliability of the import/export processes, and adherence to the awesome list specification.

## 2. In-Scope vs. Out-of-Scope

**In-Scope:**

*   A single-user administrative panel to import awesome lists via a GitHub URL.
*   A visual dashboard that clearly shows main categories, subcategories, and project entries.
*   Editing, adding, and deleting project entries and categories through full CRUD operations.
*   Automatic scraping of metadata from provided URLs, with a fallback to manual data entry.
*   Generation of a properly formatted Markdown README that complies with awesome list guidelines.
*   Integration with GitHub through OAuth and token-based authentication for updating repositories.
*   Robust validation and linting using awesome-lint and awesome_bot, along with comprehensive error feedback.
*   Search and filtering functionalities for quick navigation.
*   Detailed logging and audit trails of all CRUD actions.
*   Containerization with Docker and orchestration using Docker Compose.

**Out-of-Scope:**

*   Support for multiple user roles or granular permissions (the admin panel is designed for a single full-access user).
*   Advanced multi-user collaborations or role-based access control.
*   Extensive customization of themes or branding beyond the dark theme and standard web-safe fonts.
*   Native mobile applications or separate mobile-specific UIs.
*   Automated scheduled syncing as a default; this remains optional and secondary to manual triggers.

## 3. User Flow

When a user first accesses the Awesome List Manager, they are greeted with a simple interface prompting them to enter the GitHub URL of an existing awesome list. Once the URL is provided, the system scrapes the repository README, validates the Markdown structure, and attempts to auto-correct minor formatting issues. In the event of any significant deviations from the expected format, an "Import Errors" panel is displayed detailing the discrepancies along with suggested fixes. After a successful import, the content is neatly organized in a database representing the hierarchical structure of the list.

After importing, the user is directed to a dark-themed dashboard that presents the list in a clear and navigable layout. A sidebar provides quick access to categories and subcategories along with search and filtering options. Here, the user can click on any project entry to edit the title, URL, description, or category assignment; similarly, new project entries can be added either through automated metadata scraping (with manual entry as a fallback) or by directly filling in the required fields. Once the desired changes are made, the user can manually trigger the "Publish/Sync" action, which then exports the updated list as a purified Markdown README and pushes it back to the GitHub repository using secure GitHub integration protocols.

## 4. Core Features

*   **Import Functionality:**\
    Ability to import an awesome list from GitHub by entering a URL. This includes scraping the Markdown content and parsing it into main categories, subcategories, and project entries.
*   **Display and Navigation:**\
    A dark-themed, responsive dashboard that visually represents the hierarchical structure of the awesome list. Includes a sidebar for easy navigation and real-time search/filter options.
*   **CRUD Operations:**\
    Full support for creating, reading, updating, and deleting entries (projects) and categories/subcategories in the database.
*   **Metadata Scraping & Manual Entry:**\
    Automated scraping of project metadata from URLs with user notifications if scraping fails, prompting for manual entry.
*   **Markdown Generation & Export:**\
    Conversion of the current database state into a compliant, linted Markdown README file, ready to be pushed back to GitHub.
*   **GitHub Integration:**\
    Secure GitHub authentication using OAuth or token-based methods that allow importing from and exporting to a GitHub repository.
*   **Validation & Linting:**\
    Integration with tools (awesome-lint and awesome_bot) to validate Markdown formatting and check all project URLs for validity.
*   **Logging & Audit Trail:**\
    Logging of key user actions such as imports, edits, additions, deletions, and publishing events along with timestamps and user identifiers.
*   **Error Handling & Notifications:**\
    Robust error detection during URL scraping, Markdown parsing, and other operations with detailed user feedback on issues and corrections.
*   **Containerized Deployment:**\
    Full containerization using Docker (with separate Dockerfiles for frontend and backend) and orchestration via Docker Compose.

## 5. Tech Stack & Tools

*   **Frontend:**

    *   Framework: Next.js
    *   UI Components: Material UI (with a dark theme)
    *   Additional Tools: V0 by Vercel, Cursor, Windsurf, VS Code, Aide

*   **Backend:**

    *   Language & Framework: Python using Flask (or FastAPI as an alternative)
    *   Database: PostgreSQL
    *   API: RESTful endpoints for CRUD operations, import, export, validation, and GitHub sync
    *   Testing: Pytest or unittest for backend tests

*   **GitHub Integration:**

    *   Authentication: OAuth and token-based methods
    *   Repository Interaction: Using a GitHub App or similar setup for secure commits/pushes

*   **Containerization & Deployment:**

    *   Containerization: Docker
    *   Orchestration: Docker Compose
    *   Deployment Guidance: Detailed instructions for local and production environments

*   **Other Integrated Tools:**

    *   GPT o1: For advanced code generation
    *   Claude 3.5/3.7 Sonnet: For intelligent code assistance
    *   Bolt: For quick project scaffolding
    *   Expo (if mobile components are explored later)
    *   Gemini 2.0 Flash, Replit, and GPT o3-mini: For additional support in development and testing

## 6. Non-Functional Requirements

*   **Performance:**\
    The application must load screens quickly and provide responsive interactions. API response times should be optimized for under a few hundred milliseconds for a smooth user experience.
*   **Security:**\
    All communication, especially GitHub integration, should use secure protocols. GitHub authentication must be managed via OAuth or tokens securely, and user data should be handled according to standard security practices.
*   **Usability:**\
    The interface should be intuitive, with a dark theme that is easy on the eyes and mobile-responsive design. Clear error messages and feedback mechanisms are necessary to enhance user experience.
*   **Validation & Reliability:**\
    The linting and link-check processes must be robust, following the standards set by awesome-lint and awesome_bot. Data consistency and error correction should be prioritized during imports and exports.
*   **Compliance:**\
    The project should follow coding standards like PEP 8 for Python and best practices for Next.js. The code must be production-ready, robust, and well-documented.

## 7. Constraints & Assumptions

*   **Constraints:**

    *   The admin panel is designed for a single full-access user; multi-user role management is out-of-scope for now.
    *   The parsing and validation rely on a specific Markdown structure. Handling non-standard inputs may require manual interventions.
    *   External dependencies like awesome-lint, awesome_bot, and GitHub services may have rate limits or access restrictions.
    *   The entire solution must be containerized, so the developers need to ensure compatibility across development and production environments.

*   **Assumptions:**

    *   Users will primarily interact with the system through the admin panel in a controlled environment.
    *   GitHub repositories containing awesome lists are public and accessible for scraping and integration.
    *   Minimal design customization beyond the dark theme and standard fonts (like Arial, Roboto) is acceptable.
    *   Error reports from the import process will be clear enough for users to understand and rectify formatting issues.
    *   Testing frameworks (Pytest/unittest, Jest/React Testing Library) will provide confidence in the system's reliability by aiming for a test coverage of 80% or higher.

## 8. Known Issues & Potential Pitfalls

*   **Markdown Parsing & Format Variations:**\
    Different awesome lists may have slight deviations from the expected Markdown structure. The application must be prepared to handle these gracefully, providing corrective suggestions without halting the process.
*   **GitHub API Rate Limits:**\
    Frequent interactions with GitHub could hit rate limits. Developers should implement strategies to handle rate limit errors and inform users if such issues occur.
*   **Metadata Scraping Failures:**\
    If the system cannot extract metadata from a project URL, it must seamlessly allow for manual input. Clear and user-friendly notifications are essential to reduce frustration.
*   **Containerization Challenges:**\
    Ensuring that both the frontend and backend containers work harmoniously, especially in different development and production environments, may require extra attention in configuration.
*   **Complexity of Error Handling:**\
    Detailed error reporting for both import and editing may lead to complicated UI logic. Developers should prioritize clear, concise error messages and consider a dedicated error feedback panel.
*   **Scheduled Syncing Configuration:**\
    While manual publish/sync is the primary function, optional scheduled updates could introduce complexity. These features should be modular and optional so that they can be enabled without disrupting core functionality.

By keeping these potential issues in mind and developing with clear error-handling strategies, the project can mitigate many common pitfalls during development and integration.

This Project Requirements Document is designed to be the main brain for the Awesome List Manager project. Subsequent technical documents—covering the tech stack, frontend guidelines, backend structure, app flow, file organization, and IDE rules—will be based on the information provided here.
