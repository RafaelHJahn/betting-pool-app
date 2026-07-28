# BOL-105 — ESLint + Prettier + lefthook + commitlint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure ESLint (hybrid flat config), Prettier, lefthook, and commitlint in `betting-pool-app`, aligned with the `betting-pool` backend conventions.

**Architecture:** Add dev tooling on top of the BOL-104 bootstrap. ESLint uses `eslint-config-next/core-web-vitals` for React/Next files, `typescript-eslint` type-checked rules only in `lib/` and `types/`, and `simple-import-sort` everywhere. Prettier mirrors backend `.prettierrc.json`. Git hooks via lefthook with manual install (no `prepare` script).

**Tech Stack:** ESLint 9 flat config, eslint-config-next 16.2.12, typescript-eslint, Prettier 3, lefthook, commitlint, pnpm

**Spec:** `docs/superpowers/specs/2026-07-27-bol-105-lint-format-hooks-design.md`

## Global Constraints

- Package manager: `pnpm@11.9.0`
- Node: `>=26.4.0` (`.nvmrc` with `26.4.0`)
- ESM: `"type": "module"` in `package.json`
- ESLint: flat config (`eslint.config.js`), hybrid type-check only in `lib/**` and `types/**`
- Prettier: `printWidth: 100` (identical to backend)
- Git hooks: lefthook — **manual** install (`pnpm exec lefthook install`), no `prepare` script
- Commits: conventional commits with `scope-case: lower-case` (e.g. `feat(web): ...`)
- Out of scope: CI (BOL-108), Vitest ESLint rules (BOL-106), Prettier Tailwind plugin

---

## File map

| File                       | Action             | Responsibility                                           |
| -------------------------- | ------------------ | -------------------------------------------------------- |
| `eslint.config.js`         | Create             | Hybrid flat config (Next + type-checked + config files)  |
| `.prettierrc.json`         | Create             | Formatting rules (`printWidth: 100`)                     |
| `.prettierignore`          | Create             | Ignore lockfile, workspace, build artifacts              |
| `lefthook.yml`             | Create             | pre-commit (eslint + prettier) + commit-msg (commitlint) |
| `commitlint.config.js`     | Create             | Conventional commits config                              |
| `package.json`             | Modify             | devDependencies + lint/format scripts                    |
| `pnpm-workspace.yaml`      | Modify             | `allowBuilds: lefthook: true`                            |
| `lib/utils.ts`             | Modify (if needed) | Prettier may add semicolons                              |
| `components/ui/button.tsx` | Modify (if needed) | Import sort / format fixes                               |

---

### Task 1: Install devDependencies and update scripts

**Files:**

- Modify: `package.json`

**Interfaces:**

- Produces: all lint/format/hook packages installed; `pnpm lint` and `pnpm format` scripts ready (will fail until Task 2–3)

- [ ] **Step 1: Add devDependencies**

Run from `/home/rafael-jahn/Projetos/Pessoal/betting-pool-aio/betting-pool-app`:

```bash
pnpm add -D \
  @eslint/js@^10.0.1 \
  @commitlint/cli@^21.2.0 \
  @commitlint/config-conventional@^21.2.0 \
  eslint-config-prettier@^10.1.8 \
  eslint-plugin-simple-import-sort@^13.0.0 \
  lefthook@^2.1.9 \
  prettier@^3.9.4 \
  typescript-eslint@^8.62.1
```

Expected: packages added to `devDependencies` in `package.json` and `pnpm-lock.yaml` updated.

- [ ] **Step 2: Update scripts in `package.json`**

Replace the `scripts` section:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "pnpm dlx serve out",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --check .",
  "format:fix": "prettier --write ."
}
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
git commit -m "chore(web): add lint/format/hook devDependencies"
```

---

### Task 2: Create ESLint flat config

**Files:**

- Create: `eslint.config.js`

**Interfaces:**

- Consumes: devDependencies from Task 1 (`eslint`, `eslint-config-next`, `@eslint/js`, `typescript-eslint`, `eslint-config-prettier`, `eslint-plugin-simple-import-sort`)
- Produces: `pnpm lint` runs ESLint against the project

- [ ] **Step 1: Create `eslint.config.js`**

```js
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
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, eslintConfigPrettier],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: importSortRules,
  },
);
```

- [ ] **Step 2: Run lint (expect errors — formatting/import order not fixed yet)**

Run:

```bash
pnpm lint
```

Expected: ESLint runs (no "couldn't find eslint.config" error). May report import-sort or other fixable errors — that is OK at this step.

- [ ] **Step 3: Commit**

```bash
git add eslint.config.js
git commit -m "chore(web): add hybrid ESLint flat config"
```

---

### Task 3: Create Prettier config

**Files:**

- Create: `.prettierrc.json`
- Create: `.prettierignore`

**Interfaces:**

- Consumes: `prettier` from Task 1
- Produces: `pnpm format` checks formatting across the project

- [ ] **Step 1: Create `.prettierrc.json`**

```json
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "printWidth": 100
}
```

- [ ] **Step 2: Create `.prettierignore`**

```
pnpm-lock.yaml
pnpm-workspace.yaml
.next/
out/
```

- [ ] **Step 3: Run format check (expect failures on unformatted files)**

Run:

```bash
pnpm format
```

Expected: Prettier runs. May report files needing formatting — OK at this step.

- [ ] **Step 4: Commit**

```bash
git add .prettierrc.json .prettierignore
git commit -m "chore(web): add Prettier config aligned with backend"
```

---

### Task 4: Create git hooks (lefthook + commitlint)

**Files:**

- Create: `lefthook.yml`
- Create: `commitlint.config.js`
- Modify: `pnpm-workspace.yaml`

**Interfaces:**

- Consumes: `lefthook`, `@commitlint/cli`, `@commitlint/config-conventional` from Task 1
- Produces: hook config files ready for manual `lefthook install`

- [ ] **Step 1: Create `lefthook.yml`**

```yaml
pre-commit:
  parallel: true
  jobs:
    - name: eslint
      glob: "{app,components,lib,types}/**/*.{ts,tsx}"
      run: pnpm exec eslint -- {staged_files}

    - name: prettier
      run: pnpm exec prettier --check --ignore-unknown {staged_files}

