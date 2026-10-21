// Run with `npm test`. The Substack sync's network and image rules, with Substack faked.
import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { downloadImage, listPosts } from './sync-substack.mjs'

const realFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = realFetch
})

const post = { slug: 'what-do-we-even-need-education-for' }
const image = (url) => ({ url, original: 'https://substack-post-media.s3.amazonaws.com/public/images/a.jpeg' })
const serveImage = (type, bytes, headers = {}) => {
  globalThis.fetch = async () => new Response(new Uint8Array(bytes), { status: 200, headers: { 'content-type': type, ...headers } })
}

test('downloads a Substack image and names it after the original', async () => {
  // Arrange
  serveImage('image/webp; charset=binary', 1000)

  // Act
  const { name, buffer } = await downloadImage(image('https://substackcdn.com/image/fetch/w_1456/a.jpeg'), post)

  // Assert
  assert.match(name, /^what-do-we-even-need-education-for-[0-9a-f]{12}\.webp$/)
  assert.equal(buffer.length, 1000)
  // Same original → same name, so re-running the sync leaves the file alone.
  serveImage('image/webp', 10)
  assert.equal((await downloadImage(image('https://substackcdn.com/other-size.jpeg'), post)).name, name)
})

test('only downloads from Substack’s image hosts, over https', async () => {
  let fetched = false
  globalThis.fetch = async () => {
    fetched = true
    return new Response('')
  }
  await assert.rejects(downloadImage(image('https://evil.example/a.jpeg'), post), /unexpected host, evil.example/)
  await assert.rejects(downloadImage(image('http://substackcdn.com/a.jpeg'), post), /unexpected host/)
  await assert.rejects(downloadImage(image('https://substackcdn.com.evil.example/a.jpeg'), post), /unexpected host/)
  assert.equal(fetched, false, 'nothing is fetched from a disallowed host')
})

test('refuses files that are not images, or are too large', async () => {
  serveImage('text/html', 100)
  await assert.rejects(downloadImage(image('https://substackcdn.com/a.jpeg'), post), /not a supported image type/)
  serveImage('image/svg+xml', 100) // SVGs can carry scripts
  await assert.rejects(downloadImage(image('https://substackcdn.com/a.svg'), post), /not a supported image type/)
  serveImage('image/jpeg', 10, { 'content-length': String(16 * 1024 * 1024) })
  await assert.rejects(downloadImage(image('https://substackcdn.com/a.jpeg'), post), /too large/)
  serveImage('image/jpeg', 15 * 1024 * 1024 + 1) // lies about its size, or sends none
  await assert.rejects(downloadImage(image('https://substackcdn.com/a.jpeg'), post), /too large/)
})

test('reads every page of the archive and stops at the last one', async () => {
  // Arrange: 50 + 50 + 7 posts
  const offsets = []
  globalThis.fetch = async (url) => {
    const offset = Number(new URL(url).searchParams.get('offset'))
    offsets.push(offset)
    const count = offset < 100 ? 50 : 7
    return Response.json(Array.from({ length: count }, (_, i) => ({ slug: `post-${offset + i}` })))
  }

  // Act
  const posts = await listPosts()

  // Assert
  assert.equal(posts.length, 107)
  assert.deepEqual(offsets, [0, 50, 100])
})

test('stops with a clear error when Substack fails or answers strangely (so nothing gets written)', async () => {
  globalThis.fetch = async () => new Response('Forbidden', { status: 403, statusText: 'Forbidden' })
  await assert.rejects(listPosts(), /403 Forbidden/)
  globalThis.fetch = async () => Response.json({ error: 'nope' })
  await assert.rejects(listPosts(), /Unexpected archive response/)
  globalThis.fetch = async () => Promise.reject(new TypeError('fetch failed'))
  await assert.rejects(listPosts(), /fetch failed/)
})
