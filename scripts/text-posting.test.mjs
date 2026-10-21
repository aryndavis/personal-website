// Run with `npm test`. Checks the text-to-post flow: parsing, Twilio signatures, sender checks, preview and publish.
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { test } from 'node:test'
import { isTextNote, parseTextNote } from '../src/content/textNote.ts'
import { handleSms } from '../netlify/lib/sms.ts'
import { twilioSignature } from '../netlify/lib/twilio.ts'

const TODAY = '2026-10-20'

// ---------- parsing ----------

test('reads a full note, including multi-line notes', () => {
  const result = parseTextNote(
    [
      'Wine: Domaine Example Poulsard, Poulsard, 2022',
      'Producer: Domaine Example',
      'region: Jura, France',
      'Bought at: Bed-Vyne Wine & Spirits, Bed-Stuy',
      'style: Rosé',
      'price: $ $',
      'rating: 4/5',
      'Buy-again: Y',
      'verdict: Bright and wild.',
      'flavors: red currant, rose petal,',
      'sweetness: off dry',
      'body: Medium-Light',
      'acidity: high',
      'tannin: low',
      'paired with: roast chicken',
      'notes: First line.',
      '',
      'Second paragraph: with a colon.',
    ].join('\n'),
    TODAY,
  )
  assert.equal(result.ok, true)
  assert.deepEqual(result.note, {
    wine: 'Domaine Example Poulsard',
    grape: 'Poulsard',
    vintage: '2022',
    date: TODAY,
    producer: 'Domaine Example',
    region: 'Jura, France',
    boughtAt: 'Bed-Vyne Wine & Spirits, Bed-Stuy',
    style: 'rosé',
    price: '$$',
    rating: 4,
    buyAgain: 'yes',
    verdict: 'Bright and wild.',
    flavors: ['red currant', 'rose petal'],
    sweetness: 'off-dry',
    body: 'medium-light',
    acidity: 'high',
    tannin: 'low',
    pairedWith: 'roast chicken',
    thoughts: 'First line.\n\nSecond paragraph: with a colon.',
  })
  assert.ok(isTextNote(result.note))
})

test('only the first line is required; names may contain commas; NV works; blank template lines are skipped', () => {
  const result = parseTextNote('wine Château X, Cuvée Y, Pinot Noir, NV\nrating:\nproducer:', TODAY)
  assert.deepEqual(result, { ok: true, note: { wine: 'Château X, Cuvée Y', grape: 'Pinot Noir', vintage: 'NV', date: TODAY } })
})

