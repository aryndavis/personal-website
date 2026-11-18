// Turns a month of Gen Z With A Glass posts into the monthly post's title and Markdown body, for Substack.
// Used by wine-digest.mjs; kept separate so it can be tested.

import { publicUrl, sections, wineDomain } from '../src/site.ts'

/** The hello at the top, for Aryn to write each month. The command warns if it's still in the email. */
export const INTRO_PLACEHOLDER = '[Write a short hello here: what you’ve been drinking, and anything coming up.]'

/** "2026-10" → "October 2026". */
export const monthName = (month) =>
  new Date(`${month}-15T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })

/** The month before the given date, as "YYYY-MM" (the digest usually goes out at the start of the next month). */
export function previousMonth(today = new Date()) {
  const date = new Date(Date.UTC(today.getFullYear(), today.getMonth() - 1, 1))
  return date.toISOString().slice(0, 7)
}

export const isMonth = (text) => /^\d{4}-(0[1-9]|1[0-2])$/.test(text)

/** Keeps a wine name like "Chateau *Something* [Reserve]" from turning into Markdown formatting or links. */
const plain = (text) => String(text).replace(/([\\`*_[\]<>#])/g, '\\$1')

const link = (post) => publicUrl(`${sections.wine.path}/${post.slug}`)

const OPENING_LENGTH = 220
const inlineText = (text) => (typeof text === 'string' ? text : text.map((part) => (typeof part === 'string' ? part : part.text)).join(''))

/**
 * The start of a post's story: whole sentences from its first paragraph, up to about OPENING_LENGTH characters
 * (always at least one sentence, cut at a word if that one is very long).
 */
export function opening(post) {
  const first = (post.body ?? []).find((block) => block.type === 'p')
  if (!first) return undefined
  const text = inlineText(first.text).replace(/\s+/g, ' ').trim()
  const sentences = text.match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g) ?? [text]
  let result = ''
  for (const sentence of sentences) {
    if (result && (result + sentence).trim().length > OPENING_LENGTH) break
    result += sentence
  }
  result = result.trim()
  if (result.length > OPENING_LENGTH * 1.5) result = `${result.slice(0, OPENING_LENGTH).replace(/\s+\S*$/, '')}…`
  return result || undefined
}

// Each bottle opens with the story and what it was paired with, so readers who don't know wine have a way in.
// The facts come after; the verdict only shows when there's no story to lead with.
function tastingLines(post) {
  const wine = post.wine ?? {}
  const style = wine.style ? wine.style.charAt(0).toUpperCase() + wine.style.slice(1) : undefined
  const facts = [style, wine.grape, wine.region, wine.rating !== undefined && `♥ ${wine.rating}/5`, wine.buyAgain === 'yes' && 'I’d buy it again'].filter(Boolean)
  const story = opening(post)
  return [
    `**[${plain(post.title)}](${link(post)})**`,
    story ? `${plain(story)} [Keep reading →](${link(post)})` : wine.verdict && `> “${plain(wine.verdict)}”`,
    wine.pairedWith && `*Paired with:* ${plain(wine.pairedWith)}`,
    facts.length && plain(facts.join(' · ')),
  ]
    .filter(Boolean)
    .join('\n\n')
}

const guideLines = (post) => [`**[${plain(post.title)}](${link(post)})**`, post.summary && plain(post.summary)].filter(Boolean).join('\n\n')

/** Posts dated in the month ("YYYY-MM"), oldest first, so the email reads in order. */
export const postsIn = (posts, month) => posts.filter((post) => post.date.startsWith(`${month}-`)).sort((a, b) => a.date.localeCompare(b.date))

/** The email for a month, or undefined when nothing was posted then. */
export function monthlyDigest(posts, month) {
  const inMonth = postsIn(posts, month)
  if (!inMonth.length) return undefined
  const tastings = inMonth.filter((post) => post.kind === 'tasting')
  const guides = inMonth.filter((post) => post.kind === 'guide')
  const sections_ = [
    INTRO_PLACEHOLDER,
    tastings.length && `## New on the rack\n\n${tastings.map(tastingLines).join('\n\n')}`,
    guides.length && `## New guides\n\n${guides.map(guideLines).join('\n\n')}`,
    `[See the whole rack at ${wineDomain.host}](${wineDomain.url}/)`,
  ].filter(Boolean)
  return { subject: `${wineDomain.name}: ${monthName(month)}`, body: `${sections_.join('\n\n')}\n`, count: inMonth.length }
}
