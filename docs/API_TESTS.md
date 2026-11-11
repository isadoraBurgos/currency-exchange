# Testes da API — Frankfurter

> Resultado **real** da execução de cada endpoint da API Frankfurter.
>
> - **Data da execução:** 10/11/2026
> - **Base URL testada:** `https://api.frankfurter.dev/v1`
> - **Ferramenta:** `Invoke-WebRequest` (PowerShell) e `node` (fetch nativo)
> - **Ambiente:** com acesso à internet
>
> Os valores de cotação mudam todo dia (são republished pelos bancos centrais).
> O que está documentado aqui é o **comportamento** das respostas (status, formato,
> encaixe de datas), e não o preço de um dia específico.

---

## 1. Tabela de resultados

| # | Endpoint | Situação | Status | Resposta real (trecho) |
| - | -------- | -------- | ------ | ---------------------- |
| 1 | `GET /v1/currencies` | Moedas | **200** | `{"AUD":"Australian Dollar","BRL":"Brazilian Real", ... }` — 30 moedas |
| 2 | `GET /v1/latest?base=EUR&symbols=USD` | Última cotação | **200** | `{"amount":1.0,"base":"EUR","date":"2026-11-10","rates":{"USD":1.1214}}` |
| 3 | `GET /v1/latest?base=USD&symbols=BRL` | Última cotação | **200** | `{"amount":1.0,"base":"USD","date":"2026-11-10","rates":{"BRL":5.5517}}` |
| 4 | `GET /v1/2024-01-01..2024-03-01?base=USD&symbols=BRL` | Histórico | **200** | `{"amount":1.0,"base":"USD","start_date":"2023-12-29","end_date":"2024-03-01","rates":{"2023-12-29":{"BRL":4.8523}, ... }}` — 45 pontos |
| 5 | `GET /v1/latest?base=USD&symbols=USD` | Par igual (erro esperado) | **422** | `{"message":"bad currency pair"}` |
| 6 | `GET /v1/latest?base=XXX&symbols=BRL` | Moeda inválida (erro esperado) | **404** | `{"message":"not found"}` |
| 7 | `GET /v1/2024-01-06..2024-01-07?base=USD&symbols=BRL` | Data sem cotação (fim de semana) | **200** | `{"start_date":"2024-01-05","end_date":"2024-01-05","rates":{"2024-01-05":{"BRL":4.9193}}}` |
| 8 | `GET /v1/2024-01-01?base=USD&symbols=BRL` | Data sem cotação (feriado) | **200** | `{"date":"2023-12-29","rates":{"BRL":4.8523}}` |
| 9 | `GET /v1/2016-11-10..2026-11-10?base=USD&symbols=BRL` | Período de 10 anos | **200** | 2559 pontos diários, de `2016-11-10` a `2026-11-10` |
| 10 | `GET /v1/1999-01-04?base=USD&symbols=EUR` | Data antiga (par EUR) | **200** | `{"date":"1999-01-04","rates":{"EUR":0.84825}}` |
| 11 | `GET /v1/2000-01-01..2000-01-05?base=USD&symbols=BRL` | Par sem histórico | **404** | `{"message":"not found"}` |
| 12 | `GET /v1/2024-01-01..?base=USD&symbols=BRL` | Intervalo aberto | **200** | `{"date":"2023-12-29","rates":{"BRL":4.8523}}` |

**Legenda da situação:** "erro esperado" = o endpoint **deve** falhar; a aplicação
precisa tratar essa falha sem quebrar.

---

## 2. O que cada caso ensina

### 2.1 Moedas (`GET /currencies`)

A resposta é um **objeto simples**, não uma lista:

```json
{ "AUD": "Australian Dollar", "BRL": "Brazilian Real", ... }
```

Com **30 moedas** na data da execução (a v1 trabalha com um conjunto menor que a v2,
que tem 219). Não existem criptoativos (BTC) nem metais (XAU) na v1.

Na aplicação, `useCurrencies` guarda esse objeto e o `Converter` transforma em
lista com `Object.entries(...).map(...)` para poder renderizar as `<option>`.

