import fs from 'node:fs'

const candidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]

export function resolveChromePath() {
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) return candidate
  }

  throw new Error(
    'No Chrome/Edge executable found. Install Chrome or set CHROME_PATH to its executable.',
  )
}
