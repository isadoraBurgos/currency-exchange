/**
 * Converte o texto de um filtro de cotação em número.
 *
 * Diferente do valor a converter, a cotação **nunca** usa separador de milhar:
 * uma cotação de 5,4321 significa 5.4321, não 54321. Por isso aqui a vírgula e
 * o ponto são sempre separador decimal.
 *
 * @param {string | number} value
 * @returns {number | null}
 */
export function parseRate(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (trimmed === '') return null
  if (!/^[+-]?[\d.,]+$/.test(trimmed)) return null

  const parsed = Number(trimmed.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Filtra as linhas do histórico.
 *
 * Todos os filtros são opcionais e **combinam entre si** (lógica AND).
 * Uma string vazia significa "sem filtro". As datas comparam como string
 * porque o formato `AAAA-MM-DD` já é ordenável alfabeticamente.
 *
 * @param {Array<{ date: string, base: string, quote: string, rate: number }>} rows
 * @param {{ startDate?: string, endDate?: string, minRate?: string, maxRate?: string }} filters
 * @returns {Array} um **novo** array com as linhas que atendem a todos os filtros
 */
export function filterRows(rows, filters = {}) {
  if (!Array.isArray(rows)) return []

  const { startDate = '', endDate = '', minRate = '', maxRate = '' } = filters
  const min = minRate === '' ? null : parseRate(minRate)
  const max = maxRate === '' ? null : parseRate(maxRate)

  return rows.filter((row) => {
    if (startDate && row.date < startDate) return false
    if (endDate && row.date > endDate) return false
    if (min !== null && row.rate < min) return false
    if (max !== null && row.rate > max) return false
    return true
  })
}

/**
 * Ordena as linhas do histórico.
 *
 * Não altera o array original: cria uma cópia antes de ordenar.
 *
 * @param {Array} rows
 * @param {'date' | 'rate'} key coluna de ordenação
 * @param {'asc' | 'desc'} direction
 * @returns {Array} um **novo** array ordenado
 */
export function sortRows(rows, key = 'date', direction = 'asc') {
  if (!Array.isArray(rows)) return []

  const factor = direction === 'desc' ? -1 : 1
  // `[...rows]` cria a cópia. Se chamássemos `rows.sort()`, o array original
  // seria alterado — e isso quebraria a exportação e o gráfico.
  const sorted = [...rows]

  sorted.sort((rowA, rowB) => {
    if (key === 'rate') return (rowA.rate - rowB.rate) * factor
    if (key === 'date') return rowA.date.localeCompare(rowB.date) * factor
    return 0
  })

  return sorted
}

/**
 * Detecta filtros que não podem ser atendidos ao mesmo tempo.
 *
 * Usado pela tabela para avisar o usuário em vez de mostrar uma lista vazia
 * sem explicação.
 *
 * @param {{ startDate?: string, endDate?: string, minRate?: string, maxRate?: string }} filters
 * @returns {boolean}
 */
export function hasConflictingFilters(filters = {}) {
  const { startDate = '', endDate = '', minRate = '', maxRate = '' } = filters

  if (startDate && endDate && startDate > endDate) return true

  const min = minRate === '' ? null : parseRate(minRate)
  const max = maxRate === '' ? null : parseRate(maxRate)
  if (min !== null && max !== null && min > max) return true

  return false
}
