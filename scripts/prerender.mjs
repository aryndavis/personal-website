// Runs after `vite build` (see the build script). Writes a page for every address so each one has its own
// title, description and link preview on first load, plus the sitemaps (arynlynn.com's and genzwithaglass.com's),
// dist/404.html and dist/_redirects.
// The app itself is unchanged: once loaded, moving between pages never reloads.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { fileFor, notFoundPage, redirectsFile, renderPage, sitemap, wineDomainRules, wineRobots, wineSitemap } from './page-html.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

// Load the page list through Vite, so content files (TypeScript, JSON) work exactly as in the app.
const vite = await createServer({ root, logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom' })
let pages
let redirects
try {
  const routes = await vite.ssrLoadModule('/src/routes.ts')
  pages = routes.allPages()
  redirects = routes.portfolioRedirects()
} finally {
  await vite.close()
}

const template = await readFile(join(dist, 'index.html'), 'utf8')
for (const page of pages) {
  const file = join(dist, fileFor(page.path))
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, renderPage(template, page))
}
await writeFile(join(dist, '404.html'), notFoundPage(template))
await writeFile(join(dist, 'sitemap.xml'), sitemap(pages))
await writeFile(join(dist, 'sitemap-wine.xml'), wineSitemap(pages))
await writeFile(join(dist, 'robots-wine.txt'), wineRobots())
// Hand-written rules (public/_redirects, copied in by Vite, if there is one) come first: Netlify uses the first match.
const wineRules = wineDomainRules(pages)
const handWritten = await readFile(join(dist, '_redirects'), 'utf8').catch(() => '')
await writeFile(join(dist, '_redirects'), `${handWritten}${handWritten && !handWritten.endsWith('\n') ? '\n' : ''}${redirectsFile([...wineRules, ...redirects])}`)
console.log(`Prerendered ${pages.length} pages, 404.html and both sitemaps, with ${wineRules.length} genzwithaglass.com rules and ${redirects.length} portfolio redirects.`)
