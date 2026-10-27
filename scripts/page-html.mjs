// Builds each page's HTML from the built index.html: its own title, description, address and link-preview
// tags, plus a plain-HTML summary that search engines can read before the app starts. Used by prerender.mjs.

export const ORIGIN = 'https://arynlynn.com'

/** Separate static pages (public/), listed in the sitemap alongside the app's pages. */
export const STATIC_PAGES = ['/sms/', '/terms/', '/privacy/']

const escape = (text) =>
  String(text).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

/** Replaces exactly one match, so a template change can't silently skip a tag. */
function replaceOnce(html, pattern, replacement, what) {
  const matches = html.match(new RegExp(pattern.source, `${pattern.flags.replace('g', '')}g`))
  if (matches?.length !== 1) throw new Error(`index.html should have exactly one ${what}, found ${matches?.length ?? 0}`)
  return html.replace(pattern, replacement)
}

const PRERENDER = /<main class="prerender">[\s\S]*?<\/main>/

/** The HTML for one page. The home page keeps index.html as written. */
export function renderPage(template, page) {
  if (page.path === '/') return template
  const url = `${ORIGIN}${page.path}`
  let html = template
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${escape(page.title)}</title>`, '<title>')
  html = replaceOnce(html, /(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${escape(page.description)}$2`, 'description')
  html = replaceOnce(html, /(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`, 'canonical link')
  html = replaceOnce(html, /(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`, 'og:url')
  html = replaceOnce(html, /(<meta property="og:title" content=")[^"]*(")/, `$1${escape(page.previewTitle ?? page.title)}$2`, 'og:title')
  html = replaceOnce(html, /(<meta property="og:description" content=")[^"]*(")/, `$1${escape(page.description)}$2`, 'og:description')
  html = replaceOnce(html, /(<meta property="og:type" content=")[^"]*(")/, `$1${page.article ? 'article' : 'website'}$2`, 'og:type')
  if (page.image) {
    html = replaceOnce(html, /(<meta property="og:image" content=")[^"]*(")/, `$1${ORIGIN}${escape(page.image.src)}$2`, 'og:image')
    html = replaceOnce(html, /(<meta property="og:image:alt" content=")[^"]*(")/, `$1${escape(page.image.alt)}$2`, 'og:image:alt')
  }
  const links = page.links.map((link) => `          <li><a href="${escape(link.href)}">${escape(link.text)}</a></li>`).join('\n')
  const summary = `<main class="prerender">
        <h1>${escape(page.heading)}</h1>
        <p>${escape(page.description)}</p>
        <ul>
${links}
          <li><a href="/">Aryn Davis, home</a></li>
        </ul>
      </main>`
  return replaceOnce(html, PRERENDER, summary, 'prerender summary')
}

/** Served by Netlify for addresses that don't exist (with a 404 status); the app shows its "not found" page. */
export function notFoundPage(template) {
  let html = template
  html = replaceOnce(html, /<title>[^<]*<\/title>/, '<title>Page not found · Aryn Davis</title>', '<title>')
  html = replaceOnce(html, /\s*<link rel="canonical" href="[^"]*" \/>/, '\n    <meta name="robots" content="noindex" />', 'canonical link')
  return replaceOnce(
    html,
    PRERENDER,
    `<main class="prerender">
        <h1>Page not found</h1>
        <p><a href="/">Go to Aryn Davis's home page</a></p>
      </main>`,
    'prerender summary',
  )
}

export function sitemap(pages) {
  const urls = [...pages.map((page) => page.path), ...STATIC_PAGES]
    .map((path) => `  <url><loc>${escape(`${ORIGIN}${path}`)}</loc></url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

/**
 * Where a page's HTML goes in dist/: /wine/x → wine/x.html. Netlify serves that at /wine/x as is; a folder
 * with an index.html (wine/x/index.html) would get a redirect to /wine/x/ first.
 */
export const fileFor = (path) => (path === '/' ? 'index.html' : `${path.slice(1)}.html`)
