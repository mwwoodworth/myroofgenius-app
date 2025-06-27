# Sprint 7: Fix Playwright Browser Setup

## Why This Matters

Missing Playwright browsers break your entire E2E test suite. Every new developer who clones your repo hits this wall. Your CI pipeline fails mysteriously. This isn't about convenience—it's about protecting your team's momentum and ensuring tests actually run when it matters most.

Automated setup is the difference between "it works on my machine" and "it works everywhere."

## What This Protects

- **Prevents onboarding friction** for new team members
- **Protects CI reliability** with automatic browser installation
- **Saves debugging time** from "browser not found" errors
- **Ensures consistent testing** across all environments

## Implementation Steps

### Step 1: Add Playwright Browser Installation to Package.json

Update your package.json with a postinstall hook:

```json
{
  "scripts": {
    "postinstall": "npm run playwright:install",
    "playwright:install": "playwright install --with-deps chromium firefox webkit",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

### Step 2: Create a Setup Script for Development

Create a comprehensive setup script that handles all initialization:

```bash
#!/bin/bash
# scripts/setup-dev.sh

echo "🚀 MyRoofGenius Development Setup"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Node version
echo -e "${YELLOW}Checking Node.js version...${NC}"
NODE_VERSION=$(node -v)
REQUIRED_VERSION="18"

if [[ ! "$NODE_VERSION" =~ ^v${REQUIRED_VERSION} ]]; then
  echo -e "${RED}❌ Node.js ${REQUIRED_VERSION}.x required. Found ${NODE_VERSION}${NC}"
  echo "Please install Node.js ${REQUIRED_VERSION}.x and try again."
  exit 1
fi
echo -e "${GREEN}✅ Node.js ${NODE_VERSION} detected${NC}"

