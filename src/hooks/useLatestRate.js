import { useCallback, useEffect, useState } from 'react'
import { fetchLatestRate } from '../services/frankfurter.js'
import { toISODate } from '../utils/dates.js'

/**
 * Busca a cotação mais recente de um par de moedas.
 *
 * Quando origem e destino são a **mesma** moeda, a taxa é sempre 1 e
 * **nenhuma requisição é feita** (a API inclusive devolve erro nesse caso).
 *
 * @param {string} from moeda de origem
 * @param {string} to moeda de destino
 * @returns {{ data: { rate: number, date: string }, loading: boolean, error: string, reload: () => void }}
 */
export function useLatestRate(from, to) {
  const [data, setData] = useState({ rate: null, date: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reloadToken, setReloadToken] = useState(0)

  // Par igual: taxa 1, sem tocar na rede.
  const isSameCurrency = from === to

  useEffect(() => {
    if (isSameCurrency) {
      setData({ rate: 1, date: toISODate(new Date()) })
      setLoading(false)
      setError('')
      return undefined
    }

    const controller = new AbortController()

    async function loadRate() {
      setLoading(true)
      setError('')

      try {
        const rate = await fetchLatestRate(from, to, controller.signal)
        setData(rate)
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err.message)
        setData({ rate: null, date: '' })
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadRate()

    // Quando `from`, `to` ou `reloadToken` mudam, o cleanup cancela a requisição
    // antiga. É isso que evita a "race condition" ao trocar de par rapidamente.
    return () => controller.abort()
  }, [from, to, isSameCurrency, reloadToken])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  return { data, loading, error, reload }
}
