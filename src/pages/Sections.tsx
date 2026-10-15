import { educationPosts } from '../content/education'
import { projects } from '../content/portfolio'
import type { Project, WinePost } from '../content/types'
import { winePosts } from '../content/wine'
import Rating from '../components/Rating'
import { site } from '../site'
import Collection from './Collection'

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

function WineCard({ post, full = false }: { post: WinePost; full?: boolean }) {
  if (!post.wine) return null
  const { name, region, grape, vintage, rating } = post.wine
  return (
    <div className={`wine-card ${full ? 'full' : ''}`}>
      <p className="wine-name">
        {name}
        {vintage ? ` ${vintage}` : ''}
      </p>
      <p className="wine-detail">
        {grape} · {region}
      </p>
      <Rating value={rating} />
    </div>
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
      intro={
        <p>
          Curriculum design case studies: the challenge, my approach, and what changed for learners. Open any project for the full story.
        </p>
      }
      cardExtra={(project) => <ProjectFacts project={project} />}
      dialogMeta={(project) => <ProjectFacts project={project} />}
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
          <a className="pixel-button substack-link" href={site.substack} target="_blank" rel="noopener noreferrer">
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

export function WinePage({ slug }: { slug?: string }) {
  return (
    <Collection
      sectionKey="wine"
      entries={winePosts}
      slug={slug}
      layout="notes"
      fileExtension="dat"
      icon="glass"
      headline={
        <>
          Wine cellar
          <span className="mega-ext">.dat</span>
        </>
      }
      intro={<p>Tasting notes, regions, and bottles worth talking about. No scores to impress anyone, just honest hearts.</p>}
      cardExtra={(post) => <WineCard post={post} />}
      dialogMeta={(post) => <WineCard post={post} full />}
    />
  )
}
