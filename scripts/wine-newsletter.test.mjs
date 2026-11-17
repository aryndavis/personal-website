// Run with `npm test`. The monthly email: the sign-up form's target, the RSS feed, and the digest draft.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { newsletterSignupUrl } from '../src/site.ts'
import { INTRO_PLACEHOLDER, isMonth, monthlyDigest, previousMonth } from './digest-markdown.mjs'
import { wineDomainRules, wineFeed } from './page-html.mjs'

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

test('the sign-up form can post to Buttondown, and only there', () => {
  const headers = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8')
  assert.match(headers, /form-action https:\/\/buttondown\.com;/)
  assert.equal(new URL(newsletterSignupUrl('genz glass')).origin, 'https://buttondown.com')
  assert.ok(newsletterSignupUrl('genz glass').endsWith('/embed-subscribe/genz%20glass'))
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
  assert.ok(!digest.body.startsWith('---'), 'Buttondown rejects a body that starts with front matter')
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
