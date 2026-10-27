// The search and link-preview tags for each page. The build writes them into every prerendered page
// (scripts/page-html.mjs) and the app swaps them as you move around (linkPreview.ts), so a link reads the
// same however you got to it. Loaded by plain Node in the build, hence the .ts import and no other imports.
import type { PageMeta } from './routes'
import { homePreview, site } from './site.ts'

export interface PreviewTags {
  /** The browser tab and search-result title. */
  title: string
  /** For search results. */
  description: string
  url: string
  /** The link-preview title and description. */
  previewTitle: string
  previewDescription: string
  article: boolean
  image: { src: string; alt: string }
}

/** A page's tags. With no page, the "not found" page's: the home page's preview under its own title. */
export function previewTags(page: PageMeta | undefined): PreviewTags {
  const home = !page || page.path === '/'
  return {
    title: page?.title ?? `Page not found · ${site.name}`,
    description: home ? homePreview.description : page.description,
    url: `${site.url}${page?.path ?? '/'}`,
    previewTitle: page?.previewTitle ?? page?.title ?? `${site.name} · ${site.tagline}`,
    previewDescription: home ? homePreview.previewDescription : page.description,
    article: page?.article ?? false,
    image: page?.image ?? homePreview.card,
  }
}
