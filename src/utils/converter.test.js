import test from 'node:test'
import assert from 'node:assert/strict'

import {
  parseAmount,
  validateAmount,
  convert,
  formatMoney,
} from './converter.js'

test('parseAmount: entende o formato com ponto de milhar e vírgula decimal', () => {
  assert.equal(parseAmount('1.234,56'), 1234.56)
  assert.equal(parseAmount('1.234.567,89'), 1234567.89)
})

test('parseAmount: entende o formato com vírgula decimal', () => {
  assert.equal(parseAmount('1234,56'), 1234.56)
  assert.equal(parseAmount('0,5'), 0.5)
})

test('parseAmount: entende o formato com ponto decimal', () => {
  assert.equal(parseAmount('1234.56'), 1234.56)
  assert.equal(parseAmount('5'), 5)
  assert.equal(parseAmount('5.4321'), 5.4321)
})

test('parseAmount: ponto com 3 dígitos é separador de milhar, vírgula é decimal', () => {
  // No padrão pt-BR o ponto separa milhar: "1.234" são mil e duzentos e trinta e quatro.
  assert.equal(parseAmount('1.234'), 1234)
  assert.equal(parseAmount('12.345'), 12345)
  // A vírgula, no padrão pt-BR, é sempre o separador decimal.
  assert.equal(parseAmount('1,234'), 1.234)
  assert.equal(parseAmount('1,234,567'), 1234567)
  assert.equal(parseAmount('12.345.678'), 12345678)
})

test('parseAmount: aceita valores negativos (a validação é quem os rejeita)', () => {
  assert.equal(parseAmount('-10'), -10)
  assert.equal(parseAmount('-1.234,56'), -1234.56)
})

test('parseAmount: devolve null para entradas inválidas', () => {
  assert.equal(parseAmount(''), null)
  assert.equal(parseAmount('   '), null)
  assert.equal(parseAmount('abc'), null)
  assert.equal(parseAmount('R$'), null)
  assert.equal(parseAmount(null), null)
  assert.equal(parseAmount(undefined), null)
  assert.equal(parseAmount({}), null)
  assert.equal(parseAmount(Number.NaN), null)
})

test('validateAmount: campo vazio pede um valor', () => {
  assert.equal(validateAmount(''), 'Informe um valor para converter.')
  assert.equal(validateAmount('   '), 'Informe um valor para converter.')
})

test('validateAmount: texto não numérico é rejeitado', () => {
  assert.equal(validateAmount('abc'), 'Digite um valor numérico válido.')
  assert.equal(validateAmount('12abc'), 'Digite um valor numérico válido.')
})

test('validateAmount: negativo é rejeitado', () => {
  assert.equal(validateAmount('-1'), 'O valor não pode ser negativo.')
  assert.equal(validateAmount('-1.234,56'), 'O valor não pode ser negativo.')
})

test('validateAmount: zero é rejeitado', () => {
  assert.equal(validateAmount('0'), 'O valor deve ser maior que zero.')
  assert.equal(validateAmount('0,00'), 'O valor deve ser maior que zero.')
})

test('validateAmount: valor válido não devolve mensagem', () => {
  assert.equal(validateAmount('1'), '')
  assert.equal(validateAmount('1.234,56'), '')
  assert.equal(validateAmount('0.01'), '')
})

test('convert: multiplica valor pela taxa', () => {
  assert.equal(convert(100, 5.4321), 543.21)
  assert.equal(convert(1, 1), 1)
})

test('convert: devolve null quando o valor ou a taxa não são números', () => {
  assert.equal(convert(null, 5), null)
  assert.equal(convert(100, null), null)
  assert.equal(convert(Number.NaN, 5), null)
  assert.equal(convert(100, Number.NaN), null)
})

test('formatMoney: formata no padrão pt-BR', () => {
  // O Intl usa espaço não separável (U+00A0) entre o símbolo e o número.
  // Por isso normalizamos qualquer espaço antes de comparar.
  const normalize = (text) => text.replace(/\s/g, ' ')
  assert.equal(normalize(formatMoney(543.21, 'BRL')), 'R$ 543,21')
  assert.equal(normalize(formatMoney(1234.5, 'BRL')), 'R$ 1.234,50')
})

test('formatMoney: devolve string vazia para valores inválidos', () => {
  assert.equal(formatMoney(null, 'BRL'), '')
  assert.equal(formatMoney(Number.NaN, 'BRL'), '')
})
