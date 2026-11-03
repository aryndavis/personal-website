import { useEffect, useState } from 'react'
import { isWinePath, publicUrl, sections, site, wineDomain } from './site.ts'

// Real paths (/wine/some-post), so every page and post has its own address for search engines and link
// previews. Moving around never reloads: clicks on the app's own links are handled here with the History
// API. Netlify serves a prerendered page for each path on first load (scripts/prerender.mjs).
//
// Inside the app every page has one path (/wine/a-post). Gen Z With A Glass lives on its own domain, where
// the same page's address is genzwithaglass.com/a-post: appPathOn() reads an address into an app path, and
// href() writes an app path as a link, a full address when the page lives on the other domain. Anywhere
// else (localhost, deploy previews) addresses and app paths are the same.

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

/** The app path for an address on this host: on Gen Z With A Glass's domain, /a-post is /wine/a-post. */
export const appPathOn = (host: string, path: string) =>
  normalize(host === wineDomain.host ? `${sections.wine.path}${path === '/' ? '' : path}` : path)

/** How to link to an app path from this host: a path on the same domain, a full address on the other one. */
export function linkOn(host: string, path: string) {
  if (host === wineDomain.host) return isWinePath(path) ? path.slice(sections.wine.path.length) || '/' : `${site.url}${path}`
  if (host === new URL(site.url).host && isWinePath(path)) return publicUrl(path)
  return path
}

const host = () => window.location.hostname
const readRoute = () => appPathOn(host(), window.location.pathname)
const isFullAddress = (link: string) => /^https?:\/\//.test(link)

/** Moves to an app path: in place on this domain, or a full page load on the other one. */
function go(path: string, replace: boolean) {
  const link = href(path)
  if (isFullAddress(link)) {
    if (replace) window.location.replace(link)
    else window.location.assign(link)
    return
  }
  if (replace) window.history.replaceState(null, '', link)
  else window.history.pushState(null, '', link)
  window.dispatchEvent(new Event(CHANGE))
}

/** Old links (arynlynn.com/#/wine/x) still work: swap them for the new address before the app draws. */
export function adoptHashLink() {
  const path = fromHashLink(window.location.hash)
  if (!path) return
  const link = href(path)
  if (isFullAddress(link)) window.location.replace(link)
  else window.history.replaceState(null, '', link)
}

/** Swaps the current address for another without adding a history step (an old link that moved). */
export function redirect(path: string) {
  go(path, true)
}

export function navigate(path: string) {
  if (normalize(path) === readRoute() && !window.location.hash) return
  go(path, false)
}

/** Handles clicks on the app's own links in place. New tabs, downloads and other pages behave normally. */
function onClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const link = (event.target as Element | null)?.closest?.('a')
  if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return
  const url = new URL(link.href, window.location.href)
  if (url.origin !== window.location.origin) return
  const path = appPathOn(host(), url.pathname)
  if (!isAppPath(path)) return
  // Same page, different #fragment (like #main): let the browser handle it.
  if (url.hash && path === readRoute()) return
  event.preventDefault()
  navigate(path)
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

/** The link to an app path from the page that's open (see appPathOn and linkOn). */
export const href = (path: string) => linkOn(host(), path)
