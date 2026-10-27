import { useEffect } from 'react'
import Header from './components/Header'
import HoloBackground from './components/HoloBackground'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import BookshelfPage from './pages/Bookshelf'
import { EducationPage, PortfolioPage } from './pages/Sections'
import WinePage from './pages/Wine'
import { href, useRoute } from './router'
import { showLinkPreview } from './linkPreview'
import { pageAt } from './routes'
import { site } from './site'

const marquee = '✦ stay curious ✦ take the long way ✦ pour something interesting'

const pages = {
  portfolio: PortfolioPage,
  education: EducationPage,
  wine: WinePage,
  bookshelf: BookshelfPage,
}


export default function App() {
  const route = useRoute()
  const [, top, slug, ...rest] = route.split('/')
  const Page = Object.hasOwn(pages, top) && rest.length === 0 ? pages[top as keyof typeof pages] : undefined

  // Scroll to the top only when moving between sections, not when opening a pop-up.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [top])

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
        {route === '/' ? <Home /> : Page ? <Page slug={slug} /> : <NotFound />}
      </main>
      <footer className="site-footer">
        <span>
          © {site.year} {site.name}
        </span>
        <span className="footer-marquee" aria-hidden="true">
          <span>{`${marquee} ${marquee} `}</span>
        </span>
        <span className="footer-links">
          <a href="/sms/">SMS policy</a>
          <a href="/terms/">Terms</a>
          <a href="/privacy/">Privacy</a>
          <a href={href('/')}>Back home ↑</a>
        </span>
      </footer>
    </>
  )
}
