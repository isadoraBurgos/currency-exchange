/**
 * Utilitários de data.
 *
 * Regra importante do projeto: as datas que chegam da API já são strings no formato
 * `AAAA-MM-DD`. Por isso nós **nunca** usamos `new Date('2024-01-02')` para formatá-las:
 * essa string é interpretada como UTC à meia-noite e, em fusos negativos como o do
 * Brasil (UTC−3), o dia "anda para trás" e vira 01/01/2024.
 */

/**
 * Converte um objeto `Date` na string `AAAA-MM-DD` usando a data **local**.
 *
 * @param {Date} date
 * @returns {string} ex.: '2024-01-02'
 */
export function toISODate(date) {
  const year = date.getFullYear()
  // getMonth() começa em zero (janeiro = 0), por isso somamos 1.
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Calcula a data inicial de um período.
 *
 * Exemplo: `getStartDate({ unit: 'month', amount: 3 }, new Date(2024, 2, 15))`
 * devolve '2023-12-15' (3 meses antes de 15/03/2024).
 *
 * @param {{ unit: 'day' | 'month' | 'year', amount: number }} period
 * @param {Date} today data de referência (normalmente "hoje")
 * @returns {string} data inicial no formato 'AAAA-MM-DD'
 */
export function getStartDate(period, today = new Date()) {
  // Copia só a parte da data (sem horas), para não ser influenciado pelo horário.
  const reference = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const amount = period?.amount ?? 0

  if (period?.unit === 'day') {
    const start = new Date(reference)
    start.setDate(start.getDate() - amount)
    return toISODate(start)
  }

  if (period?.unit === 'month') {
    return toISODate(subtractMonths(reference, amount))
  }

  if (period?.unit === 'year') {
    return toISODate(subtractYears(reference, amount))
  }

  // Período desconhecido: não recua nada.
  return toISODate(reference)
}

/**
 * Subtrai meses "de forma segura".
 *
 * O construtor `new Date(2024, 1, 31)` (31 de fevereiro) rola para 2 de março,
 * o que erraria a data. Por isso montamos o mês de destino com dia 1 e depois
 * limitamos o dia ao último dia daquele mês.
 */
function subtractMonths(date, months) {
  const target = new Date(date.getFullYear(), date.getMonth() - months, 1)
  const lastDayOfTargetMonth = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate()
  target.setDate(Math.min(date.getDate(), lastDayOfTargetMonth))
  return target
}

/**
 * Subtrai anos "de forma segura" (o mesmo cuidado do dia 29 de fevereiro).
 */
function subtractYears(date, years) {
  const target = new Date(date.getFullYear() - years, date.getMonth(), 1)
  const lastDayOfTargetMonth = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate()
  target.setDate(Math.min(date.getDate(), lastDayOfTargetMonth))
  return target
}

/**
 * Formata uma data `AAAA-MM-DD` como `DD/MM/AAAA`.
 *
 * Trabalha apenas com a string: nenhum objeto `Date`, nenhuma surpresa de fuso horário.
 *
 * @param {string} iso
 * @returns {string} ex.: '02/01/2024'
 */
export function formatDateBR(iso) {
  if (typeof iso !== 'string' || iso.length < 10) return ''
  const [year, month, day] = iso.slice(0, 10).split('-')
  if (!year || !month || !day) return ''
  return `${day}/${month}/${year}`
}
