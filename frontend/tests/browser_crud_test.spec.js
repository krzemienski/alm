// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Browser-based CRUD test for Awesome List Manager
 * This test validates both frontend and backend functionality by:
 * 1. Importing a list from GitHub
 * 2. Performing CRUD operations via the browser
 * 3. Adding a new AWS documentation link
 * 4. Verifying export functionality
 */
test.describe('Awesome List Manager Browser CRUD Tests', () => {
  let awesomeListId;

  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3001');

    // Ensure app has loaded
    await page.waitForLoadState('networkidle');

    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/home-page.png' });

    console.log('Navigated to home page');
  });

  test('1. Import awesome-video repository from GitHub', async ({ page }) => {
    console.log('Starting import test...');

    // Navigate to dashboard - use exact text to avoid ambiguity with multiple dashboard links
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await page.waitForLoadState('networkidle');

    // Click on Import from GitHub button
    await page.getByRole('button', { name: /import/i }).click();
    await page.waitForLoadState('networkidle');

    // Fill in the GitHub URL
    await page.getByLabel(/github url/i).fill('https://github.com/krzemienski/awesome-video');

    // Take screenshot before import
    await page.screenshot({ path: 'test-results/before-import.png' });

    // Click Import button
    await page.getByRole('button', { name: /import/i }).click();

    // Wait for import to complete (this may take some time)
    await page.waitForTimeout(10000);
    await page.waitForLoadState('networkidle');

    // Take screenshot after import
    await page.screenshot({ path: 'test-results/after-import.png' });

    // Store the ID of the imported list for future tests
    const url = page.url();
    const match = url.match(/\/awesome-lists\/(\d+)/);
    if (match) {
      awesomeListId = match[1];
      console.log(`Captured awesome list ID: ${awesomeListId}`);
    } else {
      // If we can't get the ID from URL, try to find it on the page
      console.log('Could not extract list ID from URL, will try to continue without it');
    }

    // Verify import was successful by checking for content
    await expect(page.locator('body')).toContainText(/awesome video/i);
    console.log('Import test completed successfully');
  });

  test('2. Read - View categories and projects', async ({ page }) => {
    console.log('Starting read test...');

    // Navigate to dashboard - use exact text to avoid ambiguity with multiple dashboard links
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await page.waitForLoadState('networkidle');

    // Find and click on the imported list
    await page.getByText(/awesome video/i).first().click();
    await page.waitForLoadState('networkidle');

    // Take screenshot of the list view
    await page.screenshot({ path: 'test-results/list-view.png' });

    // Verify categories are displayed
    await expect(page.locator('body')).toContainText(/categories/i);

    // Expand categories if needed
    try {
      const expandButtons = await page.getByRole('button', { name: /expand/i }).all();
      for (const button of expandButtons) {
        await button.click();
        await page.waitForTimeout(500);
      }
    } catch (e) {
      console.log('Could not find expand buttons, categories may already be expanded');
    }

    // Take screenshot of expanded categories
    await page.screenshot({ path: 'test-results/expanded-categories.png' });

    // Verify projects are displayed
    await expect(page.locator('body')).toContainText(/ffmpeg/i);

    console.log('Read test completed successfully');
  });

  test('3. Create - Add a new category', async ({ page }) => {
    console.log('Starting create category test...');

    // Navigate to dashboard - use exact text to avoid ambiguity with multiple dashboard links
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await page.waitForLoadState('networkidle');

    // Find and click on the imported list
    await page.getByText(/awesome video/i).first().click();
    await page.waitForLoadState('networkidle');

    // Look for add category button
    await page.getByRole('button', { name: /add category/i }).click();
    await page.waitForLoadState('networkidle');

    // Fill in category form
    await page.getByLabel(/name/i).fill('AWS Documentation');

    // Take screenshot before saving
    await page.screenshot({ path: 'test-results/before-save-category.png' });

    // Save the category
    await page.getByRole('button', { name: /save|create|add/i }).click();
    await page.waitForLoadState('networkidle');

    // Take screenshot after saving
    await page.screenshot({ path: 'test-results/after-save-category.png' });

    // Verify the new category was added
    await expect(page.locator('body')).toContainText(/AWS Documentation/i);

    console.log('Create category test completed successfully');
  });

  test('4. Create - Add a new project to AWS Documentation category', async ({ page }) => {
    console.log('Starting create project test...');

    // Navigate to dashboard - use exact text to avoid ambiguity with multiple dashboard links
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await page.waitForLoadState('networkidle');

    // Find and click on the imported list
    await page.getByText(/awesome video/i).first().click();
    await page.waitForLoadState('networkidle');

    // Find the AWS Documentation category
    await page.getByText(/AWS Documentation/i).click();
    await page.waitForTimeout(1000);

    // Look for add project button
    await page.getByRole('button', { name: /add project|new project/i }).click();
    await page.waitForLoadState('networkidle');

    // Fill in project form
    await page.getByLabel(/url/i).fill('https://docs.aws.amazon.com');
    await page.waitForTimeout(2000); // Wait for metadata to load

    await page.getByLabel(/title/i).fill('AWS Documentation');
    await page.getByLabel(/description/i).fill('Official AWS documentation for all AWS services including video processing and streaming.');

    // Take screenshot before saving
    await page.screenshot({ path: 'test-results/before-save-project.png' });

    // Save the project
    await page.getByRole('button', { name: /save|create|add/i }).click();
    await page.waitForLoadState('networkidle');

    // Take screenshot after saving
    await page.screenshot({ path: 'test-results/after-save-project.png' });

    // Verify the new project was added
    await expect(page.locator('body')).toContainText(/AWS Documentation/i);

    console.log('Create project test completed successfully');
  });

  test('5. Update - Edit the AWS Documentation category', async ({ page }) => {
    console.log('Starting update category test...');

    // Navigate to dashboard - use exact text to avoid ambiguity with multiple dashboard links
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await page.waitForLoadState('networkidle');

    // Find and click on the imported list
    await page.getByText(/awesome video/i).first().click();
    await page.waitForLoadState('networkidle');

    // Find the AWS Documentation category and click edit
    await page.getByText(/AWS Documentation/i).hover();
    await page.waitForTimeout(1000);

    // Look for edit button or icon near the category
    try {
      // Try to find edit button by role
      await page.getByRole('button', { name: /edit/i }).click();
    } catch (e) {
      console.log('Could not find edit button by role, trying alternatives');
      try {
        // Try to find by text
        await page.getByText(/edit/i).click();
      } catch (e2) {
        console.log('Could not find edit text, trying to find edit icon');
        // Try to find edit icon (often a pencil icon)
        const editIcons = await page.locator('svg').all();
        let clicked = false;
        for (const icon of editIcons) {
          if (!clicked) {
            try {
              await icon.click();
              clicked = true;
              console.log('Clicked an icon that might be edit');
              await page.waitForTimeout(1000);
            } catch (e3) {
              // Continue trying other icons
            }
          }
        }
      }
    }

    await page.waitForLoadState('networkidle');

    // Update the category name
    await page.getByLabel(/name/i).fill('AWS Documentation and Resources');

    // Take screenshot before saving
    await page.screenshot({ path: 'test-results/before-update-category.png' });

    // Save the category
    await page.getByRole('button', { name: /save|update/i }).click();
    await page.waitForLoadState('networkidle');

    // Take screenshot after saving
    await page.screenshot({ path: 'test-results/after-update-category.png' });

    // Verify the category was updated
    await expect(page.locator('body')).toContainText(/AWS Documentation and Resources/i);

    console.log('Update category test completed successfully');
  });

  test('6. Update - Edit the AWS Documentation project', async ({ page }) => {
    console.log('Starting update project test...');

    // Navigate to dashboard - use exact text to avoid ambiguity with multiple dashboard links
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await page.waitForLoadState('networkidle');

    // Find and click on the imported list
    await page.getByText(/awesome video/i).first().click();
    await page.waitForLoadState('networkidle');

    // Find the AWS Documentation project
    await page.getByText(/AWS Documentation/i).click();
    await page.waitForTimeout(1000);

    // Look for the project and click on it
    await page.getByText(/AWS Documentation/i).click();
    await page.waitForTimeout(1000);

    // Look for edit button
    await page.getByRole('button', { name: /edit/i }).click();
    await page.waitForLoadState('networkidle');

    // Update the project title and description
    await page.getByLabel(/title/i).fill('AWS Documentation Portal');
    await page.getByLabel(/description/i).fill('Comprehensive documentation for all AWS services including video processing, streaming, and delivery.');

    // Take screenshot before saving
    await page.screenshot({ path: 'test-results/before-update-project.png' });

    // Save the project
    await page.getByRole('button', { name: /save|update/i }).click();
    await page.waitForLoadState('networkidle');

    // Take screenshot after saving
    await page.screenshot({ path: 'test-results/after-update-project.png' });

    // Verify the project was updated
    await expect(page.locator('body')).toContainText(/AWS Documentation Portal/i);

    console.log('Update project test completed successfully');
  });

  test('7. Delete - Remove a project', async ({ page }) => {
    console.log('Starting delete project test...');

    // First, create a project to delete
    // Navigate to dashboard - use exact text to avoid ambiguity with multiple dashboard links
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await page.waitForLoadState('networkidle');

    // Find and click on the imported list
    await page.getByText(/awesome video/i).first().click();
    await page.waitForLoadState('networkidle');

    // Find the AWS Documentation category
    await page.getByText(/AWS Documentation/i).click();
    await page.waitForTimeout(1000);

    // Look for add project button
    await page.getByRole('button', { name: /add project|new project/i }).click();
    await page.waitForLoadState('networkidle');

    // Fill in project form for a temporary project
    await page.getByLabel(/url/i).fill('https://aws.amazon.com/mediaconvert/');
    await page.waitForTimeout(2000); // Wait for metadata to load

    await page.getByLabel(/title/i).fill('AWS MediaConvert (Temporary)');
    await page.getByLabel(/description/i).fill('This is a temporary project that will be deleted.');

    // Save the project
    await page.getByRole('button', { name: /save|create|add/i }).click();
    await page.waitForLoadState('networkidle');

    // Verify the new project was added
    await expect(page.locator('body')).toContainText(/AWS MediaConvert/i);

    // Now delete the project
    await page.getByText(/AWS MediaConvert/i).click();
    await page.waitForTimeout(1000);

    // Look for delete button
    await page.getByRole('button', { name: /delete|remove/i }).click();
    await page.waitForTimeout(1000);

    // Confirm deletion if there's a confirmation dialog
    try {
      await page.getByRole('button', { name: /confirm|yes|delete/i }).click();
    } catch (e) {
      console.log('No confirmation dialog found, continuing');
    }

    await page.waitForLoadState('networkidle');

    // Take screenshot after deletion
    await page.screenshot({ path: 'test-results/after-delete-project.png' });

    // Verify the project was deleted (should not be visible anymore)
    const content = await page.content();
    expect(content.includes('AWS MediaConvert (Temporary)')).toBeFalsy();

    console.log('Delete project test completed successfully');
  });

  test('8. Export - Export the list and verify markdown format', async ({ page }) => {
    console.log('Starting export test...');

    // Navigate to dashboard - use exact text to avoid ambiguity with multiple dashboard links
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await page.waitForLoadState('networkidle');

    // Find and click on the imported list
    await page.getByText(/awesome video/i).first().click();
    await page.waitForLoadState('networkidle');

    // Look for export button
    await page.getByRole('button', { name: /export|generate/i }).click();
    await page.waitForLoadState('networkidle');

    // Take screenshot of export page
    await page.screenshot({ path: 'test-results/export-page.png' });

    // Verify export contains markdown elements
    const exportContent = await page.locator('pre').textContent();

    // Check for markdown elements
    expect(exportContent).toContain('#'); // Headers
    expect(exportContent).toContain('##'); // Subheaders
    expect(exportContent).toContain(']('); // Links

    // Check for our added content
    expect(exportContent).toContain('AWS Documentation');

    console.log('Export test completed successfully');
  });
});
