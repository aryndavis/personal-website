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

export type WineStyle = 'red' | 'white' | 'rosé' | 'orange' | 'sparkling' | 'dessert'

/** Rough price per bottle: $ under $15, $$ $15–30, $$$ $30–60, $$$$ over $60. */
export type WinePrice = '$' | '$$' | '$$$' | '$$$$'

export type BuyAgain = 'yes' | 'maybe' | 'no'

/** The tasting card. Only name, grape and vintage are required. */
export interface WineDetails {
  name: string
  grape: string
  /** A year, or 'NV' for non-vintage. */
  vintage: string
  /** Sets the bottle color on the wine rack. */
  style?: WineStyle
  producer?: string
  region?: string
  price?: WinePrice
  /** 1 to 5 hearts */
  rating?: number
  buyAgain?: BuyAgain
}

export interface WinePost extends Entry {
  /** 'tasting' posts are bottles on the wine rack; 'guide' posts are recipe cards. */
  kind: 'tasting' | 'guide'
  wine?: WineDetails
}

export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

export const newestFirst = <T extends Entry>(entries: T[]) => [...entries].sort((a, b) => b.date.localeCompare(a.date))
