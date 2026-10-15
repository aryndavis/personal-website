import { useEffect, useState } from 'react'

// Hash routes (#/wine/some-post) work on any static host with no server rewrites.
// Plain in-page anchors like #main are ignored so they don't change the page.
const readRoute = (fallback: string) => {
  const hash = window.location.hash
  if (hash === '' || hash === '#') return '/'
  if (hash.startsWith('#/')) return decodeURIComponent(hash.slice(1)).replace(/\/+$/, '') || '/'
  return fallback
}

export function useRoute() {
  const [route, setRoute] = useState(() => readRoute('/'))
  useEffect(() => {
    const onChange = () => setRoute((current) => readRoute(current))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export const href = (path: string) => `#${path}`

export const navigate = (path: string) => {
  window.location.hash = path
}
