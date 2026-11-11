import { useCallback, useEffect, useState } from 'react'
import { fetchHistory } from '../services/frankfurter.js'
import { getPeriodById, DEFAULT_PERIOD } from '../constants/periods.js'
import { getStartDate, toISODate } from '../utils/dates.js'

// Mensagem exibida quando o usuário escolhe a mesma moeda nos dois lados.
export const SAME_CURRENCY_MESSAGE = 'Escolha moedas diferentes para ver o histórico.'

/**
 * Busca o histórico de cotações de um par dentro do período selecionado.
 *
 * O histórico é recalculado sempre que o par (`from`, `to`) ou o período
 * (`periodId`) mudam. Quando as moedas são iguais, não há requisição: a
 * aplicação devolve uma lista vazia e a mensagem explicando o motivo.
 *
 * @param {string} from moeda de origem
 * @param {string} to moeda de destino
 * @param {string} periodId id do período (veja `src/constants/periods.js`)
 * @returns {{ rows: Array, loading: boolean, error: string, reload: () => void }}
 */
export function useHistory(from, to, periodId) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reloadToken, setReloadToken] = useState(0)

  const isSameCurrency = from === to

  useEffect(() => {
    if (isSameCurrency) {
      setRows([])
      setLoading(false)
      setError(SAME_CURRENCY_MESSAGE)
      return undefined
    }

    const controller = new AbortController()

    async function loadHistory() {
      setLoading(true)
      setError('')

      // Se o id do período não existir, usamos o período padrão.
      const period = getPeriodById(periodId) ?? getPeriodById(DEFAULT_PERIOD)
      const endDate = toISODate(new Date())
      const startDate = getStartDate(period, new Date())

      try {
        const history = await fetchHistory(
          from,
          to,
          startDate,
          endDate,
          controller.signal,
        )
        setRows(history)
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err.message)
        setRows([])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadHistory()

    return () => controller.abort()
  }, [from, to, periodId, isSameCurrency, reloadToken])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  return { rows, loading, error, reload }
}
