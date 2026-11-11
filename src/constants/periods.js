/**
 * Períodos disponíveis no seletor de histórico.
 *
 * `unit` é a unidade usada para calcular a data inicial do intervalo:
 *  - 'day'   -> subtrai N dias
 *  - 'month' -> subtrai N meses
 *  - 'year'  -> subtrai N anos
 *
 * `amount` é a quantidade dessa unidade.
 */
export const PERIODS = [
  { id: '7d', label: '7 dias', unit: 'day', amount: 7 },
  { id: '15d', label: '15 dias', unit: 'day', amount: 15 },
  { id: '30d', label: '30 dias', unit: 'day', amount: 30 },
  { id: '3m', label: '3 meses', unit: 'month', amount: 3 },
  { id: '6m', label: '6 meses', unit: 'month', amount: 6 },
  { id: '1y', label: '1 ano', unit: 'year', amount: 1 },
  { id: '5y', label: '5 anos', unit: 'year', amount: 5 },
  { id: '10y', label: '10 anos', unit: 'year', amount: 10 },
]

// Moeda de origem usada quando a aplicação abre.
export const DEFAULT_FROM = 'USD'

// Moeda de destino usada quando a aplicação abre.
export const DEFAULT_TO = 'BRL'

// Período usado quando a aplicação abre.
export const DEFAULT_PERIOD = '30d'

/**
 * Busca um período pelo id.
 * Devolve `undefined` se o id não existir na lista.
 */
export function getPeriodById(periodId) {
  return PERIODS.find((period) => period.id === periodId)
}
