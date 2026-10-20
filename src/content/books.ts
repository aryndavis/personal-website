// status: 'reading' shows face-out on the top shelf; 'read' and 'want' show as spines.

export type BookStatus = 'reading' | 'read' | 'want'
export type SpineColor = 'pink' | 'yellow' | 'mint' | 'lilac' | 'blue' | 'wine' | 'cream' | 'peach' | 'lime'

export interface Book {
  slug: string
  title: string
  author: string
  status: BookStatus
  color: SpineColor
  /** ISO date you started or finished it, e.g. 2026-08-01. Read books are sorted by this. */
  date?: string
  /** 1 to 5 hearts, for books you've finished. */
  rating?: number
  /** A sentence or two of thoughts. */
  note?: string
}

export const books: Book[] = [
  {
    slug: 'survivor',
    title: 'Survivor',
    author: 'Octavia E. Butler',
    status: 'reading',
    color: 'mint',
  },
  {
    slug: 'cult-classic',
    title: 'Cult Classic',
    author: 'Sloane Crosley',
    status: 'reading',
    color: 'lilac',
  },
]

export const currentlyReading = books.filter((book) => book.status === 'reading')
