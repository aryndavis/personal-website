// Twilio webhook for posting wine tasting notes by text. See netlify/lib/sms.ts for the flow and
// the README ("Post tasting notes by text") for setup. Settings come from Netlify environment variables:
//
//   TWILIO_AUTH_TOKEN   secret: checks that requests come from Twilio
//   SMS_ALLOWED_FROM    the only phone number allowed to post, e.g. +15551234567
//   SMS_WEBHOOK_URL     the URL set in Twilio, e.g. https://arynlynn.com/api/sms
//   GITHUB_TOKEN        secret: fine-grained token for this repo with Contents read/write only
//   SMS_PUBLISHING      "on" to allow posting (anything else turns it off)
//   SMS_TIMEZONE        optional, for post dates (default America/New_York)
import { getStore } from '@netlify/blobs'
import type { Config } from '@netlify/functions'
import { tastingNotes, type TastingNote } from '../../src/content/tastingNotes.ts'
import { guides, handNotes } from '../../src/content/wine.ts'
import { appendNote, readNotes, type GitHubConfig } from '../lib/github.ts'
import { handleSms } from '../lib/sms.ts'

const env = (name: string) => Netlify.env.get(name) ?? ''

export default async (request: Request) => {
  const github: GitHubConfig = { token: env('GITHUB_TOKEN'), repo: env('GITHUB_REPO') || 'aryndavis/personal-website', branch: 'main' }
  const store = getStore({ name: 'sms', consistency: 'strong' })

  return handleSms(request, {
    authToken: env('TWILIO_AUTH_TOKEN'),
    allowedFrom: env('SMS_ALLOWED_FROM'),
    webhookUrl: env('SMS_WEBHOOK_URL'),
    publishing: env('SMS_PUBLISHING') === 'on' && Boolean(github.token),
    timeZone: env('SMS_TIMEZONE') || 'America/New_York',
    siteUrl: env('URL') || 'https://arynlynn.com',
    store: {
      get: (key) => store.get(key, { type: 'json' }),
      set: async (key, value) => {
        await store.setJSON(key, value)
      },
      delete: (key) => store.delete(key),
    },
    readTextNotes: async () => (await readNotes(github)).notes,
    publish: (note, message) => appendNote(github, note, message),
    slugFor: (note: TastingNote, published: TastingNote[]) => {
      // Same link logic as the site: all notes plus the new one, with guide links already taken.
      const posts = tastingNotes([...handNotes, ...published, note], guides.map((guide) => guide.slug))
      return posts.at(-1)!.slug
    },
    now: () => new Date(),
  })
}

export const config: Config = { path: '/api/sms', method: 'POST' }
