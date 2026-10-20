// Run with `npm run test:substack`. Checks the Substack HTML → blocks conversion without the network.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { convert } from './substack-html.mjs'

const run = (html) => {
  const warnings = []
  return { ...convert(html, { slug: 'post' }, (message) => warnings.push(message)), warnings }
}

test('paragraphs keep links and italics; bold becomes plain text', () => {
  const { blocks } = run('<p>An <em>overhaul</em> of <strong>something</strong>, see <a href="https://example.com/a?b=1&amp;c=2">this</a>.</p>')
  assert.deepEqual(blocks, [
    { type: 'p', text: ['An ', { text: 'overhaul', em: true }, ' of something, see ', { text: 'this', href: 'https://example.com/a?b=1&c=2' }, '.'] },
  ])
})

test('only http(s) links stay clickable', () => {
  const { blocks } = run('<p><a href="javascript:alert(1)">bad</a> <a href="mailto:a@b.c">mail</a> <a href="/p/x">relative</a></p>')
  assert.deepEqual(blocks, [{ type: 'p', text: 'bad mail relative' }])
})

test('spaces around italic words stay outside the italics', () => {
  const { blocks } = run('<p>a<em> b </em>c</p>')
  assert.deepEqual(blocks[0].text, ['a ', { text: 'b', em: true }, ' c'])
})

test('headings, lists, quotes and pull quotes', () => {
  const { blocks } = run(
    '<h2>Part <em>one</em></h2><ul><li><p>First</p></li><li>Second <a href="https://x.com">link</a></li></ul>' +
      '<ol><li>Step</li></ol><blockquote><p>Line one</p><p>line two</p></blockquote><div class="pullquote"><p>Pulled</p></div>',
  )
  assert.deepEqual(blocks, [
    { type: 'h', text: 'Part one' },
    { type: 'list', items: ['First', 'Second link'] },
    { type: 'list', items: ['Step'] },
    { type: 'quote', text: 'Line one line two' },
    { type: 'quote', text: 'Pulled' },
  ])
})

test('images use the original URL for naming and keep alt text and captions', () => {
  const dataAttrs = JSON.stringify({ src: 'https://substack-post-media.s3.amazonaws.com/public/images/a.jpeg', alt: 'A school' }).replaceAll('"', '&quot;')
  const { blocks, images } = run(
    `<div class="captioned-image-container"><figure><a href="https://substackcdn.com/x"><picture><img src="https://substackcdn.com/image/fetch/w_1456/a.jpeg" data-attrs="${dataAttrs}" alt=""></picture></a><figcaption class="image-caption">Our <em>school</em></figcaption></figure></div>`,
  )
  assert.deepEqual(blocks, [{ type: 'image', image: 0 }])
  assert.deepEqual(images, [
    {
      url: 'https://substackcdn.com/image/fetch/w_1456/a.jpeg',
      original: 'https://substack-post-media.s3.amazonaws.com/public/images/a.jpeg',
      alt: 'A school',
      caption: 'Our school',
    },
  ])
})

test('subscribe boxes, buttons, embeds and scripts are dropped', () => {
  const { blocks } = run(
    '<p>Keep</p><div class="subscription-widget-wrap"><p>Subscribe now</p><form><input></form></div>' +
      '<p class="button-wrapper"><a class="button" href="https://x.substack.com/subscribe">Subscribe</a></p>' +
      '<div class="youtube-wrap"><iframe src="https://youtube.com"></iframe></div><script>alert(1)</script><hr><p>Also keep</p>',
  )
  assert.deepEqual(blocks, [
    { type: 'p', text: 'Keep' },
    { type: 'p', text: 'Also keep' },
  ])
})

test('footnotes keep their numbers', () => {
  const { blocks } = run(
    '<p>Claim<a class="footnote-anchor" href="#footnote-1" id="footnote-anchor-1">1</a>.</p>' +
      '<div class="footnote"><a class="footnote-number" href="#footnote-anchor-1">1</a><div class="footnote-content"><p>Source.</p></div></div>',
  )
  assert.deepEqual(blocks, [
    { type: 'p', text: 'Claim[1].' },
    { type: 'p', text: '1. Source.' },
  ])
})

test('raw HTML in text stays text', () => {
  const { blocks } = run('<p>&lt;img src=x onerror=alert(1)&gt;</p>')
  assert.deepEqual(blocks, [{ type: 'p', text: '<img src=x onerror=alert(1)>' }])
})

test('unknown elements become paragraphs with a warning; empty ones vanish', () => {
  const { blocks, warnings } = run('<table><tr><td>Cell</td></tr></table><p> </p><p><br></p>')
  assert.deepEqual(blocks, [{ type: 'p', text: 'Cell' }])
  assert.equal(warnings.length, 1)
})
