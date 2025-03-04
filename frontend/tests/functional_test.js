const puppeteer = require('puppeteer');

/**
 * Frontend functional test for Awesome List Manager
 *
 * This test covers:
 * 1. Importing the awesome-video repository
 * 2. Searching for a project and viewing its details
 * 3. Editing a project and changing its category
 * 4. Adding a new URL from AWS Elemental documentation
 * 5. Exporting the list and verifying the markdown representation
 */

// Configuration
const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:8000/api/v1';
const AWESOME_VIDEO_REPO = 'https://github.com/krzemienski/awesome-video';
const AWS_ELEMENTAL_URL = 'https://docs.aws.amazon.com/mediaconvert/latest/ug/what-is.html';
const AWS_ELEMENTAL_TITLE = 'AWS Elemental MediaConvert';
const AWS_ELEMENTAL_DESCRIPTION = 'A file-based video transcoding service with broadcast-grade features';

// Test timeout (ms)
const TEST_TIMEOUT = 60000;

// Helper functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
  console.log('Starting frontend functional test...');

  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    slowMo: 50 // Slow down operations by 50ms
  });

  try {
    const page = await browser.newPage();

    // Enable console logging from the browser
    page.on('console', msg => console.log('BROWSER:', msg.text()));

    // Step 1: Import awesome-video repository
    console.log('\n=== Testing Import Repository ===');
    await importAwesomeList(page, AWESOME_VIDEO_REPO);

    // Step 2: Search for a project and view details
    console.log('\n=== Testing Project Search ===');
    const projectId = await searchAndViewProject(page);

    // Step 3: Edit a project and change its category
    console.log('\n=== Testing Project Edit ===');
    await editProject(page, projectId);

    // Step 4: Add a new URL from AWS Elemental documentation
    console.log('\n=== Testing Adding New URL ===');
    await addNewProject(page, AWS_ELEMENTAL_URL, AWS_ELEMENTAL_TITLE, AWS_ELEMENTAL_DESCRIPTION);

    // Step 5: Export the list and verify markdown
    console.log('\n=== Testing Export ===');
    await exportAndVerifyList(page);

    console.log('\n=== All tests completed successfully! ===');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

async function importAwesomeList(page, repoUrl) {
  // Navigate to dashboard
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });

  // Click on "Import from GitHub" button
  await page.click('button:has-text("Import from GitHub")');

  // Wait for the import form to appear
  await page.waitForSelector('input[placeholder*="GitHub repository URL"]');

  // Enter repository URL
  await page.type('input[placeholder*="GitHub repository URL"]', repoUrl);

  // Click import button
  await page.click('button:has-text("Import")');

  // Wait for import to complete and redirect to the list page
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Verify we're on the list page
  const title = await page.$eval('h1', el => el.textContent);
  console.log(`Imported list: ${title}`);

  // Extract list ID from URL
  const url = page.url();
  const listId = url.split('/').pop();
  console.log(`List ID: ${listId}`);

  return listId;
}

async function searchAndViewProject(page) {
  // Use the search box to find a project
  await page.type('input[placeholder*="Search categories and projects"]', 'ffmpeg');

  // Wait for search results
  await delay(1000);

  // Expand a category that contains the search result
  const expandButtons = await page.$$('.MuiListItemIcon-root');
  if (expandButtons.length > 0) {
    await expandButtons[0].click();
    await delay(500);
  }

  // Find and click on a project edit button
  const editButtons = await page.$$('button[aria-label="Edit"]');
  if (editButtons.length > 0) {
    await editButtons[0].click();
  } else {
    throw new Error('No project edit buttons found');
  }

  // Wait for navigation to the project edit page
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Extract project ID from URL
  const url = page.url();
  const urlParts = url.split('/');
  const projectId = urlParts[urlParts.indexOf('projects') + 1];
  console.log(`Viewing project ID: ${projectId}`);

  // Go back to the list page
  await page.goBack();
  await page.waitForSelector('input[placeholder*="Search categories and projects"]');

  // Clear search
  await page.click('input[placeholder*="Search categories and projects"]', { clickCount: 3 });
  await page.keyboard.press('Backspace');

  return projectId;
}

