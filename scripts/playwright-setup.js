const { execSync } = require('child_process');
const colors = { red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', reset: '\x1b[0m' };

console.log(`${colors.yellow}🎭 Playwright Browser Setup${colors.reset}`);
const browsers = process.env.PLAYWRIGHT_BROWSERS || 'chromium firefox webkit';
try {
  execSync(`npx playwright install --with-deps ${browsers}`, { stdio: 'inherit' });
  console.log(`${colors.green}✅ Playwright browsers installed${colors.reset}`);
} catch (err) {
  console.error(`${colors.red}❌ Failed to install Playwright browsers${colors.reset}`);
  console.error(err.message);
  process.exit(1);
}
