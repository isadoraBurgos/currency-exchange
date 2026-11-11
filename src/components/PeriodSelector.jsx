import styles from './PeriodSelector.module.css'

/**
 * Seletor de período do histórico.
 *
 * Usa `aria-pressed` para indicar qual botão está ativo — é a forma correta de
 * marcar um grupo de botões "alternáveis" (toggle buttons) para leitores de tela.
 *
 * @param {object} props
 * @param {Array<{ id: string, label: string }>} props.periods lista de períodos
 * @param {string} props.activeId id do período ativo
 * @param {(id: string) => void} props.onChange
 * @param {boolean} [props.disabled]
 */
export default function PeriodSelector({
  periods,
  activeId,
  onChange,
  disabled = false,
}) {
  return (
    <div className={styles.selector} role="group" aria-label="Período do histórico">
      {periods.map((period) => {
        const isActive = period.id === activeId

        return (
          <button
            key={period.id}
            type="button"
            className={`${styles.period} ${isActive ? styles.active : ''}`}
            aria-pressed={isActive}
            disabled={disabled}
            onClick={() => onChange(period.id)}
          >
            {period.label}
          </button>
        )
      })}
    </div>
  )
}
