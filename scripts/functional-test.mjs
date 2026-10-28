import { chromium } from 'playwright-core'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { resolveChromePath } from './browser-path.mjs'

const executablePath = resolveChromePath()

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: [
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--use-angle=swiftshader',
    '--disable-dev-shm-usage',
  ],
})

const errors = []
let passed = 0
let total = 0
const check = async (name, fn) => {
  total += 1
  try {
    await fn()
    passed += 1
    console.log(`PASS  ${name}`)
  } catch (error) {
    const message = error.message.split('\n')[0]
    console.log(`FAIL  ${name}`)
    console.log(`      ${message}`)
    if (process.env.GITHUB_ACTIONS === 'true') {
      console.log(`::error title=Functional check failed::${name}: ${message}`)
    }
    process.exitCode = 1
  }
}

const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(1800)

await check('hero has three slides and portrait active', async () => {
  // Autoplay may already have advanced while the page was loading on a slow
  // runner, so reset to the first slide before asserting the portrait state.
  await page.getByRole('tab', { name: /Go to slide 1:/ }).click()
  await page.waitForTimeout(300)
  assert.equal(await page.locator('.hero__dot').count(), 3)
  assert.equal(await page.locator('.hero__dot').first().getAttribute('aria-selected'), 'true')
  assert.ok((await page.locator('.hero').getAttribute('class'))?.includes('hero--portrait'))
})

await check('hero slide switching works', async () => {
  await page.getByRole('tab', { name: /Go to slide 2:/ }).click()
  await page.waitForTimeout(900)
  assert.equal(await page.locator('.hero__dot').nth(1).getAttribute('aria-selected'), 'true')
  assert.ok((await page.locator('.hero').getAttribute('class'))?.includes('hero--objects'))
})

await check('hero pause control changes state', async () => {
  await page.getByRole('button', { name: 'Pause slideshow' }).click()
  await page.waitForTimeout(300)
  assert.equal(await page.getByRole('button', { name: 'Play slideshow' }).count(), 1)
})

await check('mega menu opens, switches category, and closes', async () => {
  await page.getByRole('button', { name: 'Shop', exact: true }).click()
  await page.waitForTimeout(500)
  assert.equal(await page.locator('#mega-menu').count(), 1)
  await page.locator('.mega-rail__item', { hasText: 'Home & Living' }).hover()
  await page.waitForTimeout(400)
  assert.ok((await page.locator('.mega__body').innerText()).includes('Home & Living'))
  assert.ok((await page.locator('.mega__body').innerText()).includes('Lighting, vessels, planters'))
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  assert.equal(await page.locator('#mega-menu').count(), 0)
})

await check('search finds the vase and opens quick view', async () => {
  await page.getByRole('button', { name: 'Search the store' }).click()
  await page.waitForTimeout(300)
  await page.getByPlaceholder('Search objects, materials, projects').fill('vase')
  await page.waitForTimeout(500)
  assert.ok((await page.locator('.search-products').innerText()).includes('Möbius Vase'))
  await page.locator('.search-products button').first().click()
  await page.waitForTimeout(600)
  assert.equal(await page.locator('.quick-view h2').innerText(), 'Möbius Vase')
})

await check('quick view adds to cart and toast confirms', async () => {
  await page.getByRole('button', { name: 'Add to bag' }).click()
  await page.waitForTimeout(400)
  assert.ok((await page.locator('.toast').innerText()).includes('Möbius Vase added to your bag'))
  assert.equal((await page.locator('.bag-count').innerText()).trim(), '1')
})

await check('cart drawer quantities, totals, and removal work', async () => {
  await page.locator('.header-action--bag').click()
  await page.waitForTimeout(600)
  assert.equal(await page.locator('.cart-line').count(), 1)
  assert.equal((await page.locator('.cart-totals strong').innerText()).trim(), '$86')
  assert.equal(await page.locator('.toast').count(), 0)
  await page.getByRole('button', { name: /Increase quantity of/ }).click()
  await page.waitForTimeout(300)
  assert.equal((await page.locator('.cart-totals strong').innerText()).trim(), '$172')
  await page.getByRole('button', { name: /Remove Möbius Vase/ }).click()
  await page.waitForTimeout(300)
  assert.ok((await page.locator('.cart-empty').innerText()).includes('Your bag is quiet.'))
  await page.getByRole('button', { name: 'Close shopping bag' }).last().click()
  await page.waitForTimeout(400)
})

await check('collection tabs filter products', async () => {
  await page.getByRole('tab', { name: /Ready to ship/ }).click()
  await page.waitForTimeout(400)
  assert.equal(await page.locator('.product-card').count(), 6)
  assert.ok((await page.locator('.product-card__type').first().innerText()).toLowerCase().includes('ready to ship'))
  await page.getByRole('tab', { name: /Everything/ }).click()
  await page.waitForTimeout(300)
  assert.equal(await page.locator('.product-card').count(), 14)
})

