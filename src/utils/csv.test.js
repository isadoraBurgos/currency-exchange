import test from 'node:test'
import assert from 'node:assert/strict'

import { rowsToCSV, buildFilename } from './csv.js'

const rows = [
  { date: '2024-01-02', base: 'USD', quote: 'BRL', rate: 4.8888 },
  { date: '2024-03-01', base: 'USD', quote: 'BRL', rate: 5.1032 },
]

test('rowsToCSV: começa com o cabeçalho pedido', () => {
  const csv = rowsToCSV(rows)
  const [header] = csv.split('\n')
  assert.equal(header, 'data,moeda_origem,moeda_destino,cotacao')
})

test('rowsToCSV: uma linha por registro, na ordem recebida', () => {
  const lines = rowsToCSV(rows).split('\n')
  assert.equal(lines.length, 3)
  assert.equal(lines[1], '2024-01-02,USD,BRL,4.8888')
  assert.equal(lines[2], '2024-03-01,USD,BRL,5.1032')
})

test('rowsToCSV: lista vazia devolve só o cabeçalho', () => {
  assert.equal(rowsToCSV([]), 'data,moeda_origem,moeda_destino,cotacao')
  assert.equal(rowsToCSV(null), 'data,moeda_origem,moeda_destino,cotacao')
})

test('rowsToCSV: campos com vírgula ou aspas são escapados', () => {
  const tricky = [
    { date: '2024-01-02', base: 'US,D', quote: 'BRL', rate: 4.8888 },
  ]
  assert.equal(
    rowsToCSV(tricky),
    'data,moeda_origem,moeda_destino,cotacao\n2024-01-02,"US,D",BRL,4.8888',
  )
})

test('buildFilename: usa par e intervalo de datas das linhas', () => {
  assert.equal(buildFilename(rows), 'cotacoes_USD-BRL_2024-01-02_2024-03-01.csv')
})

test('buildFilename: a data inicial é a menor e a final é a maior', () => {
  const foraDeOrdem = [rows[1], rows[0]]
  assert.equal(
    buildFilename(foraDeOrdem),
    'cotacoes_USD-BRL_2024-01-02_2024-03-01.csv',
  )
})

test('buildFilename: lista vazia devolve um nome genérico', () => {
  assert.equal(buildFilename([]), 'cotacoes.csv')
  assert.equal(buildFilename(null), 'cotacoes.csv')
})
