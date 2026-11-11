import styles from './StatusMessage.module.css'

/**
 * Mensagem de estado usada no conversor, no gráfico e na tabela.
 *
 * @param {object} props
 * @param {'loading' | 'error' | 'empty'} props.type tipo do estado
 * @param {string} props.message texto a exibir
 * @param {() => void} [props.onRetry] quando existe, mostra o botão "Tentar novamente"
 * @param {string} [props.actionLabel] rótulo do botão de ação extra
 * @param {() => void} [props.onAction] callback do botão de ação extra
 */
export default function StatusMessage({
  type = 'loading',
  message,
  onRetry,
  actionLabel,
  onAction,
}) {
  if (!message) return null

  const isLoading = type === 'loading'
  const isError = type === 'error'
  const isEmpty = type === 'empty'

  // Cada tipo tem sua própria classe, para que o CSS Module aplique o estilo certo.
  const classNames = [
    styles.wrapper,
    isError ? styles.error : '',
    isEmpty ? styles.empty : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classNames} role={isError ? 'alert' : 'status'}>
      <span className={styles.icon} aria-hidden="true">
        {isLoading && <span className={styles.spinner} />}
        {!isLoading && <span aria-hidden="true">!</span>}
      </span>

      <div className={styles.content}>
        <p className={styles.message}>{message}</p>

        {onRetry && (
          <button type="button" className={styles.action} onClick={onRetry}>
            Tentar novamente
          </button>
        )}

        {onAction && actionLabel && (
          <button type="button" className={styles.action} onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
