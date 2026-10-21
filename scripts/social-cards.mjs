// Draws the link-preview cards (1200×630) with a headless browser: `npm run social-cards`.
// The wine card's lines come from winePreview in src/site.ts, so after changing the tagline (say, after
// graduating), run this and commit the new PNGs in public/images/.
// Needs Playwright's Chromium once: `npx playwright install chromium`.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright'
import { FLAVOR_ART } from '../src/components/flavorIcons.ts'
import { site, winePreview } from '../src/site.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const file = (path) => pathToFileURL(join(root, path)).href

// Pixel art straight from the site's icons, in the site's palette.
const iconSource = readFileSync(join(root, 'src/components/PixelIcon.tsx'), 'utf8')
const palette = Object.fromEntries([...iconSource.matchAll(/^ {2}(\w): '(#[0-9a-f]{6})'/gm)].map((m) => [m[1], m[2]]))
palette.v = palette.r // the wine color: red on the card
const glass = iconSource.match(/ {2}glass: \[([\s\S]*?)\]/)[1].match(/'([^']*)'/g).map((row) => row.slice(1, -1))
const pixels = (rows, width) => {
  const rects = rows.flatMap((row, y) => [...row].map((char, x) => (char === '.' ? '' : `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${palette[char]}"/>`)))
  return `<svg viewBox="0 0 ${rows[0].length} ${rows.length}" width="${width}" shape-rendering="crispEdges">${rects.join('')}</svg>`
}
const escape = (text) => text.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char])

const base = `
  @font-face { font-family: Pix; src: url("${file('node_modules/@fontsource/pixelify-sans/files/pixelify-sans-latin-600-normal.woff2')}") }
  @font-face { font-family: VT; src: url("${file('node_modules/@fontsource/vt323/files/vt323-latin-400-normal.woff2')}") }
  html, body { margin: 0 }
  .card { width: 1200px; height: 630px; position: relative; overflow: hidden; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #fff8ec }
  .grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px); background-size: 48px 48px }
  .path { position: absolute; left: 64px; top: 52px; font-family: VT; font-size: 30px }
  .win { position: absolute; border: 4px solid #3b2346; background: #fff8ec }
  .bar { border-bottom: 4px solid #3b2346; padding: 6px 10px; font-family: Pix; font-size: 20px; color: #3b2346; display: flex; justify-content: space-between }
  .spark { position: absolute; font-size: 30px }`

