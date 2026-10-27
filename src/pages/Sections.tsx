import { educationPosts } from '../content/education'
import { projects } from '../content/portfolio'
import type { Project } from '../content/types'
import { site } from '../site'
import Collection from './Collection'

const isWebLink = (url: string) => /^https?:\/\//i.test(url)

/** Screenshot on a software project's card. Decorative there: the card's title and summary say what it is. */
function ProjectCover({ project }: { project: Project }) {
  if (!project.cover) return null
  return <img className="card-cover" src={`${import.meta.env.BASE_URL}${project.cover.src}`} alt="" loading="lazy" />
}

function ProjectLinks({ project }: { project: Project }) {
  const links = (project.links ?? []).filter((link) => isWebLink(link.href))
  if (!links.length) return null
  return (
    <p className="project-links">
      {links.map((link) => (
        <a key={link.href} className="pixel-button secondary" href={link.href} target="_blank" rel="noopener noreferrer">
          {link.label}
        </a>
      ))}
    </p>
  )
}

function ProjectFacts({ project }: { project: Project }) {
  return (
    <dl className="facts">
      <div>
        <dt>Role</dt>
        <dd>{project.role}</dd>
      </div>
      <div>
        <dt>For</dt>
        <dd>{project.audience}</dd>
      </div>
      <div>
        <dt>Format</dt>
        <dd>{project.format}</dd>
      </div>
    </dl>
  )
}

export function PortfolioPage({ slug }: { slug?: string }) {
  return (
    <Collection
      sectionKey="portfolio"
      entries={projects}
      slug={slug}
      layout="windows"
      fileExtension="cur"
      icon="folder"
      headline={
        <>
          Portfolio
          <span className="mega-ext">.exe</span>
        </>
      }
      intro={<p>Two kinds of work: software I’ve designed and built, and the courses, clubs and classes I’ve designed and taught. Open any project for the full story.</p>}
      groups={[
        { id: 'software-engineering', title: 'Software engineering', filter: (project) => project.track === 'software' },
        { id: 'curriculum-design', title: 'Curriculum design', filter: (project) => project.track === 'curriculum' },
      ]}
      openLabel={(project) => (project.track === 'software' ? 'Open project ▶' : 'Open case study ▶')}
      cardExtra={(project) => (
        <>
          <ProjectCover project={project} />
          <ProjectFacts project={project} />
        </>
      )}
      dialogMeta={(project) => (
        <>
          <ProjectFacts project={project} />
          <ProjectLinks project={project} />
        </>
      )}
    />
  )
}

export function EducationPage({ slug }: { slug?: string }) {
  return (
    <Collection
      sectionKey="education"
      entries={educationPosts}
      slug={slug}
      layout="notes"
      fileExtension="txt"
      icon="notebook"
      headline={
        <>
          Edu notes
          <span className="mega-ext">.txt</span>
        </>
      }
      intro={
        <>
          <p>Writing about teaching, learning, and designing for real classrooms. These posts also go out on my Substack, so subscribe there to get them by email.</p>
          <a className="pixel-button secondary" href={site.substack} target="_blank" rel="noopener noreferrer">
            ✉ Visit my Substack ↗
          </a>
        </>
      }
      cardExtra={(post) =>
        post.substackUrl && (
          <span className="substack-badge" aria-hidden="true">
            ✉ also on Substack
          </span>
        )
      }
    />
  )
}
