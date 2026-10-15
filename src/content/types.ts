// Post bodies are plain structured text. Nothing here is rendered as HTML.

/** A piece of paragraph text: plain, a link (http/https only), or italic. */
export type Inline = string | { text: string; href: string } | { text: string; em: true }

export type Block =
  | { type: 'p'; text: string | Inline[] }
  | { type: 'h'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'quote'; text: string }
  /** src is a file in public/, e.g. 'images/education/photo.jpg' */
  | { type: 'image'; src: string; alt: string; caption?: string }

export interface Entry {
  slug: string
  title: string
  /** Optional line shown under the title in the pop-up. */
  subtitle?: string
  /** ISO date, e.g. 2026-09-14 */
  date: string
  summary: string
  tags: string[]
  body: Block[]
  /** The same post on Substack; adds a "Read on Substack" link. */
  substackUrl?: string
}

export interface Project extends Entry {
  role: string
  audience: string
  format: string
}

export interface WinePost extends Entry {
  wine?: {
    name: string
    region: string
    grape: string
    vintage?: string
    /** 1 to 5 */
    rating: number
  }
}

export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

export const newestFirst = <T extends Entry>(entries: T[]) => [...entries].sort((a, b) => b.date.localeCompare(a.date))
