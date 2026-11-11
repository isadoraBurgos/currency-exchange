import CurrencySelect from './CurrencySelect.jsx'
import StatusMessage from './StatusMessage.jsx'
import styles from './Converter.module.css'
import { parseAmount, validateAmount, convert, formatMoney, formatRate } from '../utils/converter.js'
import { formatDateBR } from '../utils/dates.js'

/**
 * Conversor de moedas.
 *
 * O componente **não guarda estado**: ele recebe tudo por `props` e avisa as
 * mudanças chamando os callbacks. Quem decide o valor final é o `App`
 * (veja o *lifting state up* em `src/App.jsx`).
 *
 * @param {object} props
 * @param {string} props.from código da moeda de origem
 * @param {string} props.to código da moeda de destino
 * @param {string} props.amount valor digitado (mantido como texto)
 * @param {Record<string, string>} props.currencies mapa { código: nome }
 * @param {number | null} props.rate taxa atual
 * @param {string} props.rateDate data efetiva da cotação
 * @param {boolean} props.loading
 * @param {string} props.error
 * @param {(value: string) => void} props.onFromChange
 * @param {(value: string) => void} props.onToChange
 * @param {(value: string) => void} props.onAmountChange
 * @param {() => void} props.onSwap
 * @param {() => void} props.onRetry
 */
export default function Converter({
  from,
  to,
  amount,
  currencies,
  rate,
  rateDate,
  loading,
  error,
  onFromChange,
  onToChange,
  onAmountChange,
  onSwap,
  onRetry,
}) {
  // O valor fica como **texto** no estado: só formatamos quando vamos calcular.
  const amountError = validateAmount(amount)
  const parsedAmount = parseAmount(amount)
  const hasValidAmount = amountError === '' && parsedAmount !== null

  // A conversão é feita aqui: valor × taxa.
  const convertedValue =
    hasValidAmount && typeof rate === 'number' ? convert(parsedAmount, rate) : null

  // Transformamos o objeto { USD: 'United States Dollar' } em uma lista
  // [{ code: 'USD', name: 'United States Dollar' }] para poder mapear.
  const options = Object.entries(currencies ?? {}).map(([code, name]) => ({
    code,
    name,
  }))

  const showResult = hasValidAmount && convertedValue !== null && !loading && !error

  return (
    <section className={styles.converter} aria-labelledby="converter-title">
      <div className={styles.heading}>
        <h2 className={styles.title} id="converter-title">
          Conversor de moedas
        </h2>
        <p className={styles.subtitle}>
          Cotações de referência publicadas pelos bancos centrais.
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.amount}>
          <label className={styles.label} htmlFor="amount">
            Valor a converter
          </label>
          <input
            id="amount"
            className={`${styles.input} ${amountError ? styles.inputInvalid : ''}`}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="100,00"
            value={amount}
            aria-invalid={amountError ? 'true' : 'false'}
            aria-describedby={amountError ? 'amount-error' : undefined}
            onChange={(event) => onAmountChange(event.target.value)}
          />
          {amountError && (
            <p className={styles.fieldError} id="amount-error">
              {amountError}
            </p>
          )}
        </div>

        <CurrencySelect
          id="currency-from"
          label="Moeda de origem"
          value={from}
          options={options}
          onChange={onFromChange}
        />

        <button
          type="button"
          className={styles.swap}
          onClick={onSwap}
          aria-label="Inverter moeda de origem e moeda de destino"
          title="Inverter moedas"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 4 3 8l4 4" />
            <path d="M3 8h13a5 5 0 0 1 0 10h-1" />
            <path d="m17 20 4-4-4-4" />
          </svg>
        </button>

        <CurrencySelect
          id="currency-to"
          label="Moeda de destino"
          value={to}
          options={options}
          onChange={onToChange}
        />
      </div>

      {/* `aria-live` faz o leitor de tela anunciar o resultado quando ele muda. */}
      <div className={styles.result} aria-live="polite">
        <div className={styles.converted}>
          <span className={styles.convertedLabel}>Valor convertido</span>

          {showResult ? (
            <>
              <span className={styles.convertedValue}>
                {formatMoney(convertedValue, to)}
              </span>
              <span className={styles.convertedCurrency}>
                {formatMoney(parsedAmount, from)} → {to}
              </span>
            </>
          ) : (
            <span className={styles.convertedValue}>—</span>
          )}
        </div>

        <div className={styles.meta}>
          {loading && (
            <StatusMessage type="loading" message="Buscando cotação atual..." />
          )}

          {!loading && error && (
            <StatusMessage type="error" message={error} onRetry={onRetry} />
          )}

          {!loading && !error && (
            <>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Taxa usada</span>
                <span className={styles.metaValue}>
                  {typeof rate === 'number' ? `1 ${from} = ${formatRate(rate)} ${to}` : '—'}
                </span>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Data da cotação</span>
                <span className={styles.metaValue}>
                  {rateDate ? formatDateBR(rateDate) : '—'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
