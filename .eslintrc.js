module.exports = {
  extends: [
    'next',
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'react/no-array-index-key': 'warn',
    'react/prop-types': 'off',
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error'
  }
};
