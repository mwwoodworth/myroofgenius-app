# Sprint 5: Dependency Audit and Package Cleanup

## Why This Matters

Outdated dependencies are security vulnerabilities waiting to happen. Unused packages bloat your build and slow your development. Right now, your audit script flags issues, but nobody's acting on them. This sprint turns warnings into a clean, secure foundation—protecting your production environment and your team's velocity.

Every dependency is a trust decision. Make them count.

## What This Protects

- **Prevents security breaches** from known vulnerabilities
- **Protects build performance** by removing unused weight
- **Reduces bundle size** for faster user experiences
- **Simplifies debugging** with fewer moving parts

## Implementation Steps

### Step 1: Run the Existing Audit Script

Execute your audit and capture the output:

```bash
# Run the dependency audit
node scripts/audit-dependencies.js > audit-results.txt

# Review the output
cat audit-results.txt
```

### Step 2: Create an Enhanced Audit Script

Replace or enhance `scripts/audit-dependencies.js` with this comprehensive version:

```javascript
// scripts/audit-dependencies.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

console.log(`${colors.blue}🔍 MyRoofGenius Dependency Audit${colors.reset}\n`);

// Step 1: Check for security vulnerabilities
console.log(`${colors.yellow}Checking for security vulnerabilities...${colors.reset}`);
try {
  const auditResult = execSync('npm audit --json', { encoding: 'utf-8' });
  const audit = JSON.parse(auditResult);
  
  if (audit.metadata.vulnerabilities.total > 0) {
    console.log(`${colors.red}⚠️  Found ${audit.metadata.vulnerabilities.total} vulnerabilities:${colors.reset}`);
    console.log(`  Critical: ${audit.metadata.vulnerabilities.critical}`);
    console.log(`  High: ${audit.metadata.vulnerabilities.high}`);
    console.log(`  Moderate: ${audit.metadata.vulnerabilities.moderate}`);
    console.log(`  Low: ${audit.metadata.vulnerabilities.low}\n`);
  } else {
    console.log(`${colors.green}✅ No security vulnerabilities found${colors.reset}\n`);
  }
} catch (error) {
  console.log(`${colors.red}⚠️  npm audit failed - continuing with other checks${colors.reset}\n`);
}

// Step 2: Check for outdated packages
console.log(`${colors.yellow}Checking for outdated packages...${colors.reset}`);
try {
  const outdated = execSync('npm outdated --json', { encoding: 'utf-8' });
  if (outdated) {
    const packages = JSON.parse(outdated);
    const outdatedCount = Object.keys(packages).length;
    
    if (outdatedCount > 0) {
      console.log(`${colors.yellow}📦 Found ${outdatedCount} outdated packages:${colors.reset}`);
      
      // Group by update type
      const major = [];
      const minor = [];
      const patch = [];
      
      Object.entries(packages).forEach(([name, info]) => {
        const current = info.current || '0.0.0';
        const wanted = info.wanted || current;
        const latest = info.latest || wanted;
        
        const currentParts = current.split('.');
        const latestParts = latest.split('.');
        
        if (currentParts[0] !== latestParts[0]) {
          major.push({ name, current, latest });
        } else if (currentParts[1] !== latestParts[1]) {
          minor.push({ name, current, latest });
        } else {
          patch.push({ name, current, latest });
        }
      });
      
      if (major.length > 0) {
        console.log(`\n  ${colors.red}Major updates (breaking changes):${colors.reset}`);
        major.forEach(p => console.log(`    ${p.name}: ${p.current} → ${p.latest}`));
      }
      
      if (minor.length > 0) {
        console.log(`\n  ${colors.yellow}Minor updates (new features):${colors.reset}`);
        minor.forEach(p => console.log(`    ${p.name}: ${p.current} → ${p.latest}`));
      }
      
      if (patch.length > 0) {
        console.log(`\n  ${colors.green}Patch updates (bug fixes):${colors.reset}`);
        patch.forEach(p => console.log(`    ${p.name}: ${p.current} → ${p.latest}`));
      }
    }
  }
} catch (error) {
  console.log(`${colors.green}✅ All packages are up to date${colors.reset}`);
}

// Step 3: Find unused dependencies
console.log(`\n${colors.yellow}Checking for unused dependencies...${colors.reset}`);

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const allDeps = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies
};

// Common packages that are used indirectly
const indirectlyUsed = [
  '@types/', 'eslint-', 'postcss', 'tailwindcss', 
  'autoprefixer', 'prettier', 'husky', 'lint-staged',
  '@next/eslint', 'typescript'
];

const potentiallyUnused = [];

Object.keys(allDeps).forEach(dep => {
  // Skip packages that are commonly used indirectly
  if (indirectlyUsed.some(indirect => dep.includes(indirect))) {
    return;
  }
  
  // Check if package is imported anywhere
  try {
    const searchResult = execSync(
      `grep -r "from ['\\"]${dep}\\|require(['\\"]${dep}" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.mjs" . 2>/dev/null || true`,
      { encoding: 'utf-8' }
    );
    
    if (!searchResult.trim()) {
      potentiallyUnused.push(dep);
    }
  } catch (error) {
    // grep returns non-zero if no matches found
    potentiallyUnused.push(dep);
  }
});

if (potentiallyUnused.length > 0) {
  console.log(`${colors.yellow}⚠️  Potentially unused packages (verify before removing):${colors.reset}`);
  potentiallyUnused.forEach(dep => console.log(`  - ${dep}`));
} else {
  console.log(`${colors.green}✅ No obviously unused packages found${colors.reset}`);
}

