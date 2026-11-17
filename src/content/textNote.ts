// Reads a tasting note sent by text message (see netlify/functions/sms.ts). One "label: value" per line:
//
//   wine: Domaine Example Poulsard, Poulsard, 2022
//   rating: 4
//   buy again: yes
//   flavors: red currant, rose petal
//   notes:
//   Anything after "notes:" becomes the post's extra notes.
//
// Only the first line is required. Values are checked against the same scales the site uses;
// a bad value is never guessed, it's sent back as an error.
//
// While a preview is waiting, texting just the lines to change ("price: $$") edits it. See editTextNote.
import type { TastingNote } from './tastingNotes.ts'
import { BODY, LEVEL_OR_NONE, RATINGS, SWEETNESS, type BuyAgain, type Rating, type WinePrice, type WineStyle } from './types.ts'

export const TEXT_TEMPLATE = `wine: Name, Grape, 2022
producer:
region:
bought at:
style: red/white/rosé/orange/sparkling/dessert
price: $ (under 20), $$ (20-30), $$$ (30-50), $$$$ (50+) or not sure
rating: 1-5 (halves ok: 4.5)
buy again: yes/maybe/no
verdict:
flavors: a, b, c
sweetness: bone dry/dry/off-dry/medium sweet/sweet
body: light to full
acidity: none, low to high
tannin: none, low to high
paired with:
notes:
(anything else, as long as you like)`

export const MAX_TEXT_LENGTH = 1600

const STYLES: WineStyle[] = ['red', 'white', 'rosé', 'orange', 'sparkling', 'dessert']
const PRICES: WinePrice[] = ['$', '$$', '$$$', '$$$$']
const BUY_AGAIN: BuyAgain[] = ['yes', 'maybe', 'no']

type Field = keyof TastingNote
// Every label you can text, and the note field it fills. Case, spaces and dashes don't matter.
const LABELS: Record<string, Field> = {
  // For edits: a new note sets these on its first line.
  name: 'wine',
  grape: 'grape',
  vintage: 'vintage',
  year: 'vintage',
  producer: 'producer',
  region: 'region',
  boughtat: 'boughtAt',
  bought: 'boughtAt',
  purchasedat: 'boughtAt',
  shop: 'boughtAt',
  store: 'boughtAt',
  style: 'style',
  price: 'price',
  rating: 'rating',
  hearts: 'rating',
  buyagain: 'buyAgain',
  again: 'buyAgain',
  verdict: 'verdict',
  review: 'verdict',
  flavors: 'flavors',
  flavours: 'flavors',
  tastingnotes: 'flavors',
  sweetness: 'sweetness',
  body: 'body',
  acidity: 'acidity',
  acid: 'acidity',
  tannin: 'tannin',
  tannins: 'tannin',
  pairedwith: 'pairedWith',
  pairing: 'pairedWith',
  atewith: 'pairedWith',
  trywith: 'suggestedPairings',
  suggestions: 'suggestedPairings',
  moment: 'moment',
  look: 'look',
  color: 'look',
  colour: 'look',
  nose: 'nose',
  smell: 'nose',
  palate: 'palate',
  taste: 'palate',
  finish: 'finish',
  title: 'title',
  summary: 'summary',
  tags: 'tags',
}

const REQUIRED: readonly Field[] = ['wine', 'grape', 'vintage']
// Answers that mean "I don't know the price": the price is left off the post.
const UNSURE = new Set(['not sure', 'unsure', 'idk', 'dont know', 'i dont know', 'no idea', 'unknown', '?'])

const LIMITS: Partial<Record<Field, number>> = { wine: 120, grape: 120, verdict: 400, thoughts: 4000 }
const DEFAULT_LIMIT = 300

export type ParseResult = { ok: true; note: TastingNote } | { ok: false; error: string }

const key = (label: string) => label.toLowerCase().replace(/[^a-z]/g, '')
const clean = (text: string) =>
  text
    // Drop control characters except newlines; smart quotes and emoji are fine.
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, '')
    .trim()
const plain = (text: string) => text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[\s_-]+/g, ' ').trim()
const list = (text: string) =>
  text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

/** Matches a value against an allowed list, ignoring case, accents, spaces and dashes. */
function pick<T extends string>(value: string, allowed: readonly T[]): T | undefined {
  return allowed.find((option) => plain(option) === plain(value))
}

