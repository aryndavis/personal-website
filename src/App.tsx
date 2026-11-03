import { useEffect } from 'react'
import Header from './components/Header'
import HoloBackground from './components/HoloBackground'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import BookshelfPage from './pages/Bookshelf'
import { EngineeringNotesPage, EducationPage, PortfolioHome, PortfolioTrackPage } from './pages/Sections'
import WinePage from './pages/Wine'
import { href, redirect, useRoute } from './router'
import { showLinkPreview } from './linkPreview'
import { movedTo, pageAt } from './routes'
import { bookshelf, portfolioTracks, sections, site } from './site'
import type { Track } from './content/types'

const marquee = '✦ stay curious ✦ take the long way ✦ pour something interesting'

// Keyed by each section's first path segment (from site.ts), like the router's list of sections.
const pages = {
  [sections.education.path.slice(1)]: EducationPage,
  [sections.engineering.path.slice(1)]: EngineeringNotesPage,
  [sections.wine.path.slice(1)]: WinePage,
  [bookshelf.path.slice(1)]: BookshelfPage,
}

/** /portfolio, /portfolio/<track> and /portfolio/<track>/<slug>. */
function portfolioPage(parts: string[]) {
  const [track, slug, ...rest] = parts
  if (track === undefined) return <PortfolioHome />
  if (!Object.hasOwn(portfolioTracks, track) || rest.length) return undefined
  return <PortfolioTrackPage track={track as Track} slug={slug} />
}

export default function App() {
  const current = useRoute()
  // An old project address shows its new page right away; the effect below fixes the address bar.
  const moved = movedTo(current)
  const route = moved ?? current
  const [, top, ...parts] = route.split('/')
  const [slug, ...rest] = parts
  const Page = Object.hasOwn(pages, top) && rest.length === 0 ? pages[top as keyof typeof pages] : undefined
  const page = route === '/' ? <Home /> : top === 'portfolio' ? portfolioPage(parts) : Page && <Page slug={slug} />
  // The portfolio's tracks count as their own sections (under /portfolio, `slug` is the track).
  const sectionKey = top === 'portfolio' ? `${top}/${slug ?? ''}` : top

  useEffect(() => {
    if (moved) redirect(moved)
  }, [moved])

  // Scroll to the top only when moving between sections, not when opening a pop-up.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [sectionKey])

  // Each page and post has its own title and link preview (the same ones its prerendered page shows).
  useEffect(() => {
    showLinkPreview(pageAt(route))
  }, [route])

  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main')?.focus()
        }}
      >
        Skip to content
      </a>
      <HoloBackground />
      <Header route={route} />
      <main id="main" tabIndex={-1}>
        {page ?? <NotFound />}
      </main>
      <footer className="site-footer">
        <span>
          © {site.year} {site.name}
        </span>
        <span className="footer-marquee" aria-hidden="true">
          <span>{`${marquee} ${marquee} `}</span>
        </span>
        <span className="footer-links">
          <a href={href('/sms/')}>SMS policy</a>
          <a href={href('/terms/')}>Terms</a>
          <a href={href('/privacy/')}>Privacy</a>
          <a href={href('/')}>Back home ↑</a>
        </span>
      </footer>
    </>
  )
}
