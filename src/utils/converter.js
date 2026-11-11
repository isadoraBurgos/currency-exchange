/**
 * Utilitários de conversão de valores.
 *
 * Todas as funções aqui são **puras**: recebem dados e devolvem dados,
 * sem tocar em React, no DOM ou na rede. Isso permite testá-las
 * com o runner nativo do Node (`npm test`).
 */

/**
 * Converte o texto digitado pelo usuário em número.
 *
 * Formatos aceitos:
 *  - '1234.56'  -> 1234.56   (ponto decimal, padrão de código)
 *  - '1234,56'  -> 1234.56   (vírgula decimal, padrão pt-BR)
 *  - '1.234,56' -> 1234.56   (ponto de milhar + vírgula decimal)
 *  - '1.234'    -> 1234      (ponto de milhar: 3 dígitos depois do ponto)
 *  - '1,234'    -> 1.234     (vírgula é sempre decimal no padrão pt-BR)
 *  - '1.234.567'-> 1234567   (vários pontos = separador de milhar)
 *
 * @param {string | number} value
 * @returns {number | null} o número ou `null` quando não dá para interpretar
 */
export function parseAmount(value) {
  // Se já vier um número pronto, devolvemos direto (validando que é finito).
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (trimmed === '') return null

  // Tira espaços (inclusive o espaço não separável) e o símbolo da moeda.
  const cleaned = trimmed.replace(/\s/g, '').replace(/[R$€£¥]/g, '')

  // Se sobrou alguma letra ou símbolo, não é um número.
  // Sem esta checagem, '12abc' viraria 12 e passaria sem perceber.
  if (!/^[+-]?[\d.,]+$/.test(cleaned)) return null

  const hasComma = cleaned.includes(',')
  const hasDot = cleaned.includes('.')
  let normalized

  if (hasComma && hasDot) {
    // Existem os dois separadores: o último que aparece é o decimal.
    const decimalSeparator =
      cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.') ? ',' : '.'
    const thousandsSeparator = decimalSeparator === ',' ? '.' : ','
    normalized = cleaned.split(thousandsSeparator).join('')
    normalized = normalized.replace(decimalSeparator, '.')
  } else if (hasComma) {
    // Uma vírgula só: decimal no padrão pt-BR ("1234,56" = 1234.56).
    // Várias vírgulas: separador de milhar ("1,234,567" = 1234567).
    normalized =
      cleaned.split(',').length > 2
        ? cleaned.split(',').join('')
        : cleaned.replace(',', '.')
  } else if (hasDot) {
    // Um ponto só com exatamente 3 dígitos depois e 1 a 3 antes é separador
    // de milhar no padrão pt-BR ("1.234" = 1234).
    // Nos demais casos o ponto é decimal ("1234.56", "5.4321").
    const parts = cleaned.split('.')
    const isThousands =
      parts.length === 2 &&
      parts[1].length === 3 &&
      parts[0].length >= 1 &&
      parts[0].length <= 3

    normalized = parts.length > 2 || isThousands ? parts.join('') : cleaned
  } else {
    normalized = cleaned
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Valida o valor digitado e devolve a mensagem de erro.
 *
 * @param {string | number} value
 * @returns {string} '' quando o valor é válido, ou a mensagem de erro
 */
export function validateAmount(value) {
  const parsed = parseAmount(value)

  if (parsed === null) {
    const isEmpty = typeof value === 'string' && value.trim() === ''
    return isEmpty
      ? 'Informe um valor para converter.'
      : 'Digite um valor numérico válido.'
  }

  if (parsed < 0) return 'O valor não pode ser negativo.'
  if (parsed === 0) return 'O valor deve ser maior que zero.'

  return ''
}

/**
 * Converte o valor usando a taxa.
 *
 * A API devolve a **taxa** (1 USD = X BRL). A multiplicação é feita aqui,
 * na aplicação — nunca usamos o parâmetro `amount` da API.
 *
 * @param {number} amount
 * @param {number} rate
 * @returns {number | null} o valor convertido ou `null` se algum dos dois for inválido
 */
export function convert(amount, rate) {
  if (!Number.isFinite(amount) || !Number.isFinite(rate)) return null
  return amount * rate
}

/**
 * Formata um número como moeda usando `Intl` no padrão pt-BR.
 *
 * @param {number} value
 * @param {string} currency código ISO de 3 letras (ex.: 'BRL')
 * @param {number} [maximumFractionDigits=2]
 * @returns {string} ex.: 'R$ 543,17' (ou '' se o valor não for um número)
 */
export function formatMoney(value, currency = 'BRL', maximumFractionDigits = 2) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return ''

  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits,
    }).format(value)
  } catch {
    // Moeda desconhecida (ex.: 'XYZ'): mostramos o número sem o símbolo.
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits }).format(value)
  }
}
