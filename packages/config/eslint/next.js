const { defineConfig, globalIgnores } = require("eslint/config");
const importPlugin = require("eslint-plugin-import");
const localRules = require("./local-rules");
const nextPlugin = require("@next/eslint-plugin-next");
const reactPlugin = require("eslint-plugin-react");
const reactHooksPlugin = require("eslint-plugin-react-hooks");
const turboPlugin = require("eslint-plugin-turbo");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");
const reactRecommended = reactPlugin.configs.flat.recommended;
const reactHooksRecommended = reactHooksPlugin.configs.recommended;
const nextRecommended = nextPlugin.configs.recommended;
const nextCoreWebVitals = nextPlugin.configs["core-web-vitals"];

/*
 * This is a custom ESLint configuration for use with
 * Next.js apps.
 */

module.exports = defineConfig([
  reactRecommended,
  {
    plugins: {
      "react-hooks": reactHooksPlugin,
    },
    rules: reactHooksRecommended.rules,
  },
  nextRecommended,
  nextCoreWebVitals,
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
      turbo: turboPlugin,
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
      "turbo/no-undeclared-env-vars": "error",
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
