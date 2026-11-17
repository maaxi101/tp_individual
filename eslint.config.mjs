import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["**/node_modules/", "**/.expo/", "**/dist/", "**/build/"]),
  {
    files: ["packages/backend/**/*.js"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["packages/backend/tests/**/*.js"],
    languageOptions: { globals: { ...globals.node, ...globals.jest } },
  },
  {
    files: ["packages/frontend/**/*.{js,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: { ...globals.browser, __DEV__: "readonly", process: "readonly" },
    },
  },
  {
    files: ["packages/frontend/**/*.{js,jsx}"],
    ...pluginReact.configs.flat.recommended,
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
]);
