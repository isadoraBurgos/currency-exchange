/**
 * Geração de CSV feita à mão (sem bibliotecas), para o aluno entender a lógica.
 *
 * O arquivo usa vírgula como separador (como pede o enunciado) e guarda a data
 * no formato ISO `AAAA-MM-DD`, que é ordenável e não depende de locale.
 * A cotação também sai com ponto decimal para não "quebrar" a coluna.
 */

/**
 * Escapa um campo do CSV.
 * Se o texto tiver vírgula, aspas ou quebra de linha, envolvemos em aspas
 * e duplicamos as aspas que existirem dentro.
 */
function escapeField(value) {
  const text = String(value ?? '')
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

/**
 * Monta o conteúdo CSV das linhas.
 *
 * @param {Array<{ date: string, base: string, quote: string, rate: number }>} rows
 * @returns {string} ex.: 'data,moeda_origem,moeda_destino,cotacao\n2024-01-02,USD,BRL,4.8888'
 */
export function rowsToCSV(rows) {
  const header = 'data,moeda_origem,moeda_destino,cotacao'
  if (!Array.isArray(rows) || rows.length === 0) return header

  const lines = rows.map((row) =>
    [row.date, row.base, row.quote, row.rate]
      .map(escapeField)
      .join(','),
  )

  return [header, ...lines].join('\n')
}

/**
 * Monta o nome do arquivo a partir das linhas exportadas.
 *
 * @param {Array<{ date: string, base: string, quote: string }>} rows
 * @returns {string} ex.: 'cotacoes_USD-BRL_2024-01-02_2024-03-01.csv'
 */
export function buildFilename(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return 'cotacoes.csv'

  const { base, quote } = rows[0]
  const dates = rows.map((row) => row.date).sort()
  const start = dates[0]
  const end = dates[dates.length - 1]

  return `cotacoes_${base}-${quote}_${start}_${end}.csv`
}

/**
 * Baixa o CSV das linhas no navegador.
 *
 * Usa `Blob` + uma tag `<a>` temporária. O BOM (`\uFEFF`) no começo do arquivo
 * faz o Excel reconhecer a codificação UTF-8 e mostrar os acentos corretamente.
 *
 * @param {Array} rows
 * @returns {boolean} `false` quando não há nenhuma linha para exportar
 */
export function downloadCSV(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return false

  const csv = rowsToCSV(rows)
  const filename = buildFilename(rows)

  // O prefixo '\uFEFF' é o BOM: faz o Excel abrir o arquivo como UTF-8.
  const blob = new Blob(['\uFEFF' + csv], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Libera o objeto temporário da memória do navegador.
  URL.revokeObjectURL(url)

  return true
}
