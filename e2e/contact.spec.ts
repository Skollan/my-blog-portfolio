import { test, expect } from '@playwright/test'

test.describe('Contact Form', () => {
  test('should show validation errors', async ({ page }) => {
    await page.goto('/contact')
    
    await page.click('button[type="submit"]')
    
    // Vérifie les erreurs de validation
    await expect(page.locator('text=/nom.*2 caractères/i')).toBeVisible()
  })

  test('should submit successfully', async ({ page }) => {
    await page.goto('/contact')
    
    await page.fill('input[type="text"]', 'John Doe')
    await page.fill('input[type="email"]', 'john@example.com')
    await page.fill('textarea', 'This is a test message with enough characters')
    
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=/message envoyé/i')).toBeVisible()
  })
})