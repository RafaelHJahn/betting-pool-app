# BOL-106: Vitest + Testing Library (config base)

**Issue:** [BOL-106](https://rafaelhjahn.youtrack.cloud/issue/BOL-106)  
**Épico:** [BOL-10](https://rafaelhjahn.youtrack.cloud/issue/BOL-10) — Frontend (betting-pool-app)  
**Depende de:** [BOL-104](https://rafaelhjahn.youtrack.cloud/issue/BOL-104) — Bootstrap Next.js  
**Data:** 2026-07-28

## Objetivo

Configurar Vitest e Testing Library para testes unitários e de componente no `betting-pool-app`, com um smoke test que valida a stack completa (jsdom + React + jest-dom matchers).

## Decisões de design

| Decisão            | Escolha                                                       |
| ------------------ | ------------------------------------------------------------- |
| Runner             | Vitest (latest)                                               |
| Ambiente           | `jsdom`                                                       |
| JSX nos testes     | `@vitejs/plugin-react`                                        |
| Globals            | `globals: true` (como backend)                                |
| Path alias `@/*`   | `resolve.tsconfigPaths: true`                                 |
| Local dos testes   | Colocalizado: `**/*.{test,spec}.{ts,tsx}`                     |
| Setup jest-dom     | `test/setup.ts` via `setupFiles`                              |
| ESLint             | `@vitest/eslint-plugin` + `vitest/valid-title` (como backend) |
| lefthook           | Sem mudança — testes só via `pnpm test` / CI (BOL-108)        |
| Coverage/threshold | Fora do escopo                                                |

## Stack de ferramentas

| Pacote                    | Versão                         |
| ------------------------- | ------------------------------ |
| vitest                    | latest                         |
| @vitejs/plugin-react      | latest                         |
| jsdom                     | latest                         |
| @testing-library/react    | latest                         |
| @testing-library/jest-dom | latest                         |
| @testing-library/dom      | latest (peer dep do RTL)       |
| @vitest/eslint-plugin     | latest (compatível com Vitest) |

## Arquivos

| Arquivo                         | Ação      | Responsabilidade                               |
| ------------------------------- | --------- | ---------------------------------------------- |
| `vitest.config.ts`              | Criar     | Config Vitest (jsdom, paths, setup, includes)  |
| `test/setup.ts`                 | Criar     | Registrar matchers `@testing-library/jest-dom` |
| `components/ui/button.test.tsx` | Criar     | Smoke test — render do `Button`                |
| `vitest-env.d.ts`               | Criar     | Referência de tipos `vitest/globals`           |
| `eslint.config.js`              | Modificar | Bloco Vitest para `**/*.{test,spec}.{ts,tsx}`  |
| `package.json`                  | Modificar | Scripts `test` + devDependencies               |
| `README.md`                     | Modificar | Documentar `pnpm test`                         |

## `vitest.config.ts`

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

## `test/setup.ts`

```ts
import "@testing-library/jest-dom/vitest";
```

Único arquivo em `test/` — bootstrap de matchers. Testes de produção ficam colocalizados ao código que testam.

## `vitest-env.d.ts`

```ts
/// <reference types="vitest/globals" />
```

Arquivo de tipos dedicado — evita sobrescrever o array `types` do `tsconfig.json` (que quebraria os tipos automáticos do Next/React).

## ESLint — bloco Vitest

Novo bloco após o bloco de config files existente:

```js
import vitest from "@vitest/eslint-plugin";

// ...

{
  files: ["**/*.{test,spec}.{ts,tsx}"],
  extends: [vitest.configs.recommended],
  settings: {
    vitest: { typecheck: true },
  },
  rules: {
    "vitest/valid-title": ["error", { mustMatch: { it: ["^should .+"] } }],
  },
}
```

- `vitest.config.ts` permanece no bloco 4 existente (`*.config.{ts}`)
- Arquivos `*.test.tsx` colocalizados em `components/` já entram no glob ESLint do lefthook pre-commit

## Smoke test — `components/ui/button.test.tsx`

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

Valida: Vitest + jsdom + plugin React + RTL + jest-dom matchers (`toBeInTheDocument`).

## Scripts (`package.json`)

```json
{
  "test": "vitest run",
  "test:watch": "vitest"
}
```

`test:watch` é conveniência local; critério de aceite é apenas `pnpm test`.

## Fora do escopo

- Coverage e thresholds (backend tem; frontend adiciona quando fizer sentido)
- lefthook rodando testes no pre-commit
- Playwright / E2E (BOL-107)
- CI no GitHub Actions (BOL-108)
- Testes de páginas Next.js (`app/`) — smoke foca em componente

## Critérios de aceite

1. `pnpm test` roda e passa com o smoke test do `Button`
2. `pnpm lint` passa (incluindo arquivos de teste e `vitest.config.ts`)
3. `pnpm build` continua passando (sem regressão)

## Verificação

```bash
pnpm install
pnpm test
pnpm lint
pnpm build
```

## Fluxo de implementação

1. Instalar devDependencies
2. Criar `vitest.config.ts`, `test/setup.ts` e `vitest-env.d.ts`
3. Adicionar bloco ESLint Vitest em `eslint.config.js`
4. Criar `components/ui/button.test.tsx`
5. Adicionar scripts em `package.json`
6. Atualizar `README.md`
7. Validar `pnpm test`, `pnpm lint`, `pnpm build`