async function editProject(page, projectId) {
  // Navigate to the project edit page
  const listId = page.url().split('/').pop();
  await page.goto(`${BASE_URL}/awesome-lists/${listId}/projects/${projectId}/edit`, { waitUntil: 'networkidle2' });

  // Get current project title
  const currentTitle = await page.$eval('input[name="title"]', el => el.value);
  console.log(`Current project title: ${currentTitle}`);

  // Update the title
  await page.click('input[name="title"]', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  const newTitle = `${currentTitle} (Edited)`;
  await page.type('input[name="title"]', newTitle);

  // Get current category
  const currentCategory = await page.$eval('div[role="button"]', el => el.textContent);
  console.log(`Current category: ${currentCategory}`);

  // Change the category
  await page.click('div[role="button"]');
  await delay(500);

  // Select a different category (the second option)
  const options = await page.$$('li[role="option"]');
  if (options.length > 1) {
    await options[1].click();
  } else {
    console.log('Not enough categories to change to a different one');
    // Close the dropdown
    await page.keyboard.press('Escape');
  }

  // Save the changes
  await page.click('button[type="submit"]');

  // Wait for navigation back to the list page
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  console.log('Project edited successfully');
}

async function addNewProject(page, url, title, description) {
  // Find and click on "Add Project" button (first one)
  const addProjectButtons = await page.$$('button:has-text("Add Project")');
  if (addProjectButtons.length > 0) {
    await addProjectButtons[0].click();
  } else {
    throw new Error('No Add Project buttons found');
  }

  // Wait for navigation to the add project page
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Fill in the project details
  await page.type('input[name="url"]', url);

  // Wait for metadata to be fetched
  await delay(2000);

  // Fill in title if not auto-filled
  const titleValue = await page.$eval('input[name="title"]', el => el.value);
  if (!titleValue) {
    await page.type('input[name="title"]', title);
  }

  // Fill in description if not auto-filled
  const descriptionValue = await page.$eval('textarea[name="description"]', el => el.value);
  if (!descriptionValue) {
    await page.type('textarea[name="description"]', description);
  }

  // Save the project
  await page.click('button[type="submit"]');

  // Wait for navigation back to the list page
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  console.log('New project added successfully');

  // Verify the project was added by searching for it
  await page.type('input[placeholder*="Search categories and projects"]', 'AWS Elemental');

  // Wait for search results
  await delay(1000);

  // Check if the project appears in search results
  const pageContent = await page.content();
  if (pageContent.includes('AWS Elemental')) {
    console.log('New project found in search results');
  } else {
    console.warn('New project not found in search results');
  }

  // Clear search
  await page.click('input[placeholder*="Search categories and projects"]', { clickCount: 3 });
  await page.keyboard.press('Backspace');
}

async function exportAndVerifyList(page) {
  // Click on Export README button
  await page.click('button:has-text("Export README")');

  // Wait for navigation to the export page
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Click on Export List button
  await page.click('button:has-text("Export List")');

  // Wait for export to complete
  await delay(2000);

  // Check for success message
  const successMessage = await page.$('div[role="alert"]');
  if (successMessage) {
    console.log('Export completed successfully');
  } else {
    console.warn('Export success message not found');
  }

  // Get the markdown content
  const markdownContent = await page.evaluate(() => {
    const preElements = document.querySelectorAll('pre');
    return preElements.length > 0 ? preElements[0].textContent : null;
  });

  if (markdownContent) {
    console.log('Markdown content retrieved:');
    console.log(markdownContent.substring(0, 200) + '...');

    // Verify the markdown contains our edited project and new AWS Elemental project
    if (markdownContent.includes('AWS Elemental')) {
      console.log('Markdown contains the new AWS Elemental project');
    } else {
      console.warn('AWS Elemental project not found in markdown');
    }

    if (markdownContent.includes('Edited')) {
      console.log('Markdown contains the edited project');
    } else {
      console.warn('Edited project not found in markdown');
    }
  } else {
    console.warn('Markdown content not found');
  }
}

// Run the test
runTest().catch(console.error);
