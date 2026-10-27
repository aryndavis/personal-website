// Keeps the page's search and link-preview tags in step with the address as you move around the app.
// Moving around never reloads, and sharing from Safari's share sheet reads these tags from the open page,
// so without this a tasting note opened from the wine rack would be shared as the wine rack.
import { previewTags } from './previewTags'
import type { PageMeta } from './routes'
import { site } from './site'

function set(selector: string, attribute: string, value: string) {
  document.head.querySelector(selector)?.setAttribute(attribute, value)
}

/** The tags scripts/page-html.mjs writes for this page, or for the 404 page when there's no such page. */
export function showLinkPreview(page: PageMeta | undefined) {
  const tags = previewTags(page)
  document.title = tags.title
  set('meta[name="description"]', 'content', tags.description)
  set('meta[property="og:url"]', 'content', tags.url)
  set('meta[property="og:title"]', 'content', tags.previewTitle)
  set('meta[property="og:description"]', 'content', tags.previewDescription)
  set('meta[property="og:type"]', 'content', tags.article ? 'article' : 'website')
  set('meta[property="og:image"]', 'content', `${site.url}${tags.image.src}`)
  set('meta[property="og:image:alt"]', 'content', tags.image.alt)

  // Like the 404 page: no canonical address and not indexed. A real page gets them back.
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
  if (page) {
    robots?.remove()
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.append(canonical)
    }
    canonical.href = tags.url
  } else {
    canonical?.remove()
    if (!robots) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      robots.content = 'noindex'
      document.head.append(robots)
    }
  }
}
