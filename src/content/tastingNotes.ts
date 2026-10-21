import type { Block, Body, BuyAgain, Level, Rating, Sweetness, WinePost, WinePrice, WineStyle } from './types'

/**
 * What you write for a tasting note. Only `wine`, `grape`, `vintage` and `date` are required;
 * the title, link, summary, tags and post layout are made for you.
 */
export interface TastingNote {
  /** The wine's name as it appears on the label. */
  wine: string
  /** One grape, or a blend like 'Grenache, Syrah'. */
  grape: string
  /** A year, or 'NV' for non-vintage. */
  vintage: string | number
  /** When you posted it, e.g. '2026-10-20'. */
  date: string

  // Optional: the tasting card
  /** Guessed from the grape and name when left out (e.g. Pinot Noir → red, Champagne → sparkling). */
  style?: WineStyle
  producer?: string
  region?: string
  /** Where you bought the bottle, e.g. 'Bed-Vyne Wine & Spirits, Bed-Stuy'. */
  boughtAt?: string
  /** $ under $15, $$ $15–30, $$$ $30–60, $$$$ over $60 */
  price?: WinePrice
  /** 1 to 5 hearts, in halves: 4.5 shows four and a half */
  rating?: Rating
  buyAgain?: BuyAgain
  /** A one- or two-sentence review at the top of the card. */
  verdict?: string
  /** 'bone dry' | 'dry' | 'off-dry' | 'medium sweet' | 'sweet'. Reds, orange and dessert wines are guessed if left out. */
  sweetness?: Sweetness
  /** 'light' | 'medium-light' | 'medium' | 'medium-full' | 'full' */
  body?: Body
  /** 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high' */
  acidity?: Level
  /** Same scale as acidity, including 'none' (most whites); usually only for reds and orange wines. */
  tannin?: Level
  /** Tasting notes: a list, or one comma-separated string like 'red currant, rose petal, pepper'. */
  flavors?: string[] | string
  /** What you ate with it. */
  pairedWith?: string
  /** Your own pairing ideas; shown next to `pairedWith` as "would also go with". If you leave out both, suggestions are made from the grape or style. */
  suggestedPairings?: string[]

  // Optional: the post
  /** Where you were, who you were with, why you opened it. */
  moment?: string
  look?: string
  nose?: string
  palate?: string
  finish?: string
  /** Anything else. Blank lines start new paragraphs. */
  thoughts?: string | Block[]

  // Optional: overrides
  /** Defaults to the wine's name and vintage. */
  title?: string
  /** The line on the home page and in previews. Defaults to the verdict, then the first sentence of `moment`. */
  summary?: string
  /** Extra tags. 'tasting note' and the style are added automatically. */
  tags?: string[]
}

// Accents and case don't matter for matching: 'Albariño' and 'albarino' are the same.
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

const RED_GRAPES = [
  'cabernet sauvignon', 'cabernet franc', 'merlot', 'pinot noir', 'spatburgunder', 'syrah', 'shiraz', 'grenache', 'garnacha',
  'tempranillo', 'sangiovese', 'nebbiolo', 'malbec', 'zinfandel', 'primitivo', 'gamay', 'carmenere', 'mourvedre', 'monastrell',
  'barbera', 'dolcetto', 'petite sirah', 'petit verdot', 'pinotage', 'poulsard', 'trousseau', 'aglianico', "nero d'avola",
  'montepulciano', 'touriga nacional', 'tannat', 'carignan', 'carinena', 'cinsault', 'corvina', 'lagrein', 'blaufrankisch',
  'zweigelt', 'mencia', 'frappato', 'schiava', 'saperavi', 'xinomavro', 'dornfelder', 'st. laurent', 'nerello mascalese',
  'bobal', 'pais', 'counoise', 'refosco', 'teroldego', 'sagrantino', 'lambrusco',
]
const WHITE_GRAPES = [
  'chardonnay', 'sauvignon blanc', 'riesling', 'pinot grigio', 'pinot gris', 'pinot blanc', 'pinot bianco', 'chenin blanc',
  'albarino', 'alvarinho', 'gruner veltliner', 'viognier', 'gewurztraminer', 'semillon', 'muscadet', 'melon de bourgogne',
  'vermentino', 'assyrtiko', 'torrontes', 'verdejo', 'godello', 'garganega', 'trebbiano', 'fiano', 'falanghina', 'greco',
  'marsanne', 'roussanne', 'savagnin', 'moscato', 'muscat', 'furmint', 'picpoul', 'aligote', 'arneis', 'cortese', 'verdicchio',
  'malvasia', 'macabeo', 'viura', 'xarel-lo', 'xarello', 'palomino', 'silvaner', 'muller-thurgau', 'hondarrabi zuri',
  'loureiro', 'encruzado', 'jacquere', 'friulano', 'ribolla gialla', 'carricante', 'catarratto', 'grillo', 'pecorino',
]
// Checked against the wine's name first, since these beat the grape (a Champagne is often Pinot Noir).
const NAME_HINTS: [RegExp, WineStyle][] = [
  [/\b(champagne|cava|prosecco|cremant|pet[- ]?nat|petillant|spumante|sekt|franciacorta|lambrusco|sparkling|brut)\b/, 'sparkling'],
  [/\b(sauternes|port|porto|tokaji|ice ?wine|eiswein|late harvest|vin santo|sherry|madeira|dessert)\b/, 'dessert'],
  [/\b(orange|skin[- ]contact|amber|ramato)\b/, 'orange'],
  [/\b(rose|rosato|rosado|clairet)\b/, 'rosé'],
]