const oneOf = (label: string, allowed: readonly string[]) => `${label} must be ${allowed.slice(0, -1).join(', ')} or ${allowed.at(-1)}.`

function readVintage(vintage: string, today: string): { value: string } | { error: string } {
  if (/^nv$/i.test(vintage)) return { value: 'NV' }
  const year = new Date(`${today}T12:00:00Z`).getUTCFullYear()
  if (/^\d{4}$/.test(vintage) && Number(vintage) >= 1900 && Number(vintage) <= year) return { value: vintage }
  return { error: `The year should be a vintage like 2022, or NV for non-vintage. I got "${vintage}".` }
}

/** Turns one label's text into a note field (undefined leaves it off), or an error message. */
function readField(field: Field, label: string, value: string, today: string): { value: unknown } | { error: string } {
  switch (field) {
    case 'vintage':
      return readVintage(value, today)
    case 'style': {
      const style = pick(value, STYLES) ?? (plain(value) === 'rose' ? 'rosé' : undefined)
      return style ? { value: style } : { error: oneOf('style', STYLES) }
    }
    case 'price': {
      if (UNSURE.has(plain(value).replace(/['’.!]/g, ''))) return { value: undefined }
      const price = pick(value.replace(/\s/g, ''), PRICES)
      return price ? { value: price } : { error: 'price must be $, $$, $$$, $$$$ or not sure.' }
    }
    case 'rating': {
      // 4, 4/5, 4 hearts, 4.5, 4½
      const match = value.replace('½', '.5').match(/^(\d(?:\.\d+)?)(\s*(\/\s*5|hearts?|stars?))?$/i)
      const rating = match ? Number(match[1]) : NaN
      return (RATINGS as readonly number[]).includes(rating)
        ? { value: rating as Rating }
        : { error: 'rating must be from 1 to 5, in halves at most (4.5).' }
    }
    case 'buyAgain': {
      const answer = pick(value, BUY_AGAIN) ?? ({ y: 'yes', n: 'no' } as Record<string, BuyAgain>)[plain(value)]
      return answer ? { value: answer } : { error: oneOf('buy again', BUY_AGAIN) }
    }
    case 'sweetness': {
      const sweetness = pick(value, SWEETNESS)
      return sweetness ? { value: sweetness } : { error: oneOf('sweetness', SWEETNESS) }
    }
    case 'body': {
      const body = pick(value, BODY)
      return body ? { value: body } : { error: oneOf('body', BODY) }
    }
    case 'acidity':
    case 'tannin': {
      const level = pick(value, LEVEL_OR_NONE)
      return level ? { value: level } : { error: oneOf(label, LEVEL_OR_NONE) }
    }
    case 'flavors':
    case 'suggestedPairings':
    case 'tags': {
      const items = list(value)
      return items.length ? { value: items } : { error: `${label} needs at least one item, separated by commas.` }
    }
    default:
      return { value }
  }
}

/**
 * Reads a texted tasting note. `today` (YYYY-MM-DD) becomes the post date.
 * The text must start with "wine" ("wine: Name, Grape, 2022" or "wine Name, Grape, 2022").
 */
export function parseTextNote(text: string, today: string): ParseResult {
  if (text.length > MAX_TEXT_LENGTH) return { ok: false, error: `That's too long (over ${MAX_TEXT_LENGTH} characters). Trim the notes and try again.` }
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  while (lines.length && !lines[0].trim()) lines.shift()

  const first = clean(lines.shift() ?? '').match(/^wine\b\s*:?\s*(.*)$/i)
  if (!first) return { ok: false, error: 'Start with "wine: Name, Grape, Year". Text "wine help" for the template.' }
  const parts = first[1].split(',').map((part) => part.trim())
  if (parts.length < 3 || parts.some((part) => !part)) {
    return { ok: false, error: 'The first line needs the wine, grape and year, like "wine: Domaine Example Poulsard, Poulsard, 2022".' }
  }
  const vintage = readVintage(parts.pop()!, today)
  if ('error' in vintage) return { ok: false, error: vintage.error }
  const grape = parts.pop()!
  const wine = parts.join(', ')

  const note: Record<string, unknown> = { wine, grape, vintage: vintage.value, date: today }
  return readLines(note, lines, today)
}

/** Whether a text looks like an edit to a waiting preview: it starts with a known "label:" line. */
export function isEditText(text: string): boolean {
  const first = text.trim().match(/^([^:\n]{1,30}):/)
  return Boolean(first && (LABELS[key(first[1])] || ['notes', 'thoughts'].includes(key(first[1]))))
}

/**
 * Applies an edit to a waiting note: each "label: value" line replaces that field, and a label
 * left blank ("price:") removes it. Returns the edited copy; the original is untouched.
 */
export function editTextNote(note: TastingNote, text: string, today: string): ParseResult {
  if (text.length > MAX_TEXT_LENGTH) return { ok: false, error: `That's too long (over ${MAX_TEXT_LENGTH} characters). Trim the notes and try again.` }
  return readLines({ ...note }, text.replace(/\r\n?/g, '\n').split('\n'), today)
}

/** Reads "label: value" lines into `note` (changing it), then checks lengths. */
function readLines(note: Record<string, unknown>, lines: string[], today: string): ParseResult {
  for (let i = 0; i < lines.length; i++) {
    const line = clean(lines[i])
    if (!line) continue
    const match = line.match(/^([^:]{1,30}):\s*(.*)$/)
    if (!match) return { ok: false, error: `I couldn't read "${line.slice(0, 40)}". Use "label: value" on each line, and put longer writing after "notes:".` }
    const label = match[1].trim()
    if (key(label) === 'notes' || key(label) === 'thoughts') {
      // Everything from here on is the extra notes, blank lines and all.
      const rest = [match[2], ...lines.slice(i + 1)].join('\n').trim()
      if (rest) note.thoughts = rest
      else delete note.thoughts
      break
    }
    const field = LABELS[key(label)]
    if (!field) return { ok: false, error: `I don't know the label "${label}". Text "wine help" for the list.` }
    const value = match[2].trim()
    if (!value) {
      // A template line left blank, or an edit clearing a field.
      if (REQUIRED.includes(field)) return { ok: false, error: `${label.toLowerCase()} can’t be blank.` }
      delete note[field]
      continue
    }
    const result = readField(field, label.toLowerCase(), value, today)
    if ('error' in result) return { ok: false, error: result.error }
    if (result.value === undefined) delete note[field]
    else note[field] = result.value
  }

  for (const [field, value] of Object.entries(note)) {
    const limit = LIMITS[field as Field] ?? DEFAULT_LIMIT
    const length = Array.isArray(value) ? value.join(', ').length : String(value).length
    if (length > limit) return { ok: false, error: `${field} is too long (over ${limit} characters).` }
  }
  return { ok: true, note: note as unknown as TastingNote }
}

const STRING_FIELDS = ['wine', 'grape', 'vintage', 'date', 'producer', 'region', 'boughtAt', 'verdict', 'pairedWith', 'moment', 'look', 'nose', 'palate', 'finish', 'thoughts', 'title', 'summary'] as const

/** Checks a stored texted note before it reaches the site, so a bad file can't break the build or the page. */
export function isTextNote(value: unknown): value is TastingNote {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const note = value as Record<string, unknown>
  if (typeof note.wine !== 'string' || typeof note.grape !== 'string' || typeof note.vintage !== 'string') return false
  if (typeof note.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(note.date)) return false
  for (const field of Object.keys(note)) {
    const value = note[field]
    if ((STRING_FIELDS as readonly string[]).includes(field)) {
      if (typeof value !== 'string') return false
    } else if (field === 'flavors' || field === 'suggestedPairings' || field === 'tags') {
      if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) return false
    } else if (field === 'style') {
      if (!STYLES.includes(value as WineStyle)) return false
    } else if (field === 'price') {
      if (!PRICES.includes(value as WinePrice)) return false
    } else if (field === 'rating') {
      if (!(RATINGS as readonly unknown[]).includes(value)) return false
    } else if (field === 'buyAgain') {
      if (!BUY_AGAIN.includes(value as BuyAgain)) return false
    } else if (field === 'sweetness') {
      if (!(SWEETNESS as readonly unknown[]).includes(value)) return false
    } else if (field === 'body') {
      if (!(BODY as readonly unknown[]).includes(value)) return false
    } else if (field === 'acidity' || field === 'tannin') {
      if (!(LEVEL_OR_NONE as readonly unknown[]).includes(value)) return false
    } else {
      return false
    }
  }
  return true
}
