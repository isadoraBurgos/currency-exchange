import { useState } from 'react'
import Converter from './components/Converter.jsx'
import PeriodSelector from './components/PeriodSelector.jsx'
import RateChart from './components/RateChart.jsx'
import styles from './App.module.css'
import { useCurrencies } from './hooks/useCurrencies.js'
import { useLatestRate } from './hooks/useLatestRate.js'
import { useHistory } from './hooks/useHistory.js'
import {
  DEFAULT_FROM,
  DEFAULT_TO,
  DEFAULT_PERIOD,
  PERIODS,
} from './constants/periods.js'

/**
 * Componente raiz da aplicação.
 *
 * Aqui mora o **estado compartilhado** (lifting state up): `from`, `to` e
 * `amount` são usados por mais de um componente, então o `App` guarda os
 * valores e os distribui por `props`.
 */
export default function App() {
  // Moeda de origem selecionada.
  const [from, setFrom] = useState(DEFAULT_FROM)
  // Moeda de destino selecionada.
  const [to, setTo] = useState(DEFAULT_TO)
  // Valor digitado pelo usuário (guardado como texto).
  const [amount, setAmount] = useState('100')
  // Período selecionado no histórico.
  const [periodId, setPeriodId] = useState(DEFAULT_PERIOD)

  // Hooks que cuidam de talking com a API.
  const { data: currencies, error: currenciesError, reload: reloadCurrencies } =
    useCurrencies()
  const {
    data: latest,
    loading: rateLoading,
    error: rateError,
    reload: reloadRate,
  } = useLatestRate(from, to)
  const {
    rows,
    loading: historyLoading,
    error: historyError,
    reload: reloadHistory,
  } = useHistory(from, to, periodId)

  /**
   * Inverte origem e destino.
   * O valor digitado é mantido (regra de negócio RN04).
   */
  function handleSwap() {
    setFrom(to)
    setTo(from)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <span className={styles.logo} aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 17l6-6 4 4 8-8" />
                <path d="M14 7h7v7" />
              </svg>
            </span>

            <div>
              <h1 className={styles.title}>Currency Exchange App</h1>
              <p className={styles.tagline}>
                Conversão e histórico de cotações em tempo real
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {currenciesError && (
          <p role="alert" className={styles.tagline}>
            {currenciesError}{' '}
            <button type="button" onClick={reloadCurrencies}>
              Tentar novamente
            </button>
          </p>
        )}

        <Converter
          from={from}
          to={to}
          amount={amount}
          currencies={currencies}
          rate={latest.rate}
          rateDate={latest.date}
          loading={rateLoading}
          error={rateError}
          onFromChange={setFrom}
          onToChange={setTo}
          onAmountChange={setAmount}
          onSwap={handleSwap}
          onRetry={reloadRate}
        />

        <section className={styles.history} aria-labelledby="history-title">
          <div className={styles.historyHeader}>
            <div>
              <h2 className={styles.historyTitle} id="history-title">
                Histórico do par
              </h2>
              <p className={styles.historySubtitle}>
                {from} → {to} · os dados são atualizados a cada escolha de par ou
                período.
              </p>
            </div>

            <PeriodSelector
              periods={PERIODS}
              activeId={periodId}
              onChange={setPeriodId}
              disabled={historyLoading}
            />
          </div>

          <RateChart
            rows={rows}
            from={from}
            to={to}
            loading={historyLoading}
            error={historyError}
            onRetry={reloadHistory}
          />
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>
            Dados de referência fornecidos pela{' '}
            <a href="https://frankfurter.dev" target="_blank" rel="noreferrer">
              Frankfurter API
            </a>
            .
          </span>
          <span>Projeto didático em React.</span>
        </div>
      </footer>
    </div>
  )
}
