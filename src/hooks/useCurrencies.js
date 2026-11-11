import { useCallback, useEffect, useState } from 'react'
import { fetchCurrencies } from '../services/frankfurter.js'

/**
 * Carrega a lista de moedas disponíveis na API.
 *
 * A lista de moedas muda muito raramente, por isso o `useEffect` tem uma lista de
 * dependências **vazia** (`[]`): a requisição acontece uma única vez, ao montar
 * o componente.
 *
 * @returns {{ data: Record<string, string>, loading: boolean, error: string, reload: () => void }}
 */
export function useCurrencies() {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    // O AbortController permite cancelar a requisição se o componente
    // desmontar (ou se os parâmetros mudarem) antes de ela terminar.
    const controller = new AbortController()

    async function loadCurrencies() {
      setLoading(true)
      setError('')

      try {
        const currencies = await fetchCurrencies(controller.signal)
        setData(currencies)
      } catch (err) {
        // Requisição cancelada não é um erro de verdade: ignoramos.
        if (err.name === 'AbortError') return
        setError(err.message)
        setData({})
      } finally {
        // Só desligamos o loading se a requisição não foi cancelada,
        // senão uma requisição antiga "desligaria" o loading da nova.
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadCurrencies()

    // Cleanup: roda quando o componente desmonta ou quando as dependências mudam.
    return () => controller.abort()
  }, [reloadToken])

  // `reload` refaz a requisição (botão "Tentar novamente").
  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  return { data, loading, error, reload }
}
