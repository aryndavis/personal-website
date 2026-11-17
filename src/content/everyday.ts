// Plain-language notes for the tasting card's profile rows, so readers who don't know wine terms
// still get something from the card. Every option on every scale has one; the types make a missing one a build error.
// Each row compares along one everyday thing: sugar, milk, fruit and tea.
import type { Body, Level, Sweetness } from './types'

export const everyday: {
  Sweetness: Record<Sweetness, string>
  Body: Record<Body, string>
  Acidity: Record<Level, string>
  Tannin: Record<Level, string>
} = {
  Sweetness: {
    'bone dry': 'No sugar you can taste at all, like black coffee.',
    dry: 'Barely any sugar you can taste, like unsweetened iced tea.',
    'off-dry': 'Just a hint of sweetness, like the white part of a strawberry near the stem.',
    'medium sweet': 'Clearly sweet, like a glass of apple juice.',
    sweet: 'Dessert sweet, like honey drizzled on toast.',
  },
  Body: {
    light: 'Feels about as heavy in your mouth as skim milk.',
    'medium-light': 'Feels about as heavy in your mouth as 2% milk.',
    medium: 'Feels about as heavy in your mouth as whole milk.',
    'medium-full': 'Feels about as heavy in your mouth as half-and-half.',
    full: 'Feels about as heavy in your mouth as heavy cream.',
  },
  Acidity: {
    none: 'No tartness at all, so it won’t make your mouth water.',
    low: 'Barely tart and soft on the tongue, like a ripe banana.',
    'medium-low': 'A little tart, like a ripe peach.',
    medium: 'Tart enough to make your mouth water a bit, like a red apple.',
    'medium-high': 'Tart enough to make your mouth water, like biting into a green apple.',
    high: 'Very tart and mouth-watering, like fresh lemonade.',
  },
  Tannin: {
    none: 'None of the dry, grippy feeling some wines leave on your gums.',
    low: 'A faint dry feeling on your gums, like weak tea.',
    'medium-low': 'A light, dry grip on your tongue and gums, like green tea.',
    medium: 'A noticeable dry grip on your gums, like a strong cup of black tea.',
    'medium-high': 'A firm, drying grip, like very dark chocolate.',
    high: 'Very drying and grippy, like tea that steeped way too long.',
  },
}
