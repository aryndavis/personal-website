import { useEffect, useState } from 'react'

// Real paths (/wine/some-post), so every page and post has its own address for search engines and link
// previews. Moving around never reloads: clicks on the app's own links are handled here with the History
// API. Netlify serves a prerendered page for each path on first load (scripts/prerender.mjs).

/** First path segments the app draws. Anything else (/sms, /terms, /privacy, files) is a separate page. */
const APP_SECTIONS = new Set(['', 'portfolio', 'education', 'wine', 'bookshelf'])

const CHANGE = 'routechange'

/** '/wine/a-post/' → '/wine/a-post'; '' → '/'. */
export const normalize = (path: string) => {
  let decoded = path
  try {
    decoded = decodeURIComponent(path)
  } catch {
    // A malformed %-escape: keep it as typed, so the app shows "not found" instead of crashing.
  }
  return decoded.replace(/\/+$/, '') || '/'
}

/** Whether the app draws this path itself (so a link to it can skip the reload). */
export const isAppPath = (path: string) => APP_SECTIONS.has(normalize(path).split('/')[1] ?? '')

/** The old #/ address a link may still use (#/wine/x → /wine/x), or null for anything else, like #main. */
export const fromHashLink = (hash: string) => (hash.startsWith('#/') ? normalize(hash.slice(1)) : null)

const readRoute = () => normalize(window.location.pathname)

/** Old links (arynlynn.com/#/wine/x) still work: swap them for the new address before the app draws. */
export function adoptHashLink() {
  const path = fromHashLink(window.location.hash)
  if (path) window.history.replaceState(null, '', path)
}

export function navigate(path: string) {
  if (normalize(path) === readRoute() && !window.location.hash) return
  window.history.pushState(null, '', path)
  window.dispatchEvent(new Event(CHANGE))
}

/** Handles clicks on the app's own links in place. New tabs, downloads and other pages behave normally. */
function onClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const link = (event.target as Element | null)?.closest?.('a')
  if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return
  const url = new URL(link.href, window.location.href)
  if (url.origin !== window.location.origin || !isAppPath(url.pathname)) return
  // Same page, different #fragment (like #main): let the browser handle it.
  if (url.hash && normalize(url.pathname) === readRoute()) return
  event.preventDefault()
  navigate(url.pathname)
}

export function useRoute() {
  const [route, setRoute] = useState(readRoute)
  useEffect(() => {
    const onChange = () => setRoute(readRoute())
    // An old #/ address typed or pasted into a page that's already open.
    const onHashChange = () => {
      adoptHashLink()
      onChange()
    }
    window.addEventListener('popstate', onChange)
    window.addEventListener('hashchange', onHashChange)
    window.addEventListener(CHANGE, onChange)
    document.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('popstate', onChange)
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener(CHANGE, onChange)
      document.removeEventListener('click', onClick)
    }
  }, [])
  return route
}

export const href = (path: string) => path
