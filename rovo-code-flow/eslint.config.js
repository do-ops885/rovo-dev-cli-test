import eslintPluginTs from '@typescript-eslint/eslint-plugin';
import eslintParserTs from '@typescript-eslint/parser';
import eslintPluginSecurity from 'eslint-plugin-security';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

/** @type {import("eslint").Linter.FlatConfig} */
export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: eslintParserTs,
      parserOptions: {
       ecmaVersion: 2021,
       sourceType: 'module',
       project: './tsconfig.json',
     },
    },
    plugins: {
      '@typescript-eslint': eslintPluginTs,
      prettier: prettierPlugin,
      security: eslintPluginSecurity,
    },
    rules: {
      ...eslintPluginTs.configs.recommended.rules,
      '@typescript-eslint/strict-boolean-expressions': 'off', // Temporarily disabled
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-explicit-any': 'off', // Temporarily disabled
      'security/detect-object-injection': 'off', // Temporarily disabled
      'security/detect-non-literal-fs-filename': 'off', // Temporarily disabled
      ...prettierConfig.rules,
      'prettier/prettier': 'warn',
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    plugins: {
      prettier: prettierPlugin,
      security: eslintPluginSecurity,
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'warn',
      'security/detect-object-injection': 'off', // Temporarily disabled
      'security/detect-non-literal-fs-filename': 'off', // Temporarily disabled
    },
  },
];