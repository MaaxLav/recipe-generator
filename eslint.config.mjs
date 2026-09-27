import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import perfectionist from 'eslint-plugin-perfectionist';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  prettierRecommended,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'coverage/**',
    '.cache/**',
    '.codex/**',
    '.agents/**',
    'next-env.d.ts',
  ]),
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    plugins: { perfectionist, 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'perfectionist/sort-interfaces': [
        'error',
        {
          type: 'line-length',
          order: 'asc',
          groups: ['primitive', ['object', 'unknown'], 'function-handler'],
          customGroups: [
            {
              groupName: 'primitive',
              selector: 'property',
              elementValuePattern:
                '^(?:(?:string|number|boolean|bigint|symbol|null|undefined|unknown|never|any|void)(?:\\s*[|&]\\s*(?:string|number|boolean|bigint|symbol|null|undefined|unknown|never|any|void))*|(?:\'[^\']*\'|\\"[^\\"]*\\"|`[^`]*`)(?:\\s*\\|\\s*(?:\'[^\']*\'|\\"[^\\"]*\\"|`[^`]*`))*)$',
            },
            {
              groupName: 'object',
              selector: 'property',
              elementValuePattern:
                '^(?:[A-Z][A-Za-z0-9_]*(?:<.*>)?|Array<.*>|ReadonlyArray<.*>|Record<.*>|Partial<.*>|Required<.*>|Readonly<.*>|Pick<.*>|Omit<.*>|\\{[\\s\\S]*\\}|[^()]+\\[\\])$',
            },
            {
              groupName: 'function-handler',
              selector: 'property',
              elementValuePattern: '^(?:<[^>]+>\\s*)?\\(',
            },
            {
              groupName: 'function-handler',
              selector: 'method',
            },
          ],
        },
      ],
      'perfectionist/sort-objects': [
        'error',
        {
          type: 'line-length',
          order: 'asc',
          useConfigurationIf: {
            matchesAstSelector:
              'JSXExpressionContainer > ObjectExpression, JSXExpressionContainer > ObjectExpression ObjectExpression',
            objectType: 'non-destructured',
          },
        },
        {
          type: 'unsorted',
        },
      ],
      'perfectionist/sort-jsx-props': [
        'error',
        {
          type: 'line-length',
          order: 'asc',
          groups: [
            'hardcoded-primitive',
            ['dynamic-primitive', 'unknown'],
            'function-handler',
          ],
          customGroups: [
            {
              groupName: 'hardcoded-primitive',
              selector: 'prop',
              modifiers: ['shorthand'],
            },
            {
              groupName: 'hardcoded-primitive',
              selector: 'prop',
              elementValuePattern:
                '^(?:\\"[^\\"]*\\"|\'[^\']*\'|\\{(?:true|false|null|undefined|-?\\d+(?:\\.\\d+)?|\\"[^\\"]*\\"|\'[^\']*\'|`[^`$]*`)\\})$',
            },
            {
              groupName: 'function-handler',
              selector: 'prop',
              elementNamePattern:
                '^(?:on[A-Z].*|.*(?:Handler|Callback|Renderer|Render|Submit|Change|Click|Close|Open))$',
            },
            {
              groupName: 'function-handler',
              selector: 'prop',
              elementValuePattern:
                '^\\{(?:(?:async\\s*)?(?:\\([^)]*\\)|[A-Za-z_$][\\w$]*)\\s*=>|function\\b)[\\s\\S]*\\}$',
            },
            {
              groupName: 'dynamic-primitive',
              selector: 'prop',
              elementValuePattern: '^\\{[^{}]+\\}$',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/components/home/Hero.tsx',
      'src/components/home/ProductImage.tsx',
    ],
    // External images intentionally load in the browser, with error fallbacks.
    rules: { '@next/next/no-img-element': 'off' },
  },
]);
