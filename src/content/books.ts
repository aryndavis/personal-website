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
  /** What the book is about, in a few sentences. Shown as "About the book". */
  summary?: string
  /** 1 to 5 hearts, in halves, for books you've finished. Books you're reading show "when I finish" until you add one. */
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
    summary:
      'Alanna, an orphaned girl who grew up fending for herself on a ruined Earth, is taken in by a group of religious colonists who flee to a faraway planet. There they get pulled into a war between two furred native peoples, and when Alanna is captured by the other side, she has to decide where she really belongs.',
  },
  {
    slug: 'cult-classic',
    title: 'Cult Classic',
    author: 'Sloane Crosley',
    status: 'reading',
    color: 'lilac',
    summary:
      'Lola keeps running into her exes all over New York, one after another, and it’s too weird to be a coincidence. The trail leads back to her old boss, a magazine editor turned self-help guru, and a strange experiment in nostalgia and love.',
  },
  {
    slug: 'empire-of-ai',
    title: 'Empire of AI',
    author: 'Karen Hao',
    status: 'want',
    color: 'blue',
    summary:
      'A reporter who has covered OpenAI since its early days tells the inside story of the company and Sam Altman, from its nonprofit beginnings to the 2023 boardroom fight. She argues that the AI industry works like a new kind of empire, and she travels from Kenya to Chile to meet the workers and communities paying for it.',
  },
]

export const currentlyReading = books.filter((book) => book.status === 'reading')
