import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';
export default [
  {
    ignores: ['**/node_modules/**', '**/.next/**', '.local/**', 'reports/**', 'apps/web/public/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
  ...[
    react.configs.flat.recommended,
    reactHooks.configs.flat.recommended,
    jsxA11y.flatConfigs.recommended,
  ].map((config) => ({ ...config, files: ['apps/web/**/*.{js,jsx}'] })),
  {
    files: ['apps/web/**/*.{js,jsx}'],
    settings: { react: { version: 'detect' } },
    rules: { 'react/react-in-jsx-scope': 'off', 'react/prop-types': 'off' },
  },
];
