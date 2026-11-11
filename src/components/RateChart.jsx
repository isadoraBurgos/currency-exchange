import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import StatusMessage from './StatusMessage.jsx'
import styles from './RateChart.module.css'
import { formatDateBR } from '../utils/dates.js'
import { formatRate } from '../utils/converter.js'

/**
 * Gráfico de linha com a evolução da cotação do par.
 *
 * Detalhes importantes:
 *  - `ResponsiveContainer` faz o gráfico se adaptar ao tamanho da tela;
 *  - o eixo X usa a data **já formatada** em DD/MM/AAAA (a API devolve AAAA-MM-DD);
 *  - o `Tooltip` mostra a data e a cotação do ponto que o mouse está sobre.
 *
 * @param {object} props
 * @param {Array<{ date: string, rate: number }>} props.rows linhas do histórico
 * @param {string} props.from moeda de origem
 * @param {string} props.to moeda de destino
 * @param {boolean} props.loading
 * @param {string} props.error
 * @param {() => void} props.onRetry
 */
export default function RateChart({ rows, from, to, loading, error, onRetry }) {
  if (loading) {
    return <StatusMessage type="loading" message="Carregando o gráfico..." />
  }

  if (error) {
    return <StatusMessage type="error" message={error} onRetry={onRetry} />
  }

  if (!rows || rows.length === 0) {
    return (
      <StatusMessage
        type="empty"
        message="Não há cotações para exibir no gráfico neste período."
      />
    )
  }

  // Transformamos as linhas da API no formato que o Recharts espera.
  // O `dateLabel` é a data já em DD/MM/AAAA, pronta para o eixo X.
  const data = rows.map((row) => ({
    ...row,
    dateLabel: formatDateBR(row.date),
  }))

  return (
    <div className={styles.chart}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
          <CartesianGrid stroke="#e4e8ef" strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 12, fill: '#58687d' }}
            tickLine={false}
            axisLine={{ stroke: '#c3ccda' }}
            minTickGap={24}
          />

          <YAxis
            dataKey="rate"
            tick={{ fontSize: 12, fill: '#58687d' }}
            tickLine={false}
            axisLine={false}
            width={68}
            domain={['auto', 'auto']}
            tickFormatter={(value) => formatRate(value, 2)}
          />

          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null

              const point = payload[0].payload

              return (
                <div className={styles.tooltip}>
                  <p className={styles.tooltipDate}>{point.dateLabel}</p>
                  <p className={styles.tooltipValue}>
                    1 {from} = {formatRate(point.rate)} {to}
                  </p>
                </div>
              )
            }}
          />

          <Line
            type="monotone"
            dataKey="rate"
            stroke="#0b5c5a"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
