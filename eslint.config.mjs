import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['.next/**', 'node_modules/**', 'public/**', 'next-env.d.ts'] },
  ...tseslint.configs.recommended,
  {
    rules: {
      // Pragmatik: react-markdown/CodeMirror sınırlarında birkaç bilinçli cast var.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
);
