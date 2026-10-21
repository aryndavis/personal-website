// Run with `npm test`. The seam between the text service and GitHub: reading and appending to wine.texts.json.
import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { TEXTS_PATH, appendNote, readNotes } from '../netlify/lib/github.ts'

const config = { token: 'token-123', repo: 'aryndavis/personal-website', branch: 'main' }
const note = { wine: 'Dr. Loosen Blue Slate', grape: 'Riesling', vintage: '2022', date: '2026-10-21', thoughts: 'Crisp, café-ready, 10/10 💖' }
const b64 = (text) => Buffer.from(text, 'utf8').toString('base64')
const fromB64 = (text) => Buffer.from(text, 'base64').toString('utf8')

/**
 * A fake GitHub contents API holding one file. `putStatuses` lists canned answers for PUTs (by status);
 * `onConflict` runs when a PUT is refused, to change the file the way a competing write would.
 */
function fakeGitHub({ notes = [], putStatuses = [200], readStatus = 200, rawContent, onConflict } = {}) {
  const state = { notes, sha: 'sha-1', requests: [] }
  globalThis.fetch = async (url, init = {}) => {
    state.requests.push({ url: String(url), init })
    if ((init.method ?? 'GET') === 'GET') {
      if (readStatus !== 200) return new Response('nope', { status: readStatus })
      return Response.json({ content: rawContent ?? b64(JSON.stringify(state.notes)), sha: state.sha })
    }
    const status = putStatuses.shift() ?? 200
    if (status === 409) onConflict?.(state)
    if (status === 200) {
      const body = JSON.parse(init.body)
      state.notes = JSON.parse(fromB64(body.content))
      state.sha = `sha-${state.requests.length}`
    }
    return new Response('{}', { status })
  }
  return state
}

const realFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = realFetch
})

test('appends the note with the file’s current sha, on main, keeping accents and emoji intact', async () => {
  // Arrange
  const github = fakeGitHub({ notes: [{ wine: 'Earlier', grape: 'Gamay', vintage: '2020', date: '2026-10-01' }] })

  // Act
  await appendNote(config, note, 'Add tasting note by text: Dr. Loosen Blue Slate 2022')

  // Assert: the PUT request
  const put = github.requests.find((r) => r.init.method === 'PUT')
  const body = JSON.parse(put.init.body)
  assert.equal(put.url, `https://api.github.com/repos/aryndavis/personal-website/contents/${TEXTS_PATH}`)
  assert.equal(put.init.headers.authorization, 'Bearer token-123')
  assert.equal(body.sha, 'sha-1')
  assert.equal(body.branch, 'main')
  assert.equal(body.message, 'Add tasting note by text: Dr. Loosen Blue Slate 2022')
  // Assert: the file afterwards
  assert.deepEqual(github.notes.map((n) => n.wine), ['Earlier', 'Dr. Loosen Blue Slate'])
  assert.equal(github.notes[1].thoughts, 'Crisp, café-ready, 10/10 💖')
})

test('if the file changed in between (409), it re-reads and tries once more', async () => {
  const github = fakeGitHub({ putStatuses: [409, 200] })
  await appendNote(config, note, 'msg')
  assert.equal(github.requests.filter((r) => r.init.method === 'PUT').length, 2)
  assert.equal(github.requests.filter((r) => (r.init.method ?? 'GET') === 'GET').length, 2)
  assert.equal(github.notes.length, 1)
})

test('two quick YES replies: if the competing write already added this note, the retry adds nothing', async () => {
  // Arrange: the first PUT loses to another request that appended the same note
  const github = fakeGitHub({ putStatuses: [409], onConflict: (state) => state.notes.push({ ...note }) })

  // Act
  await appendNote(config, note, 'msg')

  // Assert: posted once, and no second PUT
  assert.equal(github.notes.length, 1)
  assert.equal(github.requests.filter((r) => r.init.method === 'PUT').length, 1)
})

test('does not write at all when the note is already in the file', async () => {
  const github = fakeGitHub({ notes: [{ ...note }] })
  await appendNote(config, note, 'msg')
  assert.equal(github.requests.filter((r) => r.init.method === 'PUT').length, 0)
  assert.equal(github.notes.length, 1)
})

test('gives up after two conflicts instead of looping', async () => {
  fakeGitHub({ putStatuses: [409, 422] })
  await assert.rejects(appendNote(config, note, 'msg'), /kept conflicting/)
})

test('does not retry errors that are not conflicts (for example an expired token)', async () => {
  const github = fakeGitHub({ putStatuses: [401] })
  await assert.rejects(appendNote(config, note, 'msg'), /GitHub write failed \(401\)/)
  assert.equal(github.requests.filter((r) => r.init.method === 'PUT').length, 1)
})

test('refuses to write when the file cannot be read or is not a list', async () => {
  fakeGitHub({ readStatus: 404 })
  await assert.rejects(readNotes(config), /GitHub read failed \(404\)/)
  fakeGitHub({ rawContent: b64('{"not":"a list"}') })
  await assert.rejects(appendNote(config, note, 'msg'), /isn't a list/)
  fakeGitHub({ rawContent: b64('not json') })
  await assert.rejects(readNotes(config))
})