/** Best guess at a wine's style from its name and grape, or undefined if there's no good guess. */
export function guessStyle(name: string, grape: string): WineStyle | undefined {
  const label = normalize(name)
  for (const [pattern, style] of NAME_HINTS) if (pattern.test(label)) return style
  // For a blend, go by the first grape listed.
  for (const part of normalize(grape).split(/,|\/|&|\+|\band\b/)) {
    const first = part.trim()
    if (RED_GRAPES.some((red) => first.includes(red))) return 'red'
    if (WHITE_GRAPES.some((white) => first.includes(white))) return 'white'
  }
  return undefined
}

// Classic pairings, used when a note doesn't say what it was paired with. Grape first, then style.
const GRAPE_PAIRINGS: [string, string[]][] = [
  ['cabernet sauvignon', ['steak', 'burgers', 'aged cheddar']],
  ['merlot', ['roast chicken', 'mushroom pasta', 'meatloaf']],
  ['pinot noir', ['salmon', 'roast chicken', 'mushroom risotto']],
  ['syrah', ['barbecue', 'lamb', 'peppery stews']],
  ['shiraz', ['barbecue', 'lamb', 'peppery stews']],
  ['grenache', ['roast vegetables', 'lamb', 'chorizo']],
  ['garnacha', ['roast vegetables', 'lamb', 'chorizo']],
  ['tempranillo', ['tapas', 'roast pork', 'manchego']],
  ['sangiovese', ['pizza', 'tomato pasta', 'parmesan']],
  ['nebbiolo', ['truffle pasta', 'braised beef', 'risotto']],
  ['malbec', ['steak', 'empanadas', 'chimichurri']],
  ['zinfandel', ['barbecue ribs', 'pizza', 'burgers']],
  ['gamay', ['charcuterie', 'roast chicken', 'picnic food']],
  ['cabernet franc', ['roast pork', 'goat cheese', 'grilled vegetables']],
  ['poulsard', ['roast chicken', 'charcuterie', 'comté']],
  ['barbera', ['pizza', 'lasagna', 'salumi']],
  ['chardonnay', ['roast chicken', 'lobster', 'creamy pasta']],
  ['sauvignon blanc', ['goat cheese', 'green salads', 'shellfish']],
  ['riesling', ['spicy Thai or Indian food', 'pork', 'sushi']],
  ['pinot grigio', ['light seafood', 'salads', 'antipasti']],
  ['pinot gris', ['spiced dishes', 'pork', 'creamy cheeses']],
  ['chenin blanc', ['pork', 'spicy food', 'soft cheeses']],
  ['albarino', ['oysters', 'grilled fish', 'sushi']],
  ['gruner veltliner', ['schnitzel', 'asparagus', 'salads']],
  ['viognier', ['curries', 'roast chicken', 'apricot desserts']],
  ['gewurztraminer', ['spicy Asian food', 'Munster cheese', 'curries']],
  ['vermentino', ['grilled fish', 'pesto pasta', 'salads']],
  ['assyrtiko', ['grilled fish', 'Greek salad', 'oysters']],
  ['muscadet', ['oysters', 'mussels', 'fish and chips']],
  ['melon de bourgogne', ['oysters', 'mussels', 'fish and chips']],
  ['moscato', ['fruit desserts', 'spicy food', 'brunch']],
]
const STYLE_PAIRINGS: Record<WineStyle, string[]> = {
  red: ['roast meats', 'pasta with red sauce', 'hard cheeses'],
  white: ['seafood', 'chicken', 'salads'],
  'rosé': ['salads', 'grilled shrimp', 'picnic food'],
  orange: ['spiced dishes', 'roast vegetables', 'funky cheeses'],
  sparkling: ['fried food', 'oysters', 'potato chips'],
  dessert: ['blue cheese', 'fruit tarts', 'dark chocolate'],
}

