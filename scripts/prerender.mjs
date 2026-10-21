// Runs after `vite build` (see the build script). Writes a page for every address so each one has its own
// title, description and link preview on first load, plus dist/sitemap.xml and dist/404.html.
// The app itself is unchanged: once loaded, moving between pages never reloads.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { fileFor, notFoundPage, renderPage, sitemap } from './page-html.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

// Load the page list through Vite, so content files (TypeScript, JSON) work exactly as in the app.
const vite = await createServer({ root, logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom' })
let pages
try {
  ;({ allPages: pages } = await vite.ssrLoadModule('/src/routes.ts'))
  pages = pages()
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
console.log(`Prerendered ${pages.length} pages, 404.html and sitemap.xml.`)
