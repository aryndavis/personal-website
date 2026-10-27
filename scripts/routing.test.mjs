// Run with `npm test`. Real-path routing: which links the app handles itself, old #/ links, every page's
// metadata (loaded through Vite, like the build does) and the prerendered HTML.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { after, before, test } from 'node:test'
import { createServer } from 'vite'
import { fileFor, notFoundPage, renderPage, sitemap } from './page-html.mjs'
import { fromHashLink, isAppPath, normalize } from '../src/router.ts'

const template = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

// ---------- the router's rules ----------

test('paths are tidied the same way everywhere', () => {
  for (const [input, expected] of [
    ['/', '/'], ['', '/'], ['/wine/', '/wine'], ['/wine//', '/wine'], ['/wine/ros%C3%A9', '/wine/rosé'], ['/bad%E0%A4%A', '/bad%E0%A4%A'],
  ]) {
    assert.equal(normalize(input), expected, input)
  }
})

test('the app handles its own sections; SMS, terms, privacy and files load as separate pages', () => {
  for (const path of ['/', '/portfolio', '/portfolio/aryns-closet', '/education/x', '/wine', '/wine/x/', '/bookshelf/survivor']) {
    assert.equal(isAppPath(path), true, path)
  }
  for (const path of ['/sms', '/sms/', '/terms', '/privacy/', '/images/social-card.png', '/sitemap.xml', '/winery', '/api/sms']) {
    assert.equal(isAppPath(path), false, path)
  }
})

test('old #/ links map to the new addresses; other #fragments are left alone', () => {
  assert.equal(fromHashLink('#/wine/hermann-j-wiemer-late-harvest-riesling-2023'), '/wine/hermann-j-wiemer-late-harvest-riesling-2023')
  assert.equal(fromHashLink('#/portfolio/'), '/portfolio')
  assert.equal(fromHashLink('#/'), '/')
  for (const hash of ['', '#', '#main', '#top']) assert.equal(fromHashLink(hash), null, hash)
})

// ---------- every page ----------

