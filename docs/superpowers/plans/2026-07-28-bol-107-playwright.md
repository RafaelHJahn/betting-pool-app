# BOL-107 — Playwright (config base + smoke test) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure Playwright in `betting-pool-app` with a smoke test that validates the static production build (`out/`) renders the homepage with correct title, heading, and button.

**Architecture:** Add E2E tooling on top of the BOL-104/105/106 bootstrap. Playwright runs via `playwright.config.ts` with a `webServer` that builds and serves `out/` on port 3000. Tests live in `e2e/*.spec.ts`. ESLint gains a Playwright block; lefthook includes `e2e/` in its ESLint glob. Vitest excludes `e2e/**` to avoid picking up Playwright spec files.

**Tech Stack:** @playwright/test (latest), serve (latest), eslint-plugin-playwright (latest), pnpm

**Spec:** `docs/superpowers/specs/2026-07-28-bol-107-playwright-design.md`

## Global Constraints

- Package manager: `pnpm@11.9.0`
- Node: `>=26.4.0` (`.nvmrc` with `26.4.0`)
- ESM: `"type": "module"` in `package.json`
- Playwright: latest (not pinned)
- Browsers: Chromium only
- Server port: `3000` (shared by `start` script and `webServer`)
- Test location: `e2e/*.spec.ts`
- Test titles: `playwright/valid-title` with `mustMatch: { test: "^should .+" }`
- lefthook: include `e2e/` in ESLint glob; do **not** run E2E on pre-commit
- Commits: conventional commits with `scope-case: lower-case` (e.g. `test(web): ...`)
- Out of scope: CI (BOL-108), Firefox/WebKit, lefthook E2E hook, Page Object Model, coverage

---

## File map

| File                   | Action | Responsibility                                   |
| ---------------------- | ------ | ------------------------------------------------ |
| `playwright.config.ts` | Create | Playwright config (webServer, Chromium, baseURL) |
| `e2e/home.spec.ts`     | Create | Smoke test for homepage                          |
| `app/layout.tsx`       | Modify | `metadata.title` → `"Bolão"`                     |
| `vitest.config.ts`     | Modify | Exclude `e2e/**` from Vitest includes            |
| `eslint.config.js`     | Modify | Add Playwright ESLint block for `e2e/**/*.ts`    |
| `lefthook.yml`         | Modify | Include `e2e/` in ESLint glob                    |
| `package.json`         | Modify | `start`, `test:e2e` scripts + devDependencies    |
| `.gitignore`           | Modify | Ignore Playwright artifacts                      |
| `README.md`            | Modify | Document `pnpm test:e2e` and browser install     |

---

### Task 1: Install devDependencies, scripts, and gitignore

**Files:**

- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**

- Produces: `@playwright/test`, `serve`, `eslint-plugin-playwright` installed; `start`/`test:e2e` scripts ready; Playwright artifacts ignored

- [ ] **Step 1: Add devDependencies**

Run from `/home/rafael-jahn/Projetos/Pessoal/betting-pool-aio/betting-pool-app`:

```bash
pnpm add -D @playwright/test serve eslint-plugin-playwright
```

Expected: packages added to `devDependencies` in `package.json` and `pnpm-lock.yaml` updated.

- [ ] **Step 2: Update scripts in `package.json`**

Replace the `start` script and add E2E scripts. The `scripts` section should become:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "serve out -l 3000",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --check .",
  "format:fix": "prettier --write .",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

- [ ] **Step 3: Add Playwright entries to `.gitignore`**

Append to `.gitignore`:

```
# playwright
/playwright-report/
/test-results/
/blob-report/
```

- [ ] **Step 4: Install browser binaries**

Run:

```bash
pnpm exec playwright install chromium
```

Expected: Chromium downloaded; exit code 0.

- [ ] **Step 5: Verify install**

Run:

```bash
pnpm install
```

Expected: exit code 0, no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml .gitignore
git commit -m "chore(web): add Playwright and serve devDependencies"
```

---

### Task 2: Create Playwright config and exclude e2e from Vitest

**Files:**

- Create: `playwright.config.ts`
- Modify: `vitest.config.ts`

**Interfaces:**

- Consumes: devDependencies from Task 1 (`@playwright/test`, `serve`)
- Produces: `playwright.config.ts` with `webServer` on port 3000; Vitest no longer matches `e2e/*.spec.ts`

- [ ] **Step 1: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm build && pnpm exec serve out -l ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 2: Exclude `e2e/` from Vitest**

In `vitest.config.ts`, update the `exclude` array:

```ts
exclude: ["node_modules/**", ".next/**", "out/**", "e2e/**"],
```

Without this, Vitest picks up `e2e/home.spec.ts` (matches `**/*.spec.ts`).

- [ ] **Step 3: Verify Vitest still passes**

Run:

```bash
pnpm test
```

Expected: exit code 0, only `components/ui/button.test.tsx` runs (1 passed test).

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts vitest.config.ts
git commit -m "chore(web): add Playwright config and exclude e2e from Vitest"
```

---

### Task 3: Create smoke test, update metadata, and verify E2E passes

**Files:**

- Create: `e2e/home.spec.ts`
- Modify: `app/layout.tsx`

**Interfaces:**

- Consumes: Playwright config from Task 2; homepage at `app/page.tsx` with `<h1>Bolão</h1>` and `<Button>Entrar</Button>`
- Produces: passing smoke test validating `<title>`, heading, and button via `getByRole`

