const eslintPluginTs = require('@typescript-eslint/eslint-plugin');
const eslintParserTs = require('@typescript-eslint/parser');
const eslintPluginSecurity = require('eslint-plugin-security');
const prettierConfig = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');

/** @type {import("eslint").Linter.FlatConfig} */
module.exports = [
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
      // eslint-disable-next-line prettier/prettier
      '@typescript-eslint': eslintPluginTs,
      prettier: prettierPlugin,
      security: eslintPluginSecurity,
    },
    rules: {
      ...eslintPluginTs.configs.recommended.rules,
      '@typescript-eslint/strict-boolean-expressions': 'warn', // Temporarily disabled
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'warn', 
      'security/detect-object-injection': 'warn', 
      'security/detect-non-literal-fs-filename': 'warn', 
      ...prettierConfig.rules,
      'prettier/prettier': 'warn',
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
    },
    plugins: {
      prettier: prettierPlugin,
      security: eslintPluginSecurity,
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'warn',
      'security/detect-object-injection': 'warn', 
      'security/detect-non-literal-fs-filename': 'off', // Temporarily disabled
    },
  },
];