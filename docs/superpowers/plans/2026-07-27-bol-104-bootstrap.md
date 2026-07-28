# BOL-104 — Bootstrap Next.js + TypeScript + Tailwind + shadcn/ui Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the `betting-pool-app` frontend with Next.js (App Router), TypeScript strict, Tailwind CSS, shadcn/ui (`new-york` + `neutral`), and static export — with a minimal homepage using a shadcn `Button`.

**Architecture:** Scaffold via `create-next-app` into the existing repo (preserving `docs/`), then initialize shadcn/ui on the existing Next.js project using a preset URL. Configure `output: "export"` for static SPA deployment. No test framework in this issue (BOL-106); verification is via `pnpm build`.

**Tech Stack:** Next.js (App Router), TypeScript strict, ESM, Tailwind CSS v4, shadcn/ui, pnpm

**Spec:** `docs/superpowers/specs/2026-07-27-bol-104-bootstrap-design.md`

## Global Constraints

- Package manager: `pnpm@11.9.0`
- Node: `>=26.4.0` (`.nvmrc` with `26.4.0`)
- ESM: `"type": "module"` in `package.json`
- TypeScript: strict mode enabled
- Folder structure: no `src/` — `app/`, `components/`, `lib/`, `types/` at repo root
- shadcn style: `new-york`
- shadcn base color: `neutral`
- Build: `output: "export"` + `images.unoptimized: true`
- Homepage: `<h1>Bolão</h1>` + `<Button>Entrar</Button>` (no action)
- Out of scope: ESLint/Prettier (BOL-105), Vitest (BOL-106), Playwright (BOL-107), CI (BOL-108)

---

## File map

| File | Action | Responsibility |
|------|--------|----------------|
| `app/globals.css` | Create (via shadcn) | shadcn theme CSS variables |
| `app/layout.tsx` | Create (via scaffold) | Root layout, metadata, font |
| `app/page.tsx` | Modify | Minimal homepage |
| `components/ui/button.tsx` | Create (via shadcn) | First shadcn component |
| `lib/utils.ts` | Create (via shadcn) | `cn()` helper |
| `types/.gitkeep` | Create | Placeholder for future shared types |
| `components.json` | Create (via shadcn) | shadcn configuration |
| `next.config.ts` | Create + Modify | Next.js config with static export |
| `package.json` | Create + Modify | Dependencies, scripts, engines |
| `tsconfig.json` | Create (via scaffold) | TypeScript strict config |
| `.nvmrc` | Create | Node version pin |
| `pnpm-lock.yaml` | Create (via install) | Lockfile |

---

### Task 1: Scaffold Next.js project

