// Copies the public posts from Substack into the education blog: `npm run sync:substack`.
// Run it after publishing on Substack, then commit and push. (It can't run in GitHub Actions:
// Substack refuses requests from GitHub's servers.)
//
// - Substack's HTML is never rendered. It's parsed and converted into the site's typed blocks
//   (paragraphs with links and italics, headings, lists, quotes, images), and anything else is dropped.
// - Images are downloaded into public/images/education/substack/, because the CSP only allows
//   images from this site.
// - Output goes to src/content/education.substack.ts. Posts written by hand in education.ts win
//   over synced posts with the same slug, so a post can be polished there (e.g. better alt text).
// - Nothing is written unless every post and image downloads, so a failed run changes nothing.
import { createHash } from 'node:crypto'
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { convert, squash } from './substack-html.mjs'

const PUBLICATION = 'https://arynlynn.substack.com'
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUTPUT = join(root, 'src/content/education.substack.ts')
const IMAGE_DIR = 'images/education/substack'
const IMAGE_HOSTS = new Set(['substackcdn.com', 'substack-post-media.s3.amazonaws.com'])
const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp' }
const MAX_IMAGE_BYTES = 15 * 1024 * 1024
const PAGE_SIZE = 50

async function get(url, accept) {
  const response = await fetch(url, {
    headers: { accept, 'user-agent': 'personal-website substack sync (+https://github.com/aryndavis/personal-website)' },
    redirect: 'follow',
    signal: AbortSignal.timeout(60_000),
  })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`)
  return response
}

const getJson = async (url) => (await get(url, 'application/json')).json()

/** Every post in the archive, newest first. */
async function listPosts() {
  const posts = []
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = await getJson(`${PUBLICATION}/api/v1/archive?sort=new&offset=${offset}&limit=${PAGE_SIZE}`)
    if (!Array.isArray(page)) throw new Error('Unexpected archive response from Substack.')
    posts.push(...page)
    if (page.length < PAGE_SIZE) return posts
  }
}

// ---------- images ----------

async function downloadImage(image, post) {
  const source = new URL(image.url)
  if (source.protocol !== 'https:' || !IMAGE_HOSTS.has(source.hostname)) {
    throw new Error(`"${post.slug}": image from an unexpected host, ${source.hostname}`)
  }
  const response = await get(source.href, 'image/webp,image/jpeg,image/png,image/gif')
  const type = response.headers.get('content-type')?.split(';')[0].trim()
  const extension = IMAGE_TYPES[type]
  if (!extension) throw new Error(`"${post.slug}": image ${source.href} is ${type}, not a supported image type`)
  if (Number(response.headers.get('content-length')) > MAX_IMAGE_BYTES) throw new Error(`"${post.slug}": image too large`)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length > MAX_IMAGE_BYTES) throw new Error(`"${post.slug}": image too large`)
  // Named after the original image, so re-running the sync leaves unchanged images alone.
  const name = `${post.slug}-${createHash('sha256').update(image.original).digest('hex').slice(0, 12)}.${extension}`
  return { name, buffer }
}

// ---------- main ----------

const warnings = []
const warn = (message) => warnings.push(message)

const archive = await listPosts()
const posts = []
const files = new Map()

for (const item of archive) {
  // Only free, published newsletter posts. Paid posts would only have a preview, and podcasts and threads don't fit the blog.
  if (item.audience !== 'everyone' || item.type !== 'newsletter') {
    warn(`skipped "${item.slug}" (${item.audience}, ${item.type})`)
    continue
  }
  if (typeof item.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) {
    warn(`skipped a post with an unusable slug: ${JSON.stringify(item.slug)}`)
    continue
  }
  const post = await getJson(`${PUBLICATION}/api/v1/posts/${item.slug}`)
  if (typeof post.body_html !== 'string') throw new Error(`"${item.slug}" has no body on Substack.`)

  const { blocks, images } = convert(post.body_html, item, warn)
  const saved = []
  for (const image of images) {
    const file = await downloadImage(image, item)
    files.set(file.name, file.buffer)
    saved.push(file.name)
  }

  const title = squash(post.title ?? '').trim()
  const subtitle = squash(post.subtitle ?? '').trim()
  const summary = squash(post.description || post.subtitle || post.truncated_body_text || '').trim()
  const body = blocks.map((block) => {
    if (block.type !== 'image') return block
    const image = images[block.image]
    // Substack usually leaves alt text empty. Fall back to the caption, then the post title.
    const alt = image.alt || image.caption || `Image from “${title}”`
    return {
      type: 'image',
      src: `${IMAGE_DIR}/${saved[block.image]}`,
      alt,
      ...(image.caption ? { caption: image.caption } : {}),
    }
  })
  const canonical = new URL(post.canonical_url ?? `${PUBLICATION}/p/${item.slug}`)
  if (canonical.protocol !== 'https:') throw new Error(`"${item.slug}" has a non-https link.`)

  posts.push({
    slug: item.slug,
    title,
    ...(subtitle ? { subtitle } : {}),
    // Substack dates are UTC timestamps; the site shows the calendar date.
    date: new Date(post.post_date).toISOString().slice(0, 10),
    summary,
    tags: (post.postTags ?? []).filter((tag) => !tag.hidden).map((tag) => squash(tag.name).trim()).filter(Boolean),
    substackUrl: canonical.href,
    body,
  })
}

// Everything downloaded, so now write: images first, then the posts that point at them.
const imageDir = join(root, 'public', IMAGE_DIR)
await mkdir(imageDir, { recursive: true })
for (const [name, buffer] of files) await writeFile(join(imageDir, name), buffer)
for (const name of await readdir(imageDir)) {
  if (!files.has(name)) await rm(join(imageDir, name))
}

posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
await writeFile(
  OUTPUT,
  `// Generated by \`npm run sync:substack\` from ${PUBLICATION}. Don't edit by hand:
// changes are overwritten on the next sync. To adjust a post, copy it into education.ts.
import type { Entry } from './types'

export const substackPosts: Entry[] = ${JSON.stringify(posts, null, 2)}
`,
)

for (const message of warnings) console.warn(`note: ${message}`)
console.log(`Synced ${posts.length} post${posts.length === 1 ? '' : 's'} and ${files.size} image${files.size === 1 ? '' : 's'} from Substack.`)
console.log('To publish, commit and push src/content/education.substack.ts and public/images/education/substack/.')
