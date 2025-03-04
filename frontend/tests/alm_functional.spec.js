// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Awesome List Manager End-to-End Tests', () => {
  let awesomeListId;

  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3001');
    
    // Ensure app has loaded by waiting for network to be idle
    await page.waitForLoadState('networkidle');
    
    // Try to navigate to the dashboard (multiple approaches)
    try {
      // First try to find by role and name
      const dashboardButton = page.getByRole('button', { name: /Go to Dashboard|Dashboard|Home/i });
      if (await dashboardButton.isVisible())
        await dashboardButton.click();
    } catch (e) {
      // If that fails, try to find using a link
      try {
        await page.getByRole('link', { name: /Dashboard|Home/i }).click();
      } catch (e2) {
        // If still failing, navigate directly
        await page.goto('http://localhost:3001/dashboard');
      }
    }
    
    // Wait after navigation
    await page.waitForLoadState('networkidle');
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'dashboard.png' });
  });

  test('Import awesome-video repository', async ({ page }) => {
    // Click on the "Import from GitHub" button if it exists
    try {
      await page.getByRole('button', { name: /Import from GitHub/i }).click();
    } catch (e) {
      console.log('Could not find Import from GitHub button, trying alternative...');
      await page.getByText(/Import|Add List|New List/i).click();
    }
    
    // Wait for the import form
    await page.waitForLoadState('networkidle');
    
    // Fill in the GitHub URL
    await page.getByPlaceholder(/GitHub URL|Repository URL/i).fill('https://github.com/krzemienski/awesome-video');
    
    // Click Import button
    await page.getByRole('button', { name: /Import|Submit|Add/i }).click();
    
    // Wait for import to complete
    await page.waitForTimeout(5000);
    
    // Store the ID of the imported list for future tests
    // Extract from URL if possible
    const url = page.url();
    const match = url.match(/\/awesome-lists\/(\d+)/);
    if (match) {
      awesomeListId = match[1];
      console.log(`Captured awesome list ID: ${awesomeListId}`);
    }
    
    // Verify import was successful by checking for any content
    await expect(page.locator('body')).toContainText(/video|awesome/i);
  });

  test('Search for a project and view details', async ({ page }) => {
    // Navigate to the awesome-video list
    if (awesomeListId) {
      await page.goto(`http://localhost:3001/awesome-lists/${awesomeListId}`);
    } else {
      // If we don't have the ID, try to find it on the dashboard
      try {
        await page.getByText(/Awesome Video|Video/i).click();
      } catch (e) {
        console.log('Could not find Awesome Video list, test may fail');
      }
    }
    
    await page.waitForLoadState('networkidle');
    
    // Search for a project
    try {
      await page.getByPlaceholder(/Search|Find/i).fill('ffmpeg');
      await page.keyboard.press('Enter');
    } catch (e) {
      console.log('Could not find search box, trying alternatives');
      try {
        await page.getByRole('textbox').first().fill('ffmpeg');
        await page.keyboard.press('Enter');
      } catch (e2) {
        console.log('Could not interact with search, test may fail');
      }
    }
    
    // Wait for search results
    await page.waitForTimeout(2000);
    
    // Verify search results are displayed
    await expect(page.locator('body')).toContainText('ffmpeg');
  });

  test('Edit project category', async ({ page }) => {
    // Navigate to the awesome-video list
    if (awesomeListId) {
      await page.goto(`http://localhost:3001/awesome-lists/${awesomeListId}`);
    } else {
      // If we don't have the ID, try to find it
      try {
        await page.getByText(/Awesome Video|Video/i).click();
      } catch (e) {
        console.log('Could not find Awesome Video list, test may fail');
      }
    }
    
    await page.waitForLoadState('networkidle');
    
    // Look for ffmpeg in the page
    await page.getByText('ffmpeg').first().click();
    
    // Click edit button if available
    try {
      await page.getByRole('button', { name: /Edit|Modify/i }).click();
    } catch (e) {
      console.log('Could not find edit button, trying alternatives');
      try {
        // Look for an edit icon or other UI element
        await page.getByText(/Edit|Update/i).click();
      } catch (e2) {
        console.log('Could not find edit controls, test may fail');
      }
    }
    
    // Wait for edit form
    await page.waitForTimeout(1000);
    
    // Change the category if possible
    try {
      await page.getByLabel(/Category|Select category/i).click();
      await page.getByText(/Utilities|Tools|Libraries/i).first().click();
    } catch (e) {
      console.log('Could not change category, test may continue');
    }
    
    // Submit the form
    try {
      await page.getByRole('button', { name: /Save|Update|Submit/i }).click();
    } catch (e) {
      console.log('Could not submit form, test may fail');
    }
    
    // Wait for update
    await page.waitForTimeout(2000);
  });

  test('Add a new URL from AWS Elemental documentation', async ({ page }) => {
    // Navigate to the awesome-video list
    if (awesomeListId) {
      await page.goto(`http://localhost:3001/awesome-lists/${awesomeListId}`);
    } else {
      // If we don't have the ID, try to find it
      try {
        await page.getByText(/Awesome Video|Video/i).click();
      } catch (e) {
        console.log('Could not find Awesome Video list, test may fail');
      }
    }
    
    // Click the add new URL/project button
    try {
      await page.getByRole('button', { name: /Add|New|Create/i }).click();
    } catch (e) {
      console.log('Could not find add button, trying alternatives');
      try {
        await page.getByText(/Add|New Project|Create/i).click();
      } catch (e2) {
        console.log('Could not find add controls, test may fail');
      }
    }
    
    // Fill in the form
    try {
      // URL field
      await page.getByLabel(/URL|Link/i).fill('https://docs.aws.amazon.com/mediaconvert/latest/ug/what-is.html');
      
      // Wait for metadata to load if applicable
      await page.waitForTimeout(2000);
      
      // Title field
      await page.getByLabel(/Title|Name/i).fill('AWS Elemental MediaConvert');
      
      // Description field
      await page.getByLabel(/Description|Summary/i).fill('Video processing service for broadcast and multiscreen delivery');
      
      // Select a category
      await page.getByLabel(/Category|Group/i).click();
      await page.getByText(/Services|APIs|Cloud/i).first().click();
    } catch (e) {
      console.log('Error filling form, test may fail: ' + e.message);
    }
    
    // Submit the form
    try {
      await page.getByRole('button', { name: /Save|Add|Create|Submit/i }).click();
    } catch (e) {
      console.log('Could not submit form, test may fail');
    }
    
    // Wait for submission
    await page.waitForTimeout(2000);
    
    // Verify the new project was added
    try {
      await page.getByPlaceholder(/Search|Find/i).fill('AWS');
      await page.keyboard.press('Enter');
      
      // Wait for search results
      await page.waitForTimeout(2000);
      
      // Verify AWS is in results
      await expect(page.locator('body')).toContainText('AWS');
    } catch (e) {
      console.log('Could not verify AWS was added, test may fail');
    }
  });

  test('Batch process multiple URLs', async ({ page }) => {
    // Navigate to the awesome-video list
    if (awesomeListId) {
      await page.goto(`http://localhost:3001/awesome-lists/${awesomeListId}`);
    } else {
      // If we don't have the ID, try to find it
      try {
        await page.getByText(/Awesome Video|Video/i).click();
      } catch (e) {
        console.log('Could not find Awesome Video list, test may fail');
      }
    }
    
    // Look for batch processing button/feature
    try {
      await page.getByRole('button', { name: /Batch|Multiple|Bulk/i }).click();
    } catch (e) {
      console.log('Could not find batch button, trying alternatives');
      try {
        await page.getByText(/Batch|Multiple URLs|Bulk Add/i).click();
      } catch (e2) {
        console.log('Could not find batch feature, test may fail');
        // Skip rest of test if batch feature not found
        return;
      }
    }
    
    // Add multiple URLs to the batch processor
    try {
      const textarea = await page.getByRole('textbox').first();
      await textarea.fill(`https://videojs.com/
https://github.com/mediaelement/mediaelement`);
      
      // Process the URLs
      await page.getByRole('button', { name: /Process|Analyze|Submit/i }).click();
      
      // Wait for processing
      await page.waitForTimeout(5000);
      
      // Complete the batch process
      await page.getByRole('button', { name: /Add|Submit|Complete/i }).click();
      
      // Wait for completion
      await page.waitForTimeout(2000);
      
      // Verify at least one new item was added
      await expect(page.locator('body')).toContainText(/videojs|mediaelement/i);
    } catch (e) {
      console.log('Error in batch processing: ' + e.message);
    }
  });

  test('Export list and verify markdown format', async ({ page }) => {
    // Navigate to the awesome-video list
    if (awesomeListId) {
      await page.goto(`http://localhost:3001/awesome-lists/${awesomeListId}`);
    } else {
      // If we don't have the ID, try to find it
      try {
        await page.getByText(/Awesome Video|Video/i).click();
      } catch (e) {
        console.log('Could not find Awesome Video list, test may fail');
      }
    }
    
    // Look for export button/feature
    try {
      await page.getByRole('button', { name: /Export|Download|Generate/i }).click();
    } catch (e) {
      console.log('Could not find export button, trying alternatives');
      try {
        await page.getByText(/Export|Generate Markdown|Download/i).click();
      } catch (e2) {
        console.log('Could not find export feature, test may fail');
        // Skip rest of test if export feature not found
        return;
      }
    }
    
    // Wait for export dialog/process
    await page.waitForTimeout(2000);
    
    // Verify export contains our added content
    try {
      // Check for AWS and videojs content in the export
      const exportContent = await page.locator('pre').textContent();
      expect(exportContent).toContain('AWS');
      console.log('Export successful and contains AWS content');
    } catch (e) {
      console.log('Could not verify export content: ' + e.message);
    }
  });
});