commit-msg:
  commands:
    commitlint:
      run: pnpm exec commitlint --edit {1}
```

- [ ] **Step 2: Create `commitlint.config.js`**

```js
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-case": [2, "always", "lower-case"],
  },
};
```

- [ ] **Step 3: Update `pnpm-workspace.yaml`**

```yaml
allowBuilds:
  sharp: true
  unrs-resolver: true
  lefthook: true
```

- [ ] **Step 4: Commit**

```bash
git add lefthook.yml commitlint.config.js pnpm-workspace.yaml
git commit -m "chore(web): add lefthook and commitlint config"
```

---

### Task 5: Fix formatting/lint issues and verify

**Files:**

- Modify: any source files flagged by `pnpm format:fix` or `pnpm lint:fix` (likely `lib/utils.ts`, possibly `components/ui/button.tsx`, `app/layout.tsx`)

**Interfaces:**

- Consumes: all config from Tasks 1–4
- Produces: clean `pnpm lint`, `pnpm format`, `pnpm build`; working commit-msg hook

- [ ] **Step 1: Auto-fix formatting and lint**

Run:

```bash
pnpm format:fix
pnpm lint:fix
```

Expected: exit code 0 for both. Review the diff — only formatting/import-order changes, no logic changes.

- [ ] **Step 2: Verify lint, format, and build**

Run:

```bash
pnpm lint
pnpm format
pnpm build
```

Expected: all three exit code 0.

- [ ] **Step 3: Install lefthook hooks (manual, one-time per clone)**

Run:

```bash
pnpm exec lefthook install
```

Expected: `sync hooks: ✔️ (commit-msg, pre-commit)` or similar success message.

- [ ] **Step 4: Test commit-msg hook rejects bad messages**

Run:

```bash
git commit --allow-empty -m "bad message"
```

Expected: FAIL — commitlint rejects with conventional-commit error.

- [ ] **Step 5: Test commit-msg hook accepts valid messages**

Run:

```bash
git commit --allow-empty -m "chore(web): setup lint and format tooling"
```

Expected: PASS — commit succeeds.

- [ ] **Step 6: Commit any remaining fixes**

If Step 1 produced uncommitted changes:

```bash
git add -A
git commit -m "chore(web): apply lint and format fixes"
```

---

## Self-review (plan vs spec)

| Spec requirement                           | Covered by                                                            |
| ------------------------------------------ | --------------------------------------------------------------------- |
| ESLint flat config (TS + React + Next)     | Task 2 — `eslint.config.js` with `eslint-config-next/core-web-vitals` |
| Type-check only in `lib/` + `types/`       | Task 2 — block 3 with `recommendedTypeChecked`                        |
| `simple-import-sort` with `@/` groups      | Task 2 — `importSortGroups` + rules in all blocks                     |
| Prettier aligned with backend              | Task 3 — `.prettierrc.json` + `.prettierignore`                       |
| lefthook pre-commit (lint + format)        | Task 4 — `lefthook.yml`                                               |
| commitlint conventional                    | Task 4 — `commitlint.config.js`                                       |
| Manual lefthook install (no `prepare`)     | Task 5 Step 3 — documented, not in `package.json`                     |
| `pnpm lint` passes                         | Task 5 Step 2                                                         |
| `pnpm format` passes                       | Task 5 Step 2                                                         |
| Bad commit rejected                        | Task 5 Step 4                                                         |
| `pnpm build` no regression                 | Task 5 Step 2                                                         |
| `pnpm-workspace.yaml` lefthook allowBuilds | Task 4 Step 3                                                         |

No placeholders. All code blocks are complete.
