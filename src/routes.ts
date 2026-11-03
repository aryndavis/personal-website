// Every page's address, title and description, for the browser tab, the prerendered pages
// (scripts/prerender.mjs) and the sitemap. Posts and projects get their own entries.
import { books } from './content/books'
import { buildLogPosts } from './content/buildLog'
import { educationPosts } from './content/education'
import { projects, projectsIn } from './content/portfolio'
import { newestFirst, type Entry, type Track } from './content/types'
import { winePosts } from './content/wine'
import { bookshelf, portfolioTracks, projectPath, sections, site, winePreview } from './site'

export interface PageMeta {
  path: string
  /** The full <title>, e.g. "Gen Z With A Glass · Aryn Davis". */
  title: string
  /** For search results and link previews; trimmed to fit. */
  description: string
  /** The page's main heading, for the plain-HTML version. */
  heading: string
  /** Links shown under it in the plain-HTML version: a section's posts, or the way back. */
  links: { href: string; text: string }[]
  /** Posts and projects are articles; sections and the home page aren't. */
  article: boolean
  /** A link-preview card other than the site's own (absolute path), with its description. */
  image?: { src: string; alt: string }
  /** The link-preview title, when it differs from the page's <title>. */
  previewTitle?: string
}

const MAX_DESCRIPTION = 160

/** Cuts long text at a word, with an ellipsis, so it fits a search result. */
export function trimDescription(text: string, max = MAX_DESCRIPTION) {
  const flat = text.replace(/\s+/g, ' ').trim()
  if (flat.length <= max) return flat
  const cut = flat.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : cut.length).replace(/[\s,.;:–—-]+$/, '')}…`
}

const titled = (name: string) => `${name} · ${site.name}`

function sectionPages(path: string, label: string, blurb: string, entries: { slug: string; title: string; summary: string }[]): PageMeta[] {
  return [
    {
      path,
      title: titled(label),
      description: trimDescription(blurb),
      heading: label,
      links: entries.map((entry) => ({ href: `${path}/${entry.slug}`, text: entry.title })),
      article: false,
    },
    ...entries.map((entry) => ({
      path: `${path}/${entry.slug}`,
      title: titled(entry.title),
      description: trimDescription(entry.summary || blurb),
      heading: entry.title,
      links: [{ href: path, text: `More from ${label}` }],
      article: true,
    })),
  ]
}

const entryPages = (key: keyof typeof sections, entries: Entry[]) => {
  const section = sections[key]
  return sectionPages(section.path, section.label, section.blurb, newestFirst(entries))
}

/** /portfolio links to its two tracks, and each track is a section of its own. */
function portfolioPages(): PageMeta[] {
  const portfolio = sections.portfolio
  const tracks = Object.entries(portfolioTracks) as [Track, (typeof portfolioTracks)[Track]][]
  return [
    {
      path: portfolio.path,
      title: titled(portfolio.label),
      description: trimDescription(portfolio.blurb),
      heading: portfolio.label,
      links: tracks.map(([, track]) => ({ href: track.path, text: track.label })),
      article: false,
    },
    ...tracks.flatMap(([key, track]) =>
      sectionPages(track.path, track.label, track.blurb, projectsIn(key)),
    ),
  ]
}

/** Projects taken off the site: their old address opens their track instead of "not found". */
const retiredProjects: { slug: string; track: Track }[] = [{ slug: 'made-space-hand-sewing', track: 'curriculum' }]

/**
 * Addresses that moved. Projects used to live at /portfolio/<slug>, before the portfolio split into
 * tracks, and a project under the wrong track (one that changed tracks) belongs under its own. Netlify
 * sends a 301 for each (dist/_redirects, from prerender.mjs) and the app follows old #/ links the same way.
 */
export function portfolioRedirects() {
  const tracks = Object.keys(portfolioTracks) as Track[]
  return [
    ...projects.flatMap((project) =>
      [`${sections.portfolio.path}/${project.slug}`, ...tracks.filter((track) => track !== project.track).map((track) => `${portfolioTracks[track].path}/${project.slug}`)].map(
        (from) => ({ from, to: projectPath(project) }),
      ),
    ),
    ...retiredProjects.map(({ slug, track }) => ({ from: `${sections.portfolio.path}/${slug}`, to: portfolioTracks[track].path })),
  ]
}

let redirects: Map<string, string> | undefined

/** Where an old project address went, or undefined. */
export function movedTo(path: string) {
  redirects ??= new Map(portfolioRedirects().map(({ from, to }) => [from, to]))
  return redirects.get(path)
}

/** Every page on the site, home first. */
export function allPages(): PageMeta[] {
  return [
    {
      path: '/',
      title: `${site.name} · ${site.tagline}`,
      description: '',
      heading: site.name,
      links: [],
      article: false,
    },
    ...portfolioPages(),
    ...entryPages('education', educationPosts),
    ...entryPages('buildlog', buildLogPosts),
    ...winePages(),
    ...sectionPages(
      bookshelf.path,
      bookshelf.label,
      bookshelf.blurb,
      books.map((book) => ({ slug: book.slug, title: `${book.title} by ${book.author}`, summary: book.note || book.summary || '' })),
    ),
  ]
}

/** Gen Z With A Glass has its own voice in search and link previews (see winePreview in site.ts). */
function winePages(): PageMeta[] {
  const wine = sections.wine
  const image = { src: winePreview.image, alt: winePreview.imageAlt }
  const subtitle = winePreview.subtitle.charAt(0).toLowerCase() + winePreview.subtitle.slice(1)
  const posts = newestFirst(winePosts)
  return [
    {
      path: wine.path,
      title: `${wine.label} · ${winePreview.tagline}`,
      description: trimDescription(`${winePreview.tagline}: ${subtitle}`),
      heading: wine.label,
      links: posts.map((post) => ({ href: `${wine.path}/${post.slug}`, text: post.title })),
      article: false,
      image,
    },
    ...posts.map((post) => ({
      path: `${wine.path}/${post.slug}`,
      title: `${post.title} · ${wine.label}`,
      // A shared tasting note says which wine's card it is.
      previewTitle: post.kind === 'tasting' ? `Tasting card: ${post.title} · ${wine.label}` : undefined,
      // The post's own summary, shortened if needed so the sign-off always fits.
      description: [trimDescription(post.summary, MAX_DESCRIPTION - winePreview.postSignoff.length - 1), winePreview.postSignoff].filter(Boolean).join(' '),
      heading: post.title,
      links: [{ href: wine.path, text: `More from ${wine.label}` }],
      article: true,
      image,
    })),
  ]
}

let byPath: Map<string, PageMeta> | undefined

/** The page at this path, or undefined if there's no such page. */
export function pageAt(path: string) {
  byPath ??= new Map(allPages().map((page) => [page.path, page]))
  return byPath.get(path)
}
