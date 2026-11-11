# Uso de IA no desenvolvimento

Este projeto foi **gerado com apoio de uma ferramenta de IA**, como parte de um
exercício de desenvolvimento front-end. Este documento registra, de forma
honesta e útil para o estudo, **o que a IA escreveu** e **o que continua sendo
responsabilidade de quem está aprendendo**.

---

## 1. Ferramenta utilizada

| Item | Detalhe |
| ---- | ------- |
| Ferramenta | Assistente de IA de código (agente de terminal, modelo MiniMax M3.1 Flash) |
| Ambiente | OpenCode, executando comandos no terminal (npm, git, node) |
| Data | 10/11/2026 |
| Interação | O humano fez o pedido (escopo, stack, regras de negócio, formato da entrega) e revisou/validou o resultado |

> Nenhuma informação inventada foi aceita sem verificação: **todas as respostas
> da API citadas nos documentos foram executadas de verdade** e o resultado real
> está em [`API_TESTS.md`](API_TESTS.md).

---

## 2. O que a IA gerou

| Área | Arquivos | Observações |
| ---- | -------- | ----------- |
| Estrutura do projeto | `package.json`, `vite.config.js`, `index.html`, `.gitignore` | Gerados pelo `npm create vite` e ajustados pela IA (React 18, script `test`, `lang="pt-BR"`) |
| Constantes | `src/constants/periods.js` | 8 períodos, moeda padrão e período padrão |
| Utilitários puros | `src/utils/dates.js`, `converter.js`, `filters.js`, `csv.js` | Toda a lógica de negócio fica aqui, para ser testável |
| Testes unitários | `src/utils/*.test.js` | 50 casos cobrindo as bordas (vazio, negativo, vírgula, lista vazia, mutação do array) |
| Camada de serviço | `src/services/frankfurter.js` | `fetch` + `async/await`, `AbortSignal`, erros em português |
| Hooks customizados | `src/hooks/useCurrencies.js`, `useLatestRate.js`, `useHistory.js` | `useState` + `useEffect` + `AbortController` |
| Componentes | `src/components/*.jsx` + `*.module.css` | 6 componentes, cada um com seu CSS Module |
| Estilos globais | `src/index.css` | Variáveis de cor, espaçamento, tipografia e raio |
| Documentação | `docs/*.md`, `README.md` | Requisitos, componentes, testes e decisões técnicas |
| Coleção Postman | `postman/currency-exchange.postman_collection.json` | 9 requisições com testes embutidos |
| Verificação da API | `scripts/verificar-colecao.mjs` | Percorre a coleção e confere status e asserções |

---

## 3. O que a IA **não** fez (e o aluno precisa fazer)

Estes pontos exigem julgamento humano e **precisam ser revisados** antes de
considerar o trabalho pronto:

### 3.1 Você precisa explicar o código

Este é o objetivo do exercício. A IA escreveu o código; **você** precisa
entender e ser capaz de explicar:

- [ ] Por que a conversão é `valor × taxa` e por que o parâmetro `amount` da API não é usado.
- [ ] O que é *lifting state up* e por que `from`, `to`, `amount` e `periodId` ficam no `App`.
- [ ] Para que serve o `AbortController` no *cleanup* do `useEffect` e qual problema (race condition) ele evita.
- [ ] Por que `formatDateBR` não usa `new Date(iso)`.
- [ ] Como os quatro filtros da tabela se combinam (lógica AND).
- [ ] Por que `sortRows` cria uma cópia do array antes de ordenar.
- [ ] Como o CSV é gerado, por que usa BOM e como o nome do arquivo é montado.

### 3.2 Decisões de produto que a IA tomou por conta própria

A IA escolheu some coisas que são **sua decisão**, não do enunciado:

