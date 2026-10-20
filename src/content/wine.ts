import { tastingNotes, type TastingNote } from './tastingNotes'
import { isTextNote } from './textNote'
import type { WinePost } from './types'
import texted from './wine.texts.json'

// Gen Z With A Glass. Two kinds of posts; newest can go anywhere, the site sorts by date.
//
// TASTING NOTES are bottles on the wine rack. Only wine, grape, vintage and date are required:
//
//   { wine: 'Domaine Example Poulsard', grape: 'Poulsard', vintage: 2022, date: '2026-10-20' },
//
// Add any of these when you have them (see tastingNotes.ts for details):
//   style: 'red' | 'white' | 'rosé' | 'orange' | 'sparkling' | 'dessert'  (guessed from the grape if left out)
//   The card:  producer, region, price: '$' | '$$' | '$$$' | '$$$$', rating: 1–5, buyAgain: 'yes' | 'maybe' | 'no',
//              verdict (a one-line review), flavors (your tasting notes: 'red currant, rose petal'),
//              sweetness: 'bone dry' | 'dry' | 'off-dry' | 'medium sweet' | 'sweet',
//              body: 'light' | 'medium-light' | 'medium' | 'medium-full' | 'full',
//              acidity, tannin: 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high',
//              pairedWith (what you ate), suggestedPairings (your ideas; made for you if both are left out)
//   The post:  moment, look, nose, palate, finish, thoughts, and title/summary/tags to override the defaults.
//
// Sample notes. Replace these with your own.
export const handNotes: TastingNote[] = [
  {
    wine: 'Sample Poulsard',
    grape: 'Poulsard',
    vintage: 2022,
    date: '2026-09-29',
    title: 'The bottle that made the whole table lean in',
    region: 'Jura, France',
    price: '$$',
    rating: 4,
    buyAgain: 'yes',
    verdict: 'Bright, a little wild, and impossible to stop sipping. Proof that light reds can steal the show.',
    flavors: 'red currant, rose petal, cranberry, white pepper',
    sweetness: 'dry',
    body: 'light',
    acidity: 'high',
    tannin: 'low',
    pairedWith: 'Roast chicken and a loud dinner table',
    moment: 'A bright, slightly unruly Jura red and a reminder to trust your curiosity. This is a sample tasting note.',
    look: 'pale ruby',
    nose: 'red currant, rose petal',
    palate: 'light, crunchy, a little wild',
  },
  {
    wine: 'Sample Albariño',
    grape: 'Albariño',
    vintage: 2024,
    date: '2026-03-08',
    title: 'Weeknight white under $20',
    region: 'Rías Baixas, Spain',
    price: '$$',
    rating: 3,
    buyAgain: 'maybe',
    verdict: 'Crisp, salty and easy to love for the price.',
    flavors: 'lemon, green apple, sea salt',
    sweetness: 'dry',
    body: 'medium-light',
    acidity: 'high',
    moment: 'A crisp, salty white that over-delivers with takeout. This is a sample tasting note.',
  },
]

// GUIDES are recipe cards: explainers, regions, how-tos. Write the body like the other blogs (see types.ts).
export const guides: WinePost[] = [
  {
    kind: 'guide',
    slug: 'a-beginners-map-of-sparkling-wine',
    title: 'A beginner’s map of sparkling wine',
    date: '2026-06-14',
    summary: 'Champagne, crémant, cava, pét-nat: what is actually different, explained simply.',
    tags: ['guide', 'sparkling'],
    body: [
      { type: 'p', text: 'This is a sample guide post.' },
      { type: 'list', items: ['Traditional method', 'Tank method', 'Ancestral method'] },
    ],
  },
]

// Notes texted in (netlify/functions/sms.ts adds them to wine.texts.json). Anything malformed is skipped.
export const textNotes: TastingNote[] = (texted as unknown[]).filter(isTextNote)

export const winePosts: WinePost[] = [...tastingNotes([...handNotes, ...textNotes], guides.map((guide) => guide.slug)), ...guides]
