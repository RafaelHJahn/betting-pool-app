# betting-pool-app

Frontend do bolão — Next.js (App Router), TypeScript, Tailwind CSS e shadcn/ui.

## Pré-requisitos

- Node `>=26.4.0` (ver `.nvmrc`)
- pnpm `11.9.0`

## Setup

```bash
pnpm install
pnpm exec lefthook install
```

O `lefthook install` configura os git hooks localmente (pre-commit: lint + format; commit-msg: commitlint). É necessário **uma vez por clone** — não roda automaticamente no `pnpm install`.

## Scripts

```bash
pnpm dev          # servidor de desenvolvimento
pnpm build        # build estático (gera out/)
pnpm start        # serve out/ localmente
pnpm lint         # ESLint
pnpm lint:fix     # ESLint com auto-fix
pnpm format       # Prettier (check)
pnpm format:fix   # Prettier (write)
```

## Commits

Mensagens seguem [Conventional Commits](https://www.conventionalcommits.org/) com escopo em minúsculas, ex.: `feat(web): add login page`.