- [ ] **Step 1: Write the smoke test**

Create `e2e/home.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("should render title, heading and enter button", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle("Bolão");
    await expect(page.getByRole("heading", { name: "Bolão", level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });
});
```

- [ ] **Step 2: Run E2E to verify it fails on title**

Run:

```bash
pnpm test:e2e
```

Expected: FAIL — `toHaveTitle` assertion fails because current title is `"Create Next App"`.

- [ ] **Step 3: Update `metadata.title` in `app/layout.tsx`**

Change the metadata block:

```ts
export const metadata: Metadata = {
  title: "Bolão",
  description: "Generated by create next app",
};
```

- [ ] **Step 4: Run E2E to verify it passes**

Run:

```bash
pnpm test:e2e
```

Expected: exit code 0, output includes `e2e/home.spec.ts` with 1 passed test.

- [ ] **Step 5: Commit**

```bash
git add e2e/home.spec.ts app/layout.tsx
git commit -m "test(web): add homepage Playwright smoke test"
```

---

### Task 4: Add ESLint Playwright block and update lefthook

**Files:**

- Modify: `eslint.config.js`
- Modify: `lefthook.yml`

**Interfaces:**

- Consumes: `eslint-plugin-playwright` from Task 1; smoke test from Task 3
- Produces: `pnpm lint` passes on `e2e/` files and `playwright.config.ts`; lefthook ESLint covers `e2e/`

- [ ] **Step 1: Add Playwright import and ESLint block**

Replace the full contents of `eslint.config.js` with:

```js
import eslint from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import playwright from "eslint-plugin-playwright";
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
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
    ],
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
    ignores: ["e2e/**"],
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
  {
    files: ["e2e/**/*.ts"],
    extends: [playwright.configs["flat/recommended"]],
    rules: {
      "playwright/valid-title": ["error", { mustMatch: { test: "^should .+" } }],
    },
  },
);
```

The Vitest block uses `ignores: ["e2e/**"]` because `**/*.spec.ts` also matches `e2e/home.spec.ts`.

- [ ] **Step 2: Update lefthook ESLint glob**

In `lefthook.yml`, change the eslint job glob:

```yaml
glob: "{app,components,lib,types,e2e}/**/*.{ts,tsx}"
```

- [ ] **Step 3: Run lint**

Run:

```bash
pnpm lint
```

Expected: exit code 0, no errors on `e2e/home.spec.ts` or `playwright.config.ts`.

- [ ] **Step 4: Commit**

```bash
git add eslint.config.js lefthook.yml
git commit -m "chore(web): add ESLint Playwright rules and lefthook e2e glob"
```

---

### Task 5: Update README and final verification

**Files:**

- Modify: `README.md`

**Interfaces:**

- Consumes: all config and tests from Tasks 1–4
- Produces: documented E2E commands; all acceptance criteria met

- [ ] **Step 1: Update `README.md`**

Add browser install to the `## Setup` section (after `pnpm exec lefthook install`):

```bash
pnpm exec playwright install chromium
```

Required once per clone — downloads Chromium binaries for E2E tests.

Update the `## Scripts` code block to:

```bash
pnpm dev          # servidor de desenvolvimento
pnpm build        # build estático (gera out/)
pnpm start        # serve out/ na porta 3000
pnpm test         # Vitest (run once)
pnpm test:watch   # Vitest (watch mode)
pnpm test:e2e     # Playwright E2E (run once)
pnpm test:e2e:ui  # Playwright E2E (UI mode)
pnpm lint         # ESLint
pnpm lint:fix     # ESLint com auto-fix
pnpm format       # Prettier (check)
pnpm format:fix   # Prettier (write)
```

- [ ] **Step 2: Run full verification**

Run:

```bash
pnpm test:e2e
pnpm test
pnpm lint
pnpm build
```

Expected: all four exit code 0.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs(web): document Playwright E2E test scripts"
```

---

## Self-review (plan vs spec)

| Spec requirement                            | Covered by                                  |
| ------------------------------------------- | ------------------------------------------- |
| `playwright.config.ts` with webServer       | Task 2 Step 1                               |
| Chromium only                               | Task 2 Step 1 (`projects`)                  |
| `serve` as devDependency + `start` script   | Task 1 Steps 1–2                            |
| `e2e/home.spec.ts` smoke test               | Task 3 Steps 1, 4                           |
| Title + heading + button assertions         | Task 3 Step 1                               |
| `metadata.title` → `"Bolão"`                | Task 3 Step 3                               |
| `eslint-plugin-playwright` + `valid-title`  | Task 4 Step 1                               |
| lefthook `e2e/` glob                        | Task 4 Step 2                               |
| `.gitignore` Playwright artifacts           | Task 1 Step 3                               |
| `pnpm test:e2e` passes                      | Task 3 Step 4, Task 5 Step 2                |
| `pnpm test`, `pnpm lint`, `pnpm build` pass | Task 2 Step 3, Task 4 Step 3, Task 5 Step 2 |
| `test:e2e:ui` script                        | Task 1 Step 2                               |
| README documents E2E + browser install      | Task 5 Step 1                               |
| No lefthook E2E hook                        | Global Constraints                          |
| No CI / multi-browser                       | Global Constraints (out of scope)           |
| Vitest does not run Playwright specs        | Task 2 Step 2 + Task 4 Vitest `ignores`     |

No placeholders. All code blocks are complete.
