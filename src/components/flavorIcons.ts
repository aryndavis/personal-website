// Pixel art for the wine tasting card: a little picture for most tasting notes (the aroma wheel's terms
// and a few Riesling favorites), plus the card's own icons. Same format as PixelIcon: one letter per
// pixel, '.' is transparent, letters are colors from PixelIcon's palette.

/** Swaps colors in a grid, so one drawing can serve several things (a violet and a jasmine flower). */
const recolor = (grid: string[], swaps: Record<string, string>) => grid.map((row) => row.replace(/./g, (ch) => swaps[ch] ?? ch))

// Templates: P is the main color, Q its shadow, C the center or accent.
const FLOWER = ['..kk.kk..', '.kPPkPPk.', '.kPPPPPk.', 'kkPPCPPkk', 'kPPCCCPPk', 'kQPPCPPQk', '.kkQQQkk.', '..kQkQk..', '...k.k...']
const LEAF = ['......kk.', '....kkPk.', '...kPCPk.', '..kPCPQk.', '.kPCPQk..', '.kCPQk...', 'kCQkk....', 'kk.......']
const BULB = ['....k....', '...kPk...', '..kPQPk..', '.kPQPQPk.', 'kPPQPPQPk', 'kPQPPQPQk', '.kPPQPPk.', '..kkkkk..']
const WRAPPED_CANDY = ['kk..kkkkk..kk', 'kPkkPwPPPkkPk', 'kPPkPPPPPkPPk', 'kPkkPPPPQkkPk', 'kk..kkkkk..kk']
const OLIVE = ['..kkkkk..', '.kPwPPPk.', 'kPPPPPPQk', 'kPPPPPQQk', '.kPPQQQk.', '..kkkkk..']

/** Icons the card uses for its own labels. */
export const CARD_ART = {
  sugar: ['.....kk.....', '....kWWk....', '...kWWWek...', '..kWWbWWek..', '.kWWWWWWeek.', 'kWbWWWWbWeek', 'kkkkkkkkkkkk'],
  bag: ['...kkkk...', '..k....k..', '..k....k..', 'kkkkkkkkkk', 'kppppppppk', 'kppdpdpppk', 'kpdddddppk', 'kppdddpppk', 'kpppdppppk', 'kkkkkkkkkk'],
  pin: ['..kkkkk..', '.kdddddk.', 'kddwwdddk', 'kddwwdddk', 'kdddddddk', '.kdddddk.', '.kdddddk.', '..kdddk..', '...kdk...', '....k....'],
  bottle: ['...kkk...', '...krk...', '...krk...', '..krrrk..', '.krrrrrk.', '.krwwwrk.', '.krwpwrk.', '.krwwwrk.', '.krrrrrk.', '.kkkkkkk.'],
  cutlery: ['k.k.k..k.', 'kwkwk.kwk', 'kwkwk.kwk', 'kwwwk.kwk', '.kwk..kwk', '..kw..kkk', '..kw...kw', '..kw...kw', '..kw...kw', '..kk...kk'],
} satisfies Record<string, string[]>

