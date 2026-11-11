# Testes por função

> Casos testados por função do projeto, com **entrada**, **saída esperada** e
> **resultado obtido**.
>
> - **Suíte automatizada:** `npm test` (runner nativo do Node, `node --test`).
> - **Última execução:** 10/11/2026 — **50 testes, 50 passaram, 0 falharam**.
> - **Complemento manual:** a interface foi verificada no navegador (Chromium) com
>   a API real; os resultados estão na seção 6.
>
> Os arquivos de teste ficam **ao lado** das funções que testam:
> `src/utils/converter.test.js`, `src/utils/dates.test.js`,
> `src/utils/filters.test.js` e `src/utils/csv.test.js`.

---

## 1. `parseAmount(str)` — `src/utils/converter.js`

Converte o texto digitado em número. Devolve `null` quando não dá para interpretar.

| # | Entrada | Saída esperada | Resultado |
| - | ------- | -------------- | --------- |
| 1.1 | `'1.234,56'` | `1234.56` | ✅ passou |
| 1.2 | `'1.234.567,89'` | `1234567.89` | ✅ passou |
| 1.3 | `'1234,56'` | `1234.56` | ✅ passou |
| 1.4 | `'0,5'` | `0.5` | ✅ passou |
| 1.5 | `'1234.56'` | `1234.56` | ✅ passou |
| 1.6 | `'5'` | `5` | ✅ passou |
| 1.7 | `'5.4321'` | `5.4321` | ✅ passou |
| 1.8 | `'1.234'` | `1234` (ponto de milhar pt-BR) | ✅ passou |
| 1.9 | `'12.345'` | `12345` | ✅ passou |
| 1.10 | `'1,234'` | `1.234` (vírgula é decimal no pt-BR) | ✅ passou |
| 1.11 | `'1,234,567'` | `1234567` (vírgula repetida = milhar) | ✅ passou |
| 1.12 | `'12.345.678'` | `12345678` | ✅ passou |
| 1.13 | `'-10'` | `-10` (a validação é quem rejeita) | ✅ passou |
| 1.14 | `'-1.234,56'` | `-1234.56` | ✅ passou |
| 1.15 | `''` | `null` | ✅ passou |
| 1.16 | `'   '` (só espaços) | `null` | ✅ passou |
| 1.17 | `'abc'` | `null` | ✅ passou |
| 1.18 | `'R$'` | `null` | ✅ passou |
| 1.19 | `null` / `undefined` / `{}` | `null` | ✅ passou |
| 1.20 | `NaN` | `null` | ✅ passou |

> **Armadilha encontrada durante o desenvolvimento:** a primeira versão removia
> qualquer caractere que não fosse dígito. Com isso, `'12abc'` virava `12` e
> passava como valor válido. A correção foi **validar** o formato
> (`/^[+-]?[\d.,]+$/`) em vez de "limpar" o texto.

## 2. `validateAmount(str)` — `src/utils/converter.js`

Devolve `''` quando o valor é válido, ou a mensagem de erro.

| # | Entrada | Saída esperada | Resultado |
| - | ------- | -------------- | --------- |
| 2.1 | `''` | `'Informe um valor para converter.'` | ✅ passou |
| 2.2 | `'   '` | `'Informe um valor para converter.'` | ✅ passou |
| 2.3 | `'abc'` | `'Digite um valor numérico válido.'` | ✅ passou |
| 2.4 | `'12abc'` | `'Digite um valor numérico válido.'` | ✅ passou |
| 2.5 | `'-1'` | `'O valor não pode ser negativo.'` | ✅ passou |
| 2.6 | `'-1.234,56'` | `'O valor não pode ser negativo.'` | ✅ passou |
| 2.7 | `'0'` | `'O valor deve ser maior que zero.'` | ✅ passou |
| 2.8 | `'0,00'` | `'O valor deve ser maior que zero.'` | ✅ passou |
| 2.9 | `'1'` | `''` | ✅ passou |
| 2.10 | `'1.234,56'` | `''` | ✅ passou |
| 2.11 | `'0.01'` | `''` | ✅ passou |

## 3. `convert(amount, rate)` — `src/utils/converter.js`

