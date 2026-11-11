# Componentes — Currency Exchange App

> Mapa de todos os componentes do projeto: o que cada um faz, onde mora, quais `props`
> recebe, quais estados controla e com quem se relaciona.
>
> **Regra de ouro do projeto:** componentes recebem **dados por `props`** e levantam
> eventos por `props` (*lifting state up*). Nenhum componente lê o estado de outro
> diretamente e não existe contexto global.

---

## 1. Visão geral em árvore

```
<App>                                  src/App.jsx
│  Estado compartilhado: from, to, amount, periodId
│
├── <header>                           cabeçalho da aplicação (inline em App)
│
├── <Converter>                        src/components/Converter.jsx
│   ├── <CurrencySelect>               src/components/CurrencySelect.jsx   (origem)
│   ├── <CurrencySelect>               src/components/CurrencySelect.jsx   (destino)
│   ├── <StatusMessage>                src/components/StatusMessage.jsx
│   └── (resultado com aria-live="polite")
│
└── <section id="historico">
    ├── <PeriodSelector>               src/components/PeriodSelector.jsx
    ├── <RateChart>                    src/components/RateChart.jsx
    │   └── <StatusMessage>            (carregando / erro / vazio)
    └── <HistoryTable>                 src/components/HistoryTable.jsx
        ├── <StatusMessage>            (carregando / erro / vazio)
        └── (filtros + tabela + exportação CSV)
```

## 2. Tabela de componentes

| Componente | Responsabilidade | Arquivo JSX | Arquivo CSS Module | Principais `props` | Estados internos | Relação com outros componentes |
| --- | --- | --- | --- | --- | --- | --- |
| **App** | Dono do estado compartilhado (`from`, `to`, `amount`, `periodId`). Monta o layout: cabeçalho, conversor e seção de histórico. Chama os hooks e distribui o resultado. | `src/App.jsx` | `src/App.module.css` | — | `useState`: `from`, `to`, `amount`, `periodId` | Renderiza `Converter`, `PeriodSelector`, `RateChart` e `HistoryTable`. Usa `useCurrencies`, `useLatestRate` e `useHistory`. |
| **Converter** | Campo de valor, os dois seletores de moeda, botão "Inverter", resultado convertido, taxa e data da cotação. Valida o valor em tempo real. | `src/components/Converter.jsx` | `src/components/Converter.module.css` | `from`, `to`, `amount`, `currencies`, `rate`, `rateDate`, `loading`, `error`, `onFromChange`, `onToChange`, `onAmountChange`, `onSwap`, `onRetry` | nenhum (totalmente controlado pelo `App`) | Usa `CurrencySelect` (2×) e `StatusMessage`. |
| **CurrencySelect** | `<select>` com `label` associado, listando todas as moedas no formato "USD — United States Dollar". | `src/components/CurrencySelect.jsx` | `src/components/CurrencySelect.module.css` | `id`, `label`, `value`, `options`, `onChange`, `disabled` | nenhum | Usado pelo `Converter`. |
| **PeriodSelector** | Botões dos 8 períodos (7 dias … 10 anos). Destaca o período ativo com `aria-pressed`. | `src/components/PeriodSelector.jsx` | `src/components/PeriodSelector.module.css` | `periods`, `activeId`, `onChange`, `disabled` | nenhum | Usado pelo `App`; a lista vem de `src/constants/periods.js`. |
| **RateChart** | Gráfico de linha (Recharts) com a evolução do par. Eixo X em DD/MM/AAAA, eixo Y em cotação, `Tooltip` e `ResponsiveContainer`. | `src/components/RateChart.jsx` | `src/components/RateChart.module.css` | `rows`, `from`, `to`, `loading`, `error`, `onRetry` | nenhum | Recebe as linhas de `useHistory` (via `App`). Usa `StatusMessage` para loading/erro/vazio. |
| **HistoryTable** | Tabela (Data, Origem, Destino, Cotação), 4 filtros, ordenação por Data e Cotação, contador de registros e exportação CSV. | `src/components/HistoryTable.jsx` | `src/components/HistoryTable.module.css` | `rows`, `from`, `to`, `loading`, `error`, `onRetry` | `useState`: `filters` (`startDate`, `endDate`, `minRate`, `maxRate`), `sortKey`, `sortDirection` | Recebe as linhas de `useHistory` (via `App`). Usa `utils/filters`, `utils/csv` e `StatusMessage`. |
| **StatusMessage** | Mensagem padronizada de estado: `loading` (spinner), `error` (com "Tentar novamente") ou `empty` (com ação opcional). | `src/components/StatusMessage.jsx` | `src/components/StatusMessage.module.css` | `type`, `message`, `onRetry`, `actionLabel`, `onAction` | nenhum | Usado por `Converter`, `RateChart` e `HistoryTable`. |

