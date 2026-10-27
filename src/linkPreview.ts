// Keeps the page's search and link-preview tags in step with the address as you move around the app.
// Moving around never reloads, and sharing from Safari's share sheet reads these tags from the open page,
// so without this a tasting note opened from the wine rack would be shared as the wine rack.
import type { PageMeta } from './routes'
import { homePreview, site } from './site'

function set(selector: string, attribute: string, value: string) {
  document.head.querySelector(selector)?.setAttribute(attribute, value)
}

/** The same tags scripts/page-html.mjs writes into each prerendered page. Unknown pages get the home page's. */
export function showLinkPreview(page: PageMeta | undefined) {
  const home = !page || page.path === '/'
  const url = `${homePreview.url}${page?.path ?? '/'}`
  const image = page?.image ?? { src: homePreview.image, alt: homePreview.imageAlt }
  set('meta[name="description"]', 'content', home ? homePreview.description : page.description)
  set('link[rel="canonical"]', 'href', url)
  set('meta[property="og:url"]', 'content', url)
  set('meta[property="og:title"]', 'content', page ? (page.previewTitle ?? page.title) : `${site.name} · ${site.tagline}`)
  set('meta[property="og:description"]', 'content', home ? homePreview.previewDescription : page.description)
  set('meta[property="og:type"]', 'content', page?.article ? 'article' : 'website')
  set('meta[property="og:image"]', 'content', `${homePreview.url}${image.src}`)
  set('meta[property="og:image:alt"]', 'content', image.alt)
}