test('bad values are explained, never guessed', () => {
  const error = (text) => {
    const result = parseTextNote(text, TODAY)
    assert.equal(result.ok, false, text)
    return result.error
  }
  assert.match(error('hello'), /Start with "wine/)
  assert.match(error('wine: Just a name'), /wine, grape and year/)
  assert.match(error('wine: X, Gamay, 2031'), /vintage/)
  assert.match(error('wine: X, Gamay, 22'), /vintage/)
  assert.match(error('wine: X, Gamay, 2020\nrating: 6'), /from 1 to 5/)
  assert.match(error('wine: X, Gamay, 2020\nacidity: zingy'), /acidity must be none, low, medium-low, medium, medium-high or high/)
  assert.match(error('wine: X, Gamay, 2020\nstyle: purple'), /style must be/)
  assert.match(error('wine: X, Gamay, 2020\nfavorite: yes'), /don't know the label "favorite"/)
  assert.match(error('wine: X, Gamay, 2020\njust some words'), /label: value/)
  assert.match(error(`wine: ${'x'.repeat(130)}, Gamay, 2020`), /too long/)
  assert.match(error('wine: X, Gamay, 2020\nnotes: ' + 'x'.repeat(1700)), /too long/)
})

test('acidity and tannin can be none', () => {
  const result = parseTextNote('wine: X, Sauvignon Blanc, 2024\ntannin: none\nacidity: None', TODAY)
  assert.equal(result.ok, true)
  assert.equal(result.note.tannin, 'none')
  assert.equal(result.note.acidity, 'none')
  assert.ok(isTextNote({ wine: 'X', grape: 'Y', vintage: '2020', date: TODAY, tannin: 'none' }))
})

test('ratings: whole or half hearts from 1 to 5, written a few ways', () => {
  const rating = (value) => {
    const result = parseTextNote(`wine: X, Riesling, 2023\nrating: ${value}`, TODAY)
    return result.ok ? result.note.rating : result.error
  }
  for (const [text, expected] of [['4', 4], ['4/5', 4], ['4.5', 4.5], ['4½', 4.5], ['4.5 hearts', 4.5], ['1', 1], ['5', 5], ['1.5', 1.5]]) {
    assert.equal(rating(text), expected, text)
  }
  for (const text of ['0', '0.5', '5.5', '6', '4.3', '4.25', '-1', 'great', '4.']) {
    assert.match(String(rating(text)), /from 1 to 5, in halves/, text)
  }
})

test('stored notes are checked before reaching the site', () => {
  assert.ok(isTextNote({ wine: 'X', grape: 'Y', vintage: '2020', date: TODAY, rating: 4.5 }))
  assert.equal(isTextNote({ wine: 'X', grape: 'Y', vintage: '2020', date: TODAY, rating: 4.3 }), false)
  assert.ok(isTextNote({ wine: 'X', grape: 'Y', vintage: '2020', date: TODAY, rating: 3, flavors: ['a'] }))
  assert.equal(isTextNote({ wine: 'X', grape: 'Y', vintage: '2020', date: TODAY, rating: 7 }), false)
  assert.equal(isTextNote({ wine: 'X', grape: 'Y', vintage: '2020', date: TODAY, html: '<b>' }), false)
  assert.equal(isTextNote({ wine: 'X', grape: 'Y', vintage: 2020, date: TODAY }), false)
  assert.equal(isTextNote(['not', 'a', 'note']), false)
})

// ---------- Twilio signatures ----------

test('signatures match an independent HMAC-SHA1 implementation', async () => {
  const params = { Body: 'wine: X, Gamay, 2020', From: '+15551234567', To: '+15550000000', MessageSid: 'SM1' }
  const url = 'https://arynlynn.com/api/sms'
  const data = url + Object.keys(params).sort().map((k) => k + params[k]).join('')
  assert.equal(await twilioSignature('secret-token', url, params), createHmac('sha1', 'secret-token').update(data).digest('base64'))
})

// ---------- the whole flow ----------

const OWNER = '+15551234567'
const URL_ = 'https://arynlynn.com/api/sms'

function setup(overrides = {}) {
  const data = new Map()
  const published = []
  let clock = Date.parse('2026-10-20T15:00:00Z')
  const deps = {
    authToken: 'secret-token',
    allowedFrom: OWNER,
    webhookUrl: URL_,
    publishing: true,
    timeZone: 'America/New_York',
    siteUrl: 'https://arynlynn.com',
    store: {
      get: async (k) => (data.has(k) ? structuredClone(data.get(k)) : null),
      set: async (k, v) => void data.set(k, structuredClone(v)),
      delete: async (k) => void data.delete(k),
    },
    readTextNotes: async () => published,
    publish: async (note) => void published.push(note),
    slugFor: (note) => `${note.wine.toLowerCase().replace(/\W+/g, '-')}-${note.vintage}`,
    now: () => new Date(clock),
    ...overrides,
  }
  const send = async (body, { from = OWNER, sign = true, signature } = {}) => {
    const params = { Body: body, From: from, To: '+15550000000', MessageSid: 'SM' + Math.random() }
    const headers = { 'content-type': 'application/x-www-form-urlencoded' }
    if (sign) headers['x-twilio-signature'] = signature ?? (await twilioSignature('secret-token', URL_, params))
    const response = await handleSms(new Request(URL_, { method: 'POST', headers, body: new URLSearchParams(params) }), deps)
    const xml = await response.text()
    return { status: response.status, reply: xml.match(/<Message>([\s\S]*)<\/Message>/)?.[1] ?? null }
  }
  return { send, published, data, advance: (ms) => (clock += ms) }
}

test('the preview shows a half rating as a half heart', async () => {
  const { send } = setup()
  assert.match((await send('wine: Late Harvest, Riesling, 2023\nrating: 4.5')).reply, /· ♥♥♥♥½$/m)
  assert.match((await send('wine: Late Harvest, Riesling, 2023\nrating: 1.5')).reply, /♥½♡♡♡/)
})

test('preview, then YES publishes and replies with the link', async () => {
  const { send, published } = setup()
  const first = await send('wine: Sample Gamay, Gamay, 2023\nrating: 4\nbuy again: yes')
  assert.equal(first.status, 200)
  assert.match(first.reply, /Preview: Sample Gamay 2023 \(Gamay\)/)
  assert.match(first.reply, /red \(guessed\) · ♥♥♥♥♡ · buy again: yes/)
  assert.match(first.reply, /Reply YES to post/)
  assert.equal(published.length, 0, 'nothing is published before YES')

  const yes = await send('Yes!')
  assert.match(yes.reply, /Posted! .*https:\/\/arynlynn\.com\/wine\/sample-gamay-2023/)
  assert.equal(published.length, 1)
  assert.equal(published[0].date, '2026-10-20')

  const again = await send('YES')
  assert.match(again.reply, /nothing waiting/, 'a note is only published once')
  assert.equal(published.length, 1)
})

test('NO discards; previews expire after an hour', async () => {
  const { send, published, advance } = setup()
  await send('wine: A, Gamay, 2023')
  assert.match((await send('no')).reply, /Discarded/)
  assert.match((await send('yes')).reply, /nothing waiting/)

  await send('wine: B, Gamay, 2023')
  advance(61 * 60_000)
  assert.match((await send('yes')).reply, /nothing waiting/)
  assert.equal(published.length, 0)
})

test('unsigned, forged or other-number texts never post', async () => {
  const { send, published } = setup()
  assert.equal((await send('wine: A, Gamay, 2023', { sign: false })).status, 403)
  assert.equal((await send('wine: A, Gamay, 2023', { signature: 'forged==' })).status, 403)

  const stranger = await send('wine: A, Gamay, 2023', { from: '+15559999999' })
  assert.equal(stranger.status, 200)
  assert.equal(stranger.reply, null, 'strangers get no reply')
  assert.equal((await send('yes', { from: '+15559999999' })).reply, null)
  assert.equal(published.length, 0)
})

test('a spoofed sender cannot confirm: YES needs a preview, which only goes to the real phone', async () => {
  const { send, published } = setup()
  // Even if someone fakes the owner's number, they never see the preview, and YES with nothing waiting does nothing.
  assert.match((await send('yes')).reply, /nothing waiting/)
  assert.equal(published.length, 0)
})

test('help, books, unknown texts and the kill switch', async () => {
  assert.match((await setup().send('wine help')).reply, /only the first line is required/)
  assert.match((await setup().send('book Matilda')).reply, /isn’t set up yet/)
  assert.match((await setup().send('hi')).reply, /Start a tasting note/)
  const off = setup({ publishing: false })
  assert.match((await off.send('wine: A, Gamay, 2023')).reply, /turned off/)
})

test('XML in a text is escaped in the reply', async () => {
  const { send } = setup()
  const { reply } = await send('wine: <b>Bold</b> & co, Gamay, 2023')
  assert.match(reply, /&lt;b&gt;Bold&lt;\/b&gt; &amp; co/)
})

test('a failed publish keeps the preview so YES can be retried', async () => {
  let fail = true
  const published = []
  const { send } = setup({
    publish: async (note) => {
      if (fail) throw new Error('GitHub down')
      published.push(note)
    },
  })
  await send('wine: A, Gamay, 2023')
  const original = console.error
  console.error = () => {}
  try {
    assert.match((await send('yes')).reply, /couldn’t post/)
  } finally {
    console.error = original
  }
  fail = false
  assert.match((await send('yes')).reply, /Posted!/)
  assert.equal(published.length, 1)
})

test('daily limits', async () => {
  const { send, published } = setup()
  for (let i = 0; i < 10; i++) {
    await send(`wine: W${i}, Gamay, 2023`)
    await send('yes')
  }
  assert.equal(published.length, 10)
  await send('wine: Eleven, Gamay, 2023')
  assert.match((await send('yes')).reply, /daily limit/)
  assert.equal(published.length, 10)
})

// ---------- when the services behind it fail (sad paths) ----------

const failingStore = (failOn) => {
  const data = new Map()
  const maybeFail = (op) => {
    if (failOn.includes(op)) throw new Error(`blob store ${op} failed`)
  }
  return {
    get: async (k) => (maybeFail('get'), data.has(k) ? structuredClone(data.get(k)) : null),
    set: async (k, v) => (maybeFail('set'), void data.set(k, structuredClone(v))),
    delete: async (k) => (maybeFail('delete'), void data.delete(k)),
  }
}

const quietly = async (fn) => {
  const original = console.error
  console.error = () => {}
  try {
    return await fn()
  } finally {
    console.error = original
  }
}

test('if storage is down, it replies that something went wrong instead of going silent', async () => {
  // Arrange: the daily counter can't even be read
  const { send } = setup({ store: failingStore(['get']) })

  // Act
  const { status, reply } = await quietly(() => send('wine: A, Gamay, 2023'))

  // Assert
  assert.equal(status, 200)
  assert.match(reply, /Something went wrong on my end/)
})

test('if the preview cannot be saved, nothing is waiting for YES', async () => {
  const store = failingStore(['set'])
  const { send, published } = setup({ store })
  assert.match((await quietly(() => send('wine: A, Gamay, 2023'))).reply, /Something went wrong/)
  assert.equal(published.length, 0)
})

test('a note that posted is never posted twice, even if clearing its preview failed', async () => {
  // Arrange: storage works until the preview is cleared after posting
  const store = failingStore([])
  const { send, published } = setup({ store })
  await send('wine: Once Only, Gamay, 2023')
  const originalDelete = store.delete
  store.delete = async () => {
    throw new Error('blob store delete failed')
  }

  // Act: YES posts it (cleanup fails quietly), then a second YES
  const first = await quietly(() => send('yes'))
  store.delete = originalDelete
  const second = await send('yes')

  // Assert
  assert.match(first.reply, /Posted!/)
  assert.match(second.reply, /already posted/)
  assert.equal(published.length, 1)
})

test('if the published notes cannot be read, nothing posts and the preview is kept', async () => {
  let readsFail = true
  const { send, published } = setup({
    readTextNotes: async () => {
      if (readsFail) throw new Error('GitHub read failed (502)')
      return published
    },
  })
  await send('wine: A, Gamay, 2023')
  assert.match((await quietly(() => send('yes'))).reply, /couldn’t post/)
  readsFail = false
  assert.match((await send('yes')).reply, /Posted!/)
  assert.equal(published.length, 1)
})

// ---------- edge cases at the front door ----------

test('only POST requests of a sensible size are accepted', async () => {
  const deps = { authToken: 'secret-token', allowedFrom: OWNER, webhookUrl: URL_, publishing: true, timeZone: 'UTC', siteUrl: '', store: failingStore([]), readTextNotes: async () => [], publish: async () => {}, slugFor: () => '', now: () => new Date() }
  assert.equal((await handleSms(new Request(URL_, { method: 'GET' }), deps)).status, 405)
  const huge = new URLSearchParams({ Body: 'x'.repeat(20_000), From: OWNER })
  assert.equal((await handleSms(new Request(URL_, { method: 'POST', body: huge }), deps)).status, 413)
})
