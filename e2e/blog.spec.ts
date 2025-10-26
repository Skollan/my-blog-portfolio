import { test, expect } from '@playwright/test'

test.describe('Blog', () => {
    test('should display blog page', async ({ page }) => {
        await page.goto('/blog')
        await expect(page.locator('h1')).toHaveText('Blog')
    })

    // Tests désactivés temporairement - nécessitent une base de données avec des articles
    test.skip('should search articles', async ({ page }) => {
        await page.goto('/blog')
        await page.fill('input[placeholder="Rechercher un article..."]', 'test')
        await page.click('button[type="submit"]')
        expect(page.url()).toContain('search=test')
    })

    test.skip('should click on article', async ({ page }) => {
        await page.goto('/blog')
        const articleLinks = page.locator('a[href*="/blog/"]')
        const count = await articleLinks.count()
        
        if (count > 0) {
            const firstArticleLink = articleLinks.first()
            await firstArticleLink.click()
            expect(page.url()).toContain('/blog/')
        }
    })
})