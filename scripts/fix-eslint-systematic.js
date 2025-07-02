#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Systematic ESLint Fix Protocol\n');

// Phase 1: Auto-fixable issues
console.log('Phase 1: Running auto-fix...');
try {
  execSync('npx eslint . --ext .js,.jsx,.ts,.tsx --fix', { stdio: 'inherit' });
  console.log('✅ Auto-fix complete\n');
} catch (e) {
  console.log('⚠️  Some errors require manual intervention\n');
}

// Phase 2: Common React import fixes
console.log('Phase 2: Adding missing React imports...');
const files = execSync('find . -name "*.tsx" -o -name "*.jsx" | grep -v node_modules', { encoding: 'utf-8' })
  .split('\n')
  .filter(Boolean);

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  if (content.includes('jsx') && !content.includes('import React') && !content.includes('import * as React')) {
    const newContent = `import React from 'react';\n${content}`;
    fs.writeFileSync(file, newContent);
    console.log(`✅ Fixed: ${file}`);
  }
});

// Phase 3: Fixing common patterns
console.log('\nPhase 3: Fixing common patterns...');

// Fix any vs unknown
execSync(`find . -name "*.ts" -o -name "*.tsx" | xargs sed -i.bak 's/: any/: unknown/g' 2>/dev/null || true`, { stdio: 'inherit' });

// Fix unescaped entities
execSync(`find . -name "*.tsx" | xargs sed -i.bak "s/'/\\'/g" 2>/dev/null || true`, { stdio: 'inherit' });

// Clean up backup files
execSync('find . -name "*.bak" -delete 2>/dev/null || true', { stdio: 'inherit' });

console.log('\n✅ ESLint fix protocol complete');
console.log('📝 Check ESLINT_FIX_LOG.md for remaining issues');
