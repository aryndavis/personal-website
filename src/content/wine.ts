import type { WinePost } from './types'

// Sample posts. Replace these with your own tasting notes.
export const winePosts: WinePost[] = [
  {
    slug: 'the-bottle-that-made-the-table-lean-in',
    title: 'The bottle that made the whole table lean in',
    date: '2026-09-29',
    summary: 'A bright, slightly unruly Jura red and a reminder to trust your curiosity.',
    tags: ['tasting note', 'France'],
    wine: { name: 'Sample Poulsard', region: 'Jura, France', grape: 'Poulsard', vintage: '2022', rating: 4 },
    body: [
      { type: 'p', text: 'This is a sample tasting note. Describe the moment, then the wine.' },
      { type: 'h', text: 'In the glass' },
      { type: 'list', items: ['Color: pale ruby', 'Nose: red currant, rose petal', 'Palate: light, crunchy, a little wild'] },
    ],
  },
  {
    slug: 'a-beginners-map-of-sparkling-wine',
    title: 'A beginner’s map of sparkling wine',
    date: '2026-06-14',
    summary: 'Champagne, crémant, cava, pét-nat: what is actually different, explained simply.',
    tags: ['guide', 'sparkling'],
    body: [
      { type: 'p', text: 'This is a sample guide post. Not every wine post needs a tasting card.' },
      { type: 'list', items: ['Traditional method', 'Tank method', 'Ancestral method'] },
    ],
  },
  {
    slug: 'weeknight-white-under-20',
    title: 'Weeknight white under $20',
    date: '2026-03-08',
    summary: 'A crisp, salty white that over-delivers with takeout.',
    tags: ['tasting note', 'Spain'],
    wine: { name: 'Sample Albariño', region: 'Rías Baixas, Spain', grape: 'Albariño', vintage: '2024', rating: 3 },
    body: [{ type: 'p', text: 'This is a sample tasting note.' }],
  },
]
