import { useEffect } from 'react'
import Header from './components/Header'
import HoloBackground from './components/HoloBackground'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import { EducationPage, PortfolioPage, WinePage } from './pages/Sections'
import { href, useRoute } from './router'
import { sections, site } from './site'

const marquee = '✦ stay curious ✦ take the long way ✦ pour something interesting'

const pages = {
  portfolio: PortfolioPage,
  education: EducationPage,
  wine: WinePage,
}

const titles: Record<string, string> = {
  portfolio: sections.portfolio.label,
  education: sections.education.label,
  wine: sections.wine.label,
}

export default function App() {
  const route = useRoute()
  const [, top, slug, ...rest] = route.split('/')
  const Page = top in pages && rest.length === 0 ? pages[top as keyof typeof pages] : undefined

  // Scroll to the top only when moving between sections, not when opening a pop-up.
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = titles[top] ? `${titles[top]} · ${site.name}` : site.name
  }, [top])

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
        <a href={href('/')}>Back home ↑</a>
      </footer>
    </>
  )
}
