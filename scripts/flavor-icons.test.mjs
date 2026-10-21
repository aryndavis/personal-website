// Run with `npm test`. The tasting card's pixel icons: every drawing is well formed, and tasting notes
// (the aroma wheel's terms and everyday wording) find the right one.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { CARD_ART, FLAVOR_ART, flavorIcon } from '../src/components/flavorIcons.ts'

// PixelIcon.tsx is JSX, so read its palette and built-in icon names from the source.
const source = readFileSync(new URL('../src/components/PixelIcon.tsx', import.meta.url), 'utf8')
const palette = new Set([...source.matchAll(/^ {2}(\w): '(#[0-9a-f]{6}|var\(--[\w-]+, #[0-9a-f]{6}\))'/gm)].map((m) => m[1]))
const builtIn = [...source.slice(source.indexOf('const icons')).matchAll(/^ {2}(\w+): \[/gm)].map((m) => m[1])

test('every drawing is a rectangle of known colors', () => {
  for (const [name, rows] of Object.entries({ ...CARD_ART, ...FLAVOR_ART })) {
    assert.ok(rows.length > 0, name)
    assert.ok(rows.every((row) => row.length === rows[0].length), `${name}: rows differ in width`)
    for (const char of rows.join('')) assert.ok(char === '.' || palette.has(char), `${name}: "${char}" isn't in the palette`)
  }
})

test('no new drawing replaces a built-in icon by sharing its name', () => {
  for (const name of [...Object.keys(CARD_ART), ...Object.keys(FLAVOR_ART)]) assert.ok(!builtIn.includes(name), name)
})

test('everyday wording finds the right icon', () => {
  for (const [flavor, icon] of [
    ['pear', 'pear'], ['Pears', 'pear'], ['ripe pear', 'pear'], ['apricot', 'apricot'],
    ['cherries', 'cherry'], ['white peaches', 'peach'], ['Green apple', 'apple'],
    ['pineapple', 'pineapple'], ['grapefruit', 'grapefruit'], // not apple or grape
    ['strawberry jam', 'jam'], ['strawberries', 'strawberry'], ['orange blossom', 'flower'], ['orange peel', 'orange'],
    ['bell pepper', 'bell pepper'], ['black pepper', 'pepper'], ['honeysuckle', 'flower'], ['honey', 'honey'],
    ['petrol', 'petrol'], ['wet stone', 'stone'], ['slate', 'stone'], ['fresh-cut grass', 'grass'],
    ['molasses', 'caramel'], ['Crème brûlée caramel', 'caramel'], ['lemon zest', 'lemon'], ['LIME', 'lime'],
  ]) {
    assert.equal(flavorIcon(flavor), icon, flavor)
  }
})

test('notes without a picture get none, rather than a wrong guess', () => {
  // 'appleton' and 'pearl' check whole words only: no apple or pear inside them.
  for (const flavor of ['', '   ', 'zippy', 'joy', 'appleton', 'pearl', '🍐']) assert.equal(flavorIcon(flavor), undefined, flavor)
})

// The aroma wheel (Noble et al.), outer ring, written the way the wheel writes them. Its faults are split
// out: a corked or spoiled bottle doesn't get a card, so those terms deliberately have no icon.
const WHEEL = [
  'Grapefruit', 'Lemon', 'Orange', 'Blackberry', 'Raspberry', 'Strawberry', 'Blackcurrant (Cassis)', 'Cherry', 'Apricot',
  'Peach', 'Pear', 'Apple', 'Pineapple', 'Melon', 'Banana', 'Artificial Fruit', 'Strawberry Jam', 'Raisin', 'Prune', 'Fig',
  'Methyl Anthranilate', 'Stemmy', 'Grass/Cut', 'Green Pepper', 'Eucalyptus', 'Mint', 'Hay/Straw', 'Tea', 'Green Bean',
  'Asparagus', 'Green Olive', 'Black Olive', 'Artichoke', 'Dusty', 'Mushroom', 'Earthy', 'Concrete', 'Tar', 'Kerosene',
  'Diesel', 'Vanilla', 'Pine', 'Cedar', 'Oak', 'Honey', 'Butterscotch', 'Buttery (Diacetyl)', 'Soy Sauce', 'Chocolate',
  'Molasses', 'Smoky', 'Burnt Toast/Charred', 'Leesy', 'Flor-Yeast', 'Lactic Acid', 'Linalool', 'Terpene', 'Jasmine', 'Rose',
  'Violet', 'Geranium', 'Cloves', 'Black Peppercorn', 'Licorice, Aniseed', 'Cinnamon',
]
const FAULTS = [
  'Musty', 'Mouldy Cork', 'Mouldy Cooperage', 'Plastic', 'Rubbery', 'Hydrogen Sulphide', 'Mercaptan', 'Garlic', 'Onion',
  'Cabbage', 'Sauerkraut', 'Skunk', 'Burnt Match', 'Wet Wool/Wet Dog', 'Filter Pad', 'Wet Cardboard', 'Wet Paper',
  'Ethyl Acetate', 'Acetic Acid', 'Ethanol', 'Sulphur Dioxide', 'Fishy', 'Soapy', 'Sorbate', 'Fusel Alcohol',
  'Acetaldehyde', 'Phenol', 'Sweaty', 'Butyric Acid', 'Horsey',
]

test('every pleasant term on the aroma wheel has an icon', () => {
  assert.deepEqual(WHEEL.filter((term) => !flavorIcon(term)), [])
})

test('faults have no icon, since a faulty bottle never gets a card', () => {
  assert.deepEqual(FAULTS.filter((term) => flavorIcon(term)), [])
})

test('the wheel’s trickier terms get the specific icon', () => {
  for (const [term, icon] of [
    ['Blackcurrant (Cassis)', 'blackberry'], ['Burnt Toast/Charred', 'toast'], ['Buttery (Diacetyl)', 'butter'],
    ['Soy Sauce', 'soy'], ['Green Pepper', 'bell pepper'], ['Black Peppercorn', 'pepper'], ['Methyl Anthranilate', 'grapes'],
    ['Strawberry Jam', 'jam'], ['Flor-Yeast', 'bread'], ['Kerosene', 'petrol'],
  ]) {
    assert.equal(flavorIcon(term), icon, term)
  }
})