const cards = {
  'social-card.png': `<style>${base}
    .card { background: #07030c }
    .blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: .75 }
    .name { position: absolute; left: 64px; bottom: 150px; font-weight: 800; font-size: 150px; line-height: .85; letter-spacing: -4px }
    .roles { position: absolute; left: 68px; bottom: 96px; font-weight: 700; font-size: 26px; letter-spacing: 1px; text-transform: uppercase }
    .url { position: absolute; left: 68px; bottom: 52px; font-family: VT; font-size: 34px; color: #8be0c4 }
    .win { right: 64px; top: 70px; width: 330px; box-shadow: 8px 8px 0 #3b2346; transform: rotate(2deg) }
    .bar { background: #ff8fcf }
    .body { padding: 18px; display: flex; gap: 16px; align-items: center; color: #3b2346 }
    .body img { width: 112px; height: 112px; image-rendering: pixelated }
    .body p { margin: 0; font-family: VT; font-size: 28px; line-height: 1.05 }
  </style><div class="card">
    <div class="blob" style="width:520px;height:420px;left:640px;top:-120px;background:conic-gradient(#ff8fcf,#8be0c4,#c9a7ff,#ffd166,#8fb7ff,#ff8fcf)"></div>
    <div class="blob" style="width:420px;height:360px;left:860px;top:330px;background:conic-gradient(#8fb7ff,#ff8fcf,#ffd166,#8be0c4,#8fb7ff)"></div>
    <div class="grid"></div>
    <div class="path" style="color:#8be0c4">C:\\HOME \\ ARYNLYNN.COM</div>
    <div class="spark" style="left:520px;top:60px;font-size:34px">✦</div><div class="spark" style="left:600px;top:250px;font-size:22px">✦</div>
    <div class="win"><div class="bar"><span>readme.txt</span><span>_ □ ×</span></div>
      <div class="body"><img src="${file('public/favicon.svg')}"><p>Software engineer.<br>Curriculum designer.<br>New York City.</p></div></div>
    <div class="name">${escape(site.shortName.replace(' ', '<br>')).replace('&lt;br&gt;', '<br>')}</div>
    <div class="roles">${escape(site.roles.join(' / '))}</div>
    <div class="url">arynlynn.com</div>
  </div>`,

  'social-card-wine.png': `<style>${base}
    .card { background: radial-gradient(circle at 78% 30%, #a3204f 0, #5e1030 38%, #1c0711 80%) }
    .name { position: absolute; left: 60px; top: 120px; font-weight: 800; font-size: 112px; line-height: .86; letter-spacing: -3px }
    .tag { position: absolute; left: 66px; top: 428px; font-family: Pix; font-size: 33px; color: #ff8fcf; max-width: 660px }
    .sub { position: absolute; left: 66px; top: 482px; font-family: VT; font-size: 34px; line-height: 1.05; max-width: 640px }
    .url { position: absolute; left: 66px; bottom: 38px; font-family: VT; font-size: 30px; color: #ffd166 }
    .win { right: 70px; top: 110px; width: 360px; box-shadow: 8px 8px 0 #1c0711; transform: rotate(3deg) }
    .bar { background: #ffd166 }
    .body { padding: 22px 18px; display: flex; align-items: flex-end; justify-content: center; gap: 18px; height: 200px }
    .hearts { text-align: center; font-family: VT; font-size: 30px; color: #d9468f; padding-bottom: 16px }
    .me { width: 96px; height: 96px; image-rendering: pixelated; align-self: flex-end }
  </style><div class="card"><div class="grid"></div>
    <div class="path" style="color:#ffd166">C:\\HOME \\ WINE_CELLAR.DAT</div>
    <div class="spark" style="left:640px;top:70px;color:#ffd166">✦</div><div class="spark" style="left:700px;top:330px;font-size:20px;color:#ff8fcf">✦</div>
    <div class="name">GEN Z<br>WITH A<br>GLASS</div>
    <div class="tag">${escape(winePreview.tagline)}.</div>
    <div class="sub">${escape(winePreview.subtitle)}</div>
    <div class="url">arynlynn.com/wine</div>
    <div class="win"><div class="bar"><span>tasting_card.dat</span><span>_ □ ×</span></div>
      <div class="body"><img class="me" src="${file('public/favicon.svg')}" alt="">${pixels(glass, 150)}${pixels(FLAVOR_ART.pear, 52)}</div>
      <div class="hearts">♥ ♥ ♥ ♥ ♡</div></div>
  </div>`,
}

const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] })
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  for (const [name, html] of Object.entries(cards)) {
    await page.goto(file('index.html')) // a file:// page, so the card can load local fonts and images
    await page.setContent(`<!doctype html><meta charset="utf-8">${html}`)
    await page.evaluate(() => document.fonts.ready)
    // Long text must not run under the pixel window or off the card.
    const overflow = await page.evaluate(() =>
      [...document.querySelectorAll('.tag, .sub, .roles')].some((el) => el.scrollWidth > el.clientWidth + 1 || el.getBoundingClientRect().right > 1180),
    )
    if (overflow) throw new Error(`${name}: some text doesn't fit; shorten it or adjust the card`)
    await page.locator('.card').screenshot({ path: join(root, 'public/images', name) })
    console.log(`Drew public/images/${name}`)
  }
} finally {
  await browser.close()
}