| Decisão | Onde | O que você precisa avaliar |
| ------- | ---- | -------------------------- |
| Paleta (navy + teal) | `src/index.css` | É a paleta que você quer? Bate com o Figma? |
| Formato da data no CSV (`AAAA-MM-DD`) | `src/utils/csv.js` | O Excel brasileiro abre melhor em `DD/MM/AAAA`? Vale trocar? |
| `Intl` com `minimumFractionDigits: 2` na moeda | `src/utils/converter.js` | Moedas como JPY não usam 2 casas decimais. Precisa de ajuste? |
| Limite de linhas na tabela | `src/components/HistoryTable.jsx` | **Não implementado.** Com o período de 10 anos são ~2.500 linhas e a tabela renderiza todas. Você pode querer paginação ou "mostrar mais". |
| Filtros **fora** do gráfico | `HistoryTable.jsx` | Talvez o usuário queira que o gráfico também respeite os filtros? |
| `React.lazy` no gráfico | `src/App.jsx` | Entendeu por que o Recharts foi separado em outro arquivo? |
| Uso da API **v1** (depreciada, mas funcional) | `src/services/frankfurter.js` | A documentação atual recomenda a v2. A migração está documentada em `API_TESTS.md` — vale fazer? |

### 3.3 Pontos que exigem teste em ambiente real

- [ ] Testar em **Safari** e no **Firefox** (o projeto foi validado no Chromium).
- [ ] Testar com o navegador em **português do Brasil**: o `<input type="date">`
      mostra o formato de data conforme o idioma do navegador — o *value* interno
      continua sendo `AAAA-MM-DD`, mas a exibição muda.
- [ ] Testar a aplicação com a internet **desligada** (o estado de erro existe,
      mas vale conferir a mensagem na sua máquina).
- [ ] Verificar o download do CSV abrindo no Excel e no Google Sheets.

### 3.4 Coisas que **não** foram feitas de propósito

| Não foi feito | Por quê |
| ------------- | ------- |
| Testes de interface automatizados (Playwright/Cypress) | O enunciado pede `node --test`; a suíte atual cobre a lógica, e a interface foi validada manualmente |
| Paginação ou *scroll infinito* na tabela | Não estava no escopo — é uma boa evolução para você implementar |
| Tema escuro | Fora do escopo declarado |
| Cache das cotações no `localStorage` | Não estava no escopo — evita chamar a API de novo a cada troca de par |
| Figma | Não existe protótipo para este projeto; `FIGMA.md` é um esqueleto para você preencher |

---

## 4. Decisões técnicas que a IA tomou (e que valem um estudo)

| Decisão | Onde | Por quê |
| ------- | ---- | ------- |
| Funções puras em `src/utils/` | `src/utils/*` | Permitem testar a lógica sem React, sem DOM e sem internet |
| `AbortController` no *cleanup* | `src/hooks/*` | Cancela requisições antigas e evita *race condition* |
| Par igual resolvido **sem** chamar a API | `useLatestRate`, `useHistory` | A API devolve 422 nesse caso; a taxa é 1 por definição |
| Estado derivado **durante a renderização** em vez de dentro do `useEffect` | `useLatestRate`, `useHistory` | Evita renderizações em cascata (o lint `react(set-state-in-effect)` apontava isso) |
| Filtros e ordenação **dentro** da `HistoryTable` | `src/components/HistoryTable.jsx` | Só a tabela usa esses valores; poluir o estado do `App` não faria sentido |
| `useMemo` para filtrar/ordenar | `src/components/HistoryTable.jsx` | Evita refiltrar a tabela a cada renderização |
| CSV gerado à mão, sem biblioteca | `src/utils/csv.js` | O objetivo é você entender a lógica de escape, BOM e download |
| Formatação de data só com string | `src/utils/dates.js` | Evita o bug clássico de fuso horário com `new Date('AAAA-MM-DD')` |

---

## 5. Registro do aluno

> Preencha esta seção **depois** de estudar o código.

### 5.1 O que eu entendi

*(Escreva aqui, com as suas palavras, o que cada parte do projeto faz. Não copie
o código: explique.)*

- **Conversão:**
- **`useEffect` + `AbortController`:**
- **Lifting state up:**
- **Filtros e ordenação:**
- **Geração do CSV:**

### 5.2 O que eu alterei

*(Liste os arquivos que você mudou e por quê.)*

| Arquivo | O que mudou | Por quê |
| ------- | ----------- | ------- |
| | | |

### 5.3 Bugs que eu encontrei e corrigi

*(Anote os problemas que você encontrou ao rodar e estudar o projeto.)*

| Sintoma | Causa | Correção |
| ------- | ----- | -------- |
| | | |

### 5.4 Dúvidas que ficaram

*(Escreva aqui as dúvidas para tirar com o professor ou com a turma.)*

-
