import { href } from '../router'
import { sections, site } from '../site'

const isActive = (route: string, path: string) => (path === '/' ? route === '/' : route === path || route.startsWith(`${path}/`))

export default function Header({ route }: { route: string }) {
  const link = (path: string, label: string) => (
    <a href={href(path)} aria-current={isActive(route, path) ? 'page' : undefined}>
      {label}
    </a>
  )

  return (
    <header className="site-header">
      <a className="wordmark" href={href('/')} aria-label={`${site.name}, home`}>
        {site.shortName}
      </a>
      <div className="header-col header-status">
        <span>{site.roles.join(' / ')}</span>
        <span className="status-line">
          <span className="status-dot" aria-hidden="true" /> {site.status}
        </span>
      </div>
      <nav className="header-col" aria-label="Main">
        {link('/', 'About me')}
        {link(sections.portfolio.path, sections.portfolio.label)}
        {link(sections.education.path, sections.education.label)}
        {link(sections.wine.path, sections.wine.label)}
      </nav>
      <a className="header-cta" href={`mailto:${site.email}`}>
        Say hello <span aria-hidden="true">↗</span>
      </a>
    </header>
  )
}
