// Run with `npm test`. What search engines and link previews read: index.html's metadata, robots.txt and the sitemap.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { site } from '../src/site.ts'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const html = read('index.html')
const meta = (attr, name) => html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`))?.[1]

test('the title and description name Aryn and fit in a search result', () => {
  const title = html.match(/<title>(.*?)<\/title>/)[1].replace('&amp;', '&')
  assert.equal(title, `${site.name} · ${site.tagline}`, 'index.html and App.tsx show the same home title')
  const description = html.match(/name="description"\s+content="([^"]*)"/)[1]
  assert.ok(description.startsWith(site.name))
  assert.ok(description.length <= 160, `description is ${description.length} characters; Google trims around 160`)
})

test('link previews have a title, description and a full-size image on this site', () => {
  for (const name of ['og:title', 'og:description', 'og:url', 'og:image']) assert.ok(meta('property', name), name)
  assert.match(meta('property', 'og:image'), /^https:\/\/arynlynn\.com\/images\/social-card\.png$/)
  const png = readFileSync(new URL('../public/images/social-card.png', import.meta.url))
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1200, 630], 'the preview image is 1200×630')
})

test('the structured data is valid JSON and lists the same profiles as the site', () => {
  const json = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])
  const person = json['@graph'].find((node) => node['@type'] === 'Person')
  assert.equal(person.name, site.name)
  for (const profile of [site.linkedin, site.instagram, site.substack]) assert.ok(person.sameAs.includes(profile), profile)
  assert.equal(person.email, `mailto:${site.email}`)
})

test('robots.txt allows crawling and points at the sitemap the build writes', () => {
  assert.match(read('public/robots.txt'), /^Allow: \/$/m)
  assert.match(read('public/robots.txt'), /^Sitemap: https:\/\/arynlynn\.com\/sitemap\.xml$/m)
})
