// @ts-check
const { test, expect } = require('@playwright/test');

test('basic test', async ({ page }) => {
  await page.goto('http://localhost:3001');
  // Check if the page loads successfully
  await expect(page).toHaveURL('http://localhost:3001/');
  
  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');
  
  console.log('Page loaded successfully');
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'homepage.png' });
});