### 2.2 Última cotação (`GET /latest`)

Sempre devolve `amount: 1.0` (a taxa é sempre "quanto da moeda destino por
**1** da moeda origem"), o `base`, a `date` efetiva e o mapa `rates`.

> A API **não tem** endpoint de conversão. O cálculo `valor × taxa` é feito na
> aplicação (regra de negócio RN02).

### 2.3 Histórico (`GET /início..fim`)

- O `rates` é um **objeto** com a data como chave: `{"2024-01-02": {"BRL": 4.8888}}`.
  Por isso o serviço converte para uma **lista** `[{ date, base, quote, rate }]`,
  ordenada por data crescente.
- **Nem todo dia tem ponto.** Fins de semana e feriados não têm cotação publicada:
  em `2024-01-01..2024-03-01` (61 dias corridos) vieram **45 pontos**.
- A API pode devolver **dados agregados** em períodos muito longos. Na v1, no
  período de 10 anos testado, vieram **2559 pontos diários** (sempre 1 ponto por
  dia útil), mas o código **não pode** assumir isso — trata cada linha como um
  ponto independente.

### 2.4 Par igual (`base` = `symbols`) → **422**

```json
{ "message": "bad currency pair" }
```

A aplicação **nunca chega a fazer essa chamada**: o hook `useLatestRate` devolve
`rate: 1` sem tocar na rede quando `from === to` (regra RN03). O mesmo vale para
`useHistory`, que devolve a lista vazia e a mensagem
"Escolha moedas diferentes para ver o histórico.".

> Verificado no navegador: ao escolher a mesma moeda nos dois seletores,
> **0 requisições** foram feitas à API.

### 2.5 Moeda inválida (`base=XXX`) → **404**

```json
{ "message": "not found" }
```

A aplicação trata qualquer `response.ok === false` lançando um `Error` com
mensagem em português (ver `src/services/frankfurter.js`).

### 2.6 Data sem cotação — **200**, e não erro

Este é o ponto que mais surpreende: **a API não erra** quando a data pedida não
tem cotação. Ela **encaixa** no dia útil mais próximo:

| Pedido | O que a API devolveu |
| ------ | -------------------- |
| `2024-01-06..2024-01-07` (sábado e domingo) | `2024-01-05` (sexta-feira) |
| `2024-01-01` (feriado de Ano Novo) | `2023-12-29` (sexta anterior) |
| `2024-01-01..2024-03-01` | `start_date: "2023-12-29"` — **anterior** à data pedida |

Consequências práticas:

1. O `start_date` da resposta **não é** necessariamente a data que pedimos.
   Por isso a aplicação **usa a data efetiva devolvida pela API** e não "corrige"
   as datas (regra RN09).
2. O gráfico e a tabela **nunca** devem assumir "um ponto por dia" (regra RN10).
3. Quando o usuário filtra por data, o filtro é aplicado sobre as **datas
   efetivamente publicadas**, então uma data de feriado simplesmente não aparece.

---

## 3. Divergências entre este projeto e a documentação oficial

O enunciado do projeto especifica a **API v1**. A documentação atual do site
(https://frankfurter.dev) apresenta a **v2** como a versão recomendada. A
documentação da v1 (https://frankfurter.dev/v1/) diz textualmente:

> "The v1 API is deprecated in favor of v2, but will continue to work."

Ou seja: **a v1 continua funcionando**, e é ela que o enunciado descreve. As
diferenças encontradas:

| Item | v1 (usada aqui) | v2 (documentação atual) |
| ---- | --------------- | ----------------------- |
| Parâmetros do filtro de moedas | `symbols=BRL` | `quotes=brl` |
| Intervalo de datas | `/2024-01-01..2024-03-01` | `?from=2024-01-01&to=2024-03-01` |
| Moedas disponíveis | 30 (conjunto do ECB, inclui BRL) | 219 (+ metais e criptoativos) |
| Cotação de um par | `/v1/latest?base=USD&symbols=BRL` | `/v2/rate/eur/usd` |
| Conversão | Não existe — fazer na aplicação | Também não existe — fazer na aplicação |

**Decisão do projeto:** manter a **v1**, conforme o enunciado, e deixar esta
tabela registrada. Se um dia o projeto for migrado para a v2, o ponto de maior
risco é o **nome dos parâmetros** (`symbols` → `quotes`) e o **formato do
intervalo** (caminho → query string) — a lógica de `src/services/frankfurter.js`
é a única parte que precisa mudar; o resto da aplicação continua igual.

### 3.1 Observação sobre fuso horário

A documentação oficial avisa:

> "Frankfurter stores dates in UTC, so in another time zone you may query a
> different calendar date than you expect."

Por isso o projeto **formata as datas só com manipulação de string**
(`formatDateBR` em `src/utils/dates.js`), sem nunca criar `new Date(iso)`.
Ver também o teste `formatDateBR: devolve string vazia para entradas inválidas`
e o comentário em `src/utils/dates.js`.

### 3.2 Observação sobre o alcance do histórico

O par **USD → BRL** só existe a partir de **2002** na base do ECB:

- `GET /v1/2002-01-01..2002-01-10?base=USD&symbols=BRL` → **200**, com
  `start_date: "2001-12-28"`;
- `GET /v1/2000-01-01..2000-01-05?base=USD&symbols=BRL` → **404**.

Já o par **USD → EUR** tem histórico desde 1999 (`1999-01-04` → **200**).

Isso **não** afeta o projeto, porque o período máximo offered é de **10 anos**,
e USD/BRL tem dados desde 2002.

---

## 4. Como repetir os testes

### 4.1 Pelo Postman

Importe `postman/currency-exchange.postman_collection.json` e execute as
requisições em sequência. A coleção já traz os casos de erro esperados.

### 4.2 Pelo terminal

```bash
# Moedas
curl "https://api.frankfurter.dev/v1/currencies"

# Última cotação
curl "https://api.frankfurter.dev/v1/latest?base=USD&symbols=BRL"

# Histórico
curl "https://api.frankfurter.dev/v1/2024-01-01..2024-03-01?base=USD&symbols=BRL"

# Par igual (erro esperado)
curl -i "https://api.frankfurter.dev/v1/latest?base=USD&symbols=USD"

# Moeda inválida (erro esperado)
curl -i "https://api.frankfurter.dev/v1/latest?base=XXX&symbols=BRL"

# Data sem cotação (encaixa no dia útil anterior)
curl "https://api.frankfurter.dev/v1/2024-01-06..2024-01-07?base=USD&symbols=BRL"
```

### 4.3 Pela aplicação

A camada `src/services/frankfurter.js` foi exercitada contra a API real durante
o desenvolvimento, e o comportamento observado está refletido nos testes unitários
das funções puras (`npm test`).

### 4.4 Com o script de verificação do projeto

O repositório traz um script que percorre a coleção do Postman, executa cada
requisição contra a API real e confere **o status e as asserções** que estão
escritas nos próprios testes da coleção:

```bash
node scripts/verificar-colecao.mjs
```

Saída da última execução (10/11/2026):

```
✔ 01 — Moedas disponíveis              status: 200 (esperado: 200)
✔ 02 — Última cotação EUR → USD        status: 200 (esperado: 200)
✔ 03 — Última cotação USD → BRL        status: 200 (esperado: 200)
✔ 04 — Histórico por intervalo         status: 200 (esperado: 200)
✔ 05 — ERRO esperado: par igual        status: 422 (esperado: 422)
✔ 06 — ERRO esperado: moeda inválida   status: 404 (esperado: 404)
✔ 07 — Data sem cotação (fim de semana) status: 200 (esperado: 200)
✔ 08 — Data sem cotação (feriado)      status: 200 (esperado: 200)
✔ 09 — Período longo (10 anos)         status: 200 (esperado: 200)

TODAS AS VERIFICAÇÕES PASSARAM
```

> Esse script **precisa de internet**. Ele não faz parte do `npm test`
> (que roda sem rede), justamente para a suíte de testes continuar offline.
