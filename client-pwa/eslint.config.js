import js from '@eslint/js';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import reactHooks from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', 'dev-dist', '!.storybook']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2025,
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      reactHooks.configs.flat.recommended,
      tanstackQuery.configs['flat/recommended-strict'],
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['.storybook/**/*.{ts,tsx}', 'src/**/*.stories.tsx'],
    extends: [storybook.configs['flat/recommended']],
  },
]);
