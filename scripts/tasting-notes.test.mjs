// Run with `npm test`. Checks how a minimal tasting note becomes a wine post.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { guessStyle, suggestPairings, tastingNotes } from '../src/content/tastingNotes.ts'

test('guesses the style from the grape, ignoring accents and case', () => {
  assert.equal(guessStyle('Something', 'Pinot Noir'), 'red')
  assert.equal(guessStyle('Something', 'albarino'), 'white')
  assert.equal(guessStyle('Something', 'Grüner Veltliner'), 'white')
  assert.equal(guessStyle('Something', 'Grenache, Syrah'), 'red')
  assert.equal(guessStyle('Something', 'Mystery Grape'), undefined)
})

test('the name beats the grape for sparkling, dessert, orange and rosé', () => {
  assert.equal(guessStyle('Brut Champagne', 'Pinot Noir'), 'sparkling')
  assert.equal(guessStyle('Pét-Nat', 'Gamay'), 'sparkling')
  assert.equal(guessStyle('Tokaji Aszú', 'Furmint'), 'dessert')
  assert.equal(guessStyle('Skin-Contact Pinot Grigio', 'Pinot Grigio'), 'orange')
  assert.equal(guessStyle('Côtes de Provence Rosé', 'Grenache'), 'rosé')
})

test('a note with only the required fields becomes a full post', () => {
  const [post] = tastingNotes([{ wine: 'Château Exemple', grape: 'Merlot', vintage: 2019, date: '2026-10-20' }])
  assert.deepEqual(post, {
    kind: 'tasting',
    slug: 'chateau-exemple-2019',
    title: 'Château Exemple 2019',
    date: '2026-10-20',
    summary: 'Merlot.',
    tags: ['tasting note', 'red'],
    wine: {
      name: 'Château Exemple', grape: 'Merlot', vintage: '2019', style: 'red', producer: undefined, region: undefined, price: undefined,
      rating: undefined, buyAgain: undefined, verdict: undefined, sweetness: 'dry', body: undefined, acidity: undefined, tannin: undefined,
      flavors: [], pairedWith: undefined, suggestedPairings: ['roast chicken', 'mushroom pasta', 'meatloaf'],
    },
    body: [],
  })
})

test('optional fields fill in the post body', () => {
  const [post] = tastingNotes([
    {
      wine: 'X', grape: 'Riesling', vintage: 'NV', date: '2026-01-01', region: 'Mosel',
      moment: 'First line. Second line.\n\nNew paragraph.', look: 'gold', palate: ' zippy ', pairedWith: ' Thai food ', flavors: 'lemon, , lime ', verdict: 'Zesty fun.', thoughts: 'More.', style: 'sparkling',
    },
  ])
  assert.equal(post.summary, 'Zesty fun.')
  assert.deepEqual(post.wine.flavors, ['lemon', 'lime'])
  assert.equal(post.wine.pairedWith, 'Thai food')
  assert.equal(post.wine.suggestedPairings, undefined)
  assert.equal(post.wine.sweetness, undefined, 'sparkling sweetness is never guessed')
  assert.deepEqual(post.tags, ['tasting note', 'sparkling'])
  assert.deepEqual(post.body, [
    { type: 'p', text: 'First line. Second line.' },
    { type: 'p', text: 'New paragraph.' },
    { type: 'h', text: 'In the glass' },
    { type: 'list', items: ['Look: gold', 'Palate: zippy'] },
    { type: 'p', text: 'More.' },
  ])
})

test('repeat bottles get unique links, and adding one never changes an older link', () => {
  const older = { wine: 'Same', grape: 'Gamay', vintage: 2020, date: '2026-01-01' }
  const newer = { wine: 'Same', grape: 'Gamay', vintage: 2020, date: '2026-05-01' }
  assert.deepEqual(tastingNotes([newer, older]).map((p) => p.slug), ['same-2020-2', 'same-2020'])
  assert.deepEqual(tastingNotes([older]).map((p) => p.slug), ['same-2020'])
  assert.deepEqual(tastingNotes([older], ['same-2020']).map((p) => p.slug), ['same-2020-2'])
})

test('pairings are suggested from the grape, then the style, unless the note has its own', () => {
  assert.deepEqual(suggestPairings('Albariño', 'white'), ['oysters', 'grilled fish', 'sushi'])
  assert.deepEqual(suggestPairings('Mystery Grape', 'orange'), ['spiced dishes', 'roast vegetables', 'funky cheeses'])
  assert.deepEqual(suggestPairings('Pinot Noir', 'sparkling'), ['fried food', 'oysters', 'potato chips'])
  assert.equal(suggestPairings('Mystery Grape'), undefined)
  const [own] = tastingNotes([{ wine: 'X', grape: 'Merlot', vintage: 2020, date: '2026-01-01', suggestedPairings: ['tacos'] }])
  assert.deepEqual(own.wine.suggestedPairings, ['tacos'])
})

test('sweetness is only guessed for reds, orange and dessert wines', () => {
  const guess = (grape, extra = {}) => tastingNotes([{ wine: 'X', grape, vintage: 2020, date: '2026-01-01', ...extra }])[0].wine.sweetness
  assert.equal(guess('Syrah'), 'dry')
  assert.equal(guess('Riesling'), undefined)
  assert.equal(guess('Furmint', { style: 'dessert' }), 'sweet')
  assert.equal(guess('Riesling', { sweetness: 'off-dry' }), 'off-dry')
})
