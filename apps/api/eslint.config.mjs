import { config } from '@repo/eslint-config/base';
import globals from 'globals';

export default [
  ...config,
  {
    ignores: ['dist/**', 'generated/**', 'coverage/**'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['src/infrastructure/identity/stripe-identity.provider.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
