# betting-pool-app

Frontend do bolão — Next.js (App Router), TypeScript, Tailwind CSS e shadcn/ui.

## Pré-requisitos

- Node `>=26.4.0` (ver `.nvmrc`)
- pnpm `11.9.0`

## Setup

```bash
pnpm install
pnpm exec lefthook install
pnpm exec playwright install chromium
```

O `lefthook install` configura os git hooks localmente (pre-commit: lint + format; commit-msg: commitlint). É necessário **uma vez por clone** — não roda automaticamente no `pnpm install`.

Required once per clone — downloads Chromium binaries for E2E tests.

## Scripts

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
pnpm typecheck    # TypeScript (tsc --noEmit)
```

## CI

O workflow `Verify` (`.github/workflows/ci.yml`) roda automaticamente em push e PR para `development` e `main`. Steps: format → lint → typecheck → test → E2E (inclui build estático via Playwright).

## Commits

Mensagens seguem [Conventional Commits](https://www.conventionalcommits.org/) com escopo em minúsculas, ex.: `feat(web): add login page`.
