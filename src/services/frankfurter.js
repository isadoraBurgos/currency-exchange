/**
 * Camada de acesso à API Frankfurter (https://frankfurter.dev).
 *
 * A API é pública e não pede chave. Usamos a versão **v1**, que continua
 * disponível (a documentação atual do site recomenda a v2 — a diferença está
 * registrada em `docs/API_TESTS.md`).
 *
 * Todas as funções:
 *  - usam `fetch` + `async/await` (sem axios);
 *  - aceitam um `AbortSignal` para permitir o cancelamento da requisição;
 *  - devolvem dados já normalizados, prontos para a interface usar;
 *  - lançam `Error` com mensagem **em português** quando algo dá errado.
 */

const BASE_URL = 'https://api.frankfurter.dev/v1'

/**
 * Monta a URL da API com os parâmetros de query.
 */
function buildUrl(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  })
  return url.toString()
}

/**
 * Faz a requisição e devolve o JSON.
 *
 * @param {string} path caminho do endpoint (ex.: '/latest')
 * @param {object} params parâmetros de query
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
async function request(path, params = {}, signal) {
  const url = buildUrl(path, params)

  let response
  try {
    response = await fetch(url, { signal })
  } catch (error) {
    // `AbortError` NÃO é erro: é o cancelamento que nós mesmos pedimos.
    if (error.name === 'AbortError') throw error
    throw new Error(
      'Não foi possível conectar ao serviço de câmbio. Verifique sua conexão com a internet.',
    )
  }

  if (!response.ok) {
    throw new Error(
      `O serviço de câmbio respondeu com erro ${response.status}. Tente novamente em instantes.`,
    )
  }

  return response.json()
}

/**
 * Busca a lista de moedas disponíveis.
 *
 * @param {AbortSignal} [signal]
 * @returns {Promise<Record<string, string>>} ex.: { USD: 'United States Dollar', ... }
 */
export async function fetchCurrencies(signal) {
  const data = await request('/currencies', {}, signal)
  return data
}

/**
 * Busca a cotação mais recente de um par de moedas.
 *
 * @param {string} base moeda de origem (ex.: 'USD')
 * @param {string} quote moeda de destino (ex.: 'BRL')
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ rate: number, date: string }>}
 */
export async function fetchLatestRate(base, quote, signal) {
  const data = await request('/latest', { base, symbols: quote }, signal)

  const rate = data?.rates?.[quote]
  if (typeof rate !== 'number') {
    throw new Error(
      `A cotação de ${base} para ${quote} não está disponível no momento.`,
    )
  }

  // A API devolve a **taxa** (1 base = X quote). A conversão é feita na aplicação.
  return { rate, date: data.date }
}

/**
 * Busca o histórico de cotações de um par dentro de um intervalo de datas.
 *
 * Observações importantes:
 *  - a API pode devolver **dados agregados** (semanais/mensais) em períodos longos;
 *  - fins de semana e feriados não têm cotação publicada;
 *  - a primeira data devolvida pode ser **anterior** à data pedida, porque a API
 *    "encaixa" o início no primeiro dia útil disponível.
 *
 * @param {string} base moeda de origem
 * @param {string} quote moeda de destino
 * @param {string} startDate data inicial no formato 'AAAA-MM-DD'
 * @param {string} endDate data final no formato 'AAAA-MM-DD'
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<{ date: string, base: string, quote: string, rate: number }>>}
 *          linhas ordenadas da data mais antiga para a mais recente
 */
export async function fetchHistory(base, quote, startDate, endDate, signal) {
  const data = await request(
    `/${startDate}..${endDate}`,
    { base, symbols: quote },
    signal,
  )

  const rates = data?.rates ?? {}

  // `Object.entries` transforma o objeto da API ("2024-01-02": { BRL: 4.9 })
  // em uma lista de pares que podemos ordenar e transformar.
  return Object.entries(rates)
    .map(([date, value]) => ({
      date,
      base,
      quote,
      rate: value?.[quote],
    }))
    .filter((row) => typeof row.rate === 'number')
    .sort((rowA, rowB) => rowA.date.localeCompare(rowB.date))
}
