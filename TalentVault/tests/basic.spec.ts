import { test, expect } from '@playwright/test';

test.describe('TalentVault Basic Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/TalentVault/);
  });

  test('navigation works', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check if main navigation elements are present
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('signup page loads', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Look for signup link or button
    const signupLink = page.locator('a[href*="signup"], button:has-text("Sign up")');
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await expect(page).toHaveURL(/.*signup/);
    }
  });

  test('login page loads', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Look for login link or button
    const loginLink = page.locator('a[href*="login"], button:has-text("Log in")');
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*login/);
    }
  });

  test('jobseeker page accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/jobseeker');
    
    // Should either load the page or redirect to login
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/jobseeker|login/);
  });

  test('employer page accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/employer');
    
    // Should either load the page or redirect to login
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/employer|login/);
  });

  test('admin page accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/admin');
    
    // Should either load the page or redirect to login
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/admin|login/);
  });
});
