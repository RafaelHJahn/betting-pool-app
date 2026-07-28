import eslint from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import eslintConfigPrettier from "eslint-config-prettier";
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
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    extends: [...nextVitals, eslintConfigPrettier],
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
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, eslintConfigPrettier],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: importSortRules,
  },
  {
    files: ["**/*.{test,spec}.{ts,tsx}"],
    extends: [vitest.configs.recommended],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    settings: {
      vitest: {
        typecheck: true,
      },
    },
    rules: {
      "vitest/valid-title": ["error", { mustMatch: { it: ["^should .+"] } }],
    },
  },
);
