// The text-to-post flow, kept separate from Netlify so it can be tested without the network.
//
// 1. Only Twilio-signed requests from the owner's phone number get through; everything else gets no reply.
// 2. "wine: …" is parsed and a preview is texted back. Nothing is published yet.
// 3. "YES" publishes the waiting note (a commit to the site's repo); "NO" throws it away.
//    The preview only ever goes to the owner's real phone, so a spoofed sender can't confirm a post.
import { guessStyle, type TastingNote } from '../../src/content/tastingNotes.ts'
import { MAX_TEXT_LENGTH, TEXT_TEMPLATE, isTextNote, parseTextNote } from '../../src/content/textNote.ts'
import { isFromTwilio, twiml } from './twilio.ts'

export interface Store {
  get(key: string): Promise<unknown>
  set(key: string, value: unknown): Promise<void>
  delete(key: string): Promise<void>
}

export interface SmsDeps {
  /** Twilio auth token, used to check signatures. */
  authToken: string
  /** The owner's phone number in +15551234567 form. */
  allowedFrom: string
  /** The exact URL configured in Twilio, e.g. https://arynlynn.com/api/sms. */
  webhookUrl: string
  /** Kill switch: when false, texts are answered but nothing is published. */
  publishing: boolean
  /** For post dates, e.g. America/New_York. */
  timeZone: string
  siteUrl: string
  store: Store
  readTextNotes(): Promise<unknown[]>
  publish(note: TastingNote, message: string): Promise<void>
  /** The link a new note will get, given the texted notes already published. */
  slugFor(note: TastingNote, published: TastingNote[]): string
  now(): Date
}

const PENDING = 'pending'
const PENDING_MINUTES = 60
// A ceiling on runaway use (a stuck phone, a script that got the auth token), well above normal posting.
const MAX_TEXTS_PER_DAY = 60
const MAX_POSTS_PER_DAY = 10
const MAX_REQUEST_BYTES = 16_000

const normalizeNumber = (number: string) => number.replace(/[^\d+]/g, '')

export function dateIn(timeZone: string, date: Date): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

export function preview(note: TastingNote): string {
  const style = note.style ?? guessStyle(note.wine, note.grape)
  const facts = [
    style && `${style}${note.style ? '' : ' (guessed)'}`,
    note.rating && `${'♥'.repeat(Math.floor(note.rating))}${note.rating % 1 ? '½' : ''}${'♡'.repeat(5 - Math.ceil(note.rating))}`,
    note.buyAgain && `buy again: ${note.buyAgain}`,
    note.price,
  ].filter(Boolean)
  const flavors = Array.isArray(note.flavors) ? note.flavors.join(', ') : note.flavors
  const lines = [
    `Preview: ${note.title ?? `${note.wine} ${note.vintage}`} (${note.grape})`,
    facts.length ? facts.join(' · ') : '',
    note.verdict ? `“${note.verdict}”` : '',
    flavors ? `flavors: ${flavors}` : '',
    note.pairedWith ? `paired with: ${note.pairedWith}` : '',
    note.thoughts ? `notes: ${note.thoughts.length} characters` : '',
    'Reply YES to post or NO to discard.',
  ]
  return lines.filter(Boolean).join('\n')
}

async function bump(store: Store, key: string): Promise<number> {
  const count = Number((await store.get(key)) ?? 0) + 1
  await store.set(key, count)
  return count
}

export async function handleSms(request: Request, deps: SmsDeps): Promise<Response> {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { allow: 'POST' } })
  const raw = await request.text()
  if (raw.length > MAX_REQUEST_BYTES) return new Response('Too large', { status: 413 })
  const params = Object.fromEntries(new URLSearchParams(raw))

  if (!(await isFromTwilio(deps.authToken, deps.webhookUrl, params, request.headers.get('x-twilio-signature')))) {
    return new Response('Forbidden', { status: 403 })
  }
  // Anyone else who texts the number gets silence.
  if (!deps.allowedFrom || normalizeNumber(params.From ?? '') !== normalizeNumber(deps.allowedFrom)) return twiml()

  try {
    return await respond(params, deps)
  } catch (error) {
    // Storage or another service failed: say so instead of leaving the texter with no reply.
    console.error('text handling failed', error)
    return twiml('Something went wrong on my end. Try again in a minute.')
  }
}

