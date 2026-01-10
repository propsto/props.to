const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const { defineConfig, globalIgnores } = require("eslint/config");
const importPlugin = require("eslint-plugin-import");
const reactPlugin = require("eslint-plugin-react");
const reactHooksPlugin = require("eslint-plugin-react-hooks");
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
 * internal (bundled by their consumer) libraries
 * that utilize React.
 */

module.exports = defineConfig([
  ...compat.extends(
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
  ),
  ...typescriptConfigs,
  globalIgnores(["node_modules/**", "dist/**"]),
  {
    plugins: {
      import: importPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      globals: {
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
      "import/no-extraneous-dependencies": [
        1,
        {
          packageDir: [process.cwd()],
        },
      ],
      "import/no-default-export": "off",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
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
]);
