import { test, expect } from '@playwright/test';
test.beforeEach(async ({page}) => { await page.goto('http://127.0.0.1:4173'); });
test('Portfolio lists all six projects', async ({page}) => {
 await expect(page.getByRole('heading', {level:1})).toBeVisible();
 await expect(page.getByRole('article')).toHaveCount(6);
});
test('Portfolio search filters and clears', async ({page}) => {
 const search = page.getByPlaceholder('Search projects');
 await search.fill('CareTaxi');
 await expect(page.getByRole('article')).toHaveCount(1);
 await expect(page.getByRole('heading', {name:'CareTaxi',exact:true})).toBeVisible();
 await search.fill('no-matching-project');
 await expect(page.getByRole('article')).toHaveCount(0);
 await search.fill('');
 await expect(page.getByRole('article')).toHaveCount(6);
});
test('Portfolio category and search combine', async ({page}) => {
 await page.getByRole('button', {name:'Math',exact:true}).click();
 await expect(page.getByRole('article')).toHaveCount(2);
 await page.getByPlaceholder('Search projects').fill('Clock');
 await expect(page.getByRole('article')).toHaveCount(1);
 await expect(page.getByRole('heading', {name:'Unit Circle Clock Lab',exact:true})).toBeVisible();
 await page.getByPlaceholder('Search projects').fill('');
 await page.getByRole('button', {name:'All',exact:true}).click();
 await expect(page.getByRole('article')).toHaveCount(6);
});
