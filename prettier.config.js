/** @type {import("prettier").Config} */
const config = {
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  endOfLine: 'lf',
  arrowParens: 'always',
  importOrder: [
    '^react$',
    '^fastify$',
    '^vite$',
    '<THIRD_PARTY_MODULES>',
    '^[./](?!.*\\.css$)',
    '\\.css$',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

export default config;
