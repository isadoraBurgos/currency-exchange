import { useMemo, useState } from 'react'
import StatusMessage from './StatusMessage.jsx'
import styles from './HistoryTable.module.css'
import { filterRows, sortRows, hasConflictingFilters } from '../utils/filters.js'
import { buildFilename, downloadCSV } from '../utils/csv.js'
import { formatDateBR } from '../utils/dates.js'
import { formatRate } from '../utils/converter.js'

// Estado inicial dos filtros: tudo vazio = sem filtro.
const EMPTY_FILTERS = { startDate: '', endDate: '', minRate: '', maxRate: '' }

/**
 * Tabela do histórico com filtros, ordenação e exportação em CSV.
 *
 * Aqui o estado dos filtros e da ordenação **fica dentro do componente**,
 * porque só a tabela usa esses valores. O `App` não precisa saber deles.
 *
 * @param {object} props
 * @param {Array<{ date: string, base: string, quote: string, rate: number }>} props.rows
 * @param {string} props.from moeda de origem
 * @param {string} props.to moeda de destino
 * @param {boolean} props.loading
 * @param {string} props.error
 * @param {() => void} props.onRetry
 */
export default function HistoryTable({
  rows,
  from,
  to,
  loading,
  error,
  onRetry,
}) {
  // Filtros digitados pelo usuário.
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  // Coluna de ordenação: 'date' ou 'rate'.
  const [sortKey, setSortKey] = useState('date')
  // Direção da ordenação: 'asc' ou 'desc'.
  const [sortDirection, setSortDirection] = useState('asc')

  /**
   * Atualiza um filtro. Usamos a forma funcional do `useState` para não
   * perder os outros filtros.
   */
  function handleFilterChange(field, value) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  /**
   * Clica no cabeçalho "Data" ou "Cotação":
   * se já estiver ordenando por essa coluna, inverte a direção.
   */
  function handleSort(key) {
    if (key === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDirection('asc')
  }

  // Aviso quando os filtros não podem ser atendidos ao mesmo tempo.
  const hasConflict = hasConflictingFilters(filters)

  // `useMemo` evita refiltrar a tabela a cada renderização desnecessária.
  const filteredRows = useMemo(
    () => filterRows(rows ?? [], filters),
    [rows, filters],
  )

  // As linhas que aparecem na tela (filtradas **e** ordenadas).
  const visibleRows = useMemo(
    () => sortRows(filteredRows, sortKey, sortDirection),
    [filteredRows, sortKey, sortDirection],
  )

  // A exportação usa exatamente as linhas visíveis, na ordem exibida.
  function handleExport() {
    downloadCSV(visibleRows)
  }

  const hasRows = visibleRows.length > 0

  if (loading) {
    return <StatusMessage type="loading" message="Carregando as cotações..." />
  }

  if (error) {
    return <StatusMessage type="error" message={error} onRetry={onRetry} />
  }

  return (
    <div className={styles.table}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <div className={styles.filter}>
            <label className={styles.label} htmlFor="filter-start-date">
              Data inicial
            </label>
            <input
              id="filter-start-date"
              className={styles.input}
              type="date"
              value={filters.startDate}
              onChange={(event) => handleFilterChange('startDate', event.target.value)}
            />
          </div>

          <div className={styles.filter}>
            <label className={styles.label} htmlFor="filter-end-date">
              Data final
            </label>
            <input
              id="filter-end-date"
              className={styles.input}
              type="date"
              value={filters.endDate}
              onChange={(event) => handleFilterChange('endDate', event.target.value)}
            />
          </div>

          <div className={styles.filter}>
            <label className={styles.label} htmlFor="filter-min-rate">
              Cotação mínima
            </label>
            <input
              id="filter-min-rate"
              className={styles.input}
              type="number"
              step="any"
              inputMode="decimal"
              placeholder="0,0000"
              value={filters.minRate}
              onChange={(event) => handleFilterChange('minRate', event.target.value)}
            />
          </div>

          <div className={styles.filter}>
            <label className={styles.label} htmlFor="filter-max-rate">
              Cotação máxima
            </label>
            <input
              id="filter-max-rate"
              className={styles.input}
              type="number"
              step="any"
              inputMode="decimal"
              placeholder="0,0000"
              value={filters.maxRate}
              onChange={(event) => handleFilterChange('maxRate', event.target.value)}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => setFilters(EMPTY_FILTERS)}
            disabled={
              filters.startDate === '' &&
              filters.endDate === '' &&
              filters.minRate === '' &&
              filters.maxRate === ''
            }
          >
            Limpar filtros
          </button>

          <button
            type="button"
            className={styles.primary}
            onClick={handleExport}
            disabled={!hasRows}
            title={hasRows ? buildFilename(visibleRows) : 'Nenhum registro para exportar'}
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <div className={styles.summary}>
        <span className={styles.count}>
          {visibleRows.length} registro{visibleRows.length === 1 ? '' : 's'} encontrado
          {visibleRows.length === 1 ? '' : 's'}
        </span>

        {hasConflict && (
          <span className={styles.warning} role="alert">
            {filters.startDate && filters.endDate && filters.startDate > filters.endDate
              ? 'A data inicial está depois da data final.'
              : 'A cotação mínima está acima da cotação máxima.'}
          </span>
        )}
      </div>

      {!hasRows && (
        <StatusMessage
          type="empty"
          message={
            rows && rows.length > 0
              ? 'Nenhum registro para os filtros aplicados.'
              : 'Nenhuma cotação encontrada para este par e período.'
          }
          actionLabel="Limpar filtros"
          onAction={() => setFilters(EMPTY_FILTERS)}
        />
      )}

      {hasRows && (
        <div className={styles.tableWrapper}>
          <table className={styles.tableElement}>
            <caption className="visually-hidden">
              Histórico de cotações de {from} para {to}
            </caption>

            <thead>
              <tr>
                <th scope="col">
                  <button
                    type="button"
                    className={styles.sortable}
                    onClick={() => handleSort('date')}
                    aria-label="Ordenar por data"
                  >
                    Data
                    <span className={styles.arrow} aria-hidden="true">
                      {sortKey === 'date' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </button>
                </th>

                <th scope="col">Origem</th>
                <th scope="col">Destino</th>

                <th scope="col" className={styles.numeric}>
                  <button
                    type="button"
                    className={styles.sortable}
                    onClick={() => handleSort('rate')}
                    aria-label="Ordenar por cotação"
                  >
                    Cotação
                    <span className={styles.arrow} aria-hidden="true">
                      {sortKey === 'rate' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {visibleRows.map((row) => (
                <tr key={`${row.base}-${row.quote}-${row.date}`}>
                  <td>{formatDateBR(row.date)}</td>
                  <td>{row.base}</td>
                  <td>{row.quote}</td>
                  <td className={styles.numeric}>{formatRate(row.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
