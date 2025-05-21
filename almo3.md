# Awesome List Manager (alm) — Cursor Build Prompt (Context7 MCP)

> **‼️ Critical Constraints (May 20 2025)**
>
> 1. **Absolutely no GitHub integrations.** The application must **never** authenticate to GitHub, call any GitHub REST/GraphQL API, create web‑hooks, or push/commit on the user’s behalf. All interactions with third‑party repositories are *read‑only* via anonymous `raw.githubusercontent.com` fetches. Exported README files are downloaded locally so that the user can commit them manually.
> 2. **No unit tests or mocked tests.** All automated verification is carried out exclusively through **black‑box functional tests** that exercise the running Docker stack end‑to‑end (see `scripts/functional-test.sh`).
>
> These two rules are non‑negotiable and supersede any earlier instructions.

---

## Baseline Original Prompt (verbatim)

<details>
<summary>Click to expand the raw specification provided by the user</summary>

```markdown
# Awesome List Manager (alm) Project Prompt

## Project Title
Awesome List Manager (alm)

## Project Overview
The Awesome List Manager (alm) is a web application designed to generate, manage, and maintain “awesome lists” — curated repositories hosted on GitHub that follow a strict Markdown README specification. An awesome list is a repository that organizes projects (or resources) into categories—with optional subcategories—where each project entry includes a title, URL, and description. The application provides an administrative panel for users to **import an existing awesome list via its raw README URL** (token‑free), explore and edit its contents, and then **export** an updated, linted, and valid README file **for manual commit**. The project supports REST API endpoints for CRUD operations, integrates tools to validate links and the list format, and is fully containerized for self‑hosted deployment.

## Key References & Resources
- **Awesome List Concept:**
  - <https://github.com/sindresorhus/awesome>
- **Example Awesome Lists:**
  - <https://github.com/vsouza/awesome-ios>
  - <https://github.com/dypsilon/frontend-dev-bookmarks#readme>
- **Awesome List Tooling:**
  - <https://github.com/sindresorhus/awesome-lint>
  - <https://github.com/dkhamsing/awesome_bot>
- **Functional Testing Artifact:**
  - <https://github.com/krzemienski/awesome-video>

---

## Detailed Requirements

### 1. Understanding the Awesome List Specification
Based on research from the provided references, an awesome list must adhere to a consistent Markdown structure and style. The key guidelines include:

- **Header & Description:**
  - The README must start with a single top‑level header (using `#`) that serves as the list title (typically containing the word “Awesome”).
  - Immediately following the title, there should be a concise description outlining the purpose and scope of the list.
- **Table of Contents (Optional):** A table of contents can be included to facilitate navigation through different sections/categories.
- **Categories & Subcategories:**
  - The content is divided into sections using secondary headers (`##`) for main categories.
  - **Subcategories:** Within a main category, one or more subcategories can be defined using tertiary headers (`###`).
- **List Items (Projects):**
  - Bullet points (`*` or `-`) in the format `* [Project](URL) - description.`
  - Must include clickable link and brief description.
- **Curation & Consistency:** Manual curation, consistent styling.
- **Validation & Linting:** Use `awesome-lint` and `awesome_bot`.

### 2. User Workflows & Administrative Panel
The administrative UI supports the full lifecycle of an awesome list:

1. **Import**
   - User supplies a repository URL (`https://github.com/<owner>/<repo>`) or raw README URL.
   - Backend derives the raw path, fetches the Markdown, and parses it into an internal graph.
2. **Browse & Edit**
   - Tree‑view navigator for categories / sub‑categories.
   - Inline editors for titles, URLs, and descriptions (rich‑text with Markdown preview).
   - Drag‑and‑drop re‑ordering; bulk delete; search / filter.
3. **Validation**
   - On every save, `awesome-lint` and `awesome_bot` run asynchronously; results stream via Server‑Sent Events to a floating console.
   - Validation panel highlights lint errors and broken links with direct links to the offending line.
4. **Export**
   - Generates a new spec‑compliant README.
   - Offers **Download** (`README.md`) and **Copy‑to‑Clipboard** actions—*no automatic Git push.*
5. **History & Undo**
   - Local revision timeline with diff viewer; revert to any prior state.
