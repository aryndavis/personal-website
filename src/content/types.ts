// Post bodies are plain structured text. Nothing here is rendered as HTML.
export type Block =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'quote'; text: string }

export interface Entry {
  slug: string
  title: string
  /** ISO date, e.g. 2026-09-14 */
  date: string
  summary: string
  tags: string[]
  body: Block[]
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
