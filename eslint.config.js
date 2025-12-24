import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true, // разрешает функции в выражениях без типа
          allowTypedFunctionExpressions: true, // разрешает типизированные function expressions
          allowHigherOrderFunctions: true, // разрешает HOC без типа возврата
          allowDirectConstAssertionInArrowFunctions: true, // разрешает const assertions
          allowConciseArrowFunctionExpressionsStartingWithVoid: false, // стрелочные функции с void
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-require-imports': 'off',
      'no-unused-vars': 'off',
    },
  },

  {
    ignores: ['node_modules/', 'dist/', 'build/', '*.config.*'],
  },
];
