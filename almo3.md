# Awesome List Manager (alm) — Cursor Build Prompt (Context7 MCP)

> **‼️ Critical Addendum (May 20 2025)**
>
> 1. **No GitHub integrations whatsoever.** The application *must never* authenticate to GitHub, call the GitHub REST/GraphQL APIs, or push/commit on the user’s behalf. All interactions with Git‑hosted awesome lists happen **only** through unauthenticated HTTP `raw.githubusercontent.com` fetches. Exported README files are downloaded locally for the user to commit manually.
> 2. **No unit tests.** All automated verification is performed exclusively through **black‑box functional tests** that exercise the running Docker stack (see `scripts/functional‑test.sh`). Remove any reference to unit, integration, or mocked tests from the specification.

---

## Baseline Original Prompt (verbatim)

<details>
<summary>Click to expand the raw specification provided by the user</summary>

```markdown
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
*(unchanged; see original)*

### 2. User Workflows & Administrative Panel
*(unchanged; see original)*

### 3. Backend API & Database
*(unchanged; see original)*

### 4. Frontend Application & Layout
*(unchanged; see original)*

### ~~5. GitHub Integration~~
**Removed.** No GitHub tokens/OAuth, web‑hooks, or push operations are permitted. All interactions use unauthenticated raw‑content URLs only.

### 5. Deployment & Containerization
*(renumbered; unchanged)*

### 6. Functional Testing & Validation
All automated testing **must be functional**. The external harness (`scripts/functional‑test.sh`) drives the live Docker stack and Playwright UI smoke tests. **No unit or mocked tests are allowed.**

### 7. Coding & Documentation Standards
*(renumbered; unchanged)*
```

</details>

---

## Cursor‑Specific Enhancements & Workflow (Context7 MCP)

> **Feed this document directly into Cursor’s code‑generation agent.**
> Combines the raw prompt with Docker‑first execution, ShadCN dark theme, **Context7 MCP** integration, separate **Memory MCP**, and an external functional‑test harness.
> This is the **single source of truth**—all earlier drafts are obsolete.

---

### 0 · Global Execution Rules (Cursor)

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

### 1 · Project Overview

**Awesome List Manager (alm)** imports, edits, validates, and republishes awesome lists **without any GitHub integration**:

* **Import** public awesome list via raw README URL—token‑free fetch.
* **Edit** categories, sub‑categories, and items in a ShadCN dark‑theme UI.
* **Validate** with `awesome-lint` + `awesome_bot`.
* **Export** spec‑compliant README that users download locally (no automatic push).
* **Docker‑only** execution; SSE event logs; external black‑box functional tests.

---

### 2 · Key References & Resources

| Topic          | Link                                                                                                                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canonical spec | [https://github.com/sindresorhus/awesome](https://github.com/sindresorhus/awesome)                                                                                                       |
| Example lists  | [https://github.com/vsouza/awesome-ios](https://github.com/vsouza/awesome-ios), [https://github.com/dypsilon/frontend-dev-bookmarks](https://github.com/dypsilon/frontend-dev-bookmarks) |
| Lint tools     | **awesome-lint**, **awesome\_bot**                                                                                                                                                       |
| Test fixture   | [https://github.com/krzemienski/awesome-video](https://github.com/krzemienski/awesome-video)                                                                                             |

---

### 3 · Architecture

| Layer                    | Stack                                                   |
| ------------------------ | ------------------------------------------------------- |
| **Frontend**             | Next.js 14 (App Router), Tailwind, **shadcn/ui** (dark) |
| **Backend**              | FastAPI, async SQLAlchemy, structlog                    |
| **Database**             | Postgres 15                                             |
| **Events**               | Plain FastAPI SSE endpoint (`/events`) — *no Redis*     |
| **Reverse proxy (prod)** | Nginx (optional)                                        |

```
Browser ──SSE /events──▶ FastAPI ──▶ Postgres
           ▲              ▲
           └───REST /api──┘
```

#### 3A · Awesome‑List Spec & Token‑Free Import Rule

*Follow Sindre‑Sorhus spec (title, description, TOC optional, `##` categories, `###` sub‑cats, bullet items).*

**Never call GitHub REST API.** Derive raw README URL:

```
https://raw.githubusercontent.com/<owner>/<repo>/refs/heads/<branch>/README.md
```

Example: `https://github.com/krzemienski/awesome-video` →
`https://raw.githubusercontent.com/krzemienski/awesome-video/refs/heads/master/README.md`

Validation:

1. **awesome-lint** clean.
2. **awesome\_bot** links 2xx (≤ 3 retries).
3. Emit `validate:lint` & `validate:links` events; fail import on any error.

---

### 4 · Development Phases

1. **Backend & functional tests**
2. **Frontend UI**
3. **Docs & CI**

---

### 5 · Docker & Compose (api · web · db)

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

### 6 · API Endpoints

Health, `/events`, `/import`, `/lists/{id}`, `/items`, `/categories`, `/export/{id}`, `/validate/{id}` — *no GitHub API usage*.

---

### 7 · UI Wireframes

*(Import, Dashboard, Edit Modal, Validation Report, Settings, Floating Log Console)*

---

### 8 · External Functional‑Test Harness (`scripts/functional-test.sh`)

* **T‑01 Import parity**
* **T‑02 CRUD**
* **T‑03 Export round‑trip**
* **T‑04 UI smoke (Playwright)**

---

### 9 · Context7 MCP Checkpoints

| Checkpoint  | Branch            | Commit     |
| ----------- | ----------------- | ---------- |
| `import-ok` | `feat/T01-import` | `pass:T01` |
| `crud-ok`   | `feat/T02-crud`   | `pass:T02` |
| `export-ok` | `feat/T03-export` | `pass:T03` |
| `ui-ok`     | `feat/T04-ui`     | `pass:T04` |

---

### 10 · Deliverables

1. Cursor repo with branches (no GitHub integration; local only)
2. Dockerfiles & compose
3. External functional‑test script & Playwright specs
4. README
5. Event logs visible via SSE & Context7 MCP timeline

---

> **Implement to this specification.** Use Context7 MCP (+ separate Memory MCP) for Git & ops; ensure external functional tests pass. **Docker‑only. No GitHub integration. No unit tests.**
