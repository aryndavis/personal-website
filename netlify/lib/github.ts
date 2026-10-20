// Adds a texted tasting note to src/content/wine.texts.json with the GitHub contents API.
// The push to main makes Netlify rebuild the site.
import type { TastingNote } from '../../src/content/tastingNotes.ts'

export const TEXTS_PATH = 'src/content/wine.texts.json'

const decoder = new TextDecoder()
const encoder = new TextEncoder()
const fromBase64 = (text: string) => decoder.decode(Uint8Array.from(atob(text.replace(/\s/g, '')), (char) => char.charCodeAt(0)))
const toBase64 = (text: string) => btoa(Array.from(encoder.encode(text), (byte) => String.fromCharCode(byte)).join(''))

export interface GitHubConfig {
  token: string
  /** owner/name */
  repo: string
  branch: string
}

export interface NoteFile {
  notes: unknown[]
  sha: string
}

async function github(config: GitHubConfig, path: string, init?: RequestInit) {
  return fetch(`https://api.github.com/repos/${config.repo}/contents/${path}`, {
    ...init,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${config.token}`,
      'x-github-api-version': '2022-11-28',
      'user-agent': 'arynlynn.com text-to-post',
      ...init?.headers,
    },
    signal: AbortSignal.timeout(15_000),
  })
}

export async function readNotes(config: GitHubConfig): Promise<NoteFile> {
  const response = await github(config, `${TEXTS_PATH}?ref=${encodeURIComponent(config.branch)}`)
  if (!response.ok) throw new Error(`GitHub read failed (${response.status})`)
  const file = (await response.json()) as { content: string; sha: string }
  const notes: unknown = JSON.parse(fromBase64(file.content))
  if (!Array.isArray(notes)) throw new Error(`${TEXTS_PATH} isn't a list`)
  return { notes, sha: file.sha }
}

/** Appends the note. Retries once if the file changed in between (for example two quick YES replies). */
export async function appendNote(config: GitHubConfig, note: TastingNote, message: string): Promise<void> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { notes, sha } = await readNotes(config)
    const content = `${JSON.stringify([...notes, note], null, 2)}\n`
    const response = await github(config, TEXTS_PATH, {
      method: 'PUT',
      body: JSON.stringify({ message, content: toBase64(content), sha, branch: config.branch }),
    })
    if (response.ok) return
    if (response.status !== 409 && response.status !== 422) throw new Error(`GitHub write failed (${response.status})`)
  }
  throw new Error('GitHub write kept conflicting')
}
