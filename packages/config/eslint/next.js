const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/*
 * This is a custom ESLint configuration for use with
 * Next.js apps.
 *
 * This config extends the Vercel Engineering Style Guide.
 * For more information, see https://github.com/vercel/style-guide
 *
 */

module.exports = {
  extends: [
    "@vercel/style-guide/eslint/node",
    "@vercel/style-guide/eslint/browser",
    "@vercel/style-guide/eslint/typescript",
    "@vercel/style-guide/eslint/react",
    "@vercel/style-guide/eslint/next",
    "eslint-config-turbo",
  ].map(require.resolve),
  parserOptions: {
    project,
  },
  globals: {
    React: true,
    JSX: true,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: ["node_modules/", "dist/"],
  plugins: ["eslint-plugin-local-rules"],
  rules: {
    "import/no-default-export": "off", // Next.js v14 App Router relies on default exporting pages components
    "react/jsx-sort-props": "off",
    "local-rules/restrict-import": [
      "error",
      {
        allowedFile: resolve(process.cwd(), "packages/data/db.ts"),
        checkPackage: "@prisma/client",
      },
    ],
    "local-rules/restrict-import": [
      "error",
      {
        allowedFile: "^packages/data/repos/.*/.*.ts",
        checkPackage: "@propsto/data",
      },
    ],
  },
  overrides: [
    {
      files: ["*.js", "*.ts", "*.tsx"],
      rules: {
        "local-rules/restrict-import": [
          "error",
          {
            allowedFile: resolve(process.cwd(), "packages/data/db.ts"),
            checkPackage: "@prisma/client",
            restrictedMembers: ["PrismaClient"],
          },
        ],
        "local-rules/restrict-import": [
          "error",
          {
            allowedFile: "^packages/data/repos/.*/.*.ts",
            checkPackage: "@propsto/data",
            restrictedMembers: ["db"],
          },
        ],
      },
    },
  ],
};
