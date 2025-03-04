# Functional Tests for Awesome List Manager

This directory contains end-to-end functional tests for the Awesome List Manager (ALM) application using Playwright.

## Test Coverage

The functional tests verify the following features:

1. **Import Repository**: Import an existing awesome list from GitHub
2. **Search Functionality**: Search for projects within an awesome list
3. **Project Management**: View and edit project details
4. **Category Management**: Change project categories
5. **URL Processing**: Add new URLs with AI-suggested categorization
6. **Batch URL Processing**: Process multiple URLs simultaneously
7. **Export Functionality**: Export lists as markdown

## Running the Tests

### Prerequisites

- Node.js 18+
- ALM backend and frontend services running
- Playwright installed

### Installation

Install Playwright and its browsers:

```bash
npm install
npx playwright install
```

### Running Tests

Run all functional tests:

```bash
npm run test:playwright
```

Or run a specific test:

```bash
npx playwright test tests/playwright_functional_test.js
```

### Test Reports

After running the tests, view the HTML report:

```bash
npx playwright show-report
```

## Test Structure

The tests are organized to run in sequence, as they build upon each other. For example:

1. First, we import a repository
2. Then we search for projects in that repository
3. Then we edit those projects
4. And so on

This ensures a complete end-to-end verification of the application's functionality.

## Troubleshooting

- If tests fail with timeout errors, try increasing the timeout values in `playwright.config.js`
- If selector errors occur, check if the UI has changed and update the selectors accordingly
- Ensure both frontend and backend services are running before executing tests
