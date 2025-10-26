import { test, expect } from '@playwright/test'

test.describe('Blog', () => {
    test('should display blog page', async ({ page }) => {
        await page.goto('/blog')

        await expect(page.locator('h1')).toHaveText('Blog')
    })

    test('should search articles', async ({ page }) => {
        await page.goto('/blog')

        await page.fill('input[placeholder="Rechercher un article..."]', 'test')
        await page.click('button[type="submit"]')

        expect(page.url()).toContain('search=test')
    })

    test('should click on article', async ({ page }) => {
        await page.goto('/blog')

        // Attendre que les articles se chargent
        await page.waitForSelector('a[href*="/blog/"]', { timeout: 10000 })

        const firstArticleLink = page.locator('a[href*="/blog/"]').first()
        await firstArticleLink.click()

        expect(page.url()).toContain('/blog/')
    })
})