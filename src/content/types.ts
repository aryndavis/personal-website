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
  /** ISO date, e.g. 2026-09-14. Used for sorting; shown unless there's a period. */
  date: string
  /** Shown instead of the date for work that spans time, e.g. 'Aug 2021 – present'. */
  period?: string
  summary: string
  tags: string[]
  body: Block[]
  /** The same post on Substack; adds a "Read on Substack" link. */
  substackUrl?: string
}

export type Track = 'curriculum' | 'software'

export interface Project extends Entry {
  /** Which half of the portfolio it belongs to. */
  track: Track
  role: string
  audience: string
  format: string
  /** A screenshot or image on the project's card. src is a file in public/. */
  cover?: { src: string; alt: string }
  /** Buttons in the project's pop-up, e.g. the live site and the code. Only http(s) links are shown. */
  links?: { label: string; href: string }[]
}

export type WineStyle = 'red' | 'white' | 'rosé' | 'orange' | 'sparkling' | 'dessert'

/** Rough price per bottle: $ under $20, $$ $20–30, $$$ $30–50, $$$$ $50 and up. */
export type WinePrice = '$' | '$$' | '$$$' | '$$$$'

export type BuyAgain = 'yes' | 'maybe' | 'no'
/** Hearts out of 5, in halves. */
export const RATINGS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const
export type Rating = (typeof RATINGS)[number]

// Five-step scales for the tasting card's profile meters.
export const SWEETNESS = ['bone dry', 'dry', 'off-dry', 'medium sweet', 'sweet'] as const
export const BODY = ['light', 'medium-light', 'medium', 'medium-full', 'full'] as const
export const LEVEL = ['low', 'medium-low', 'medium', 'medium-high', 'high'] as const
/** Acidity and tannin can also be 'none' (tannin in most whites): the meter shows all five steps empty. */
export const LEVEL_OR_NONE = ['none', ...LEVEL] as const
/** Values that mean "nothing at all", so the meter shows no filled steps. */
const NOTHING: readonly string[] = ['bone dry', 'none']
/** How many of a meter's five steps to fill: 0 for "bone dry" or "none", otherwise the step's place on the scale. */
export const meterFill = (scale: readonly string[], value: string) => (NOTHING.includes(value) ? 0 : scale.indexOf(value) + 1)
export type Sweetness = (typeof SWEETNESS)[number]
export type Body = (typeof BODY)[number]
export type Level = (typeof LEVEL_OR_NONE)[number]

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
  /** Where the bottle was bought. */
  boughtAt?: string
  price?: WinePrice
  /** 1 to 5 hearts, in halves */
  rating?: number
  buyAgain?: BuyAgain
  /** A one- or two-sentence review shown at the top of the card. */
  verdict?: string
  sweetness?: Sweetness
  body?: Body
  acidity?: Level
  tannin?: Level
  /** Tasting notes: flavors and aromas, e.g. ['red currant', 'rose petal']. */
  flavors?: string[]
  /** What I actually ate with it. */
  pairedWith?: string
  /** Shown as "Try it with" when there's no pairedWith. */
  suggestedPairings?: string[]
}

export interface WinePost extends Entry {
  /** 'tasting' posts are bottles on the wine rack; 'guide' posts are recipe cards. */
  kind: 'tasting' | 'guide'
  wine?: WineDetails
}

export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

export const newestFirst = <T extends Entry>(entries: T[]) => [...entries].sort((a, b) => b.date.localeCompare(a.date))
