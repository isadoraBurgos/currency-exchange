import test from 'node:test'
import assert from 'node:assert/strict'

import { toISODate, getStartDate, formatDateBR } from './dates.js'

test('toISODate: monta AAAA-MM-DD a partir da data local', () => {
  assert.equal(toISODate(new Date(2024, 0, 2)), '2024-01-02')
  assert.equal(toISODate(new Date(2024, 11, 31)), '2024-12-31')
  assert.equal(toISODate(new Date(2024, 8, 9)), '2024-09-09')
})

test('getStartDate: subtrai dias', () => {
  const today = new Date(2024, 2, 15) // 15/03/2024
  assert.equal(getStartDate({ unit: 'day', amount: 7 }, today), '2024-03-08')
  assert.equal(getStartDate({ unit: 'day', amount: 15 }, today), '2024-02-29')
  assert.equal(getStartDate({ unit: 'day', amount: 30 }, today), '2024-02-14')
})

test('getStartDate: subtrai meses', () => {
  const today = new Date(2024, 2, 15) // 15/03/2024
  assert.equal(getStartDate({ unit: 'month', amount: 3 }, today), '2023-12-15')
  assert.equal(getStartDate({ unit: 'month', amount: 6 }, today), '2023-09-15')
})

test('getStartDate: subtrai anos', () => {
  const today = new Date(2024, 2, 15) // 15/03/2024
  assert.equal(getStartDate({ unit: 'year', amount: 1 }, today), '2023-03-15')
  assert.equal(getStartDate({ unit: 'year', amount: 5 }, today), '2019-03-15')
  assert.equal(getStartDate({ unit: 'year', amount: 10 }, today), '2014-03-15')
})

test('getStartDate: não "rola" a data quando o dia não existe no mês de destino', () => {
  // 31 de março menos 1 mês seria 31 de fevereiro (inválido).
  const today = new Date(2024, 2, 31)
  assert.equal(getStartDate({ unit: 'month', amount: 1 }, today), '2024-02-29')
})

test('getStartDate: 29 de fevereiro menos 1 ano vira 28 de fevereiro', () => {
  const today = new Date(2024, 1, 29) // ano bissexto
  assert.equal(getStartDate({ unit: 'year', amount: 1 }, today), '2023-02-28')
})

test('getStartDate: período desconhecido devolve a própria data de referência', () => {
  const today = new Date(2024, 2, 15)
  assert.equal(getStartDate({ unit: 'hour', amount: 5 }, today), '2024-03-15')
  assert.equal(getStartDate({}, today), '2024-03-15')
})

test('formatDateBR: formata AAAA-MM-DD como DD/MM/AAAA sem usar Date', () => {
  assert.equal(formatDateBR('2024-01-02'), '02/01/2024')
  assert.equal(formatDateBR('2024-12-31'), '31/12/2024')
})

test('formatDateBR: devolve string vazia para entradas inválidas', () => {
  assert.equal(formatDateBR(''), '')
  assert.equal(formatDateBR(null), '')
  assert.equal(formatDateBR(undefined), '')
  // String que não está no formato AAAA-MM-DD não tem mês nem dia.
  assert.equal(formatDateBR('02/01/2024'), '')
})