/** Handles a text from the owner (already checked: signed by Twilio, from the allowed number). */
async function respond(params: Record<string, string>, deps: SmsDeps): Promise<Response> {
  const today = dateIn(deps.timeZone, deps.now())
  if ((await bump(deps.store, `texts/${today}`)) > MAX_TEXTS_PER_DAY) return twiml()
  if (!deps.publishing) return twiml('Posting by text is turned off right now.')

  const body = (params.Body ?? '').trim()
  const command = body.toLowerCase().replace(/[.!\s]+$/g, '')

  if (command === 'help' || command === 'wine help') return twiml(`Text a tasting note like this (only the first line is required):\n\n${TEXT_TEMPLATE}`)

  if (command === 'no' || command === 'n') {
    await deps.store.delete(PENDING)
    return twiml('Discarded. Nothing was posted.')
  }

  if (command === 'yes' || command === 'y') {
    const pending = (await deps.store.get(PENDING)) as { note: unknown; at: number } | null
    if (!pending || deps.now().getTime() - pending.at > PENDING_MINUTES * 60_000 || !isTextNote(pending.note)) {
      await deps.store.delete(PENDING)
      return twiml('There’s nothing waiting to post (previews expire after an hour). Text a note starting with "wine:".')
    }
    if (Number((await deps.store.get(`posts/${today}`)) ?? 0) >= MAX_POSTS_PER_DAY) {
      return twiml(`That’s ${MAX_POSTS_PER_DAY} posts today, the daily limit. Your preview is saved; reply YES tomorrow.`)
    }
    const note = pending.note
    let slug: string
    try {
      const published = (await deps.readTextNotes()).filter(isTextNote)
      // Already posted (say, the preview couldn't be cleared after an earlier YES): don't post it twice.
      const alreadyPosted = published.find((existing) => JSON.stringify(existing) === JSON.stringify(note))
      if (alreadyPosted) {
        await deps.store.delete(PENDING).catch(() => {})
        return twiml(`That one’s already posted: ${deps.siteUrl}/#/wine/${deps.slugFor(note, published.filter((n) => n !== alreadyPosted))}`)
      }
      slug = deps.slugFor(note, published)
      await deps.publish(note, `Add tasting note by text: ${note.wine} ${note.vintage}`)
    } catch (error) {
      console.error('publish failed', error)
      return twiml('I couldn’t post that just now. Your preview is still saved, so reply YES to try again.')
    }
    // It's posted. Bookkeeping failures after this point must not make it look unposted (a second YES
    // would post it twice), so they're logged and the reply still says it worked.
    try {
      await deps.store.delete(PENDING)
      await bump(deps.store, `posts/${today}`)
    } catch (error) {
      console.error('posted, but clearing the preview failed', error)
    }
    return twiml(`Posted! It’ll be live in a couple of minutes: ${deps.siteUrl}/#/wine/${slug}`)
  }

  if (/^books?\b/i.test(body)) return twiml('Adding books by text isn’t set up yet.')

  if (/^wine\b/i.test(body)) {
    if (body.length > MAX_TEXT_LENGTH) return twiml(`That’s over ${MAX_TEXT_LENGTH} characters. Trim the notes and try again.`)
    const result = parseTextNote(body, today)
    if (!result.ok) return twiml(result.error)
    await deps.store.set(PENDING, { note: result.note, at: deps.now().getTime() })
    return twiml(preview(result.note))
  }

  return twiml('Start a tasting note with "wine: Name, Grape, Year". Text "wine help" for the template.')
}
