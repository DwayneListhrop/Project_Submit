import { test, expect } from '@playwright/test';

const target = process.env.STUDIO_TARGET_URL?.trim();
test('QA harness launches a functional browser', async ({ page }) => {
  await page.setContent('<!doctype html><html><head><title>Studio QA Harness</title></head><body><button id="check">Ready</button><script>document.querySelector("#check").onclick=()=>document.querySelector("#check").textContent="Passed"</script></body></html>');
  await page.getByRole('button', { name: 'Ready' }).click();
  await expect(page.getByRole('button', { name: 'Passed' })).toBeVisible();
});
test('Application preview loads without uncaught errors', async ({ page }) => {
  test.skip(!target, 'Not an application test: configure workflow target_url input for a deployed preview');
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto(target, { waitUntil: 'domcontentloaded' });
  expect(response?.status(), 'HTTP status').toBeLessThan(400);
  await expect(page.locator('body')).toBeVisible();
  expect(errors, 'Uncaught JavaScript exceptions').toEqual([]);
});
