// Gera as capturas de tela usadas no README.
//
// AVISO: o Playwright NÃO faz parte das dependências do projeto (para não
// pesar a instalação). Instale apenas se quiser regerar as imagens:
//
//   npm install --no-save playwright
//   npx playwright install chromium
//   npm run dev            (em outro terminal)
//   node scripts/capturar-telas.mjs
//
// As imagens já versionadas estão em docs/screenshots/.
let chromium
try {
  ;({ chromium } = await import('playwright'))
} catch {
  console.error(
    'Playwright não encontrado. Rode "npm install --no-save playwright" antes.',
  )
  process.exit(1)
}

import { mkdir } from 'node:fs/promises'

const URL = process.env.APP_URL || 'http://localhost:5173'
const OUT = 'docs/screenshots'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()

async function capturar(nome, viewport, acoes) {
  const page = await browser.newPage({ viewport })
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForSelector('tbody tr', { timeout: 20000 })
  await page.waitForTimeout(800)
  if (acoes) await acoes(page)
  await page.screenshot({ path: `${OUT}/${nome}.png`, fullPage: true })
  await page.close()
  console.log(`✔ ${OUT}/${nome}.png`)
}

await capturar('desktop', { width: 1280, height: 900 })
await capturar('mobile', { width: 360, height: 780 })

// Versão com um filtro aplicado, para mostrar a tabela filtrada e o aviso.
await capturar('tabela-filtrada', { width: 1280, height: 900 }, async (page) => {
  await page.fill('#filter-start-date', '2026-11-02')
  await page.fill('#filter-max-rate', '5.5')
  await page.waitForTimeout(500)
})

await browser.close()
