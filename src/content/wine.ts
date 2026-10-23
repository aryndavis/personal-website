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
//   The card:  producer, region, boughtAt (the shop), price: '$' | '$$' | '$$$' | '$$$$', rating: 1–5 (halves ok, 4.5), buyAgain: 'yes' | 'maybe' | 'no',
//              verdict (a one-line review), flavors (your tasting notes: 'red currant, rose petal'),
//              sweetness: 'bone dry' | 'dry' | 'off-dry' | 'medium sweet' | 'sweet',
//              body: 'light' | 'medium-light' | 'medium' | 'medium-full' | 'full',
//              acidity, tannin: 'none' | 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high',
//              pairedWith (what you ate), suggestedPairings (your ideas; made for you if both are left out)
//   The post:  moment, look, nose, palate, finish, thoughts, and title/summary/tags to override the defaults.
//
// Tasting notes written here. (Notes can also be texted in; see textNotes below.)
export const handNotes: TastingNote[] = [
  {
    wine: 'Rukatac Bura',
    grape: 'Rukatac',
    vintage: 2025,
    style: 'orange',
    date: '2026-10-23',
    producer: 'Bura Estate Vintner',
    region: 'Dalmatia, Croatia',
    boughtAt: 'Table Wine, Jackson Heights',
    rating: 3.5,
    buyAgain: 'maybe',
    verdict: 'I’m not a huge fan of acidic wines, but this was still a fun tasting.',
    sweetness: 'dry',
    body: 'medium',
    acidity: 'medium-high',
    tannin: 'low',
    flavors: 'lemon zest, lime zest, flower petals, grass, hay',
    suggestedPairings: ['fish'],
    moment:
      'My dad (who is a high-level somm) was visiting my neighborhood recently, so we went to my local wine shop. He said he wanted to buy me an orange wine for my small wine fridge and picked this one out. Then we went back to my place, opened it, got high, and watched Harlem Nights. It was a great time.',
    finish: 'A lovely bit of acid on the aftertaste.',
  },
  {
    wine: 'Hermann J. Wiemer Late Harvest Riesling',
    grape: 'Riesling',
    vintage: 2023,
    style: 'white',
    date: '2026-10-18',
    producer: 'Hermann J. Wiemer',
    region: 'Finger Lakes, New York',
    boughtAt: 'Bed-Vyne Wine and Spirits, Bed-Stuy',
    price: '$$',
    rating: 4.5,
    buyAgain: 'yes',
    sweetness: 'medium sweet',
    body: 'light',
    acidity: 'low',
    flavors: 'pear, apricot',
    pairedWith: 'Pretzels, for the sweet and salty mix',
    suggestedPairings: ['a fruit tart', 'sweeter cheeses', 'salty crackers'],
    thoughts: 'Slightly acidic, but only enough to balance out the sweetness so it doesn’t get too sweet. A very light body.',
  },
]

// GUIDES are recipe cards: explainers, regions, how-tos. Write the body like the other blogs (see types.ts).
// Example:
//   { kind: 'guide', slug: 'sparkling-wine-map', title: 'A beginner’s map of sparkling wine', date: '2026-11-01',
//     summary: 'Champagne, crémant, cava, pét-nat: what’s actually different.', tags: ['guide'], body: [{ type: 'p', text: '…' }] },
export const guides: WinePost[] = []

// Notes texted in (netlify/functions/sms.ts adds them to wine.texts.json). Anything malformed is skipped.
export const textNotes: TastingNote[] = (texted as unknown[]).filter(isTextNote)

export const winePosts: WinePost[] = [...tastingNotes([...handNotes, ...textNotes], guides.map((guide) => guide.slug)), ...guides]
