// Verifica se cada requisição da coleção do Postman realmente se comporta
// como o Collection diz (status + asserções dos testes).
import { readFileSync } from 'node:fs'

const collection = JSON.parse(
  readFileSync('postman/currency-exchange.postman_collection.json', 'utf8'),
)

const variaveis = Object.fromEntries(
  collection.variable.map((v) => [v.key, v.value]),
)

function resolverUrl(url) {
  let raw = url.raw
  raw = raw.replace(/\{\{(\w+)\}\}/g, (_, chave) => variaveis[chave])
  return raw
}

let falhas = 0

for (const item of collection.item) {
  const url = resolverUrl(item.request.url)

  let status = 0
  let corpo = null
  try {
    const resposta = await fetch(url)
    status = resposta.status
    const texto = await resposta.text()
    try {
      corpo = JSON.parse(texto)
    } catch {
      corpo = texto
    }
  } catch (erro) {
    console.log(`✗ ${item.name}\n    FALHA DE REDE: ${erro.message}`)
    falhas++
    continue
  }

  // Extrai os status esperados dos testes do próprio Postman.
  const esperado = item.event?.[0]?.script?.exec
    ?.join('\n')
    ?.match(/to\.have\.status\((\d+)\)/)?.[1]

  const statusOk = String(status) === esperado
  if (!statusOk) falhas++

  console.log(
    `${statusOk ? '✔' : '✗'} ${item.name}\n    ${url}\n    status: ${status} (esperado: ${esperado})`,
  )

  // Confere as asserções de conteúdo declaradas nos testes do Postman.
  const corpoTexto = item.event?.[0]?.script?.exec?.join('\n') ?? ''
  const verificacoes = []

  if (corpoTexto.includes("to.eql('bad currency pair')")) {
    verificacoes.push([
      corpo?.message === 'bad currency pair',
      `message = ${JSON.stringify(corpo?.message)}`,
    ])
  }
  if (corpoTexto.includes("to.eql('not found')")) {
    verificacoes.push([
      corpo?.message === 'not found',
      `message = ${JSON.stringify(corpo?.message)}`,
    ])
  }
  if (corpoTexto.includes("pm.expect(body.base).to.eql('EUR')")) {
    verificacoes.push([corpo?.base === 'EUR', `base = ${corpo?.base}`])
  }
  if (corpoTexto.includes("pm.expect(body.date).to.eql('2023-12-29')")) {
    verificacoes.push([
      corpo?.date === '2023-12-29',
      `date = ${corpo?.date}`,
    ])
  }
  if (corpoTexto.includes("pm.expect(body.rates).to.have.property('USD')")) {
    verificacoes.push([
      typeof corpo?.rates?.USD === 'number',
      `rates.USD = ${corpo?.rates?.USD}`,
    ])
  }
  if (corpoTexto.includes("pm.expect(body.rates).to.have.property(pm.variables.get('to'))")) {
    verificacoes.push([
      typeof corpo?.rates?.[variaveis.to] === 'number',
      `rates.${variaveis.to} = ${corpo?.rates?.[variaveis.to]}`,
    ])
  }
  if (corpoTexto.includes('Object.keys(body.rates).length).to.be.above(1)')) {
    verificacoes.push([
      Object.keys(corpo?.rates ?? {}).length > 1,
      `${Object.keys(corpo?.rates ?? {}).length} datas`,
    ])
  }
  if (corpoTexto.includes('Object.keys(body.rates).length).to.be.above(1000)')) {
    verificacoes.push([
      Object.keys(corpo?.rates ?? {}).length > 1000,
      `${Object.keys(corpo?.rates ?? {}).length} datas`,
    ])
  }
  if (corpoTexto.includes('Object.keys(moedas).length).to.be.above(1)')) {
    verificacoes.push([
      Object.keys(corpo ?? {}).length > 1,
      `${Object.keys(corpo ?? {}).length} moedas`,
    ])
  }
  if (corpoTexto.includes('to.match(/^[A-Z]{3}$/)')) {
    const primeira = Object.entries(corpo ?? {})[0]
    verificacoes.push([
      /^[A-Z]{3}$/.test(primeira?.[0] ?? ''),
      `código = ${primeira?.[0]}`,
    ])
  }
  if (corpoTexto.includes('não ter ponto em fins de semana')) {
    const dias = Object.keys(corpo?.rates ?? {}).map(
      (d) => new Date(`${d}T00:00:00Z`).getUTCDay(),
    )
    verificacoes.push([
      !dias.includes(0) && !dias.includes(6),
      `dias da semana: ${[...new Set(dias)].join(',')}`,
    ])
  }
  if (corpoTexto.includes("pm.expect(datas).to.include('2024-01-05')")) {
    const datas = Object.keys(corpo?.rates ?? {})
    verificacoes.push([
      datas.includes('2024-01-05') &&
        !datas.includes('2024-01-06') &&
        !datas.includes('2024-01-07'),
      `datas = ${datas.join(', ')}`,
    ])
  }
  if (corpoTexto.includes('pm.expect(body.rates.USD).to.be.above(0)')) {
    verificacoes.push([
      corpo?.rates?.USD > 0,
      `rates.USD = ${corpo?.rates?.USD}`,
    ])
  }

  for (const [ok, detalhe] of verificacoes) {
    if (!ok) falhas++
    console.log(`    ${ok ? '✔' : '✗'} ${detalhe}`)
  }
}

console.log(`\n${falhas === 0 ? 'TODAS AS VERIFICAÇÕES PASSARAM' : `${falhas} FALHA(S)`}`)
process.exit(falhas === 0 ? 0 : 1)