| # | Entrada | Saída esperada | Resultado |
| - | ------- | -------------- | --------- |
| 3.1 | `convert(100, 5.4321)` | `543.21` | ✅ passou |
| 3.2 | `convert(1, 1)` | `1` | ✅ passou |
| 3.3 | `convert(null, 5)` | `null` | ✅ passou |
| 3.4 | `convert(100, null)` | `null` | ✅ passou |
| 3.5 | `convert(NaN, 5)` | `null` | ✅ passou |
| 3.6 | `convert(100, NaN)` | `null` | ✅ passou |

## 4. `formatMoney(value, currency)` e `formatRate(rate)` — `src/utils/converter.js`

| # | Entrada | Saída esperada | Resultado |
| - | ------- | -------------- | --------- |
| 4.1 | `formatMoney(543.21, 'BRL')` | `'R$ 543,21'` | ✅ passou |
| 4.2 | `formatMoney(1234.5, 'BRL')` | `'R$ 1.234,50'` | ✅ passou |
| 4.3 | `formatMoney(null, 'BRL')` | `''` | ✅ passou |
| 4.4 | `formatMoney(NaN, 'BRL')` | `''` | ✅ passou |

> **Detalhe:** o `Intl` usa **espaço não separável (U+00A0)** entre o símbolo e o
> número. O teste normaliza os espaços (`replace(/\s/g, ' ')`) antes de comparar —
> sem isso o teste falharia mesmo com o código correto.

## 5. `toISODate(date)`, `getStartDate(period, today)` e `formatDateBR(iso)` — `src/utils/dates.js`

| # | Entrada | Saída esperada | Resultado |
| - | ------- | -------------- | --------- |
| 5.1 | `toISODate(new Date(2024, 0, 2))` | `'2024-01-02'` | ✅ passou |
| 5.2 | `toISODate(new Date(2024, 11, 31))` | `'2024-12-31'` | ✅ passou |
| 5.3 | `toISODate(new Date(2024, 8, 9))` | `'2024-09-09'` | ✅ passou |
| 5.4 | `getStartDate({unit:'day',amount:7}, 15/03/2024)` | `'2024-03-08'` | ✅ passou |
| 5.5 | `getStartDate({unit:'day',amount:15}, 15/03/2024)` | `'2024-02-29'` | ✅ passou |
| 5.6 | `getStartDate({unit:'day',amount:30}, 15/03/2024)` | `'2024-02-14'` | ✅ passou |
| 5.7 | `getStartDate({unit:'month',amount:3}, 15/03/2024)` | `'2023-12-15'` | ✅ passou |
| 5.8 | `getStartDate({unit:'month',amount:6}, 15/03/2024)` | `'2023-09-15'` | ✅ passou |
| 5.9 | `getStartDate({unit:'year',amount:1}, 15/03/2024)` | `'2023-03-15'` | ✅ passou |
| 5.10 | `getStartDate({unit:'year',amount:5}, 15/03/2024)` | `'2019-03-15'` | ✅ passou |
| 5.11 | `getStartDate({unit:'year',amount:10}, 15/03/2024)` | `'2014-03-15'` | ✅ passou |
| 5.12 | `getStartDate({unit:'month',amount:1}, 31/03/2024)` | `'2024-02-29'` (não "rola" para 2 de março) | ✅ passou |
| 5.13 | `getStartDate({unit:'year',amount:1}, 29/02/2024)` | `'2023-02-28'` | ✅ passou |
| 5.14 | `getStartDate({unit:'hour',amount:5}, 15/03/2024)` | `'2024-03-15'` (período desconhecido) | ✅ passou |
| 5.15 | `getStartDate({}, 15/03/2024)` | `'2024-03-15'` | ✅ passou |
| 5.16 | `formatDateBR('2024-01-02')` | `'02/01/2024'` | ✅ passou |
| 5.17 | `formatDateBR('2024-12-31')` | `'31/12/2024'` | ✅ passou |
| 5.18 | `formatDateBR('')` | `''` | ✅ passou |
| 5.19 | `formatDateBR(null)` / `undefined` | `''` | ✅ passou |
| 5.20 | `formatDateBR('02/01/2024')` (formato errado) | `''` | ✅ passou |

## 6. `filterRows(rows, filters)` — `src/utils/filters.js`

Linhas de exemplo: `4.9`, `5.1`, `5.0`, `5.4` (datas de 02/01 a 05/01/2024).

