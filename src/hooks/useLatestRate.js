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

  // "Hoje" é calculado uma única vez, na montagem do hook.
  // (o inicializador preguiçoso do useState roda só na primeira renderização)
  const [today] = useState(() => toISODate(new Date()))

  // Par igual: taxa 1, sem tocar na rede.
  const isSameCurrency = from === to

  useEffect(() => {
    // Par igual: não há requisição nenhuma (a API devolveria erro).
    if (isSameCurrency) return undefined

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

  // Par igual: a taxa é 1 e a data é hoje. Esse valor é **derivado** durante a
  // renderização, sem precisar de requisição nem de `useState`.
  if (isSameCurrency) {
    return {
      data: { rate: 1, date: today },
      loading: false,
      error: '',
      reload,
    }
  }

  return { data, loading, error, reload }
}
