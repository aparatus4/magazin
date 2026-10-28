import fs from 'node:fs/promises'
import path from 'node:path'

import { chromium } from 'playwright-core'

import { resolveChromePath } from './browser-path.mjs'

const url = process.env.LEGACY_URL ?? 'http://127.0.0.1:5173'
const outputDir = path.resolve('shots', 'baseline')

const sections = [
  ['02-trust', '.trust-strip'],
  ['03-portrait', '#portrait'],
  ['04-categories', '#categories'],
  ['05-collection', '#collection'],
  ['06-custom', '#custom'],
  ['07-materials', '#materials'],
  ['08-projects', '#projects'],
  ['09-reviews', '#reviews'],
  ['10-newsletter', '.newsletter'],
  ['11-footer', '.site-footer'],
]

const browser = await chromium.launch({
  executablePath: resolveChromePath(),
  headless: true,
  args: [
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--use-angle=swiftshader',
    '--disable-dev-shm-usage',
  ],
})

try {
  await fs.mkdir(outputDir, { recursive: true })

  for (const [name, viewport] of [
    ['desktop', { width: 1440, height: 1000 }],
    ['mobile', { width: 390, height: 844 }],
  ]) {
    const page = await browser.newPage({ viewport })
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })
    await page.waitForTimeout(2_000)

    await page.screenshot({ path: path.join(outputDir, `${name}-01-hero.png`) })

    for (const [label, selector] of sections) {
      const section = page.locator(selector)
      if ((await section.count()) === 0) {
        console.warn(`skip ${name}-${label}: ${selector} not found`)
        continue
      }

      await section.scrollIntoViewIfNeeded()
      await page.waitForTimeout(400)
      await page.screenshot({ path: path.join(outputDir, `${name}-${label}.png`) })
    }

    await page.close()
  }

  console.log(`Baseline screenshots written to ${outputDir}`)
} finally {
  await browser.close()
}
