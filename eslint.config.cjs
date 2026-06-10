const js = require('@eslint/js')
const nextPlugin = require('@next/eslint-plugin-next')
module.exports = [
  {
    ignores: [
      'node_modules/**',
      '_legacy/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      '.vercel/**',
      'public/**',
      '*.config.js',
      '*.config.mjs',
      '*.config.cjs',
      '*.config.ts',
      'payload-types.ts',
      'migrations/**',
    ],
  },
  js.configs.recommended,
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      ...require('@typescript-eslint/eslint-plugin').configs.recommended.rules,
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-undef': 'off',
      eqeqeq: ['error', 'always'],
      // FW2: fail CI if a logger.* call references an email-shaped
      // identifier. Use the user's numeric id or `emailHash()` from
      // @/lib/log-pii instead. One deliberate exception (GDPR audit
      // trail in collections/User/index.ts afterDelete) is marked with
      // an eslint-disable-next-line comment.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.property.name=/^(error|warn|info|debug|log)$/] Identifier[name=/^[a-zA-Z_]*[eE]mail[a-zA-Z0-9_]*$/]",
          message:
            'FW2: do not reference email-shaped identifiers in logger.* calls — use the user id or emailHash() from @/lib/log-pii.',
        },
      ],
    },
  },
  {
    files: ['next-env.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
  {
    // Payload admin components navigate between route groups with separate
    // <html>/<body> trees, so full-page navigation via <a> is correct.
    // <Link> would break because the layout trees are incompatible.
    files: ['components/admin/**/*.{ts,tsx}'],
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
]
