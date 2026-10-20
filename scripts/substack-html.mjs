// Converts a Substack post's HTML into the site's typed blocks (see src/content/types.ts).
// Image blocks come back as { type: 'image', image: index } pointing into `images`; the sync script downloads them.
import { parseFragment } from 'parse5'

const attr = (node, name) => node.attrs?.find((a) => a.name === name)?.value
const classes = (node) => (attr(node, 'class') ?? '').split(/\s+/)
const elements = (node) => (node.childNodes ?? []).filter((child) => child.tagName)
export const squash = (text) => text.replace(/\s+/g, ' ')

function find(node, predicate) {
  for (const child of node.childNodes ?? []) {
    if (predicate(child)) return child
    const found = find(child, predicate)
    if (found) return found
  }
}

/** Plain text of a node, with spacing collapsed. */
// Elements whose contents are never text worth keeping, and block elements that need a space between them.
const NO_TEXT = new Set(['script', 'style', 'template', 'svg', 'button', 'form', 'input', 'select', 'textarea', 'iframe'])
const BLOCK = /^(p|div|li|h[1-6]|blockquote|figcaption|pre|ul|ol|section)$/

function textOf(node) {
  if (node.nodeName === '#text') return node.value
  if (node.tagName === 'br') return ' '
  if (NO_TEXT.has(node.tagName)) return ''
  const text = (node.childNodes ?? []).map(textOf).join('')
  return BLOCK.test(node.tagName) ? ` ${text} ` : text
}
const cleanText = (node) => squash(textOf(node)).trim()

const isWebLink = (href) => {
  try {
    return ['http:', 'https:'].includes(new URL(href).protocol)
  } catch {
    return false
  }
}

/** Paragraph contents as text, links (http/https only) and italics. Bold and other formatting become plain text. */
function inlinesOf(node) {
  const parts = []
  const push = (part) => {
    const last = parts.at(-1)
    if (typeof part === 'string' && typeof last === 'string') parts[parts.length - 1] = last + part
    else parts.push(part)
  }
  const walk = (current, italic) => {
    for (const child of current.childNodes ?? []) {
      if (child.nodeName === '#text') {
        const text = squash(child.value)
        if (!italic || !text.trim()) {
          if (text) push(text)
        } else {
          // Keep the spaces around italic words as plain text.
          const [, before, words, after] = text.match(/^(\s*)(.*?)(\s*)$/)
          if (before) push(before)
          push({ text: words, em: true })
          if (after) push(after)
        }
      } else if (child.tagName === 'br') {
        push(' ')
      } else if (NO_TEXT.has(child.tagName)) {
        // Skip.
      } else if (child.tagName === 'a') {
        const text = cleanText(child)
        const href = attr(child, 'href')
        // Footnote markers point into Substack's page, so keep just the number.
        if (classes(child).includes('footnote-anchor')) push(`[${text}]`)
        else if (text && href && isWebLink(href)) push({ text, href })
        else if (text) push(text)
      } else if (child.tagName === 'em' || child.tagName === 'i') {
        walk(child, true)
      } else {
        walk(child, italic)
      }
    }
  }
  walk(node, false)

  if (typeof parts[0] === 'string') parts[0] = parts[0].trimStart()
  if (typeof parts.at(-1) === 'string') parts[parts.length - 1] = parts.at(-1).trimEnd()
  const result = parts.filter((part) => (typeof part === 'string' ? part : part.text.trim()))
  if (result.length === 0) return null
  return result.length === 1 && typeof result[0] === 'string' ? result[0] : result
}

/** The image inside a Substack image container, with its original (unresized) URL when available. */
function imageOf(container) {
  const img = find(container, (node) => node.tagName === 'img')
  if (!img) return null
  let data = {}
  try {
    data = JSON.parse(attr(img, 'data-attrs') ?? '{}') ?? {}
  } catch {
    // Older posts have no data-attrs; fall back to the img tag.
  }
  const caption = find(container, (node) => node.tagName === 'figcaption')
  return {
    // The resized CDN copy (max 1456px wide) is used for the download; the original URL names the file.
    url: attr(img, 'src'),
    original: typeof data.src === 'string' ? data.src : attr(img, 'src'),
    alt: (typeof data.alt === 'string' && data.alt.trim()) || attr(img, 'alt')?.trim() || '',
    caption: caption ? cleanText(caption) : '',
  }
}

// Substack widgets with nothing worth mirroring: subscribe and share buttons, embeds, polls, dividers.
// Checked before anything else, so a widget wrapped in a <p> is dropped too.
const SKIPPED_CLASSES = [
  'subscription-widget-wrap',
  'subscription-widget-wrap-editor',
  'button-wrapper',
  'captioned-button-wrap',
  'poll-embed',
  'youtube-wrap',
  'tweet',
  'embedded-post-wrap',
  'digest-post-embed',
  'install-substack-app-embed',
  'paywall-jump',
]

export function convert(html, post, warn) {
  const blocks = []
  const images = []

  const visit = (node) => {
    const tag = node.tagName
    if (!tag) {
      const text = node.nodeName === '#text' ? squash(node.value).trim() : ''
      if (text) blocks.push({ type: 'p', text })
      return
    }
    if (NO_TEXT.has(tag) || tag === 'hr' || SKIPPED_CLASSES.some((name) => classes(node).includes(name))) return
    if (tag === 'p' || tag === 'pre') {
      const text = inlinesOf(node)
      if (text) blocks.push({ type: 'p', text })
    } else if (/^h[1-6]$/.test(tag)) {
      const text = cleanText(node)
      if (text) blocks.push({ type: 'h', text })
    } else if (tag === 'ul' || tag === 'ol') {
      const items = elements(node)
        .filter((child) => child.tagName === 'li')
        .map(cleanText)
        .filter(Boolean)
      if (items.length) blocks.push({ type: 'list', items })
    } else if (tag === 'blockquote' || classes(node).includes('pullquote')) {
      const text = cleanText(node)
      if (text) blocks.push({ type: 'quote', text })
    } else if (tag === 'figure' || classes(node).includes('captioned-image-container')) {
      const image = imageOf(node)
      if (!image) return
      const index = images.push(image) - 1
      blocks.push({ type: 'image', image: index })
    } else if (classes(node).includes('footnote')) {
      const text = cleanText(node)
      if (text) blocks.push({ type: 'p', text: text.replace(/^(\d+)\s*/, '$1. ') })
    } else if (tag === 'div' || tag === 'section' || tag === 'footer') {
      elements(node).forEach(visit)
    } else {
      const text = inlinesOf(node)
      if (text) {
        warn(`"${post.slug}": kept <${tag}> as a plain paragraph`)
        blocks.push({ type: 'p', text })
      }
    }
  }

  parseFragment(html).childNodes.forEach(visit)
  return { blocks, images }
}
