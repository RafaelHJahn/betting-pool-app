# BOL-105: ESLint + Prettier + lefthook + commitlint

**Issue:** [BOL-105](https://rafaelhjahn.youtrack.cloud/issue/BOL-105)  
**Épico:** [BOL-10](https://rafaelhjahn.youtrack.cloud/issue/BOL-10) — Frontend (betting-pool-app)  
**Depende de:** [BOL-104](https://rafaelhjahn.youtrack.cloud/issue/BOL-104) — Bootstrap Next.js  
**Data:** 2026-07-27

## Objetivo

Configurar lint, formatação e hooks de commit no `betting-pool-app`, alinhados ao padrão do repo `betting-pool` (backend).

## Decisões de design

| Decisão           | Escolha                                                           |
| ----------------- | ----------------------------------------------------------------- |
| Abordagem ESLint  | `eslint-config-next/core-web-vitals` + blocos híbridos            |
| Type-check ESLint | Só em `lib/**` e `types/**` (`recommendedTypeChecked`)            |
| Import sort       | `eslint-plugin-simple-import-sort` com grupos adaptados para `@/` |
| Prettier          | `.prettierrc.json` idêntico ao backend (`printWidth: 100`)        |
| Git hooks         | lefthook — instalação **manual** (`pnpm exec lefthook install`)   |
| Commits           | commitlint conventional + `scope-case: lower-case`                |
| `prepare` script  | Não — evita falha em `pnpm install --prod`                        |

## Stack de ferramentas

| Ferramenta                       | Versão (alinhada ao backend quando possível) |
| -------------------------------- | -------------------------------------------- |
| ESLint                           | ^9 (já instalado)                            |
| eslint-config-next               | 16.2.12 (já instalado)                       |
| @eslint/js                       | ^10.0.1                                      |
| typescript-eslint                | ^8.62.1                                      |
| eslint-config-prettier           | ^10.1.8                                      |
| eslint-plugin-simple-import-sort | ^13.0.0                                      |
| prettier                         | ^3.9.4                                       |
| lefthook                         | ^2.1.9                                       |
| @commitlint/cli                  | ^21.2.0                                      |
| @commitlint/config-conventional  | ^21.2.0                                      |

## Arquivos

| Arquivo                | Ação      | Responsabilidade                                         |
| ---------------------- | --------- | -------------------------------------------------------- |
| `eslint.config.js`     | Criar     | Flat config híbrido (Next + type-checked + config files) |
| `.prettierrc.json`     | Criar     | Formatação (`printWidth: 100`)                           |
| `.prettierignore`      | Criar     | Ignorar lockfile, workspace e artefatos de build         |
| `lefthook.yml`         | Criar     | pre-commit (eslint + prettier) e commit-msg (commitlint) |
| `commitlint.config.js` | Criar     | Conventional commits com scope lowercase                 |
| `package.json`         | Modificar | Scripts e devDependencies                                |
| `pnpm-workspace.yaml`  | Modificar | `allowBuilds: lefthook: true`                            |

## ESLint — estrutura do flat config

### Bloco 1 — Ignores globais

```js
ignores: [".next/**", "out/**", "node_modules/**", "coverage/**"];
```

### Bloco 2 — Next.js (app + components)

- **Arquivos:** `app/**/*.{ts,tsx}`, `components/**/*.{ts,tsx}`
- **Extends:** `eslint-config-next/core-web-vitals`, `eslint-config-prettier`
- **Plugins:** `simple-import-sort`
- **Sem** `projectService` (lint rápido em componentes React)

### Bloco 3 — Type-checked (lib + types)

- **Arquivos:** `lib/**/*.ts`, `types/**/*.ts`
- **Extends:** `@eslint/js` recommended, `typescript-eslint` `recommendedTypeChecked`, `eslint-config-prettier`
- **Language options:** `parserOptions.projectService: true`
- **Plugins:** `simple-import-sort`

### Bloco 4 — Config files

- **Arquivos:** `*.config.{js,ts,mjs}`, `next.config.ts`
- **Extends:** `@eslint/js` recommended, `typescript-eslint` recommended (sem type-check)
- **Plugins:** `simple-import-sort`

### Grupos `simple-import-sort`

```js
const importSortGroups = [
  ["^\\u0000"],
  ["^node:"],
  ["^react", "^next"],
  ["^@?\\w"],
  ["^@/"],
  ["^\\."],
];
```

Regras `simple-import-sort/imports` e `simple-import-sort/exports` como `error` em todos os blocos com código fonte.

## Prettier

**`.prettierrc.json`:**

```json
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "printWidth": 100
}
```

**`.prettierignore`:**

```
pnpm-lock.yaml
pnpm-workspace.yaml
.next/
out/
```

## lefthook

**`lefthook.yml`:**

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

**Setup (manual, uma vez por clone):**

```bash
pnpm exec lefthook install
```

**`pnpm-workspace.yaml`** — adicionar:

```yaml
allowBuilds:
  lefthook: true
```

(mantendo entradas existentes: `sharp`, `unrs-resolver`)

## commitlint

**`commitlint.config.js`:**

```js
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-case": [2, "always", "lower-case"],
  },
};
```

Escopo esperado nos commits do frontend: `web` (ex.: `feat(web): ...`).

## Scripts (`package.json`)

```json
{
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --check .",
  "format:fix": "prettier --write ."
}
```

## Fora do escopo

- CI no GitHub Actions (BOL-108)
- Regras ESLint para testes Vitest (BOL-106)
- `prepare` script automático para lefthook
- Prettier plugin Tailwind

## Critérios de aceite

1. `pnpm lint` roda sem erros no projeto inicial
2. `pnpm format` passa no estado atual do código
3. Commit com mensagem fora do padrão é rejeitado pelo hook `commit-msg`
4. `pnpm build` continua passando (sem regressão do BOL-104)

## Verificação

```bash
pnpm install
pnpm lint
pnpm format
pnpm build

# Setup hooks (manual):
pnpm exec lefthook install

# Deve falhar:
git commit --allow-empty -m "bad message"

# Deve passar:
git commit --allow-empty -m "chore(web): setup lint and format tooling"
```

## Fluxo de implementação

1. Instalar devDependencies
2. Criar `eslint.config.js` com os 4 blocos
3. Criar `.prettierrc.json` e `.prettierignore`
4. Criar `lefthook.yml` e `commitlint.config.js`
5. Atualizar `package.json` (scripts) e `pnpm-workspace.yaml` (`allowBuilds`)
6. Rodar `pnpm format:fix` se necessário para alinhar código existente
7. Validar `pnpm lint`, `pnpm format`, `pnpm build`
8. Instalar hooks (`pnpm exec lefthook install`) e testar commit-msg
