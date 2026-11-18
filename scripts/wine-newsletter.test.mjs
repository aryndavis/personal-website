// Run with `npm test`. The monthly email: the sign-up link, the RSS feed, and the digest draft.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { newsletterSubscribeUrl } from '../src/site.ts'
import { INTRO_PLACEHOLDER, digestHtml, isMonth, monthlyDigest, opening, previousMonth } from './digest-markdown.mjs'
import { renderPage, wineDomainRules, wineFeed } from './page-html.mjs'

const tasting = (overrides) => ({
  kind: 'tasting',
  slug: 'negretti-barolo-2021',
  title: 'Negretti Barolo 2021',
  date: '2026-10-26',
  summary: 'A balanced Barolo.',
  wine: { name: 'Negretti Barolo', grape: 'Nebbiolo', vintage: 2021, style: 'red', region: 'Barolo, Piedmont, Italy', rating: 3.5, verdict: 'Very balanced.' },
  ...overrides,
})
const guide = { kind: 'guide', slug: 'smell-vs-taste', title: 'Smell vs. taste', date: '2026-10-02', summary: 'Why your nose does most of the work.' }

test('the sign-up is a link to Substack, so the site still allows no form posts', () => {
  const headers = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8')
  assert.match(headers, /form-action 'none';/)
  assert.equal(newsletterSubscribeUrl(''), '')
  assert.equal(newsletterSubscribeUrl('https://genz.substack.com'), 'https://genz.substack.com/subscribe')
  assert.equal(newsletterSubscribeUrl('https://genz.substack.com/'), 'https://genz.substack.com/subscribe')
})

test('the RSS feed lists posts newest first with full genzwithaglass.com links, escaped', () => {
  const feed = wineFeed([guide, tasting({ title: 'Rosé & friends <2025>' })])
  const links = [...feed.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>/g)].map((match) => match[1])
  assert.deepEqual(links, ['https://genzwithaglass.com/negretti-barolo-2021', 'https://genzwithaglass.com/smell-vs-taste'])
  assert.match(feed, /<title>Rosé &amp; friends &lt;2025&gt;<\/title>/)
  assert.match(feed, /<pubDate>Mon, 26 Oct 2026 12:00:00 GMT<\/pubDate>/)
  assert.match(feed, /<atom:link href="https:\/\/genzwithaglass.com\/feed.xml"/)
})

test('genzwithaglass.com/feed.xml serves the feed', () => {
  const rule = wineDomainRules([]).find((r) => r.from === 'https://genzwithaglass.com/feed.xml')
  assert.deepEqual(rule, { from: 'https://genzwithaglass.com/feed.xml', to: '/feed-wine.xml', status: '200!' })
})

