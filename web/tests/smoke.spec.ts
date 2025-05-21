import { test, expect } from '@playwright/test';

test('Home page loads correctly', async ({ page }) => {
  await page.goto('/');

  // Check title
  await expect(page.locator('h1')).toContainText('Awesome List Manager');

  // Check import form
  await expect(page.getByPlaceholder(/Enter GitHub repo/)).toBeVisible();

  // Check import button
  await expect(page.getByRole('button', { name: 'Import' })).toBeDisabled();

  // Enter URL and check button enables
  await page.getByPlaceholder(/Enter GitHub repo/).fill('https://github.com/krzemienski/awesome-video');
  await expect(page.getByRole('button', { name: 'Import' })).toBeEnabled();

  // Check event log
  await expect(page.getByText('Event Logs')).toBeVisible();
});