await check('category filter and clear filter work', async () => {
  const chip = page.locator('.collection-chip', { hasText: 'Home & Living' })
  await chip.scrollIntoViewIfNeeded()
  await chip.click()
  await page.waitForTimeout(400)
  assert.ok((await page.locator('.collection__count-row').innerText()).includes('in Home & Living'))
  await page.getByRole('button', { name: 'Clear filter' }).click()
  await page.waitForTimeout(300)
  assert.ok((await page.locator('.collection__count-row').innerText()).includes('of 14 objects'))
})

await check('project modal validates and submits a brief', async () => {
  await page.evaluate(() => {
    const node = document.querySelector('#projects')
    if (node) window.scrollTo({ top: node.getBoundingClientRect().top + window.scrollY - 80, behavior: 'instant' })
  })
  await page.waitForTimeout(800)
  await page.getByRole('button', { name: /Add your project/ }).click()
  await page.waitForTimeout(400)
  assert.equal(await page.locator('.project-modal').count(), 1)
  await page.getByRole('button', { name: 'Send the brief' }).click()
  await page.waitForTimeout(300)
  assert.ok((await page.locator('.project-form__error').innerText()).includes('Please add your name'))
  await page.getByPlaceholder('First and last').fill('Ada Lovelace')
  await page.getByPlaceholder('you@example.com').fill('ada@example.com')
  await page.getByPlaceholder(/A portrait for my father/).fill('A 1:100 model of a courtyard studio.')
  await page.locator('.project-field select').selectOption('Within two weeks')

  const briefPath = path.join(os.tmpdir(), 'test-brief.txt')
  fs.writeFileSync(briefPath, 'test reference')
  await page.locator('.project-modal input[type=file]').setInputFiles(briefPath)
  await page.getByRole('button', { name: 'Send the brief' }).click()
  await page.waitForTimeout(500)
  assert.ok((await page.locator('.project-modal__success').innerText()).toLowerCase().includes('brief received'))
  assert.ok((await page.locator('.project-modal__success').innerText()).includes('Ada'))
  assert.ok((await page.locator('.project-modal__success').innerText()).includes('test-brief.txt'))
  await page.getByRole('button', { name: 'Return to the studio' }).click()
  await page.waitForTimeout(300)
})

await check('project lightbox opens and closes', async () => {
  await page.locator('.project-card').first().click()
  await page.waitForTimeout(400)
  assert.equal(await page.locator('.project-lightbox').count(), 1)
  assert.ok((await page.locator('.project-lightbox').innerText()).includes('A portrait for Maya'))
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  assert.equal(await page.locator('.project-lightbox').count(), 0)
})

await check('newsletter validates and confirms subscription', async () => {
  await page.evaluate(() => {
    const node = document.querySelector('.newsletter')
    if (node) window.scrollTo({ top: node.getBoundingClientRect().top + window.scrollY - 80, behavior: 'instant' })
  })
  await page.waitForTimeout(500)
  await page.getByPlaceholder('Your email address').fill('ada@example.com')
  await page.getByRole('button', { name: 'Subscribe' }).click()
  await page.waitForTimeout(400)
  assert.ok((await page.locator('.newsletter__done').innerText()).includes('You’re on the list.'))
})

/* mobile menu expansion */
// Close the desktop page first: its software-rendered 3D hero otherwise starves
// the mobile renderer and intermittently delays hydration past the click timeout.
await page.close()

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
mobile.on('pageerror', (error) => errors.push(error.message))
await mobile.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded', timeout: 60000 })
await mobile.locator('.header-action--menu').waitFor({ state: 'visible', timeout: 60000 })
await mobile.waitForTimeout(300)

await check('mobile menu expands a category and links into the collection', async () => {
  await mobile.getByRole('button', { name: 'Open menu' }).click()
  await mobile.waitForTimeout(400)
  const cat = mobile.locator('.mobile-cat', { hasText: 'Home & Living' })
  await cat.locator('summary').click()
  await mobile.waitForTimeout(400)
  assert.ok((await cat.locator('.mobile-cat__body').innerText()).includes('Vases & vessels'))
  await mobile.getByRole('button', { name: 'Close menu' }).click()
  await mobile.waitForTimeout(300)
  assert.equal(await mobile.locator('.mobile-menu').count(), 0)
})

await browser.close()
fs.rmSync(path.join(os.tmpdir(), 'test-brief.txt'), { force: true })

if (errors.length > 0) {
  console.log(`\nBrowser errors (${errors.length}):`)
  for (const error of errors) {
    console.log(`  ${error}`)
    if (process.env.GITHUB_ACTIONS === 'true') {
      console.log(`::error title=Browser error::${error}`)
    }
  }
  process.exitCode = 1
}

console.log(`\n${passed}/${total} checks passed.`)