6. **Settings**
   - Theme (dark / light), page width, link‑check retries, lint strictness.

### 3. Backend API & Database
- **Framework:** FastAPI (async) with Uvicorn.
- **Database:** PostgreSQL 15 via async SQLAlchemy + Alembic migrations.
- **Core Tables:** `lists`, `categories`, `items`, `imports`, `exports`, `validation_runs`.
- **Endpoints:**
  - `POST /import` → create list from raw URL.
  - `GET /lists/{id}` / `PATCH /lists/{id}` / `DELETE /lists/{id}`.
  - `POST /items` / `PATCH /items/{id}` / `DELETE /items/{id}`.
  - `GET /validate/{id}` triggers lint + link check.
  - `GET /export/{id}` returns generated README as a file download.
  - `GET /events` Server‑Sent Events stream (logs, lint, link check results).
- **Link Checking:** async HTTP client with retry/back‑off; max 3 retries; respects robots.
- **Logging:** `structlog` in JSON; forwarded to SSE stream.

### 4. Frontend Application & Layout
- **Stack:** Next.js 14 (App Router) + TypeScript, Tailwind CSS, **shadcn/ui** components, Zustand state management.
- **Pages / Routes:**
  - `/` Landing / Import form.
  - `/dashboard` list overview, editable tree, lint panel.
  - `/settings` app‑level preferences.
- **Components:** TreeNavigator, ItemEditorModal, ValidationConsole (SSE), DiffViewer, DownloadBar.
- **UX:** Sleek dark theme mirroring the OpenAI dashboard; keyboard shortcuts; optimistic UI.
- **Data Fetching:** React Query with stale‑while‑revalidate; SSE hook for real‑time updates.

### 5. Deployment & Containerization
- **Images:** `api` (FastAPI), `web` (Next.js), `db` (Postgres 15).
- **Orchestration:** Docker Compose v3.9; `docker compose up -d --build` is the only supported run mode—*never run code directly on the host.*
- **Prod Guidance:** optional Nginx reverse proxy, Traefik labels for self‑host.

### 6. Functional Testing & Validation
- **Test Driver:** `scripts/functional-test.sh` (Bash).
- **Playwright Suite:** UI smoke tests (`tests/ui/*.spec.ts`).
- **Scenarios:** import → edit → validate → export → README diff equality.
- **CI:** Container startup + driver script; build fails on any non‑zero exit.

