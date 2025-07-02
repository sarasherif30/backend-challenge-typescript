import eslintPluginTs from '@typescript-eslint/eslint-plugin';
import parserTs from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: parserTs,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': eslintPluginTs
    },
    rules: {
      ...eslintPluginTs.configs.recommended.rules
    }
  }
];
