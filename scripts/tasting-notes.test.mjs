// Run with `npm test`. Checks how a minimal tasting note becomes a wine post.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { guessStyle, tastingNotes } from '../src/content/tastingNotes.ts'

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
    wine: { name: 'Château Exemple', grape: 'Merlot', vintage: '2019', style: 'red', producer: undefined, region: undefined, price: undefined, rating: undefined, buyAgain: undefined },
    body: [],
  })
})

test('optional fields fill in the post body', () => {
  const [post] = tastingNotes([
    {
      wine: 'X', grape: 'Riesling', vintage: 'NV', date: '2026-01-01', region: 'Mosel',
      moment: 'First line. Second line.\n\nNew paragraph.', look: 'gold', palate: ' zippy ', pairing: 'Thai food', thoughts: 'More.', style: 'sparkling',
    },
  ])
  assert.equal(post.summary, 'First line.')
  assert.deepEqual(post.tags, ['tasting note', 'sparkling'])
  assert.deepEqual(post.body, [
    { type: 'p', text: 'First line. Second line.' },
    { type: 'p', text: 'New paragraph.' },
    { type: 'h', text: 'In the glass' },
    { type: 'list', items: ['Look: gold', 'Palate: zippy'] },
    { type: 'h', text: 'Goes with' },
    { type: 'p', text: 'Thai food' },
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
