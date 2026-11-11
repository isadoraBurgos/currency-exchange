import test from 'node:test'
import assert from 'node:assert/strict'

import { filterRows, sortRows, hasConflictingFilters, parseRate } from './filters.js'

// Linhas de exemplo (em ordem cronológica, como a API devolve).
const rows = [
  { date: '2024-01-02', base: 'USD', quote: 'BRL', rate: 4.9 },
  { date: '2024-01-03', base: 'USD', quote: 'BRL', rate: 5.1 },
  { date: '2024-01-04', base: 'USD', quote: 'BRL', rate: 5.0 },
  { date: '2024-01-05', base: 'USD', quote: 'BRL', rate: 5.4 },
]

test('filterRows: sem filtros devolve todas as linhas', () => {
  assert.equal(filterRows(rows, {}).length, 4)
  assert.equal(filterRows(rows).length, 4)
})

test('filterRows: filtra pela data inicial', () => {
  const result = filterRows(rows, { startDate: '2024-01-03' })
  assert.equal(result.length, 3)
  assert.equal(result[0].date, '2024-01-03')
})

test('filterRows: filtra pela data final', () => {
  const result = filterRows(rows, { endDate: '2024-01-03' })
  assert.equal(result.length, 2)
  assert.equal(result[1].date, '2024-01-03')
})

test('filterRows: filtra por cotação mínima', () => {
  const result = filterRows(rows, { minRate: '5.1' })
  assert.equal(result.length, 2)
  assert.deepEqual(
    result.map((row) => row.rate),
    [5.1, 5.4],
  )
})

test('filterRows: filtra por cotação máxima', () => {
  const result = filterRows(rows, { maxRate: '5.0' })
  assert.equal(result.length, 2)
  assert.deepEqual(
    result.map((row) => row.rate),
    [4.9, 5.0],
  )
})

test('filterRows: combina os filtros com AND', () => {
  const result = filterRows(rows, {
    startDate: '2024-01-02',
    endDate: '2024-01-04',
    minRate: '5',
    maxRate: '5.1',
  })
  assert.equal(result.length, 2)
  assert.deepEqual(
    result.map((row) => row.date),
    ['2024-01-03', '2024-01-04'],
  )
})

test('filterRows: os quatro filtros juntos deixam só um registro', () => {
  const result = filterRows(rows, {
    startDate: '2024-01-02',
    endDate: '2024-01-04',
    minRate: '5.05',
    maxRate: '5.15',
  })
  assert.equal(result.length, 1)
  assert.equal(result[0].date, '2024-01-03')
})

test('filterRows: filtro impossível devolve lista vazia', () => {
  assert.equal(filterRows(rows, { minRate: '10', maxRate: '1' }).length, 0)
  assert.equal(
    filterRows(rows, { startDate: '2024-01-05', endDate: '2024-01-02' }).length,
    0,
  )
})

test('filterRows: não altera o array original', () => {
  const original = [...rows]
  filterRows(rows, { minRate: '5.1' })
  assert.deepEqual(rows, original)
})

test('filterRows: array vazio devolve array vazio', () => {
  assert.deepEqual(filterRows([], { minRate: '1' }), [])
  assert.deepEqual(filterRows(null, {}), [])
})

test('sortRows: ordena por data crescente', () => {
  const shuffled = [rows[2], rows[0], rows[3], rows[1]]
  const result = sortRows(shuffled, 'date', 'asc')
  assert.deepEqual(
    result.map((row) => row.date),
    ['2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05'],
  )
})

test('sortRows: ordena por data decrescente', () => {
  const result = sortRows(rows, 'date', 'desc')
  assert.deepEqual(
    result.map((row) => row.date),
    ['2024-01-05', '2024-01-04', '2024-01-03', '2024-01-02'],
  )
})

test('sortRows: ordena por cotação crescente e decrescente', () => {
  const ascending = sortRows(rows, 'rate', 'asc')
  assert.deepEqual(
    ascending.map((row) => row.rate),
    [4.9, 5.0, 5.1, 5.4],
  )

  const descending = sortRows(rows, 'rate', 'desc')
  assert.deepEqual(
    descending.map((row) => row.rate),
    [5.4, 5.1, 5.0, 4.9],
  )
})

test('sortRows: não muta o array original', () => {
  const original = [...rows]
  const result = sortRows(rows, 'rate', 'desc')
  assert.deepEqual(rows, original)
  assert.notEqual(result, rows)
})

test('sortRows: array vazio devolve array vazio', () => {
  assert.deepEqual(sortRows([], 'date', 'asc'), [])
  assert.deepEqual(sortRows(null, 'rate', 'desc'), [])
})

test('hasConflictingFilters: detecta data inicial maior que a final', () => {
  assert.equal(
    hasConflictingFilters({ startDate: '2024-01-05', endDate: '2024-01-02' }),
    true,
  )
  assert.equal(
    hasConflictingFilters({ startDate: '2024-01-02', endDate: '2024-01-05' }),
    false,
  )
})

test('hasConflictingFilters: detecta cotação mínima maior que a máxima', () => {
  assert.equal(hasConflictingFilters({ minRate: '10', maxRate: '1' }), true)
  assert.equal(hasConflictingFilters({ minRate: '1', maxRate: '10' }), false)
  assert.equal(hasConflictingFilters({ minRate: '10' }), false)
  assert.equal(hasConflictingFilters({}), false)
})

test('parseRate: cotação é sempre decimal, nunca com separador de milhar', () => {
  assert.equal(parseRate('5.4321'), 5.4321)
  assert.equal(parseRate('5,4321'), 5.4321)
  // Diferente do valor a converter, "1.234" aqui vale 1.234 (e não 1234).
  assert.equal(parseRate('1.234'), 1.234)
  assert.equal(parseRate(' 5 '), 5)
})

test('parseRate: devolve null para entradas inválidas', () => {
  assert.equal(parseRate(''), null)
  assert.equal(parseRate('   '), null)
  assert.equal(parseRate('abc'), null)
  assert.equal(parseRate('5abc'), null)
  assert.equal(parseRate(null), null)
  assert.equal(parseRate(Number.NaN), null)
})
