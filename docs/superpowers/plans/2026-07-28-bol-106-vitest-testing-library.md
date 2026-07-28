# BOL-106 — Vitest + Testing Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure Vitest and Testing Library in `betting-pool-app` with a smoke test that validates jsdom + React + jest-dom matchers.

**Architecture:** Add test tooling on top of the BOL-104/105 bootstrap. Vitest runs in a dedicated `vitest.config.ts` with `@vitejs/plugin-react` and `jsdom`. Tests are colocated (`**/*.{test,spec}.{ts,tsx}`). A single `test/setup.ts` registers jest-dom matchers. ESLint gains a Vitest block aligned with the backend.

**Tech Stack:** Vitest (latest), @vitejs/plugin-react, jsdom, @testing-library/react, @testing-library/jest-dom, @vitest/eslint-plugin, pnpm

**Spec:** `docs/superpowers/specs/2026-07-28-bol-106-vitest-testing-library-design.md`

## Global Constraints

- Package manager: `pnpm@11.9.0`
- Node: `>=26.4.0` (`.nvmrc` with `26.4.0`)
- ESM: `"type": "module"` in `package.json`
- Vitest: latest (not pinned to backend's `^4.1.9`)
- Test environment: `jsdom`
- Test location: colocated `**/*.{test,spec}.{ts,tsx}`
- Globals: `globals: true` with types via `vitest-env.d.ts` (do **not** override `types` in `tsconfig.json`)
- lefthook: no changes — tests run via `pnpm test` only (CI in BOL-108)
- Commits: conventional commits with `scope-case: lower-case` (e.g. `test(web): ...`)
- Out of scope: coverage/thresholds, lefthook test hook, Playwright (BOL-107), CI (BOL-108)

---

## File map

| File                            | Action | Responsibility                             |
| ------------------------------- | ------ | ------------------------------------------ |
| `vitest.config.ts`              | Create | Vitest config (jsdom, paths, setup)        |
| `test/setup.ts`                 | Create | Register `@testing-library/jest-dom`       |
| `vitest-env.d.ts`               | Create | Vitest globals type reference              |
| `components/ui/button.test.tsx` | Create | Smoke test for `Button` component          |
| `eslint.config.js`              | Modify | Add Vitest ESLint block for test files     |
| `package.json`                  | Modify | `test` scripts + devDependencies           |
| `README.md`                     | Modify | Document `pnpm test` and `pnpm test:watch` |

---

### Task 1: Install devDependencies and test scripts

**Files:**

- Modify: `package.json`

**Interfaces:**

- Produces: all test packages installed; `pnpm test` script ready (will fail until Task 2–3)

- [ ] **Step 1: Add devDependencies**

Run from `/home/rafael-jahn/Projetos/Pessoal/betting-pool-aio/betting-pool-app`:

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/dom @vitest/eslint-plugin
```

Expected: packages added to `devDependencies` in `package.json` and `pnpm-lock.yaml` updated.

- [ ] **Step 2: Add test scripts to `package.json`**

Add to the `scripts` section (keep existing scripts):

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Verify install**

Run:

```bash
pnpm install
```

Expected: exit code 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(web): add Vitest and Testing Library devDependencies"
```

---

### Task 2: Create Vitest configuration files

**Files:**

- Create: `vitest.config.ts`
- Create: `test/setup.ts`
- Create: `vitest-env.d.ts`

**Interfaces:**

- Consumes: devDependencies from Task 1 (`vitest`, `@vitejs/plugin-react`, `@testing-library/jest-dom`)
- Produces: Vitest runner configured; `pnpm test` finds zero tests (no failure — exit 0 with "no tests")

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", "out/**"],
  },
});
```

- [ ] **Step 2: Create `test/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Create `vitest-env.d.ts`**

```ts
/// <reference types="vitest/globals" />
```

- [ ] **Step 4: Verify Vitest runs (no tests yet)**

Run:

```bash
pnpm test
```

Expected: exit code 0 with message like `No test files found` — confirms config is valid.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts test/setup.ts vitest-env.d.ts
git commit -m "chore(web): add Vitest config with jsdom and jest-dom setup"
```

---

### Task 3: Create smoke test and verify `pnpm test` passes

**Files:**

- Create: `components/ui/button.test.tsx`

**Interfaces:**

- Consumes: Vitest config from Task 2; `Button` component from `components/ui/button.tsx`
- Produces: passing smoke test validating jsdom + RTL + jest-dom

- [ ] **Step 1: Write the smoke test**

Create `components/ui/button.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { Button } from "./button";

describe("Button", () => {
  it("should render with label", () => {
    render(<Button>Entrar</Button>);
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run:

```bash
pnpm test
```

Expected: exit code 0, output includes `components/ui/button.test.tsx` with 1 passed test.

- [ ] **Step 3: Commit**

```bash
git add components/ui/button.test.tsx
git commit -m "test(web): add Button smoke test for Vitest setup"
```

---

### Task 4: Add ESLint Vitest block

**Files:**

- Modify: `eslint.config.js`

**Interfaces:**

- Consumes: `@vitest/eslint-plugin` from Task 1; smoke test from Task 3
- Produces: `pnpm lint` passes on test files and `vitest.config.ts`

- [ ] **Step 1: Add Vitest import and ESLint block**

Replace the full contents of `eslint.config.js` with:

```js
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import eslintConfigPrettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import vitest from "@vitest/eslint-plugin";
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
```

- [ ] **Step 2: Run lint**

Run:

```bash
pnpm lint
```

Expected: exit code 0, no errors on test files or `vitest.config.ts`.

- [ ] **Step 3: Commit**

```bash
git add eslint.config.js
git commit -m "chore(web): add ESLint Vitest rules for test files"
```

---

### Task 5: Update README and final verification

**Files:**

- Modify: `README.md`

**Interfaces:**

- Consumes: all config and tests from Tasks 1–4
- Produces: documented test commands; all acceptance criteria met

- [ ] **Step 1: Update `README.md` scripts section**

Add test scripts to the `## Scripts` code block:

```bash
pnpm test          # Vitest (run once)
pnpm test:watch    # Vitest (watch mode)
```

The full scripts section should be:

```bash
pnpm dev          # servidor de desenvolvimento
pnpm build        # build estático (gera out/)
pnpm start        # serve out/ localmente
pnpm test         # Vitest (run once)
pnpm test:watch   # Vitest (watch mode)
pnpm lint         # ESLint
pnpm lint:fix     # ESLint com auto-fix
pnpm format       # Prettier (check)
pnpm format:fix   # Prettier (write)
```

- [ ] **Step 2: Run full verification**

Run:

```bash
pnpm test
pnpm lint
pnpm build
```

Expected: all three exit code 0.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs(web): document Vitest test scripts"
```

---

## Self-review (plan vs spec)

| Spec requirement                               | Covered by                        |
| ---------------------------------------------- | --------------------------------- |
| `vitest.config.ts` with jsdom                  | Task 2 Step 1                     |
| `@testing-library/react` + `jest-dom`          | Task 1 Step 1 + Task 2 Step 2     |
| Smoke test for config validation               | Task 3                            |
| `pnpm test` passes                             | Task 3 Step 2, Task 5 Step 2      |
| Colocated tests `**/*.{test,spec}.{ts,tsx}`    | Task 2 Step 1 (`include` glob)    |
| `globals: true` + `vitest-env.d.ts`            | Task 2 Steps 1 + 3                |
| `@vitest/eslint-plugin` + `vitest/valid-title` | Task 4                            |
| `pnpm lint` passes (tests + vitest.config.ts)  | Task 4 Step 2, Task 5 Step 2      |
| `pnpm build` no regression                     | Task 5 Step 2                     |
| `test:watch` script                            | Task 1 Step 2                     |
| README documents `pnpm test`                   | Task 5 Step 1                     |
| No lefthook changes                            | Global Constraints                |
| No coverage/thresholds                         | Global Constraints (out of scope) |
| Vitest latest (not pinned)                     | Task 1 Step 1 (`pnpm add` no pin) |

No placeholders. All code blocks are complete.