let pages
let vite
before(async () => {
  vite = await createServer({ logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom' })
  pages = (await vite.ssrLoadModule('/src/routes.ts')).allPages()
})
after(() => vite?.close())

test('every section, post, project and book has exactly one page, under an address the app handles', () => {
  const paths = pages.map((page) => page.path)
  assert.equal(new Set(paths).size, paths.length, 'no two pages share an address')
  for (const path of ['/', '/portfolio', '/portfolio/aryns-closet', '/education', '/wine', '/wine/hermann-j-wiemer-late-harvest-riesling-2023', '/bookshelf', '/bookshelf/survivor']) {
    assert.ok(paths.includes(path), path)
  }
  for (const path of paths) assert.ok(isAppPath(path) && normalize(path) === path, path)
})

test('each page has its own title, and a description that fits a search result', () => {
  for (const page of pages) {
    assert.match(page.title, / · |Aryn Davis/, page.path)
    if (page.path !== '/') {
      assert.ok(page.description.length > 0 && page.description.length <= 160, `${page.path}: ${page.description.length} characters`)
    }
  }
  const titles = pages.map((page) => page.title)
  assert.equal(new Set(titles).size, titles.length, 'no two pages share a title')
})

test('Gen Z With A Glass speaks for itself: wine card, wine titles, no day-job details', async () => {
  const { winePreview } = await vite.ssrLoadModule('/src/site.ts')
  const wine = pages.filter((p) => p.path === '/wine' || p.path.startsWith('/wine/'))
  assert.ok(wine.length >= 2)
  for (const p of wine) {
    assert.equal(p.image?.src, winePreview.image, p.path)
    assert.doesNotMatch(`${p.title} ${p.description} ${p.image.alt}`, /software|engineer|microsoft|curriculum|portfolio/i, p.path)
  }
  const section = wine.find((p) => p.path === '/wine')
  assert.equal(section.title, `Gen Z With A Glass · ${winePreview.tagline}`)
  for (const post of wine.filter((p) => p.path !== '/wine')) {
    assert.match(post.title, / · Gen Z With A Glass$/)
    assert.ok(post.description.endsWith(winePreview.postSignoff) && post.description.length <= 160, post.description)
  }
  // A shared tasting note's preview title names the wine whose card it is; the tab title doesn't change.
  const barolo = wine.find((p) => p.path === '/wine/negretti-barolo-2021')
  assert.equal(barolo.previewTitle, 'Tasting card: Negretti Barolo 2021 · Gen Z With A Glass')
  assert.equal(barolo.title, 'Negretti Barolo 2021 · Gen Z With A Glass')
  // Everything else keeps the site's own card.
  assert.ok(pages.filter((p) => !wine.includes(p)).every((p) => p.image === undefined))
})

test('trimDescription cuts at a word and adds an ellipsis', async () => {
  const { trimDescription } = await vite.ssrLoadModule('/src/routes.ts')
  assert.equal(trimDescription('short'), 'short')
  const long = trimDescription('word '.repeat(60))
  assert.ok(long.length <= 160 && long.endsWith('word…'), long)
})

// ---------- the prerendered HTML ----------

const page = {
  path: '/wine/a-post',
  title: 'Rosé & "friends" · Aryn Davis',
  description: 'Pink <wine> notes',
  heading: 'Rosé & "friends"',
  links: [{ href: '/wine', text: 'More from Gen Z With A Glass' }],
  article: true,
}

test('a post page gets its own title, description, address and preview tags, escaped', () => {
  const html = renderPage(template, page)
  assert.match(html, /<title>Rosé &amp; &quot;friends&quot; · Aryn Davis<\/title>/)
  assert.match(html, /name="description"\s+content="Pink &lt;wine&gt; notes"/)
  assert.match(html, /<link rel="canonical" href="https:\/\/arynlynn\.com\/wine\/a-post" \/>/)
  assert.match(html, /property="og:url" content="https:\/\/arynlynn\.com\/wine\/a-post"/)
  assert.match(html, /property="og:type" content="article"/)
  assert.match(html, /<h1>Rosé &amp; &quot;friends&quot;<\/h1>/)
  assert.match(html, /<a href="\/wine">More from Gen Z With A Glass<\/a>/)
  assert.doesNotMatch(html, /<wine>/, 'no raw HTML from content')
  // Everything else (scripts, styles, the structured data about Aryn) is kept.
  assert.equal(html.match(/<script/g).length, template.match(/<script/g).length)
})

test('a preview title changes og:title only, not the tab title', () => {
  const html = renderPage(template, { ...page, previewTitle: 'Tasting card: Rosé' })
  assert.match(html, /property="og:title" content="Tasting card: Rosé"/)
  assert.match(html, /<title>Rosé &amp; &quot;friends&quot; · Aryn Davis<\/title>/)
})

test('a page with its own card swaps the preview image and its description; others keep the site card', () => {
  const html = renderPage(template, { ...page, image: { src: '/images/social-card-wine.png', alt: 'Wine & "friends"' } })
  assert.match(html, /property="og:image" content="https:\/\/arynlynn\.com\/images\/social-card-wine\.png"/)
  assert.match(html, /property="og:image:alt" content="Wine &amp; &quot;friends&quot;"/)
  assert.match(renderPage(template, page), /property="og:image" content="https:\/\/arynlynn\.com\/images\/social-card\.png"/)
})

test('the home page keeps index.html exactly as written', () => {
  assert.equal(renderPage(template, { ...page, path: '/' }), template)
})

test('a template missing a tag stops the build instead of writing a half-finished page', () => {
  assert.throws(() => renderPage(template.replace(/<link rel="canonical"[^>]*>/, ''), page), /exactly one canonical link/)
})

test('the 404 page is not indexed and has no canonical address', () => {
  const html = notFoundPage(template)
  assert.match(html, /<title>Page not found · Aryn Davis<\/title>/)
  assert.match(html, /<meta name="robots" content="noindex" \/>/)
  assert.doesNotMatch(html, /rel="canonical"/)
})

test('the sitemap lists every page and the static pages, and files go where Netlify serves them', () => {
  const xml = sitemap([{ path: '/' }, { path: '/wine/a-post' }])
  assert.match(xml, /<loc>https:\/\/arynlynn\.com\/<\/loc>/)
  assert.match(xml, /<loc>https:\/\/arynlynn\.com\/wine\/a-post<\/loc>/)
  assert.match(xml, /<loc>https:\/\/arynlynn\.com\/privacy\/<\/loc>/)
  assert.equal(fileFor('/'), 'index.html')
  assert.equal(fileFor('/wine/a-post'), 'wine/a-post.html')
  assert.equal(fileFor('/portfolio'), 'portfolio.html')
})
