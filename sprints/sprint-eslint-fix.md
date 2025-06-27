# Sprint 2: ESLint Configuration Consolidation

## Why This Matters

Multiple ESLint configs create confusion and conflicts. Right now, your linter might be checking different rules in different places, or worse—missing issues entirely due to plugin conflicts. A single, authoritative ESLint configuration ensures consistent code quality across your entire codebase and prevents the "works on my machine" syndrome.

Clean linting saves debugging time and prevents style debates during code reviews.

## What This Protects

- **Prevents inconsistent code styles** across the team
- **Catches bugs early** through static analysis
- **Eliminates plugin conflicts** that break CI/CD
- **Protects code review time** by automating style checks

## Implementation Steps

### Step 1: Remove Redundant Config File

Delete the JSON config to avoid conflicts:
```bash
rm .eslintrc.json
```

### Step 2: Create Comprehensive ESLint Configuration

Replace `.eslintrc.js` with this production-ready, consolidated configuration:

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  
  // Parser configuration for TypeScript
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  
  // Environment settings
  env: {
    browser: true,
    node: true,
    es2022: true,
    jest: true,
  },
  
  // Plugin configurations
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@next/next/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier', // Must be last to override other configs
  ],
  
  // Active plugins
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
  ],
  
  // Custom rules
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false,
      },
    ],
    
    // React specific rules
    'react/react-in-jsx-scope': 'off', // Not needed in Next.js
    'react/prop-types': 'off', // Using TypeScript
    'react/jsx-uses-react': 'off',
    'react/jsx-filename-extension': [
      'error',
      { extensions: ['.jsx', '.tsx'] },
    ],
    'react/jsx-props-no-spreading': 'off',
    'react/require-default-props': 'off',
    'react/no-unescaped-entities': 'warn',
    
    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Import rules
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'off', // Next.js requires default exports
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
          'type',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-unresolved': 'error',
    
    // General JavaScript rules
    'no-console': [
      'warn',
      {
        allow: ['warn', 'error'],
      },
    ],
    'no-debugger': 'error',
    'no-alert': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-nested-ternary': 'warn',
    'no-return-await': 'error',
    'require-await': 'error',
    
    // Accessibility rules
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton'],
      },
    ],
  },
  
  // Settings for plugins
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  
  // Override configurations for specific file patterns
  overrides: [
    // Configuration files
    {
      files: ['*.config.js', '*.config.ts'],
      rules: {
        'import/no-default-export': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    // Test files
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
    // Next.js specific files
    {
      files: ['pages/**/*.tsx', 'pages/**/*.ts', 'app/**/*.tsx', 'app/**/*.ts'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    // Playwright test files
    {
      files: ['tests/**/*.ts', 'e2e/**/*.ts'],
      rules: {
        'no-await-in-loop': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
      },
    },
  ],
  
  // Ignore patterns
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'public/',
    'coverage/',
    'dist/',
    '.eslintrc.js',
    '*.min.js',
    'build/',
  ],
};
```

### Step 3: Update lint-staged Configuration

If you're using lint-staged with Husky, update `.lintstagedrc.js`:

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  '*.{json,md,mdx,css,scss}': [
    'prettier --write',
  ],
};
```

### Step 4: Ensure Required Dependencies

Add missing ESLint packages to `package.json`:

```json
{
  "devDependencies": {
    "@next/eslint-plugin-next": "^14.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.50.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-import-resolver-typescript": "^3.6.0",
    "eslint-plugin-import": "^2.28.0",
    "eslint-plugin-jsx-a11y": "^6.7.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0"
  }
}
```

Install any missing dependencies:
```bash
npm install --save-dev @next/eslint-plugin-next @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier eslint-import-resolver-typescript eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks
```

### Step 5: Create .eslintignore (if needed)

```bash
# .eslintignore
node_modules
.next
out
public
coverage
dist
build
*.min.js
```

## Test & Validation Steps

1. **Test the consolidated config:**
   ```bash
   # Clear ESLint cache first
   rm -rf .eslintcache
   
   # Run linting
   npm run lint
   ```

2. **Fix any auto-fixable issues:**
   ```bash
   npm run lint -- --fix
   ```

3. **Check specific file types:**
   ```bash
   # Test TypeScript files
   npx eslint "src/**/*.ts" "src/**/*.tsx"
   
   # Test config files
   npx eslint "*.config.js"
   
   # Test test files
   npx eslint "tests/**/*.ts"
   ```

4. **Verify no plugin conflicts:**
   ```bash
   npx eslint --print-config .eslintrc.js > eslint-config-debug.json
   # Review the output for duplicate or conflicting rules
   ```

## What to Watch For

- **Missing TypeScript project reference:** If you see errors about missing project, ensure `tsconfig.json` exists and is valid

- **Import resolution errors:** May need to adjust the import/resolver settings based on your path aliases

- **Performance issues:** For large codebases, consider adding:
  ```javascript
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    // Add this for performance
    EXPERIMENTAL_useSourceOfProjectReferenceRedirect: true,
  }
  ```

- **Prettier conflicts:** Ensure `prettier` is last in the extends array

## Success Criteria Checklist

- [ ] Only `.eslintrc.js` exists (no `.eslintrc.json`)
- [ ] `npm run lint` completes without plugin errors
- [ ] All ESLint plugins are installed
- [ ] lint-staged config updated (if applicable)
- [ ] No conflicting rule definitions
- [ ] TypeScript files are properly linted
- [ ] Import order is enforced
- [ ] Prettier integration works correctly

## Commit Message

```
fix: consolidate ESLint configuration to single source of truth

- Remove redundant .eslintrc.json file
- Create comprehensive .eslintrc.js with all rules
- Add proper TypeScript and React configurations
- Configure import ordering and resolution
- Add file-specific overrides for tests and Next.js
- Update lint-staged configuration
- Ensure Prettier compatibility

This eliminates linting conflicts and creates consistent
code standards across the entire codebase.
```