/** One drawing per tasting note family. */
export const FLAVOR_ART = {
  // Fruit
  pear: ['....k....', '....kGGk.', '...kgk...', '..kgggk..', '..kgggk..', '.kgggggk.', 'kgwggggGk', 'kggggggGk', 'kgggggGGk', '.kgggGGk.', '..kkkkk..'],
  apricot: ['....kGG..', '...kGGk..', '..kkkkk..', '.kyoooOk.', 'kywooooOk', 'kyooooOOk', 'koooooOOk', '.kooOOOk.', '..kkkkk..'],
  peach: ['.....kGk..', '....kGGk..', '..kkkkkk..', '.kPPPkPPk.', 'kPwPPkPRRk', 'kPPPPkRRRk', 'kPPPPRRRRk', '.kPPRRRdk.', '..kkkkkk..'],
  apple: ['....k.GG..', '....kGG...', '.kkkkkkkk.', 'kgwgggggGk', 'kgggggggGk', 'kgggggggGk', 'kggggggGGk', '.kgggGGGk.', '..kkkkkk..'],
  cherry: ['.....kkGk', '....k.kk.', '...k...k.', '..k....k.', '.kkk..kkk', 'kcwckkcwk', 'kccrkkccr', '.krk..krk', '..k....k.'],
  plum: ['....kG...', '..kkkkk..', '.klVVVVk.', 'klwVVVVVk', 'kVVVVVVVk', 'kVVVVVVXk', '.kVVVVXk.', '..kkkkk..'],
  lemon: ['.....kkkk.....', '...kkyyyykk...', '..kywwyyyyyk..', '.kyyyyyyyyyok.', 'kyyyyyyyyyyook', '.kyyyyyyyyyok.', '..kyyyyyyook..', '...kkyyyokk...', '.....kkkk.....'],
  lime: ['..kkkkk..', '.kgGGGGk.', 'kgwGGGGLk', 'kGGGGGGLk', 'kGGGGGLLk', '.kGGLLLk.', '..kkkkk..'],
  orange: ['....kGG..', '..kkkkk..', '.kyoooOk.', 'kywoOooOk', 'kyoooOoOk', 'kooOoooOk', '.koooOOk.', '..kkkkk..'],
  grapefruit: ['..kkkkkkk..', '.kRpRpRpRk.', 'kyRpRpRpRyk', 'kypRpwpRpyk', '.kyyyyyyyk.', '..kkkkkkk..'],
  strawberry: ['..GkGkG..', '.kGGGGGk.', 'kcycccyck', 'kcccyccck', 'kcyccccrk', '.kccycrk.', '.kcccrrk.', '..kcrrk..', '...krk...', '....k....'],
  raspberry: ['...kGk...', '..kkkkk..', '.kRcRcRk.', 'kRcRcRcRk', 'kcRwRcRck', 'kRcRcRcRk', '.kcRcRck.', '..kRcRk..', '...kkk...'],
  blackberry: ['...kGk...', '..kkkkk..', '.kXVXVXk.', 'kXVXVXVXk', 'kVXlXVXVk', 'kXVXVXVXk', '.kVXVXVk.', '..kXVXk..', '...kkk...'],
  blueberry: ['...kkk...', '.kkBkBkk.', 'kbBBBBBBk', 'kBwBBBBBk', 'kBBBBBBXk', 'kBBBBBXXk', '.kBBBXXk.', '..kkkkk..'],
  grapes: ['....kk...', '...km....', '.kkkkkkk.', 'klllklllk', 'kllklllk.', '.klllllk.', '..klllk..', '...klk...', '....k....'],
  pineapple: ['..G.G.G..', '...GGG...', '..GGLGG..', '...kkk...', '..kyoyk..', '.kyoyoyk.', '.koyoyok.', '.kyoyoyk.', '.koyoyok.', '..kyoyk..', '...kkk...'],
  melon: ['kkkkkkkkkkkk', 'kPWPPPPPPPOk', '.kPPPPPPPOk.', '..kPPPPPOk..', '...kggGGk...', '....kkkk....'],
  banana: ['.........kk.', '........kNk.', '.......kyyk.', 'k.....kyyyk.', 'kyk..kyyyok.', '.kyykyyyook.', '..kyyyyook..', '...kkkkkk...'],
  raisin: ['..kkkkk..', '.kVXVXVk.', 'kVlVXVXVk', 'kXVXVXVXk', '.kXVXVXk.', '..kkkkk..'],
  fig: ['...kkk...', '..kVVVk..', '.kVpppVk.', 'kVpRyRpVk', 'kVpyRypVk', 'kVpRyRpVk', '.kVpppVk.', '..kkkkk..'],
  jam: ['.kkkkkkk.', '.kpwpwpk.', 'kkkkkkkkk', 'kcWccccrk', 'kcwwwwwrk', 'kcwRwRwrk', 'kcwwwwwrk', 'kccccccrk', '.kkkkkkk.'],
  candy: recolor(WRAPPED_CANDY, { P: 'p', Q: 'd' }),

  // Flowers
  flower: recolor(FLOWER, { P: 'R', Q: 'd', C: 'y' }),
  rose: ['..kkkkk..', '.kRpppRk.', 'kRpdddpRk', 'kRdpkpdRk', 'kRpdddpRk', '.kRRRRRk.', '..kkGkk..', '.kGGkGGk.', '..kkGkk..', '....k....'],
  violet: recolor(FLOWER, { P: 'l', Q: 'V', C: 'y' }),
  jasmine: recolor(FLOWER, { P: 'W', Q: 'e', C: 'y' }),
  vanilla: recolor(FLOWER, { P: 'w', Q: 'y', C: 'o' }),

  // Spices and herbs
  cinnamon: ['kkkkkkkkkkk.', 'kNnnnnnnnnk.', 'kNNNNNNNNNk.', '.kkkkkkkkkkk', '.kNnnnnnnnnk', '.kNNNNNNNNNk', '.kkkkkkkkkkk'],
  clove: ['..kkk..', '.kNnNk.', '.kNNNk.', '..kNk..', '..kNk..', '..kNk..', '..kNk..', '...k...'],
  pepper: ['.kkk.kkk.', 'kSsSkSsSk', 'kSSSkSSSk', '.kkkkkkk.', '..kSsSk..', '..kSSSk..', '...kkk...'],
  anise: ['....k....', '...knk...', '.kkknkkk.', '.knnNnnk.', 'kknNyNnkk', '.knnNnnk.', '.kkknkkk.', '...knk...', '....k....'],
  mint: recolor(LEAF, { P: 'G', Q: 'L', C: 'g' }),
  eucalyptus: recolor(LEAF, { P: 'm', Q: 'S', C: 'w' }),

  // Bakery, dairy and sweets
  bread: ['...kkkkk...', '.kknnnnnkk.', 'knnNnnNnnNk', 'knnnnnnnnnk', 'kNNNNNNNNNk', '.kkkkkkkkk.'],
  toast: ['.kkk.kkk.', 'knnnknnnk', 'knNNNNNnk', 'knNDNNNnk', 'knNNNDNnk', 'knNNNNNnk', 'knnnnnnnk', 'kkkkkkkkk'],
  cheese: ['......kkk.', '....kkyyyk', '..kkyyyyyk', 'kkyyyyyyyk', 'kkkkkkkkkk', 'kyoyyyoyyk', 'kyyyoyyyok', 'kkkkkkkkkk'],
  butter: ['.kkkkkkkkk.', 'kyWyyyyyyyk', 'kyyyyyyyyok', 'kooooooooOk', '.kkkkkkkkk.'],
  honey: ['.kkkkkkk.', '.kNNNNNk.', 'kkkkkkkkk', 'kYyyyyyYk', 'kYwyyyyYk', 'kYyyyyyYk', 'kYYyyyYYk', '.kkkkkkk.'],
  caramel: recolor(WRAPPED_CANDY, { P: 'o', Q: 'O' }),
  chocolate: ['.kkkkkkk.', 'kNDkNDkNk', 'kDDkDDkDk', 'kkkkkkkkk', 'kNDkNDkNk', 'kDDkDDkDk', 'kkkkkkkkk'],
  soy: ['...kkk...', '...kck...', '...kkk...', '..kDDDk..', '.kDDDDDk.', '.kDwwwDk.', '.kDwcwDk.', '.kDwwwDk.', '.kDDDDDk.', '..kkkkk..'],

  // Smoke, wood and earth
  smoke: ['......kk...', '.....ksk...', '......kk...', '...kkk.....', '..ksssk.kk.', '.kssssskssk', 'kssssssssSk', 'kSsssssSSSk', '.kkkkkkkkk.'],
  barrel: ['..kkkkk..', '.kNnnnNk.', 'kSSSSSSSk', 'kNnnnnnNk', 'kNnnnnnNk', 'kSSSSSSSk', '.kNnnnNk.', '..kkkkk..'],
  pine: ['....k....', '...kLk...', '..kLGLk..', '.kLGGGLk.', '..kLGLk..', '.kLGGGLk.', 'kLGGGGGLk', 'kkkkkkkkk', '...kNk...', '...kkk...'],
  mushroom: ['..kkkkk..', '.knnWnnk.', 'knnnnnWnk', 'knWnnnnnk', 'kkkkkkkkk', '...kwk...', '...kwk...', '..kwwwk..', '..kkkkk..'],
  earth: ['....G....', '...GkG...', '....k....', '...kkk...', '.kkNNNkk.', 'kNNnNNnNk', 'kkkkkkkkk'],
  stone: ['..kkkkk..', '.ksWsssk.', 'kssssssSk', 'ksssssSSk', '.kSSSSSk.', '..kkkkk..'],
  cork: ['.kkkkk.', 'knnnnnk', 'kNnnGnk', 'knnNnnk', 'kNnnnNk', 'knGNnnk', 'kNnnnnk', '.kkkkk.'],

  // Green and vegetal
  grass: ['.k...k..k..', 'kGk.kGk.kGk', 'kGk.kGk.kGk', 'kGGkGGGkGGk', 'kGLGGLGGLGk', 'kkkkkkkkkkk'],
  'bell pepper': ['....kk...', '...kGk...', '.kkkkkkk.', 'kgGkgGkGk', 'kgwgGgGLk', 'kgGgGgGLk', 'kGgGGgGLk', '.kGkGkLk.', '..k.k.k..'],
  asparagus: ['..k..', '.kGk.', '.kLk.', 'kGLGk', '.kGk.', '.kGk.', 'kGGGk', '.kGk.', '.kGk.', '.kGk.', '.kkk.'],
  olive: recolor(OLIVE, { P: 'G', Q: 'L' }),
  'black olive': recolor(OLIVE, { P: 'X', Q: 'k', w: 'l' }),
  artichoke: ['....k....', '...kGk...', '..kGLGk..', '.kGLGLGk.', 'kGLGLGLGk', '.kLGLGLk.', '..kLGLk..', '...kkk...', '....k....'],
  cabbage: recolor(BULB, { P: 'g', Q: 'G' }),
  tea: ['.kkkkkkk..', '.kNNNNNkkk', '.kWWWWWk.k', '.kWWWWWkkk', '..kWWWk...', 'kkkkkkkkk.'],
  hay: ['.kkkkkkkk.', 'kyoyyoyyok', 'kyyoyyoyyk', 'kNNNNNNNNk', 'kyoyyoyyok', 'kyyoyyoyyk', '.kkkkkkkk.'],

  // Chemical, sulfur and funk
  petrol: ['....k....', '...kXk...', '...kXk...', '..kXXXk..', '.kXlXXXk.', '.kXbXpXk.', 'kXXXyXXXk', 'kXXXXXXXk', '.kXXXXXk.', '..kkkkk..'],
  match: ['.kkk.', 'kcRck', 'kccck', '.kkk.', '.kNk.', '.kNk.', '.kNk.', '.kNk.', '.kNk.', '.kkk.'],
  garlic: recolor(BULB, { P: 'W', Q: 'e' }),
  onion: recolor(BULB, { P: 'l', Q: 'V' }),
  rubber: ['..kkkkk..', '.kSSSSSk.', 'kSSkkkSSk', 'kSk...kSk', 'kSk...kSk', 'kSSkkkSSk', '.kSSSSSk.', '..kkkkk..'],
  dog: ['.kk...kk.', 'kNNkkkNNk', 'kNnnnnnNk', 'kNnknknNk', '.knnkknk.', '..knnnk..', '...kkk...'],
  yarn: ['..kkkkk...', '.kpdpppk..', 'kpppdppdk.', 'kdpppdppk.', 'kppdpppdk.', 'kpdpppdpk.', '.kppdppkk.', '..kkkkk.dd'],
  cardboard: ['kkkkkkkkk', 'knnnNnnnk', 'kkkkkkkkk', 'knnnNnnnk', 'knnnNnnnk', 'knnnnnnnk', 'kkkkkkkkk'],
  soap: ['.......kk.', '..k...kbWk', '.kbk...kk.', '..k.......', '.kkkkkkkk.', 'kpWppppppk', 'kppppppppk', 'kddddddddk', '.kkkkkkkk.'],
  fish: ['...kkkk..k.', '.kkbbbbk.kk', 'kbkbbbbbkbk', 'kbbbbbbbbbk', '.kkBBBBk.kk', '...kkkk..k.'],
  flask: ['...kkk...', '...kwk...', '...kwk...', '..kwwwk..', '.kwwwwwk.', 'kwmmmmmwk', 'kmmWmmmmk', 'kmmmmmmmk', 'kkkkkkkkk'],
} satisfies Record<string, string[]>