### 7. Coding & Documentation Standards
- **Python:** PEP 8, type‑annotated; logger lines include ISO‑8601 timestamp + request ID.
- **TypeScript/React:** ESLint + Prettier.
- **Docs:** README with architecture diagram, setup, `docker compose` commands, functional test instructions.
```

</details>

---

## Cursor‑Specific Enhancements & Workflow (Context7 MCP)

> **Feed this document directly into Cursor’s code‑generation agent.**
> Combines the raw prompt with Docker‑first execution, ShadCN dark theme, **Context7 MCP** integration, separate **Memory MCP**, and an external functional‑test harness.
> This is the **single source of truth**—all earlier drafts are obsolete.

---

### 0 · Global Execution Rules (Cursor)

| ID      | Rule                                                                                                                                            |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **R‑1** | **Run everything via Docker** (`docker compose up -d --build`). Never invoke Python / Node or tests on the host.                                |
| **R‑2** | Functional verification is driven by `scripts/functional-test.sh`, which exercises the running stack over the local network.                    |
| **R‑3** | After each green functional suite, Cursor auto‑creates `feat/<unit>` branch and commits `pass:<unit>`.                                          |
| **R‑4** | **Event logs** stream as Server‑Sent Events from the backend and are mirrored to **Context7 MCP** (`event:<step>`). No Redis, no extra brokers. |
| **R‑5** | Use **Context7 MCP** for Git, shell / web ops, and timeline; **Memory MCP** handles all persistent memory.                                      |
| **R‑6** | **No GitHub integrations of any kind.** Never authenticate, push, or create PRs. Only fetch `raw.githubusercontent.com` assets anonymously.     |
| **R‑7** | **No unit tests.** All CI gates rely solely on black‑box functional tests (CLI + Playwright).                                                   |

---

### 1 · Project Overview

**Awesome List Manager (alm)** imports, edits, validates, and republishes awesome lists **without any GitHub integration**:

* **Import** public awesome list via raw README URL—token‑free fetch.
* **Edit** categories, sub‑categories, and items in a ShadCN dark‑theme UI.
* **Validate** with `awesome-lint` + `awesome_bot`.
* **Export** spec‑compliant README for manual commit—*no automatic push.*
* **Docker‑only** execution; SSE event logs; external black‑box functional tests.

---

### 2 · Key References & Resources

| Topic          | Link                                                                                                                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canonical spec | [https://github.com/sindresorhus/awesome](https://github.com/sindresorhus/awesome)                                                                                                       |
| Example lists  | [https://github.com/vsouza/awesome-ios](https://github.com/vsouza/awesome-ios), [https://github.com/dypsilon/frontend-dev-bookmarks](https://github.com/dypsilon/frontend-dev-bookmarks) |
| Lint tools     | **awesome-lint**, **awesome\_bot**                                                                                                                                                       |
| Test fixture   | [https://github.com/krzemienski/awesome-video](https://github.com/krzemienski/awesome-video)                                                                                             |

---

### 3 · Architecture (runtime view)

| Layer                    | Stack                                                   |
| ------------------------ | ------------------------------------------------------- |
| **Frontend**             | Next.js 14 (App Router), Tailwind, **shadcn/ui** (dark) |
| **Backend**              | FastAPI, async SQLAlchemy, structlog                    |
| **Database**             | Postgres 15                                             |
| **Events**               | Plain FastAPI SSE endpoint (`/events`) — *no Redis*     |
| **Reverse proxy (prod)** | Nginx (optional)                                        |

```
Browser ──SSE /events──▶ FastAPI ──▶ Postgres
           ▲              ▲
           └───REST /api──┘
```

#### 3A · Awesome‑List Spec & Token‑Free Import Rule

*(see Detailed Requirements §1 and §2)*

---

### 4 · Development Phases

1. **Backend + functional tests**
2. **Frontend UI**
3. **Docs & CI pipeline**

---

### 5 · Docker & Compose (api · web · db)

```yaml
version: "3.9"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: alm
      POSTGRES_PASSWORD: alm
      POSTGRES_DB: alm
    volumes: [db:/var/lib/postgresql/data]

  api:
    build: ./api
    depends_on: [db]
    environment:
      DATABASE_URL: postgresql+asyncpg://alm:alm@db:5432/alm
    ports: ["8000:8000"]

  web:
    build: ./web
    depends_on: [api]
    environment:
      NEXT_PUBLIC_API_BASE_URL: http://api:8000
    ports: ["3000:3000"]
volumes: { db: }
```

---

### 6 · API Endpoints

Health, `/events`, `/import`, `/lists/{id}`, `/items`, `/categories`, `/export/{id}`, `/validate/{id}` — *no GitHub API usage*.

---

### 7 · UI Wireframes

*(Import, Dashboard, Edit Modal, Validation Report, Settings, Floating Log Console)*

---

### 8 · External Functional‑Test Harness (`scripts/functional-test.sh`)

* **T‑01 Import parity**
* **T‑02 CRUD**
* **T‑03 Export round‑trip**
* **T‑04 UI smoke (Playwright)**

---

### 9 · Context7 MCP Checkpoints

| Checkpoint  | Branch            | Commit     |
| ----------- | ----------------- | ---------- |
| `import-ok` | `feat/T01-import` | `pass:T01` |
| `crud-ok`   | `feat/T02-crud`   | `pass:T02` |
| `export-ok` | `feat/T03-export` | `pass:T03` |
| `ui-ok`     | `feat/T04-ui`     | `pass:T04` |

---

### 10 · Deliverables

1. Cursor repo with local Git branches (no remote push)
2. Dockerfiles & compose
3. External functional‑test script & Playwright specs
4. README with architecture & usage
5. Event logs (SSE + Context7 MCP timeline)

---

> **Implement to this specification.** Use Context7 MCP (+ separate Memory MCP) for Git & ops; ensure functional tests pass via external harness. **Docker‑only, no GitHub integration, no unit tests.**
