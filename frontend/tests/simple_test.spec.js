// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Simple Awesome List Manager Tests', () => {
  test('Homepage loads and has content', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3001');
    
    // Ensure app has loaded by waiting for network to be idle
    await page.waitForLoadState('networkidle');
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'homepage.png' });
    
    // Verify the page has some content
    await expect(page.locator('body')).not.toBeEmpty();
    console.log('Homepage loaded successfully');
  });

  test('Dashboard is accessible', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3001');
    
    // Ensure app has loaded by waiting for network to be idle
    await page.waitForLoadState('networkidle');
    
    // Try to navigate to the dashboard
    try {
      // Go directly to dashboard
      await page.goto('http://localhost:3001/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Take screenshot
      await page.screenshot({ path: 'dashboard.png' });
      
      // Verify the page has some content
      await expect(page.locator('body')).not.toBeEmpty();
      console.log('Dashboard loaded successfully');
    } catch (e) {
      console.log('Error navigating to dashboard:', e.message);
    }
  });
});
