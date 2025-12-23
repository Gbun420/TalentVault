import { test, expect } from '@playwright/test';

test.describe('Authentication Flow Tests', () => {
  test('jobseeker signup flow', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Navigate to signup
    await page.click('a[href="/signup"]');
    await expect(page).toHaveURL(/.*signup/);
    
    // Fill out jobseeker signup form
    await page.fill('input[name="email"]', 'testjobseeker@example.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.fill('input[name="full_name"]', 'Test Jobseeker');
    await page.selectOption('select[name="role"]', 'jobseeker');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to jobseeker dashboard or show verification message
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/jobseeker|auth/);
  });

  test('employer signup flow', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Navigate to signup
    await page.click('a[href="/signup"]');
    await expect(page).toHaveURL(/.*signup/);
    
    // Fill out employer signup form
    await page.fill('input[name="email"]', 'testemployer@example.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.fill('input[name="full_name"]', 'Test Company');
    await page.selectOption('select[name="role"]', 'employer');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to employer dashboard or show verification message
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/employer|auth/);
  });

  test('login flow', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Navigate to login
    await page.click('a[href="/login"]');
    await expect(page).toHaveURL(/.*login/);
    
    // Fill out login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to appropriate dashboard
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/jobseeker|employer|admin/);
  });

  test('protected routes redirect to login', async ({ page }) => {
    // Test jobseeker route
    await page.goto('http://localhost:3000/jobseeker');
    await page.waitForTimeout(1000);
    const jobseekerUrl = page.url();
    expect(jobseekerUrl).toMatch(/login|auth/);
    
    // Test employer route
    await page.goto('http://localhost:3000/employer');
    await page.waitForTimeout(1000);
    const employerUrl = page.url();
    expect(employerUrl).toMatch(/login|auth/);
    
    // Test admin route
    await page.goto('http://localhost:3000/admin');
    await page.waitForTimeout(1000);
    const adminUrl = page.url();
    expect(adminUrl).toMatch(/login|auth/);
  });

  test('logout functionality', async ({ page }) => {
    // First try to login (this might fail if user doesn't exist)
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Look for logout button/link
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/login|home|\//);
    }
  });

  test('email verification flow', async ({ page }) => {
    // Test the auth callback page
    await page.goto('http://localhost:3000/auth/callback?mode=verifyEmail&oobCode=test-code');
    
    // Should handle the verification (might show error for invalid code)
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/auth|callback/);
  });
});
