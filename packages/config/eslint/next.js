const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const { defineConfig, globalIgnores } = require("eslint/config");
const importPlugin = require("eslint-plugin-import");
const localRules = require("./local-rules");
const reactPlugin = require("eslint-plugin-react");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});
const nextVitals = compat.extends(
  "plugin:react/recommended",
  "plugin:react-hooks/recommended",
  "plugin:@next/next/recommended",
  "plugin:@next/next/core-web-vitals",
);

/*
 * This is a custom ESLint configuration for use with
 * Next.js apps.
 */

module.exports = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    plugins: {
      "@typescript-eslint": tsPlugin,
      import: importPlugin,
      "local-rules": localRules,
      react: reactPlugin,
    },
    languageOptions: {
      globals: {
        React: "readonly",
        JSX: "readonly",
      },
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          project,
        },
      },
    },
    rules: {
      "import/no-default-export": "off", // Next.js App Router relies on default exporting pages/components.
      "react/jsx-sort-props": "off",
      "local-rules/restrict-import": [
        "error",
        [
          {
            allowedFile: resolve(process.cwd(), "packages/data/db.ts"),
            checkPackage: "@prisma/client",
          },
          {
            allowedFile: "^packages/data/repos/.*/.*.ts",
            checkPackage: "@propsto/data",
          },
        ],
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project,
        tsconfigRootDir: process.cwd(),
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: "module",
      },
    },
  },
  {
    files: ["**/*.{js,ts,tsx}"],
    rules: {
      "local-rules/restrict-import": [
        "error",
        [
          {
            allowedFile: resolve(process.cwd(), "packages/data/db.ts"),
            checkPackage: "@prisma/client",
            restrictedMembers: ["PrismaClient"],
          },
          {
            allowedFile: "^packages/data/repos/.*/.*.ts",
            checkPackage: "@propsto/data",
            restrictedMembers: ["db"],
          },
        ],
      ],
    },
  },
]);