export type FlavorIcon = keyof typeof FLAVOR_ART

// Words (singular, lowercase, no accents) that point at each drawing. The longest match wins,
// so "strawberry jam" is jam, "bell pepper" isn't black pepper, and "orange blossom" is a flower.
const WORDS: Record<FlavorIcon, string[]> = {
  pear: ['pear', 'asian pear', 'quince'],
  apricot: ['apricot', 'dried apricot'],
  peach: ['peach', 'white peach', 'nectarine', 'stone fruit'],
  apple: ['apple', 'green apple', 'red apple', 'baked apple', 'tree fruit'],
  cherry: ['cherry', 'black cherry', 'sour cherry', 'kirsch'],
  plum: ['plum', 'prune', 'damson'],
  lemon: ['lemon', 'lemon zest', 'lemon curd', 'citrus', 'meyer lemon'],
  lime: ['lime', 'lime zest', 'key lime'],
  orange: ['orange', 'orange peel', 'tangerine', 'mandarin', 'clementine', 'blood orange'],
  grapefruit: ['grapefruit', 'pomelo'],
  strawberry: ['strawberry'],
  raspberry: ['raspberry', 'red berry', 'berry', 'red currant', 'cranberry'],
  blackberry: ['blackberry', 'blackcurrant', 'black currant', 'cassis', 'black fruit', 'mulberry', 'boysenberry'],
  blueberry: ['blueberry'],
  grapes: ['grape', 'labrusca', 'methyl anthranilate', 'foxy'],
  pineapple: ['pineapple', 'tropical', 'tropical fruit', 'passion fruit', 'mango', 'guava', 'lychee'],
  melon: ['melon', 'honeydew', 'cantaloupe', 'watermelon'],
  banana: ['banana', 'estery'],
  raisin: ['raisin', 'dried fruit', 'sultana', 'date'],
  fig: ['fig'],
  jam: ['jam', 'strawberry jam', 'jammy', 'compote', 'marmalade'],
  candy: ['artificial fruit', 'candy', 'bubblegum', 'cotton candy', 'jolly rancher'],
  flower: ['floral', 'flower', 'blossom', 'orange blossom', 'apple blossom', 'geranium', 'honeysuckle', 'linalool', 'terpene', 'elderflower', 'acacia', 'lavender'],
  rose: ['rose', 'rose petal'],
  violet: ['violet', 'iris'],
  jasmine: ['jasmine', 'white flower', 'gardenia'],
  vanilla: ['vanilla'],
  cinnamon: ['cinnamon', 'spice', 'spicy', 'baking spice', 'nutmeg', 'ginger'],
  clove: ['clove'],
  pepper: ['pepper', 'black pepper', 'white pepper', 'peppercorn', 'black peppercorn'],
  anise: ['anise', 'aniseed', 'star anise', 'licorice', 'liquorice', 'fennel'],
  mint: ['mint', 'herb', 'herbal', 'fresh herb', 'basil', 'sage', 'thyme', 'vegetative', 'green'],
  eucalyptus: ['eucalyptus', 'menthol'],
  bread: ['bread', 'yeast', 'yeasty', 'lees', 'leesy', 'flor', 'flor yeast', 'brioche', 'biscuit', 'dough'],
  toast: ['toast', 'toasty', 'burnt toast', 'charred', 'burned', 'burnt'],
  cheese: ['cheese', 'lactic', 'lactic acid', 'butyric acid', 'sweaty', 'yogurt', 'cream'],
  butter: ['butter', 'buttery', 'diacetyl'],
  honey: ['honey', 'beeswax', 'honeycomb'],
  caramel: ['caramel', 'caramelized', 'butterscotch', 'molasses', 'toffee', 'brown sugar', 'maple'],
  chocolate: ['chocolate', 'cocoa', 'mocha', 'dark chocolate'],
  soy: ['soy sauce', 'soy', 'umami'],
  smoke: ['smoke', 'smoky', 'smoked'],
  barrel: ['oak', 'oaky', 'wood', 'woody', 'cedar', 'sawdust', 'barrel', 'phenolic'],
  pine: ['pine', 'resin', 'resinous', 'forest floor', 'evergreen'],
  mushroom: ['mushroom', 'truffle', 'earthy mushroom'],
  earth: ['earth', 'earthy', 'dust', 'dusty', 'soil', 'dirt', 'potting soil'],
  stone: ['stone', 'wet stone', 'slate', 'mineral', 'minerality', 'flint', 'chalk', 'concrete', 'gravel', 'saline'],
  cork: ['cork', 'corked', 'mouldy cork', 'moldy cork', 'mould', 'mold', 'mouldy', 'moldy', 'musty', 'mouldy cooperage', 'moldy cooperage'],
  grass: ['grass', 'cut grass', 'fresh cut grass', 'stemmy', 'stem', 'grassy'],
  'bell pepper': ['bell pepper', 'green pepper', 'capsicum', 'jalapeno'],
  asparagus: ['asparagus', 'green bean', 'canned vegetable', 'cooked vegetable'],
  olive: ['olive', 'green olive'],
  'black olive': ['black olive', 'tapenade'],
  artichoke: ['artichoke'],
  cabbage: ['cabbage', 'sauerkraut'],
  tea: ['tea', 'black tea', 'green tea', 'chamomile'],
  hay: ['hay', 'straw', 'dried herb', 'dried', 'tobacco', 'barnyard', 'horsey'],
  petrol: ['petrol', 'petroleum', 'diesel', 'kerosene', 'gasoline', 'tdn', 'plastic', 'tar'],
  match: ['match', 'burnt match', 'struck match', 'sulphur', 'sulfur', 'sulphur dioxide', 'sulfur dioxide', 'skunk', 'mercaptan', 'hydrogen sulphide', 'hydrogen sulfide', 'rotten egg'],
  garlic: ['garlic'],
  onion: ['onion', 'shallot'],
  rubber: ['rubber', 'rubbery', 'tire', 'tyre'],
  dog: ['wet dog'],
  yarn: ['wool', 'wet wool', 'lanolin'],
  cardboard: ['cardboard', 'wet cardboard', 'paper', 'wet paper', 'papery', 'filter pad'],
  soap: ['soap', 'soapy'],
  fish: ['fish', 'fishy'],
  flask: ['chemical', 'pungent', 'ethanol', 'alcohol', 'acetic acid', 'vinegar', 'ethyl acetate', 'nail polish', 'sorbate', 'acetaldehyde', 'oxidized', 'oxidised', 'fusel alcohol', 'phenol', 'medicinal', 'band aid', 'nutty', 'sherry'],
}

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/** Plural to singular, roughly: cherries → cherry, peaches → peach, figs → fig. Not -ss words (grass). */
const singular = (word: string) =>
  word.endsWith('ies') ? `${word.slice(0, -3)}y` : /(ch|sh|x|ss)es$/.test(word) ? word.slice(0, -2) : /[^s]s$/.test(word) ? word.slice(0, -1) : word

// Both sides go through the same steps, so "molasses" still matches "molasses".
const simplify = (text: string) => normalize(text).split(' ').map(singular).join(' ')

// Every phrase, longest first, so the most specific match wins.
const PHRASES = (Object.entries(WORDS) as [FlavorIcon, string[]][])
  .flatMap(([icon, words]) => words.map((phrase) => ({ icon, words: simplify(phrase) })))
  .sort((a, b) => b.words.length - a.words.length)

/** The drawing for a tasting note, like "ripe pears" → pear, or undefined when nothing fits. */
export function flavorIcon(flavor: string): FlavorIcon | undefined {
  const text = ` ${simplify(flavor)} `
  return PHRASES.find(({ words }) => text.includes(` ${words} `))?.icon
}