| # | Filtros | Saída esperada | Resultado |
| - | ------- | -------------- | --------- |
| 6.1 | `{}` (sem filtro) | 4 linhas | ✅ passou |
| 6.2 | `{ startDate: '2024-01-03' }` | 3 linhas, começando em 03/01 | ✅ passou |
| 6.3 | `{ endDate: '2024-01-03' }` | 2 linhas, terminando em 03/01 | ✅ passou |
| 6.4 | `{ minRate: '5.1' }` | 2 linhas (`5.1` e `5.4`) | ✅ passou |
| 6.5 | `{ maxRate: '5.0' }` | 2 linhas (`4.9` e `5.0`) | ✅ passou |
| 6.6 | datas + `minRate: '5'` + `maxRate: '5.1'` | 2 linhas (03/01 e 04/01) — **combinados com AND** | ✅ passou |
| 6.7 | os **quatro** filtros juntos | 1 linha (03/01/2024) | ✅ passou |
| 6.8 | `{ minRate: '10', maxRate: '1' }` (impossível) | lista vazia | ✅ passou |
| 6.9 | `{ startDate: '2024-01-05', endDate: '2024-01-02' }` | lista vazia | ✅ passou |
| 6.10 | qualquer filtro | o array original **não** é alterado | ✅ passou |
| 6.11 | `[]` (lista vazia) | `[]` | ✅ passou |
| 6.12 | `null` | `[]` | ✅ passou |

## 7. `sortRows(rows, key, direction)` — `src/utils/filters.js`

| # | Entrada | Saída esperada | Resultado |
| - | ------- | -------------- | --------- |
| 7.1 | `sortRows(embaralhado, 'date', 'asc')` | 02/01 → 05/01 | ✅ passou |
| 7.2 | `sortRows(rows, 'date', 'desc')` | 05/01 → 02/01 | ✅ passou |
| 7.3 | `sortRows(rows, 'rate', 'asc')` | `4.9, 5.0, 5.1, 5.4` | ✅ passou |
| 7.4 | `sortRows(rows, 'rate', 'desc')` | `5.4, 5.1, 5.0, 4.9` | ✅ passou |
| 7.5 | `sortRows(rows, 'rate', 'desc')` | o array original **não** é alterado e o retorno é um array **diferente** | ✅ passou |
| 7.6 | `sortRows([], ...)` / `sortRows(null, ...)` | `[]` | ✅ passou |

## 8. `hasConflictingFilters(filters)` e `parseRate(value)` — `src/utils/filters.js`

| # | Entrada | Saída esperada | Resultado |
| - | ------- | -------------- | --------- |
| 8.1 | `{ startDate: '2024-01-05', endDate: '2024-01-02' }` | `true` | ✅ passou |
| 8.2 | `{ startDate: '2024-01-02', endDate: '2024-01-05' }` | `false` | ✅ passou |
| 8.3 | `{ minRate: '10', maxRate: '1' }` | `true` | ✅ passou |
| 8.4 | `{ minRate: '1', maxRate: '10' }` | `false` | ✅ passou |
| 8.5 | `{ minRate: '10' }` / `{}` | `false` | ✅ passou |
| 8.6 | `parseRate('5.4321')` | `5.4321` | ✅ passou |
| 8.7 | `parseRate('5,4321')` | `5.4321` | ✅ passou |
| 8.8 | `parseRate('1.234')` | `1.234` (cotação **nunca** usa milhar) | ✅ passou |
| 8.9 | `parseRate('')` / `'abc'` / `'5abc'` / `null` / `NaN` | `null` | ✅ passou |

## 9. `rowsToCSV(rows)` e `buildFilename(rows)` — `src/utils/csv.js`

| # | Entrada | Saída esperada | Resultado |
| - | ------- | -------------- | --------- |
| 9.1 | `rowsToCSV(rows)` | primeira linha = `'data,moeda_origem,moeda_destino,cotacao'` | ✅ passou |
| 9.2 | `rowsToCSV(rows)` | 1 linha de dados por registro, na ordem recebida | ✅ passou |
| 9.3 | `rowsToCSV([])` | só o cabeçalho | ✅ passou |
| 9.4 | `rowsToCSV(null)` | só o cabeçalho | ✅ passou |
| 9.5 | campo com vírgula (`'US,D'`) | campo envolvido em aspas: `"US,D"` | ✅ passou |
| 9.6 | `buildFilename(rows)` | `'cotacoes_USD-BRL_2024-01-02_2024-03-01.csv'` | ✅ passou |
| 9.7 | `buildFilename(rows fora de ordem)` | a data inicial é a **menor** e a final é a **maior** | ✅ passou |
| 9.8 | `buildFilename([])` / `null` | `'cotacoes.csv'` | ✅ passou |

