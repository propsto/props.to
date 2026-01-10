const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const { defineConfig, globalIgnores } = require("eslint/config");
const importPlugin = require("eslint-plugin-import");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});
const typescriptConfigs = compat
  .extends("plugin:@typescript-eslint/recommended", "plugin:import/typescript")
  .map(config => ({
    ...config,
    files: ["**/*.{ts,tsx}"],
  }));

/*
 * This is a custom ESLint configuration for use with
 * typescript packages.
 */

module.exports = defineConfig([
  ...compat.extends(
    "plugin:import/recommended",
  ),
  ...typescriptConfigs,
  globalIgnores(["node_modules/**", "dist/**"]),
  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project,
        },
      },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tsPlugin,
      import: importPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project,
        tsconfigRootDir: process.cwd(),
        sourceType: "module",
      },
    },
  },
  {
    files: ["**/*.d.ts"],
    rules: {
      "import/no-unresolved": "off",
    },
  },
  {
    files: ["**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
]);
