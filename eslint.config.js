import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import nextVitals from "eslint-config-next/core-web-vitals";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

const importSortGroups = [
  ["^\\u0000"],
  ["^node:"],
  ["^react", "^next"],
  ["^@?\\w"],
  ["^@/"],
  ["^\\."],
];

const importSortRules = {
  "simple-import-sort/imports": ["error", { groups: importSortGroups }],
  "simple-import-sort/exports": "error",
};

export default defineConfig(
  {
    ignores: [".next/**", "out/**", "node_modules/**", "coverage/**"],
  },
  ...nextVitals,
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    extends: [eslintConfigPrettier],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: importSortRules,
  },
  {
    files: ["lib/**/*.ts", "types/**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      eslintConfigPrettier,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: importSortRules,
  },
  {
    files: ["*.config.{js,ts,mjs}", "next.config.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      eslintConfigPrettier,
    ],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: importSortRules,
  },
);