> `downloadCSV(rows)` depende do DOM, então **não** é testada com `node --test`.
> Ela foi verificada manualmente no navegador (seção 10).

---

## 10. Testes manuais da interface (navegador + API real)

Realizados em 10/11/2026 no Chromium, contra a API real.

| # | Cenário | Resultado esperado | Resultado |
| - | ------- | ------------------ | --------- |
| 10.1 | Abrir a aplicação | Par USD → BRL, 100 USD = R$ 555,17, taxa 5,5517, data 10/11/2026 | ✅ |
| 10.2 | Valor vazio | Erro "Informe um valor para converter." e resultado "—" | ✅ |
| 10.3 | Valor `abc` | Erro "Digite um valor numérico válido." | ✅ |
| 10.4 | Valor `-5` | Erro "O valor não pode ser negativo." | ✅ |
| 10.5 | Valor `0` | Erro "O valor deve ser maior que zero." | ✅ |
| 10.6 | Valor `1.234,56` | R$ 6.853,91 (1234,56 × 5,5517) | ✅ |
| 10.7 | Clicar em "Inverter" | Vira BRL → USD, **valor continua 100**, taxa 1 BRL = 0,1801 USD | ✅ |
| 10.8 | Escolher a mesma moeda nos dois lados | Taxa 1,00 e **0 requisições** feitas à API | ✅ |
| 10.9 | Período "7 dias" | Eixo X de 03/11 a 10/11/2026 | ✅ |
| 10.10 | Período "1 ano" | Eixo X de 30/12/2025 a 10/11/2026 | ✅ |
| 10.11 | Período "10 anos" | Eixo X de 2018 a 10/11/2026 | ✅ |
| 10.12 | Tabela com 30 dias | 23 registros encontrados (dias úteis) | ✅ |
| 10.13 | Filtro só por data inicial `2026-11-02` | 7 registros | ✅ |
| 10.14 | Filtro data inicial + data final | 4 registros | ✅ |
| 10.15 | Filtro data inicial + final + cotação mínima | 4 registros (combinação) | ✅ |
| 10.16 | Data inicial **depois** da data final | 0 registros + aviso "A data inicial está depois da data final." + botão de exportar **desabilitado** | ✅ |
| 10.17 | Cotação mínima **acima** da máxima | 0 registros + aviso "A cotação mínima está acima da cotação máxima." | ✅ |
| 10.18 | Clicar em "Limpar filtros" | Volta aos 23 registros | ✅ |
| 10.19 | Ordenar por Cotação (1º clique) | 4,9923 → 5,5884, indicador ▲ | ✅ |
| 10.20 | Ordenar por Cotação (2º clique) | 5,5884 → 4,9923, indicador ▼ | ✅ |
| 10.21 | Ordenar por Data | 09/10 → 10/11, indicador ▲ | ✅ |
| 10.22 | Exportar CSV com filtro aplicado | Arquivo `cotacoes_USD-BRL_2026-11-02_2026-11-10.csv` com cabeçalho + **7 linhas** (só as filtradas), na ordem exibida | ✅ |
| 10.23 | Bytes do arquivo exportado | Começa com `EF BB BF` (**BOM UTF-8**), para o Excel abrir os acentos certo | ✅ |
| 10.24 | Largura de 360 px | Sem rolagem horizontal da página; a tabela rola dentro do contêiner (311 px de largura para 560 px de conteúdo) | ✅ |
| 10.25 | Lighthouse (acessibilidade) | Nota **1.0**; boas práticas **1.0** | ✅ |

---

## 11. Como rodar

```bash
npm test
```

Saída esperada (resumo):

```
# tests 50
# suites 0
# pass 50
# fail 0
# cancelled 0
# skipped 0
# todo 0
```