// Step 4: Check for duplicate packages
console.log(`\n${colors.yellow}Checking for duplicate packages...${colors.reset}`);
try {
  execSync('npm dedupe --dry-run', { stdio: 'pipe' });
  console.log(`${colors.green}✅ No duplicate packages found${colors.reset}`);
} catch (error) {
  console.log(`${colors.yellow}⚠️  Duplicate packages found - run 'npm dedupe' to optimize${colors.reset}`);
}

// Step 5: Generate actionable report
console.log(`\n${colors.blue}📋 Recommended Actions:${colors.reset}\n`);

console.log('1. Fix security vulnerabilities:');
console.log('   npm audit fix');
console.log('   npm audit fix --force  # Use with caution\n');

console.log('2. Update safe patches:');
console.log('   npm update  # Updates to latest wanted versions\n');

console.log('3. Review and remove unused packages:');
if (potentiallyUnused.length > 0) {
  potentiallyUnused.slice(0, 5).forEach(dep => {
    console.log(`   npm uninstall ${dep}`);
  });
  if (potentiallyUnused.length > 5) {
    console.log(`   # ... and ${potentiallyUnused.length - 5} more`);
  }
} else {
  console.log('   # No unused packages detected');
}

console.log('\n4. Deduplicate packages:');
console.log('   npm dedupe\n');

console.log(`${colors.green}✨ Audit complete${colors.reset}`);
```

### Step 3: Execute Cleanup Based on Audit Results

Create a cleanup script for safe updates:

```bash
#!/bin/bash
# scripts/dependency-cleanup.sh

echo "🧹 MyRoofGenius Dependency Cleanup"
echo "================================="

# Step 1: Backup current state
echo "📦 Backing up current package-lock.json..."
cp package-lock.json package-lock.backup.json

# Step 2: Fix security issues
echo "🔒 Fixing security vulnerabilities..."
npm audit fix

# Step 3: Update patch versions
echo "📈 Updating to latest patch versions..."
npm update

# Step 4: Remove specific unused packages (customize based on your audit)
echo "🗑️  Removing unused packages..."
# Example removals - adjust based on your audit results:
# npm uninstall package-name-1
# npm uninstall package-name-2

# Step 5: Deduplicate
echo "🔧 Deduplicating packages..."
npm dedupe

# Step 6: Clean and reinstall
echo "🔄 Clean reinstall..."
rm -rf node_modules
npm ci

# Step 7: Run tests to ensure nothing broke
echo "🧪 Running tests..."
npm run lint
npm run type-check
npm run test:unit

echo "✅ Cleanup complete!"
echo ""
echo "⚠️  Important next steps:"
echo "1. Run 'npm run dev' and test the application"
echo "2. Run 'npm run build' to ensure production build works"
echo "3. Commit the updated package.json and package-lock.json"
echo "4. If issues occur, restore with: mv package-lock.backup.json package-lock.json"
```

Make the script executable:
```bash
chmod +x scripts/dependency-cleanup.sh
```

### Step 4: Update Package.json Scripts

Add audit commands to your package.json:

```json
{
  "scripts": {
    "audit": "node scripts/audit-dependencies.js",
    "audit:fix": "npm audit fix && npm dedupe",
    "deps:clean": "./scripts/dependency-cleanup.sh",
    "deps:check": "npm outdated || true",
    "deps:update:safe": "npm update && npm audit fix"
  }
}
```

### Step 5: Create a Dependency Management Policy

Create `docs/dependency-policy.md`:

```markdown
# Dependency Management Policy

## Update Schedule

- **Security patches**: Immediately upon notification
- **Patch updates**: Weekly (automated via CI)
- **Minor updates**: Monthly review
- **Major updates**: Quarterly planning

## Before Adding New Dependencies

Ask yourself:
1. Is this solving a real problem?
2. Is the package actively maintained?
3. What's the bundle size impact?
4. Are there lighter alternatives?
5. Can we build this ourselves in < 2 hours?

## Regular Maintenance

Run these commands weekly:
\`\`\`bash
npm run audit
npm run deps:check
\`\`\`

## Emergency Response

For critical vulnerabilities:
\`\`\`bash
npm audit
npm audit fix --force  # If needed
npm test               # Verify nothing broke
\`\`\`
```

## Test & Validation Steps

1. **Run the enhanced audit:**
   ```bash
   npm run audit
   ```

2. **Execute safe cleanup:**
   ```bash
   npm run deps:update:safe
   ```

3. **Test the application:**
   ```bash
   npm run dev
   # Browse the site, test key features
   
   npm run build
   npm run test:e2e
   ```

4. **Check bundle size impact:**
   ```bash
   # If you have bundle analysis set up
   npm run analyze
   
   # Or check build output size
   du -sh .next
   ```

## What to Watch For

- **Breaking changes**: Major version updates can break your app
- **Peer dependency conflicts**: Some updates may require coordinated changes
- **Type definition mismatches**: @types packages may lag behind main packages
- **Build tool updates**: Webpack, PostCSS changes can affect your build

## Success Criteria Checklist

- [ ] Security vulnerabilities reduced to 0 (or documented exceptions)
- [ ] No high or critical vulnerabilities remain
- [ ] Outdated packages reviewed and updated where safe
- [ ] Unused packages identified and removed
- [ ] Package deduplication completed
- [ ] All tests pass after cleanup
- [ ] Build succeeds without errors
- [ ] Bundle size reduced (or at least not increased)
- [ ] Dependency policy documented

## Commit Message

```
fix: audit and clean up project dependencies

- Run comprehensive dependency audit
- Fix all security vulnerabilities
- Update packages to latest patch versions
- Remove unused dependencies
- Deduplicate package tree
- Add dependency management scripts
- Document dependency policy

This reduces security risk and improves build performance
while maintaining application stability.
```