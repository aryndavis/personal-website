// Sample books. Replace these with your own shelf.
// status: 'reading' shows face-out on the top shelf; 'read' and 'want' show as spines.

export type BookStatus = 'reading' | 'read' | 'want'
export type SpineColor = 'pink' | 'yellow' | 'mint' | 'lilac' | 'blue' | 'wine' | 'cream'

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
    slug: 'teaching-to-transgress',
    title: 'Teaching to Transgress',
    author: 'bell hooks',
    status: 'reading',
    color: 'pink',
    date: '2026-09-28',
    note: 'Sample entry. Write a line about why you picked this up.',
  },
  {
    slug: 'the-widow-clicquot',
    title: 'The Widow Clicquot',
    author: 'Tilar J. Mazzeo',
    status: 'reading',
    color: 'yellow',
    date: '2026-10-05',
  },
  {
    slug: 'understanding-by-design',
    title: 'Understanding by Design',
    author: 'Grant Wiggins & Jay McTighe',
    status: 'read',
    color: 'blue',
    date: '2026-08-14',
    rating: 5,
    note: 'Sample entry. Short thoughts show up in the pop-up.',
  },
  {
    slug: 'pedagogy-of-the-oppressed',
    title: 'Pedagogy of the Oppressed',
    author: 'Paulo Freire',
    status: 'read',
    color: 'wine',
    date: '2026-06-02',
    rating: 4,
  },
  {
    slug: 'wine-folly-magnum-edition',
    title: 'Wine Folly: Magnum Edition',
    author: 'Madeline Puckette & Justin Hammack',
    status: 'read',
    color: 'mint',
    date: '2026-04-20',
    rating: 4,
  },
  {
    slug: 'braiding-sweetgrass',
    title: 'Braiding Sweetgrass',
    author: 'Robin Wall Kimmerer',
    status: 'read',
    color: 'lilac',
    date: '2026-02-11',
    rating: 5,
  },
  {
    slug: 'range',
    title: 'Range',
    author: 'David Epstein',
    status: 'want',
    color: 'cream',
  },
  {
    slug: 'the-sommeliers-atlas-of-taste',
    title: "The Sommelier's Atlas of Taste",
    author: 'Rajat Parr & Jordan Mackay',
    status: 'want',
    color: 'pink',
  },
]

export const currentlyReading = books.filter((book) => book.status === 'reading')
