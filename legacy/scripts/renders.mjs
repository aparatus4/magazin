import { chromium } from 'playwright-core'
import fs from 'node:fs'
import path from 'node:path'

const executablePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

const products = [
  'portrait',
  'mobius-vase',
  'halo-lamp',
  'terra-planter',
  'orbit-desk',
  'aster-ring',
  'kite-tabletop',
  'echo-house',
  'pulse-drone',
  'companion-four',
  'atelier-dock',
  'marlowe-knob',
  'arc-topper',
  'arch-study',
]

const projectSizes = {
  maya: [1100, 1460],
  wren: [1600, 1080],
  noon: [1480, 1110],
  aster: [1100, 1380],
  kite: [1600, 1100],
  pulse: [1480, 1110],
}

const productImages = {
  portrait: 'portrait-bust',
}

const only = process.argv[2]
const onlyProject = only?.startsWith('project:') ? only.slice('project:'.length) : null

fs.mkdirSync('public/renders', { recursive: true })

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader'],
})
const page = await browser.newPage({ viewport: { width: 1000, height: 1250 }, deviceScaleFactor: 1 })
page.on('pageerror', (error) => console.log(`[pageerror] ${error.message}`))

async function capture(url, width, height, out) {
  await page.setViewportSize({ width, height })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForFunction(() => window.__FORMA_RENDER_READY__ === true, null, { timeout: 30000 })
  await page.waitForTimeout(350)
  await page.screenshot({ path: out, type: 'jpeg', quality: 90 })
  console.log(`saved ${out}`)
}

if (!only || only === 'products' || Boolean(only && only !== 'projects' && !onlyProject)) {
  for (const id of products) {
    if (only && only !== 'products' && only !== id) continue
    const file = productImages[id] ?? id
    await capture(
      `http://127.0.0.1:5173/?render=${id}&kind=product`,
      1000,
      1250,
      path.join('public/renders', `${file}.jpg`),
    )
  }
}

if (!only || only === 'projects' || onlyProject) {
  for (const [id, size] of Object.entries(projectSizes)) {
    if (onlyProject && onlyProject !== id) continue
    await capture(
      `http://127.0.0.1:5173/?render=${id}&kind=project`,
      size[0],
      size[1],
      path.join('public/renders', `project-${id}.jpg`),
    )
  }
}

await browser.close()