test('the digest covers only that month, oldest first, with a hello to fill in', () => {
  const posts = [tasting(), guide, tasting({ slug: 'old', title: 'Old bottle', date: '2026-09-30' })]
  const digest = monthlyDigest(posts, '2026-10')
  assert.equal(digest.subject, 'Gen Z With A Glass: October 2026')
  assert.equal(digest.count, 2)
  assert.ok(digest.body.startsWith(INTRO_PLACEHOLDER))
  assert.ok(!digest.body.includes('Old bottle'))
  assert.match(digest.body, /\*\*\[Negretti Barolo 2021\]\(https:\/\/genzwithaglass.com\/negretti-barolo-2021\)\*\*/)
  assert.match(digest.body, /Red · Nebbiolo · Barolo, Piedmont, Italy · ♥ 3\.5\/5/)
  assert.match(digest.body, /> “Very balanced\.”/)
  assert.match(digest.body, /## New guides[\s\S]*Smell vs\. taste/)
  assert.ok(!digest.body.startsWith('---'), 'the body starts with the hello, not front matter')
})

test('wine names cannot turn into Markdown links or formatting', () => {
  const digest = monthlyDigest([tasting({ title: 'Cuvée *Rare* [Magnum]' })], '2026-10')
  assert.match(digest.body, /\[Cuvée \\\*Rare\\\* \\\[Magnum\\\]\]\(/)
})

test('an empty month has no digest, and months are checked', () => {
  assert.equal(monthlyDigest([tasting()], '2026-11'), undefined)
  assert.equal(previousMonth(new Date(2026, 0, 5)), '2025-12')
  assert.equal(previousMonth(new Date(2026, 10, 10)), '2026-10')
  assert.ok(isMonth('2026-10'))
  for (const bad of ['2026-13', '2026-1', 'october']) assert.ok(!isMonth(bad), bad)
})

test('each bottle leads with the start of the story and the pairing, then the facts', () => {
  const story = 'this is the perfectly balanced orange wine. I feel like I used to not like orange wines as much but I must have had some great luck lately! Apparently Georgia has some of the oldest wine producing land in the world, and this is one of the oldest grapes anywhere.'
  const post = tasting({
    body: [{ type: 'p', text: story }, { type: 'p', text: 'Second paragraph.' }],
    wine: { ...tasting().wine, pairedWith: 'wavy chips and French onion dip!' },
  })
  const body = monthlyDigest([post], '2026-10').body
  const at = (text) => body.indexOf(text)
  assert.match(body, /this is the perfectly balanced orange wine\. I feel like .* lately! \[Keep reading →\]\(https:\/\/genzwithaglass\.com\/negretti-barolo-2021\)/)
  assert.ok(!body.includes('Apparently Georgia'), 'only the opening, about 220 characters')
  assert.ok(!body.includes('Very balanced'), 'no verdict when the story leads')
  assert.ok(at('this is the') < at('*Paired with:* wavy chips') && at('*Paired with:*') < at('Red · Nebbiolo'))
})

test('the opening handles links, one very long sentence, and no story at all', () => {
  assert.equal(opening(tasting({ body: [{ type: 'p', text: ['Bought at ', { text: 'Table Wine', href: 'https://x' }, '. Great shop.'] }] })), 'Bought at Table Wine. Great shop.')
  const long = opening(tasting({ body: [{ type: 'p', text: 'word '.repeat(200).trim() }] }))
  assert.ok(long.length <= 221 && long.endsWith('…'))
  assert.equal(opening(tasting({ body: [{ type: 'h', text: 'In the glass' }] })), undefined)
  assert.match(monthlyDigest([tasting({ body: [] })], '2026-10').body, /> “Very balanced\.”/)
})

test('the opening does not end a sentence at an abbreviation, an initial or a decimal', () => {
  const filler = 'We opened it on a rainy Sunday with friends from the neighborhood, put on a movie nobody watched, and talked about the wine and everything else for far too long, honestly. '
  const text = `${filler}Then a bottle of St. Laurent from Austria, which I rated a 3.5 vs. the others. Third sentence here.`
  assert.equal(opening(tasting({ body: [{ type: 'p', text }] })), filler.trim())
  const short = opening(tasting({ body: [{ type: 'p', text: 'A St. Laurent rated 3.5 vs. the rest. Done.' }] }))
  assert.equal(short, 'A St. Laurent rated 3.5 vs. the rest. Done.')
})

test('a story that starts like a list or heading stays a paragraph', () => {
  for (const story of ['2019. What a year for Barolo.', '- tried this at a party.', '+ chips.', '# one.']) {
    const body = monthlyDigest([tasting({ body: [{ type: 'p', text: story }] })], '2026-10').body
    const line = body.split('\n').find((l) => l.includes('Keep reading'))
    assert.match(line, /^(\d+\\\.|\\[-+#])/, story)
  }
})

test('the count only includes posts the digest shows', () => {
  assert.equal(monthlyDigest([tasting(), guide, { ...guide, kind: 'other', slug: 'x' }], '2026-10').count, 2)
})

test('the paste-ready HTML has the headings, links, bold and quotes, with nothing left as Markdown', () => {
  const digest = monthlyDigest([tasting({ title: 'Cuvée *Rare* & <Co>', body: [] }), guide], '2026-10')
  const page = digestHtml(digest)
  assert.match(page, /<h2>New on the rack<\/h2>/)
  assert.match(page, /<p><strong><a href="https:\/\/genzwithaglass.com\/negretti-barolo-2021">Cuvée \*Rare\* &amp; &lt;Co&gt;<\/a><\/strong><\/p>/)
  assert.match(page, /<blockquote><p>“Very balanced\.”<\/p><\/blockquote>/)
  assert.match(page, /<h2>New guides<\/h2>/)
  assert.ok(!/\*\*|\]\(|^## /m.test(page.replace(/Cuvée \*Rare\*/g, '')), 'no Markdown left')
})

test('wine pages point feed readers at the RSS feed; the feed file redirects off arynlynn.com', () => {
  const template = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const page = { path: '/wine/a-post', title: 'A', description: 'B', heading: 'A', links: [], article: true }
  assert.match(renderPage(template, page), /<link rel="alternate" type="application\/rss\+xml" title="Gen Z With A Glass" href="https:\/\/genzwithaglass.com\/feed.xml" \/>/)
  assert.doesNotMatch(renderPage(template, { ...page, path: '/portfolio' }), /application\/rss\+xml/)
  assert.ok(wineDomainRules([]).some((r) => r.from === 'https://arynlynn.com/feed-wine.xml' && r.to === 'https://genzwithaglass.com/feed.xml'))
})
