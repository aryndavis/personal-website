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
  // Late harvest is about when the grapes were picked, not a style: it goes by the grape.
  assert.equal(guessStyle('Hermann J. Wiemer Late Harvest Riesling', 'Riesling'), 'white')
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
      name: 'Château Exemple', grape: 'Merlot', vintage: '2019', style: 'red', producer: undefined, region: undefined, boughtAt: undefined, price: undefined,
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
  // Your own ideas stay next to what you actually paired it with; made-up ones don't.
  const [both] = tastingNotes([{ wine: 'X', grape: 'Riesling', vintage: 2023, date: '2026-01-01', pairedWith: 'pretzels', suggestedPairings: ['fruit tart'] }])
  assert.equal(both.wine.pairedWith, 'pretzels')
  assert.deepEqual(both.wine.suggestedPairings, ['fruit tart'])
})

test('sweetness is only guessed for reds, orange and dessert wines', () => {
  const guess = (grape, extra = {}) => tastingNotes([{ wine: 'X', grape, vintage: 2020, date: '2026-01-01', ...extra }])[0].wine.sweetness
  assert.equal(guess('Syrah'), 'dry')
  assert.equal(guess('Riesling'), undefined)
  assert.equal(guess('Furmint', { style: 'dessert' }), 'sweet')
  assert.equal(guess('Riesling', { sweetness: 'off-dry' }), 'off-dry')
})

test('meters: "bone dry" and "none" fill nothing; every other step fills up to its place', async () => {
  const { BODY, LEVEL, SWEETNESS, meterFill } = await import('../src/content/types.ts')
  for (const [scale, value, filled] of [
    [SWEETNESS, 'bone dry', 0], [SWEETNESS, 'dry', 2], [SWEETNESS, 'medium sweet', 4], [SWEETNESS, 'sweet', 5],
    [LEVEL, 'none', 0], [LEVEL, 'low', 1], [LEVEL, 'high', 5],
    [BODY, 'light', 1], [BODY, 'full', 5],
  ]) {
    assert.equal(meterFill(scale, value), filled, `${value} on ${scale.join('/')}`)
  }
})

test('reviewing the same bottle again: revisited titles, new links, and links back to earlier reviews', () => {
  const visit = (date, rating) => ({ wine: 'Hermann J. Wiemer Late Harvest Riesling', grape: 'Riesling', vintage: 2023, date, rating })
  const [first, second, third, fourth, otherYear] = tastingNotes([
    visit('2026-10-18', 4.5), visit('2026-11-02', 4), visit('2026-12-01', 5), visit('2027-01-05', 5),
    { wine: 'Hermann J. Wiemer Late Harvest Riesling', grape: 'Riesling', vintage: 2024, date: '2026-11-10' },
  ])
  assert.deepEqual(
    [first, second, third, fourth].map((post) => [post.slug, post.title]),
    [
      ['hermann-j-wiemer-late-harvest-riesling-2023', 'Hermann J. Wiemer Late Harvest Riesling 2023'],
      ['hermann-j-wiemer-late-harvest-riesling-2023-2', 'Hermann J. Wiemer Late Harvest Riesling 2023, revisited'],
      ['hermann-j-wiemer-late-harvest-riesling-2023-3', 'Hermann J. Wiemer Late Harvest Riesling 2023, revisited again'],
      ['hermann-j-wiemer-late-harvest-riesling-2023-4', 'Hermann J. Wiemer Late Harvest Riesling 2023, revisited 3 times'],
    ],
  )
  assert.equal(first.wine.earlier, undefined, 'the first review has nothing earlier')
  assert.deepEqual(third.wine.earlier.map((review) => review.slug), ['hermann-j-wiemer-late-harvest-riesling-2023-2', 'hermann-j-wiemer-late-harvest-riesling-2023'], 'newest first')
  assert.equal(second.wine.earlier[0].title, 'Hermann J. Wiemer Late Harvest Riesling 2023')
  // A different vintage is a different bottle.
  assert.equal(otherYear.title, 'Hermann J. Wiemer Late Harvest Riesling 2024')
  assert.equal(otherYear.wine.earlier, undefined)
})

test('the order notes are listed in does not change who is "revisited": the date does', () => {
  const a = { wine: 'X', grape: 'Gamay', vintage: 2022, date: '2026-05-01' }
  const b = { wine: 'X', grape: 'Gamay', vintage: 2022, date: '2026-03-01' }
  const [later, earlier] = tastingNotes([a, b])
  assert.equal(earlier.title, 'X 2022')
  assert.equal(later.title, 'X 2022, revisited')
})

