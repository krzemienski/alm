# .windsurfrules

## Project Overview

*   **Type:** windsurf_file
*   **Description:** The Awesome List Manager (alm) is a web application designed to generate, manage, and maintain curated "awesome lists" on GitHub. It allows the user to import an existing awesome list via a GitHub URL, automatically parse its Markdown content into a structured format (with main categories, subcategories, and project entries), and then edit, add, or delete items in a dark-themed administrative panel. After modifications, the app exports a linted, compliant Markdown README back to GitHub.
*   **Primary Goal:** "The goal of the project is to ensure that awesome lists remain high quality and consistent in style by automating tasks such as linting and link checking, while seamlessly integrating GitHub for importing and exporting data."

## Project Structure

### Framework-Specific Routing

*   **Directory Rules:**

    *   Next.js 14 (App Router): Uses the `app/` directory structure with nested route folders, for example, `app/[route]/page.tsx` conventions.
    *   Example 1: "Next.js 14 (App Router)" → `app/[route]/page.tsx` conventions
    *   Example 2: "Next.js (Pages Router)" → `pages/[route].tsx` pattern
    *   Example 3: "React Router 6" → `src/routes/` with `createBrowserRouter`

### Core Directories

*   **Versioned Structure:**

    *   app/api: Next.js 14 API routes with Route Handlers for backend interactions (e.g., CRUD operations for the awesome list, categories, and project entries).
    *   Example 1: `app/api` → "Next.js 14 API routes using Route Handlers"
    *   Example 2: `src/views` → "Vue 3 composition API components"

### Key Files

*   **Stack-Versioned Patterns:**

    *   app/dashboard/layout.tsx: Implements Next.js 14 root layouts for the admin panel and dashboard.
    *   Example 1: `app/dashboard/layout.tsx` → "Next.js 14 root layouts"
    *   Example 2: `pages/_app.js` → "Next.js Pages Router customization"

## Tech Stack Rules

*   **Version Enforcement:**

    *   next@14: App Router is required; no usage of `getInitialProps` is allowed.
    *   flask@latest: Backend REST APIs to be implemented using Flask following production-ready coding standards.

## PRD Compliance

*   **Non-Negotiable:**

    *   "The goal of the project is to ensure that awesome lists remain high quality and consistent in style by automating tasks such as linting and link checking, while seamlessly integrating GitHub for importing and exporting data." : This emphasizes strict compliance with awesome list specifications, robust GitHub integration (with OAuth/token-based authentication), and comprehensive error handling including linting with awesome-lint and link verification with awesome_bot.

## App Flow Integration

*   **Stack-Aligned Flow:**

    *   Example: "Next.js 14 Import Flow → `app/import/page.tsx` initiates GitHub URL scraping and Markdown parsing using server actions, followed by a dashboard redirection for list management."