**Files:**
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css` (initial), `next.config.ts`, `package.json`, `tsconfig.json`, `public/*`
- Preserve: `docs/` (do not delete)

**Interfaces:**
- Produces: Next.js App Router project at repo root without `src/`, ready for shadcn init

- [ ] **Step 1: Verify Node and pnpm versions**

Run:
```bash
node -v
pnpm -v
```
Expected: Node `>=26.4.0`, pnpm `11.9.0` (or compatible)

- [ ] **Step 2: Scaffold Next.js in repo root**

Run from `/home/rafael-jahn/Projetos/Pessoal/betting-pool-aio/betting-pool-app`:

```bash
pnpm create next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --use-pnpm \
  --disable-git
```

Do **not** pass `--eslint` (ESLint config is BOL-105).

If the CLI refuses the non-empty directory because of `docs/`, scaffold into a temp directory and move files:

```bash
pnpm create next-app@latest /tmp/bol-104-scaffold \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --use-pnpm \
  --disable-git

# Move scaffolded files into repo root, preserving docs/
shopt -s dotglob
mv /tmp/bol-104-scaffold/* .
rm -rf /tmp/bol-104-scaffold
```

- [ ] **Step 3: Verify scaffold structure**

Run:
```bash
ls -la app/ package.json tsconfig.json next.config.ts
```
Expected: all files exist; no `src/` directory

- [ ] **Step 4: Verify TypeScript strict and ESM**

Confirm `tsconfig.json` has `"strict": true`.

Confirm `package.json` has `"type": "module"`. If missing, add it:

```json
{
  "type": "module"
}
```

- [ ] **Step 5: Verify dev server starts**

Run:
```bash
pnpm dev
```
Expected: server starts on `http://localhost:3000` without errors. Stop the server after verifying.

---

### Task 2: Configure static export

**Files:**
- Modify: `next.config.ts`

**Interfaces:**
- Consumes: Next.js scaffold from Task 1
- Produces: `next.config.ts` with static export settings

- [ ] **Step 1: Update next.config.ts**

Replace contents of `next.config.ts` with:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

- [ ] **Step 2: Verify static export build**

Run:
```bash
pnpm build
```
Expected: build succeeds and `out/` directory is created

- [ ] **Step 3: Commit**

```bash
git add app/ public/ next.config.ts package.json pnpm-lock.yaml tsconfig.json postcss.config.mjs next-env.d.ts .gitignore
git commit -m "$(cat <<'EOF'
feat(web): scaffold Next.js with static export

Bootstrap App Router project with TypeScript strict, Tailwind CSS,
and output: export for static SPA deployment.
EOF
)"
```

---

### Task 3: Initialize shadcn/ui and add Button

**Files:**
- Create: `components.json`, `lib/utils.ts`, `components/ui/button.tsx`
- Modify: `app/globals.css`, `package.json` (shadcn deps)

**Interfaces:**
- Consumes: Next.js project from Task 1–2
- Produces: `components.json` with `style: "new-york"` and `baseColor: "neutral"`; `Button` component at `@/components/ui/button`

- [ ] **Step 1: Initialize shadcn/ui with new-york + neutral preset**

Run:
```bash
pnpm dlx shadcn@latest init --preset "https://ui.shadcn.com/init?style=new-york&baseColor=neutral"
```

If the preset URL fails, run interactively and select `new-york` style + `neutral` base color:

```bash
pnpm dlx shadcn@latest init
```

- [ ] **Step 2: Verify components.json**

Confirm `components.json` contains:

```json
{
  "style": "new-york",
  "tailwind": {
    "baseColor": "neutral",
    "cssVariables": true
  }
}
```

Style may appear as `"new-york"` or an equivalent preset name — the visual result must match `new-york` + `neutral`.

- [ ] **Step 3: Add Button component**

Run:
```bash
pnpm dlx shadcn@latest add button
```

Expected: creates `components/ui/button.tsx` and `lib/utils.ts`

- [ ] **Step 4: Verify build still passes**

Run:
```bash
pnpm build
```
Expected: PASS, `out/` generated

- [ ] **Step 5: Commit**

```bash
git add components.json components/ lib/ app/globals.css package.json pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
feat(web): initialize shadcn/ui with Button component

Set up new-york style with neutral base color and add the
first shadcn component for homepage validation.
EOF
)"
```

---

### Task 4: Minimal homepage and project alignment

**Files:**
- Modify: `app/page.tsx`
- Create: `types/.gitkeep`, `.nvmrc`
- Modify: `package.json` (engines, packageManager)

**Interfaces:**
- Consumes: `Button` from `@/components/ui/button`
- Produces: homepage rendering `<h1>Bolão</h1>` + `<Button>Entrar</Button>`

- [ ] **Step 1: Implement homepage**

Replace `app/page.tsx` with:

```tsx
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold tracking-tight">Bolão</h1>
      <Button>Entrar</Button>
    </main>
  );
}
```

- [ ] **Step 2: Create types directory placeholder**

Run:
```bash
mkdir -p types
touch types/.gitkeep
```

- [ ] **Step 3: Add .nvmrc**

Create `.nvmrc`:

```
26.4.0
```

- [ ] **Step 4: Add engines and packageManager to package.json**

Add to `package.json`:

```json
{
  "engines": {
    "node": ">=26.4.0"
  },
  "packageManager": "pnpm@11.9.0"
}
```

- [ ] **Step 5: Verify final build**

Run:
```bash
pnpm install
pnpm build
```
Expected: PASS, `out/index.html` exists

- [ ] **Step 6: Verify homepage content in build output**

Run:
```bash
grep -q "Bolão" out/index.html && grep -q "Entrar" out/index.html && echo "Homepage OK"
```
Expected: `Homepage OK`

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx types/.gitkeep .nvmrc package.json
git commit -m "$(cat <<'EOF'
feat(web): add minimal homepage and align Node/pnpm versions

Render Bolão title with shadcn Button placeholder and pin
Node/pnpm versions to match the backend repo.
EOF
)"
```

---

### Task 5: Final acceptance verification

**Files:** none (verification only)

- [ ] **Step 1: Run full acceptance checklist**

Run:
```bash
pnpm install
pnpm build
ls out/index.html
pnpm dev
```

Manual check at `http://localhost:3000`:
- Page shows "Bolão" heading
- Page shows "Entrar" button styled with shadcn

- [ ] **Step 2: Verify repo structure matches spec**

Run:
```bash
test -d app && test -d components/ui && test -d lib && test -d types && test ! -d src && echo "Structure OK"
```
Expected: `Structure OK`

- [ ] **Step 3: Confirm acceptance criteria**

| Criterion | Command | Expected |
|-----------|---------|----------|
| `pnpm install` | `pnpm install` | No errors |
| `pnpm build` | `pnpm build` | Generates `out/` without errors |
| shadcn component on homepage | manual / grep | `Button` renders |
| `pnpm dev` | `pnpm dev` | Server starts, homepage loads |
