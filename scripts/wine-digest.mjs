// Drafts Gen Z With A Glass's monthly email from the posts dated that month.
//
//   npm run wine-digest              last month (run it at the start of a new month)
//   npm run wine-digest -- 2026-10   a particular month
//
// Prints the subject and a Markdown body. Paste them into a new email in Buttondown, write the hello at the
// top, preview, and send. Nothing is sent from here.
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { INTRO_PLACEHOLDER, isMonth, monthName, monthlyDigest, previousMonth } from './digest-markdown.mjs'

const month = process.argv[2] ?? previousMonth()
if (!isMonth(month)) {
  console.error(`"${month}" isn't a month. Use YYYY-MM, for example: npm run wine-digest -- 2026-10`)
  process.exit(1)
}

// Load the posts through Vite, the same way the build does, so texted-in notes are included.
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const vite = await createServer({ root, logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom' })
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
console.log(`${digest.count} post${digest.count === 1 ? '' : 's'} from ${monthName(month)}. Replace the line "${INTRO_PLACEHOLDER}" with your hello before sending.`)