/** Pairing ideas from the grape (the first one, for a blend), then the style. */
export function suggestPairings(grape: string, style?: WineStyle): string[] | undefined {
  const first = normalize(grape).split(/,|\/|&|\+|\band\b/)[0].trim()
  const match = GRAPE_PAIRINGS.find(([name]) => first.includes(name))
  if (match && style !== 'sparkling' && style !== 'dessert') return match[1]
  return style ? STYLE_PAIRINGS[style] : undefined
}

/** Only for styles that are almost always one way. Whites, rosés and sparkling vary too much to guess. */
function guessSweetness(style?: WineStyle): Sweetness | undefined {
  if (style === 'red' || style === 'orange') return 'dry'
  if (style === 'dessert') return 'sweet'
  return undefined
}

const list = (value?: string[] | string) =>
  (typeof value === 'string' ? value.split(',') : (value ?? [])).map((item) => item.trim()).filter(Boolean)

const slugify = (text: string) =>
  normalize(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'wine'

const firstSentence = (text: string) => text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text

const paragraphs = (text: string): Block[] =>
  text
    .split(/\n\s*\n/)
    .map((part) => part.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .map((part) => ({ type: 'p', text: part }))

function toPost(note: TastingNote, slug: string): WinePost {
  const vintage = String(note.vintage).trim()
  const style = note.style ?? guessStyle(note.wine, note.grape)

  const body: Block[] = []
  if (note.moment) body.push(...paragraphs(note.moment))
  const glass = (
    [
      ['Look', note.look],
      ['Nose', note.nose],
      ['Palate', note.palate],
      ['Finish', note.finish],
    ] as const
  ).filter(([, value]) => value?.trim())
  if (glass.length) {
    body.push({ type: 'h', text: 'In the glass' })
    body.push({ type: 'list', items: glass.map(([label, value]) => `${label}: ${value!.trim()}`) })
  }
  if (note.thoughts) body.push(...(typeof note.thoughts === 'string' ? paragraphs(note.thoughts) : note.thoughts))

  const where = note.region ? ` from ${note.region}` : ''
  return {
    kind: 'tasting',
    slug,
    title: note.title ?? `${note.wine} ${vintage}`,
    date: note.date,
    summary: note.summary ?? (note.verdict?.trim() || (note.moment ? firstSentence(note.moment.trim()) : `${note.grape}${where}.`)),
    tags: [...new Set(['tasting note', ...(style ? [style] : []), ...(note.tags ?? [])])],
    wine: {
      name: note.wine,
      grape: note.grape,
      vintage,
      style,
      producer: note.producer,
      region: note.region,
      boughtAt: note.boughtAt?.trim() || undefined,
      price: note.price,
      rating: note.rating,
      buyAgain: note.buyAgain,
      verdict: note.verdict?.trim() || undefined,
      sweetness: note.sweetness ?? guessSweetness(style),
      body: note.body,
      acidity: note.acidity,
      tannin: note.tannin,
      flavors: list(note.flavors),
      pairedWith: note.pairedWith?.trim() || undefined,
      // Your own ideas always show; made-up suggestions only when there's no pairing at all.
      suggestedPairings: list(note.suggestedPairings).length
        ? list(note.suggestedPairings)
        : note.pairedWith?.trim()
          ? undefined
          : suggestPairings(note.grape, style),
    },
    body,
  }
}

/**
 * Turns tasting notes into wine posts. Each gets a link made from its name and vintage,
 * e.g. #/wine/sample-poulsard-2022. If two notes would share a link, the newer one gets -2, -3, …
 * (by date, so adding a note never changes an older note's link). `taken` are links used by other wine posts.
 */
export function tastingNotes(notes: TastingNote[], taken: Iterable<string> = []): WinePost[] {
  const used = new Set(taken)
  const slugs = new Map<TastingNote, string>()
  const oldestFirst = [...notes].sort((a, b) => a.date.localeCompare(b.date))
  for (const note of oldestFirst) {
    const base = slugify(`${note.wine} ${note.vintage}`)
    let slug = base
    for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`
    used.add(slug)
    slugs.set(note, slug)
  }
  return notes.map((note) => toPost(note, slugs.get(note)!))
}
