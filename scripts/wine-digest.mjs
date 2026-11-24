// Drafts Gen Z With A Glass's monthly email from the posts dated that month.
//
//   npm run wine-digest              last month (run it at the start of a new month)
//   npm run wine-digest -- 2026-10   a particular month
//
// Prints a title and a Markdown body for a new Substack post, and opens the same body as a page to copy and
// paste into Substack (its editor keeps the links and bold that way). Write the hello at the top, preview, and send.
// Nothing is sent from here.
import { execFile } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { INTRO_PLACEHOLDER, digestHtml, isMonth, monthName, monthlyDigest, previousMonth } from './digest-markdown.mjs'

const month = process.argv[2] ?? previousMonth()
if (!isMonth(month)) {
  console.error(`"${month}" isn't a month. Use YYYY-MM, for example: npm run wine-digest -- 2026-10`)
  process.exit(1)
}

// Load the posts through Vite, the same way the build does, so texted-in notes are included.
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const vite = await createServer({ root, logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
let winePosts
try {
  winePosts = (await vite.ssrLoadModule('/src/content/wine.ts')).winePosts
} finally {
  await vite.close()
}

const digest = monthlyDigest(winePosts, month)
if (!digest) {
  console.log(`Nothing was posted in ${monthName(month)}, so there's no email to draft.`)
  process.exit(0)
}

console.log(`Subject: ${digest.subject}\n`)
console.log('----- body (Markdown) -----\n')
console.log(digest.body)
console.log('---------------------------')
// Substack's editor doesn't read pasted Markdown, so the same body is written as a page to copy from.
const page = join(tmpdir(), `wine-digest-${month}.html`)
writeFileSync(page, digestHtml(digest))
if (process.platform === 'darwin') execFile('open', [page])
console.log(`${digest.count} post${digest.count === 1 ? '' : 's'} from ${monthName(month)}.`)
console.log(`To paste into Substack: open ${page}, select the body (from your hello down), copy, and paste into a new post.`)
console.log(`Replace the line "${INTRO_PLACEHOLDER}" with your hello before sending.`)
