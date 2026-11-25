import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',fullyParallel:false,workers:1,timeout:30000,use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure'},webServer:{command:'node tests/serve.mjs',port:4173,reuseExistingServer:false},projects:[{name:'webkit',use:{browserName:'webkit'}},{name:'chromium',use:{browserName:'chromium'}}]});