# Step 2: Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm ci
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to install dependencies${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 3: Install Playwright browsers
echo -e "${YELLOW}Installing Playwright browsers...${NC}"
npx playwright install --with-deps
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to install Playwright browsers${NC}"
  echo "Try running: sudo npx playwright install-deps"
  exit 1
fi
echo -e "${GREEN}✅ Playwright browsers installed${NC}"

# Step 4: Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
  echo -e "${YELLOW}Creating .env.local file...${NC}"
  cp .env.example .env.local 2>/dev/null || {
    cat > .env.local << EOF
# Local development environment
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Add your environment variables here
EOF
  }
  echo -e "${GREEN}✅ Created .env.local (please update with your values)${NC}"
else
  echo -e "${GREEN}✅ .env.local already exists${NC}"
fi

# Step 5: Run type checking
echo -e "${YELLOW}Running TypeScript type check...${NC}"
npm run type-check
if [ $? -ne 0 ]; then
  echo -e "${RED}⚠️  TypeScript errors detected (non-blocking)${NC}"
fi

# Step 6: Run linting
echo -e "${YELLOW}Running ESLint...${NC}"
npm run lint
if [ $? -ne 0 ]; then
  echo -e "${RED}⚠️  Linting errors detected (non-blocking)${NC}"
fi

# Step 7: Test the build
echo -e "${YELLOW}Testing production build...${NC}"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Build failed - please fix before committing${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"

# Step 8: Final instructions
echo ""
echo -e "${GREEN}✨ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Run 'npm run test:e2e' to verify E2E tests work"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Useful commands:"
echo "- npm run test:e2e:ui    # Run tests with interactive UI"
echo "- npm run test:e2e:debug # Debug tests step by step"
echo "- npm run audit          # Check dependency security"
```

Make it executable:
```bash
chmod +x scripts/setup-dev.sh
```

### Step 3: Create Playwright Install Helper

Create a dedicated Playwright setup script for CI and troubleshooting:

```javascript
// scripts/playwright-setup.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

console.log(`${colors.yellow}🎭 Playwright Browser Setup${colors.reset}\n`);

// Check if running in CI
const isCI = process.env.CI === 'true';

// Determine which browsers to install
const browsers = process.env.PLAYWRIGHT_BROWSERS || 'chromium firefox webkit';

try {
  // Check if browsers are already installed
  const playwrightPath = path.join(process.cwd(), 'node_modules', '@playwright', 'test');
  
  if (!fs.existsSync(playwrightPath)) {
    console.log(`${colors.red}❌ Playwright not found. Run 'npm install' first.${colors.reset}`);
    process.exit(1);
  }
  
  // Install browsers
  console.log(`Installing browsers: ${browsers}`);
  const installCommand = isCI 
    ? `npx playwright install --with-deps ${browsers}`
    : `npx playwright install ${browsers}`;
    
  execSync(installCommand, { 
    stdio: 'inherit',
    env: {
      ...process.env,
      // Ensure Playwright doesn't skip browser downloads
      PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '0'
    }
  });
  
  console.log(`${colors.green}✅ Playwright browsers installed successfully${colors.reset}`);
  
  // Verify installation
  console.log(`\n${colors.yellow}Verifying installation...${colors.reset}`);
  
  try {
    execSync('npx playwright --version', { stdio: 'inherit' });
    
    // List installed browsers
    const output = execSync('npx playwright list', { encoding: 'utf-8' });
    console.log(`\nInstalled browsers:\n${output}`);
    
  } catch (verifyError) {
    console.log(`${colors.yellow}⚠️  Could not verify installation${colors.reset}`);
  }
  
} catch (error) {
  console.error(`${colors.red}❌ Failed to install Playwright browsers${colors.reset}`);
  console.error(error.message);
  
  // Provide troubleshooting steps
  console.log(`\n${colors.yellow}Troubleshooting steps:${colors.reset}`);
  console.log('1. Try running with sudo: sudo npx playwright install-deps');
  console.log('2. Clear npm cache: npm cache clean --force');
  console.log('3. Reinstall Playwright: npm uninstall @playwright/test && npm install -D @playwright/test');
  console.log('4. Check system requirements at: https://playwright.dev/docs/browsers');
  
  process.exit(1);
}
```

### Step 4: Update CI Configuration for Playwright

Ensure your CI workflow properly installs browsers:

```yaml
# .github/workflows/ci.yml (excerpt)
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        env:
          PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1'
          
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium
        # Only install Chromium in CI to save time
        
      - name: Build application
        run: npm run build
        
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true
          PLAYWRIGHT_BROWSERS_PATH: '0'
```

### Step 5: Create Development Documentation

Create `docs/playwright-setup.md`:

```markdown
# Playwright E2E Testing Setup

## Automatic Setup

When you run `npm install`, Playwright browsers are automatically installed via the postinstall hook.

## Manual Setup

If automatic setup fails, run:

\`\`\`bash
# Option 1: Use our setup script
npm run playwright:install

# Option 2: Direct Playwright command
npx playwright install --with-deps

# Option 3: Install specific browser
npx playwright install chromium
\`\`\`

## Troubleshooting

### "Browser not found" Error

1. Run `npx playwright install`
2. If on Linux/WSL, you may need: `sudo npx playwright install-deps`

### CI Failures

Ensure the CI workflow includes:
\`\`\`yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps chromium
\`\`\`

### Docker Environments

Use the Playwright Docker image:
\`\`\`dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-jammy
\`\`\`

## Running Tests

\`\`\`bash
# Run all tests
npm run test:e2e

# Run with UI (great for debugging)
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/homepage.spec.ts

# Run in headed mode (see browser)
npm run test:e2e:headed
\`\`\`

## Writing Tests

Tests live in `tests/e2e/` and follow the pattern `*.spec.ts`.

Example:
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('should load homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/MyRoofGenius/);
});
\`\`\`
```

## Test & Validation Steps

1. **Test fresh installation:**
   ```bash
   # Remove node_modules to simulate fresh clone
   rm -rf node_modules
   
   # Run install
   npm install
   
   # Verify browsers installed
   npx playwright list
   ```

2. **Test the setup script:**
   ```bash
   ./scripts/setup-dev.sh
   ```

3. **Verify E2E tests run:**
   ```bash
   npm run test:e2e
   ```

4. **Test in Docker (optional):**
   ```bash
   docker run --rm -it -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.40.0-jammy npm run test:e2e
   ```

## What to Watch For

- **Disk space**: Browsers require ~500MB of disk space
- **System dependencies**: Linux requires additional system packages
- **Permissions**: May need sudo on some systems
- **Network**: Corporate firewalls may block browser downloads

## Success Criteria Checklist

- [ ] `npm install` automatically installs Playwright browsers
- [ ] No manual steps required for new developers
- [ ] CI pipeline installs browsers successfully
- [ ] E2E tests run without "browser not found" errors
- [ ] Setup script provides clear troubleshooting
- [ ] Documentation covers common issues
- [ ] Works on Mac, Linux, and Windows (WSL)
- [ ] Browsers verified with `npx playwright list`

## Commit Message

```
fix: automate Playwright browser installation

- Add postinstall hook to automatically install browsers
- Create comprehensive setup script for development
- Add Playwright setup helper with troubleshooting
- Update CI workflow for proper browser installation
- Document setup process and common issues
- Add multiple test execution scripts

This eliminates manual Playwright setup and ensures
E2E tests work immediately after cloning the repo.
```