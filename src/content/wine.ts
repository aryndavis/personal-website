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
    wine: 'Negretti Barolo',
    grape: 'Nebbiolo',
    vintage: 2021,
    style: 'red',
    date: '2026-10-26',
    producer: 'Negretti',
    region: 'Barolo, Piedmont, Italy',
    rating: 3.5,
    buyAgain: 'maybe',
    verdict: 'Very balanced, and the type of red wine I love as someone who only drinks white wine.',
    sweetness: 'dry',
    body: 'medium',
    acidity: 'medium',
    tannin: 'medium',
    flavors: 'blackcurrant, fig, blackberry, peppercorn',
    pairedWith: 'Greens, which brought out a lot of the acidity',
    suggestedPairings: ['braised beef', 'mushroom risotto', 'aged Parmesan'],
  },
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
      'My dad (who is a high-level somm) was visiting my neighborhood recently, so we went to my local wine shop. He said he wanted to buy me an orange wine for my small wine fridge and picked this one out. The whole time we were in the shop, he was embarrassing me by telling everyone that I just started a wine blog.',
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
export const guides: WinePost[] = [
  {
    kind: 'guide',
    slug: 'smell-vs-taste',
    title: 'Smell vs. taste: why the nose and tongue read wine differently',
    date: '2026-11-02',
    summary: 'I don’t like apples, but I don’t mind apple in a wine, and I often pick it out distinctly. On smell vs. taste.',
    tags: ['tasting', 'thoughts'],
    body: [
      {
        type: 'p',
        text: 'I think a lot about the difference between smelling and tasting wine, partly because so many of the aromas I know, I only know from wine. I couldn’t tell you what a blackcurrant actually is, yet I can find it in a glass. I also don’t like apples, but I don’t mind apple in a wine at all, and it’s often one of the notes I pick out most distinctly.',
      },
      {
        type: 'p',
        text: 'In a series of wine classes I took (shoutout to Wine Outlet in Seattle!), the instructor knew about my dislike of apples and brought in a Granny Smith for me to try. I’ve disliked apples since I was a kid, so it was my first apple in years, and it largely tasted like the note I’d been smelling in wine. Granny Smiths are supposed to have one of the most distinctive flavors of any apple (or so I’ve heard), so maybe it makes sense that the taste and the smell lined up for me. I wonder whether other fruits, like blackcurrant, apricot or even other kinds of apple, would have the same parallel to what we find in wine, or whether they’d taste completely different from what I imagined.',
      },
      {
        type: 'p',
        text: 'We tend to think of taste and smell as closely connected, and they are (anything you eat with a stuffy nose proves that). But the more I taste, the more the nose and the tongue feel like two separate senses reading the same glass. Some notes only exist on the nose: I can smell hay in a wine, but I’m not sure I know what hay tastes like. Others change on the way from one to the other, and grassy notes on the nose often come across as more floral on my tongue.',
      },
      {
        type: 'p',
        text: 'Acid is one of the most interesting parts of this for me, because it shapes what you taste and the aftertaste much more than what you smell. You can sort of smell acid, usually as citrus on the nose, but some very acidic wines don’t taste especially lemony. A wine can be really acidic and still be grounded in floral notes, so the acid never feels overpowering. And sometimes high acidity actually makes it easier for me to taste other, non-acidic notes that I couldn’t pick up as easily on the nose. Tannins do something similar in red wine: with your tongue occupied by those sensations, new flavors come forward that you never noticed when you were only smelling the glass.',
      },
      {
        type: 'p',
        text: 'I think this distinction is also why most people are so bad at blind tastings at first, and why they can be so humbling even if you drink wine often. At this stage, I can really only tell red from white (which is obvious) and pick out Riesling, my favorite, just because I drink it so often. Everything else still feels completely unknown to me.',
      },
      {
        type: 'p',
        text: 'There’s also an odd tension between how subjective aromas are and how objectively we often treat them. I’ve never been to a wine tasting competition myself, but I’ve heard in past wine classes that not everyone there lands on the same aromas; instead, people usually lock in on a common few that everyone agrees on. It feels like an open secret in wine that aromas aren’t necessarily concrete, and yet there’s still real anxiety about sharing the notes you pick up at a tasting. No one can actually tell you that you didn’t smell or taste something.',
      },
      {
        type: 'p',
        text: 'We already know genetics shape how we experience certain tastes and smells; cilantro tasting like soap to some people is the classic example. So I’m not sure why wine is so much more stubborn about it. It’s a fascinating thought experiment: how our bodies process all of this, and how that leads two people to have different experiences of the same bottle.',
      },
      {
        type: 'p',
        text: 'It’s also why food pairings for wine usually go by grape rather than by aromas. The core principles of wine (acid, sugar, tannin and body) matter more than any single note you smell. I just think aromas are fun, and they make every glass a little puzzle.',
      },
      {
        type: 'p',
        text: 'So if a wine smells like one thing and tastes like another to you, or you notice something no one else at the table does, share it. That range is a big part of what makes wine so expansive.',
      },
    ],
  },
]

// Notes texted in (netlify/functions/sms.ts adds them to wine.texts.json). Anything malformed is skipped.
export const textNotes: TastingNote[] = (texted as unknown[]).filter(isTextNote)

export const winePosts: WinePost[] = [...tastingNotes([...handNotes, ...textNotes], guides.map((guide) => guide.slug)), ...guides]
