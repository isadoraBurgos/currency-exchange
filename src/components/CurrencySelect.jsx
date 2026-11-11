import styles from './CurrencySelect.module.css'

/**
 * Campo de seleção de moeda.
 *
 * O `label` usa o atributo `htmlFor` com o mesmo `id` do `select`: é isso que
 * associa o texto ao campo (e faz o leitor de tela anunciar o nome do campo).
 *
 * @param {object} props
 * @param {string} props.id identificador único do campo (usado no htmlFor)
 * @param {string} props.label texto visível do campo
 * @param {string} props.value código da moeda selecionada
 * @param {Array<{ code: string, name: string }>} props.options lista de moedas
 * @param {(value: string) => void} props.onChange chamado com o novo código
 * @param {boolean} [props.disabled]
 */
export default function CurrencySelect({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>

      <select
        id={id}
        className={styles.select}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.code} — {option.name}
          </option>
        ))}
      </select>
    </div>
  )
}
