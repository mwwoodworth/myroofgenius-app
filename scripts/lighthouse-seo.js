#!/usr/bin/env node
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

(async () => {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const result = await lighthouse('http://localhost:3000', {
    port: chrome.port,
    onlyCategories: ['seo'],
  });

  const score = result.lhr.categories.seo.score * 100;
  console.log('SEO score:', score);
  await chrome.kill();
  if (score < 90) {
    console.error('Lighthouse SEO score below 90');
    process.exit(1);
  }
})();
