import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir: './tests', timeout: 30000, retries: process.env.CI ? 1 : 0,
 reporter: [['list'], ['json', { outputFile: 'results.json' }]],
 webServer: { command: 'npm --prefix ../../portfolio-platform run preview -- --host 127.0.0.1 --port 4173 --strictPort', url: 'http://127.0.0.1:4173', reuseExistingServer: false },
 use: { browserName: 'chromium', headless: true, trace: 'retain-on-failure', screenshot: 'only-on-failure' }
});
