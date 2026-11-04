// Run with `npm test`. Real-path routing: which links the app handles itself, old #/ links, every page's
// metadata (loaded through Vite, like the build does) and the prerendered HTML.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { after, before, test } from 'node:test'
import { createServer } from 'vite'
import { fileFor, notFoundPage, redirectsFile, renderPage, sitemap, wineDomainRules, wineRewrites, wineRobots, wineSitemap } from './page-html.mjs'
import { appPathOn, fromHashLink, isAppPath, linkOn, normalize, opensInApp } from '../src/router.ts'

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
  for (const path of ['/', '/portfolio', '/portfolio/aryns-closet', '/education/x', '/engineering-notes', '/engineering-notes/x', '/wine', '/wine/x/', '/bookshelf/survivor']) {
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

test('on genzwithaglass.com, addresses are the wine section’s pages; elsewhere they’re the app’s paths', () => {
  for (const [address, path] of [['/', '/wine'], ['/smell-vs-taste', '/wine/smell-vs-taste'], ['/smell-vs-taste/', '/wine/smell-vs-taste']]) {
    assert.equal(appPathOn('genzwithaglass.com', address), path, address)
  }
  for (const host of ['arynlynn.com', 'localhost', 'deploy-preview-47--arynlynn.netlify.app']) {
    assert.equal(appPathOn(host, '/wine/smell-vs-taste'), '/wine/smell-vs-taste', host)
    assert.equal(appPathOn(host, '/portfolio'), '/portfolio', host)
  }
})

test('links stay on their own domain, and cross to the other one with a full address', () => {
  // On the wine blog: wine pages are plain paths, everything else is on arynlynn.com.
  assert.equal(linkOn('genzwithaglass.com', '/wine'), '/')
  assert.equal(linkOn('genzwithaglass.com', '/wine/smell-vs-taste'), '/smell-vs-taste')
  assert.equal(linkOn('genzwithaglass.com', '/portfolio'), 'https://arynlynn.com/portfolio')
  assert.equal(linkOn('genzwithaglass.com', '/sms/'), 'https://arynlynn.com/sms/')
  // On arynlynn.com: the wine blog is on its own domain, everything else is a path.
  assert.equal(linkOn('arynlynn.com', '/wine'), 'https://genzwithaglass.com/')
  assert.equal(linkOn('arynlynn.com', '/wine/smell-vs-taste'), 'https://genzwithaglass.com/smell-vs-taste')
  assert.equal(linkOn('arynlynn.com', '/portfolio'), '/portfolio')
  assert.equal(linkOn('arynlynn.com', '/winery'), '/winery', 'only the wine section moves')
  // Anywhere else (local, deploy previews) the whole site is one domain, as before.
  assert.equal(linkOn('localhost', '/wine/smell-vs-taste'), '/wine/smell-vs-taste')
})

test('on the wine domain, only links to wine pages open in place; files and the rest of the site load normally', () => {
  for (const address of ['/', '/smell-vs-taste', '/negretti-barolo-2021/']) assert.equal(opensInApp('genzwithaglass.com', address), true, address)
  for (const address of ['/sms/', '/privacy', '/portfolio', '/portfolio/software', '/engineering-notes/text-to-post', '/images/label.jpg', '/files/deck.pdf', '/api/sms']) {
    assert.equal(opensInApp('genzwithaglass.com', address), false, address)
  }
  // Elsewhere, the app's own sections, as before.
  assert.equal(opensInApp('arynlynn.com', '/portfolio'), true)
  assert.equal(opensInApp('arynlynn.com', '/sms/'), false)
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
  for (const path of [
    '/', '/portfolio', '/portfolio/curriculum', '/portfolio/curriculum/codepath-web101-web102', '/portfolio/software', '/portfolio/software/aryns-closet',
    '/education', '/engineering-notes', '/engineering-notes/text-to-post', '/wine', '/wine/hermann-j-wiemer-late-harvest-riesling-2023', '/bookshelf', '/bookshelf/survivor',
  ]) {
    assert.ok(paths.includes(path), path)
  }
  for (const path of paths) assert.ok(isAppPath(path) && normalize(path) === path, path)
})

test('the portfolio links to both tracks, and each project lives under its own track', async () => {
  const { projects } = await vite.ssrLoadModule('/src/content/portfolio.ts')
  const portfolio = pages.find((page) => page.path === '/portfolio')
  assert.deepEqual(portfolio.links.map((link) => link.href), ['/portfolio/curriculum', '/portfolio/software'], 'curriculum comes first')
  const curriculum = pages.find((page) => page.path === '/portfolio/curriculum')
  assert.deepEqual(
    curriculum.links.map((link) => link.href),
    projects.filter((project) => project.track === 'curriculum').map((project) => `/portfolio/curriculum/${project.slug}`),
    'a track lists its projects in the order portfolio.ts has them, not by date',
  )
  for (const project of projects) {
    const track = pages.find((page) => page.path === `/portfolio/${project.track}`)
    assert.ok(track.links.some((link) => link.href === `/portfolio/${project.track}/${project.slug}`), project.slug)
  }
})

test('school assignments link to real case studies, or to outside pages over http(s)', async () => {
  const { school, assignmentLinks } = await vite.ssrLoadModule('/src/content/school.ts')
  const links = assignmentLinks()
  assert.equal(links.length, school.assignments.length, 'every assignment has somewhere to go')
  for (const link of links) {
    if (link.external) assert.match(link.path, /^https?:\/\//, link.title)
    else assert.ok(pages.some((page) => page.path === link.path), link.path)
  }
})

test('old and wrong-track project addresses redirect to the project’s page', async () => {
  const { movedTo, portfolioRedirects } = await vite.ssrLoadModule('/src/routes.ts')
  const paths = new Set(pages.map((page) => page.path))
  const redirects = portfolioRedirects()
  assert.ok(redirects.length > 0)
  for (const { from, to } of redirects) {
    assert.ok(paths.has(to), `${from} → ${to} goes to a real page`)
    assert.ok(!paths.has(from), `${from} isn't also a page`)
    assert.equal(movedTo(from), to)
  }
  assert.equal(movedTo('/portfolio/aryns-closet'), '/portfolio/software/aryns-closet')
  assert.equal(movedTo('/portfolio/curriculum/aryns-closet'), '/portfolio/software/aryns-closet', 'a project under the wrong track')
  assert.equal(movedTo('/portfolio/made-space-hand-sewing'), '/portfolio/curriculum', 'a retired project opens its track')
  assert.equal(movedTo('/portfolio/curriculum'), undefined)
  assert.equal(movedTo('/portfolio/software/aryns-closet'), undefined)
  assert.equal(redirectsFile([{ from: '/a', to: '/b/a' }]), '/a /b/a 301\n')
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
  const previewTitles = pages.map((page) => page.previewTitle ?? page.title)
  assert.equal(new Set(previewTitles).size, previewTitles.length, 'no two pages share a link-preview title')
})

test('Gen Z With A Glass speaks for itself: wine card, wine titles, no day-job details', async () => {
  const { winePreview } = await vite.ssrLoadModule('/src/site.ts')
  const { winePosts } = await vite.ssrLoadModule('/src/content/wine.ts')
  const wine = pages.filter((p) => p.path === '/wine' || p.path.startsWith('/wine/'))
  assert.ok(wine.length >= 2)
  for (const p of wine) {
    assert.equal(p.image?.src, winePreview.image, p.path)
    assert.doesNotMatch(`${p.title} ${p.previewTitle ?? ''} ${p.description} ${p.image.alt}`, /software|engineer|microsoft|curriculum|portfolio/i, p.path)
  }
  const section = wine.find((p) => p.path === '/wine')
  assert.equal(section.title, `Gen Z With A Glass · ${winePreview.tagline}`)
  for (const post of wine.filter((p) => p.path !== '/wine')) {
    assert.match(post.title, / · Gen Z With A Glass$/)
    assert.ok(post.description.endsWith(winePreview.postSignoff) && post.description.length <= 160, post.description)
  }
  // A shared tasting note's preview title names the card it is (its own title, "revisited" and all);
  // the tab title doesn't change.
  for (const post of winePosts.filter((p) => p.kind === 'tasting')) {
    const p = wine.find((p) => p.path === `/wine/${post.slug}`)
    assert.equal(p.previewTitle, `Tasting card: ${post.title} · Gen Z With A Glass`)
    assert.equal(p.title, `${post.title} · Gen Z With A Glass`)
  }
  // Guides have a page under their own title, and their whole summary fits before the sign-off
  // (a summary that gets cut off mid-sentence in link previews means it needs shortening).
  const guides = winePosts.filter((p) => p.kind === 'guide')
  for (const post of guides) {
    const p = wine.find((p) => p.path === `/wine/${post.slug}`)
    assert.ok(p, `${post.slug} has a page`)
    assert.equal(p.previewTitle, undefined, post.slug)
    assert.equal(p.title, `${post.title} · Gen Z With A Glass`)
    assert.ok(p.description.startsWith(post.summary), `${post.slug}: shorten the summary so previews show all of it`)
  }
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
  // A wine page's address and site name are Gen Z With A Glass's.
  assert.match(html, /<link rel="canonical" href="https:\/\/genzwithaglass\.com\/a-post" \/>/)
  assert.match(html, /property="og:url" content="https:\/\/genzwithaglass\.com\/a-post"/)
  assert.match(html, /property="og:site_name" content="Gen Z With A Glass"/)
  assert.match(html, /property="og:type" content="article"/)
  assert.match(html, /<h1>Rosé &amp; &quot;friends&quot;<\/h1>/)
  assert.match(html, /<a href="https:\/\/genzwithaglass\.com\/">More from Gen Z With A Glass<\/a>/)
  assert.match(html, /<a href="https:\/\/arynlynn\.com\/">Aryn Davis, home<\/a>/)
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

test('the home page keeps index.html exactly as written, so its tags and the app’s agree', () => {
  assert.equal(renderPage(template, pages.find((p) => p.path === '/')), template)
})

test('a template missing a tag stops the build instead of writing a half-finished page', () => {
  assert.throws(() => renderPage(template.replace(/<link rel="canonical"[^>]*>/, ''), page), /exactly one canonical link/)
})

test('the 404 page is not indexed and has no canonical address', () => {
  const html = notFoundPage(template)
  assert.match(html, /<title>Page not found · Aryn Davis<\/title>/)
  assert.match(html, /<meta name="robots" content="noindex" \/>/)
  assert.doesNotMatch(html, /rel="canonical"/)
  // It's served for missing addresses on both domains, so its way home is a full address.
  assert.match(html, /<a href="https:\/\/arynlynn\.com\/">Go to Aryn Davis's home page<\/a>/)
  // Otherwise it previews like the home page.
  const home = renderPage(template, pages.find((p) => p.path === '/'))
  for (const tag of ['og:url', 'og:title', 'og:description', 'og:image', 'og:image:alt']) {
    const content = (text) => text.match(new RegExp(`property="${tag}" content="([^"]*)"`))[1]
    assert.equal(content(html), content(home), tag)
  }
})

test('the sitemap lists every page and the static pages, and files go where Netlify serves them', () => {
  const pages = [{ path: '/' }, { path: '/portfolio' }, { path: '/wine' }, { path: '/wine/a-post' }]
  const xml = sitemap(pages)
  assert.match(xml, /<loc>https:\/\/arynlynn\.com\/<\/loc>/)
  assert.match(xml, /<loc>https:\/\/arynlynn\.com\/privacy\/<\/loc>/)
  assert.doesNotMatch(xml, /wine/, 'wine pages are in genzwithaglass.com’s sitemap instead')
  const wine = wineSitemap(pages)
  assert.match(wine, /<loc>https:\/\/genzwithaglass\.com\/<\/loc>/)
  assert.match(wine, /<loc>https:\/\/genzwithaglass\.com\/a-post<\/loc>/)
  assert.doesNotMatch(wine, /arynlynn/)
  assert.equal(fileFor('/'), 'index.html')
  assert.equal(fileFor('/wine/a-post'), 'wine/a-post.html')
  assert.equal(fileFor('/portfolio'), 'portfolio.html')
})

test('genzwithaglass.com serves every wine page, and the wine blog’s old addresses move there', () => {
  const rules = wineDomainRules(pages)
  const to = (from) => rules.find((rule) => rule.from === from)
  const moved = (target) => ({ to: target, status: '301!' })
  const check = (from, expected) => assert.deepEqual(to(from) && { to: to(from).to, status: to(from).status }, expected, from)
  check('https://www.genzwithaglass.com/*', moved('https://genzwithaglass.com/:splat'))
  check('https://arynlynn.com/wine', moved('https://genzwithaglass.com/'))
  check('https://arynlynn.com/wine/*', moved('https://genzwithaglass.com/:splat'))
  check('https://genzwithaglass.com/wine/*', moved('https://genzwithaglass.com/:splat'))
  check('https://genzwithaglass.com/robots.txt', { to: '/robots-wine.txt', status: '200!' })
  check('https://genzwithaglass.com/sitemap.xml', { to: '/sitemap-wine.xml', status: '200!' })
  // The rest of the site's pages go back to arynlynn.com instead of showing up on the wine domain.
  for (const section of ['portfolio', 'education', 'engineering-notes', 'bookshelf', 'sms', 'terms', 'privacy']) {
    check(`https://genzwithaglass.com/${section}`, moved(`https://arynlynn.com/${section}`))
    check(`https://genzwithaglass.com/${section}/*`, moved(`https://arynlynn.com/${section}/:splat`))
  }
  // Files (the app's scripts, images, PDFs) are served on both domains: no rule catches them.
  for (const prefix of ['assets', 'images', 'files', 'fonts']) assert.ok(!rules.some((rule) => rule.from.startsWith(`https://genzwithaglass.com/${prefix}`)), prefix)
  // Nothing sends a genzwithaglass.com wine page back to arynlynn.com.
  assert.ok(!rules.some((rule) => rule.from.startsWith('https://genzwithaglass.com/') && rule.to.startsWith('https://arynlynn.com/wine')))
  assert.equal(wineRobots(), 'User-agent: *\nAllow: /\n\nSitemap: https://genzwithaglass.com/sitemap.xml\n')
})

test('the build serves each wine page at its genzwithaglass.com address, and only wine pages', () => {
  const paths = new Set(pages.map((page) => page.path))
  const rewrites = wineRewrites(pages)
  const wine = pages.filter((page) => page.path === '/wine' || page.path.startsWith('/wine/'))
  assert.equal(rewrites.length, wine.length)
  assert.deepEqual(rewrites.find((rule) => rule.to === '/wine'), { from: 'https://genzwithaglass.com/', to: '/wine', status: '200!' })
  for (const rule of rewrites) {
    assert.ok(paths.has(rule.to), `${rule.from} serves a real page`)
    assert.equal(rule.status, '200!')
    assert.equal(rule.from, `https://genzwithaglass.com${rule.to.slice('/wine'.length) || '/'}`)
  }
  assert.equal(redirectsFile([{ from: '/a', to: '/b', status: '200!' }]), '/a /b 200!\n')
})