## 3. Hooks customizados (`src/hooks/`)

| Hook | Retorna | Observações |
| --- | --- | --- |
| `useCurrencies()` | `{ data, loading, error, reload }` | `data` é um objeto `{ USD: 'United States Dollar', ... }`. Carrega **uma única vez** (`useEffect` com `[]`). |
| `useLatestRate(from, to)` | `{ data: { rate, date }, loading, error, reload }` | Se `from === to`, devolve `rate: 1` **sem** chamar a API. |
| `useHistory(from, to, periodId)` | `{ rows, loading, error, reload }` | `rows` = `[{ date, base, quote, rate }]` em ordem cronológica crescente. Se `from === to`, devolve `[]` e a mensagem "Escolha moedas diferentes para ver o histórico." |

Todos os três:

- usam `useState` para `data`/`rows`, `loading` e `error`;
- usam `useEffect` com `AbortController` — a requisição é cancelada no *cleanup*;
- ignoram `AbortError` (requisição cancelada não é erro de verdade);
- expõem `reload()` para o botão "Tentar novamente".

## 4. Camadas de dados

```
src/services/frankfurter.js   -> fala com a API (fetch + async/await)
        ^
src/hooks/use*.js              -> gerencia loading/error/abort
        ^
src/components/*.jsx          -> só renderiza e avisa eventos
        ^
src/App.jsx                    -> guarda o estado compartilhado
```

## 5. Utilitários e constantes

| Arquivo | Exports | Usado por |
| --- | --- | --- |
| `src/constants/periods.js` | `PERIODS`, `DEFAULT_FROM`, `DEFAULT_TO`, `DEFAULT_PERIOD` | `App`, `PeriodSelector`, `useHistory` |
| `src/utils/dates.js` | `toISODate`, `getStartDate`, `formatDateBR` | `useHistory`, `RateChart`, `HistoryTable`, `utils/csv` |
| `src/utils/converter.js` | `parseAmount`, `validateAmount`, `convert`, `formatMoney` | `Converter`, `utils/filters` |
| `src/utils/filters.js` | `filterRows`, `sortRows`, `hasConflictingFilters` | `HistoryTable` |
| `src/utils/csv.js` | `rowsToCSV`, `buildFilename`, `downloadCSV` | `HistoryTable` |

## 6. Decisões de projeto (para o aluno explicar)

1. **Por que o `App` guarda `from`, `to`, `amount` e `periodId`?**
   Porque esses valores são usados por mais de um componente (o `Converter` usa `from`/`to`/`amount`;
   o `RateChart` e a `HistoryTable` usam `from`/`to`; o `PeriodSelector` usa `periodId`).
   O estado sobe para o componente mais alto e volta por `props` (*lifting state up*).
   Como o `Converter` precisa avisar quando o usuário troca a moeda, ele **não** guarda
   `from`/`to` — ele apenas chama `onFromChange`/`onToChange` e o `App` decide.

2. **Por que os filtros e a ordenação ficam dentro da `HistoryTable`?**
   Porque só a tabela usa esses valores. Guardá-los no `App` poluiria o estado global
   sem necessidade. O `HistoryTable` calcula as linhas visíveis e as entrega ao CSV.

3. **Por que a taxa é calculada pela aplicação?**
   A API devolve a **taxa** (1 USD = X BRL). Converter é `valor × taxa`. Usar o
   parâmetro `amount` da API esconderia a matemática e impediria inverter o par.

4. **Por que `formatDateBR` não usa `new Date(iso)`?**
   `new Date('2024-01-02')` é interpretado como UTC à meia-noite; em fusos negativos
   (como o do Brasil, UTC−3) isso vira **01/01/2024**. Como as datas da API já são
   strings `AAAA-MM-DD`, basta recortar a string — sempre correto e sem dependência de fuso.
