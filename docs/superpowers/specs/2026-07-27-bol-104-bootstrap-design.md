# BOL-104: Bootstrap Next.js + TypeScript + Tailwind + shadcn/ui

**Issue:** [BOL-104](https://rafaelhjahn.youtrack.cloud/issue/BOL-104)  
**Épico:** [BOL-10](https://rafaelhjahn.youtrack.cloud/issue/BOL-10) — Frontend (betting-pool-app)  
**Data:** 2026-07-27

## Objetivo

Criar o projeto Next.js (App Router) em TypeScript strict, com Tailwind CSS e shadcn/ui configurados, servindo de base para todo o frontend do bolão.

## Decisões de design

| Decisão | Escolha |
|---------|---------|
| Abordagem | `create-next-app` + `shadcn init` (CLIs oficiais) |
| Estilo shadcn | `new-york` |
| Cor base | `neutral` |
| Homepage | Mínima — título "Bolão" + `Button` shadcn |
| Package manager | `pnpm@11.9.0` |
| Node | `>=26.4.0` (`.nvmrc` com `26.4.0`) |
| Estrutura | Sem `src/` — pastas na raiz |

## Stack

| Item | Decisão |
|------|---------|
| Framework | Next.js (App Router), última versão estável |
| Linguagem | TypeScript strict, ESM (`"type": "module"`) |
| CSS | Tailwind CSS v4 (padrão do shadcn atual) |
| UI | shadcn/ui — `new-york` + `neutral` |
| Build | `output: "export"` + `images.unoptimized: true` |

## Fora do escopo

Estas issues tratam em sequência após o bootstrap:

- **BOL-105** — ESLint + Prettier + lefthook + commitlint
- **BOL-106** — Vitest + Testing Library
- **BOL-107** — Playwright (smoke test)
- **BOL-108** — CI no GitHub Actions
- **BOL-119** — Shell responsivo (header, navegação)
- **BOL-118** — AuthGate + sessão

## Estrutura de pastas

```
betting-pool-app/
├── app/
│   ├── globals.css          # tema shadcn (CSS variables)
│   ├── layout.tsx           # root layout (fonte, metadata)
│   └── page.tsx             # homepage mínima
├── components/
│   └── ui/
│       └── button.tsx       # primeiro componente shadcn
├── lib/
│   └── utils.ts             # cn() helper do shadcn
├── types/                   # vazio por enquanto (.gitkeep)
├── components.json          # config shadcn
├── next.config.ts
├── package.json
├── tsconfig.json
├── .nvmrc
└── pnpm-lock.yaml
```

## Configuração Next.js

`next.config.ts` deve incluir:

```ts
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
};
```

Export estático é requisito do épico (deploy S3 + CloudFront em BOL-132). `images.unoptimized: true` é necessário porque o Image Optimization API do Next.js não funciona com export estático.

## Configuração shadcn/ui

`components.json` deve refletir:

```json
{
  "style": "new-york",
  "tailwind": {
    "baseColor": "neutral",
    "cssVariables": true
  }
}
```

## Homepage

`app/page.tsx` renderiza:

- `<h1>Bolão</h1>`
- `<Button>Entrar</Button>` — componente shadcn, sem ação (placeholder)

Sem layout shell, navegação ou autenticação.

## Alinhamento com o backend

O repo `betting-pool` usa `pnpm@11.9.0`, Node `>=26.4.0` e Prettier com `printWidth: 100`. O frontend segue as mesmas versões de Node e pnpm. Prettier será configurado em BOL-105.

## Critérios de aceite

1. `pnpm install` — sem erros
2. `pnpm build` — gera `out/` com export estático, sem erros
3. Homepage usa ao menos um componente shadcn (`Button`)
4. `pnpm dev` sobe localmente (verificação manual)

## Verificação

```bash
pnpm install
pnpm build    # deve gerar out/ sem erros
pnpm dev      # verificação manual da homepage
```

## Fluxo de implementação

1. `create-next-app` no diretório atual com flags: App Router, TypeScript, Tailwind, sem `src/`
2. Ajustar `next.config.ts` para export estático
3. `shadcn init` com `new-york` + `neutral`
4. `shadcn add button`
5. Implementar homepage mínima
6. Criar `types/.gitkeep`
7. Adicionar `.nvmrc` e `engines` no `package.json`
8. Validar `pnpm build`
