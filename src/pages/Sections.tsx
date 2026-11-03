import { buildLogPosts } from '../content/buildLog'
import { educationPosts } from '../content/education'
import { projectsIn } from '../content/portfolio'
import PixelIcon from '../components/PixelIcon'
import PixelWindow from '../components/PixelWindow'
import type { Project, Track } from '../content/types'
import { href } from '../router'
import { portfolioTracks, projectPath, sections, site } from '../site'
import Collection, { PageHero } from './Collection'

// Web links, or a file on this site (/files/deck.pdf).
const isShownLink = (url: string) => /^https?:\/\//i.test(url) || url.startsWith('/files/')

/** Screenshot or title slide on a project's card. Decorative there: the card's title and summary say what it is. */
function ProjectCover({ project }: { project: Project }) {
  if (!project.cover) return null
  return <img className="card-cover" src={`${import.meta.env.BASE_URL}${project.cover.src}`} alt="" loading="lazy" />
}

function ProjectLinks({ project }: { project: Project }) {
  const links = (project.links ?? []).filter((link) => isShownLink(link.href))
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

const tracks = Object.keys(portfolioTracks) as Track[]

/** /portfolio: a door into each track. */
export function PortfolioHome() {
  return (
    <div className="collection collection-portfolio">
      <PageHero
        sectionKey="portfolio"
        trail={[sections.portfolio]}
        icon="folder"
        headline={
          <>
            Portfolio
            <span className="mega-ext">.exe</span>
          </>
        }
        intro={<p>Two kinds of work, each in its own folder: the courses, clubs and classes I’ve designed and taught, and software I’ve designed and built.</p>}
      />
      <ul className="portfolio-doors">
        {tracks.map((track, i) => {
          const folder = portfolioTracks[track]
          const list = projectsIn(track)
          return (
            <li key={track}>
              <PixelWindow as="section" title={folder.file} tone={i === 0 ? 'mint' : 'lime'} labelledBy={`door-${track}`}>
                <div className="folder-head">
                  <PixelIcon name={track === 'curriculum' ? 'notebook' : 'folder'} size={44} />
                  <div>
                    <h2 id={`door-${track}`}>
                      <a href={href(folder.path)}>{folder.label}</a>
                    </h2>
                    <p>{folder.blurb}</p>
                  </div>
                </div>
                <p className="folder-recent">Inside:</p>
                <ul className="folder-list">
                  {list.map((project) => (
                    <li key={project.slug}>
                      <a href={href(projectPath(project))}>{project.title}</a>
                    </li>
                  ))}
                </ul>
                <div className="folder-actions">
                  <a className="pixel-button" href={href(folder.path)}>
                    Open folder ▶
                  </a>
                </div>
              </PixelWindow>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** /portfolio/curriculum and /portfolio/software. */
export function PortfolioTrackPage({ track, slug }: { track: Track; slug?: string }) {
  const curriculum = track === 'curriculum'
  return (
    <Collection
      sectionKey="portfolio"
      part={portfolioTracks[track]}
      entries={projectsIn(track)}
      ordered
      slug={slug}
      layout="windows"
      fileExtension="cur"
      icon={curriculum ? 'notebook' : 'folder'}
      longTitle={curriculum}
      headline={
        <>
          {curriculum ? 'Curriculum' : 'Software'}
          <span className="mega-ext">.exe</span>
        </>
      }
      intro={
        <p>
          {curriculum
            ? 'Courses, clubs and classes I’ve designed and taught. Each case study covers the learners, the goals, the design decisions, my role, and how it went.'
            : 'Things I’ve designed and built, most with a live demo and the code on GitHub.'}{' '}
          <a href={href(portfolioTracks[curriculum ? 'software' : 'curriculum'].path)}>See {curriculum ? 'my software' : 'my curriculum design'} work ▶</a>
        </p>
      }
      openLabel={() => (curriculum ? 'Open case study ▶' : 'Open project ▶')}
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

export function BuildLogPage({ slug }: { slug?: string }) {
  return (
    <Collection
      sectionKey="buildlog"
      entries={buildLogPosts}
      slug={slug}
      layout="notes"
      fileExtension="md"
      icon="floppy"
      headline={
        <>
          Build log
          <span className="mega-ext">.md</span>
        </>
      }
      intro={<p>How I build the things on this site, step by step and with the code, so you can make something similar for your own.</p>}
    />
  )
}
