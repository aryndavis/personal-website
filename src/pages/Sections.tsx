import { educationPosts } from '../content/education'
import { projects } from '../content/portfolio'
import type { Project, WinePost } from '../content/types'
import { winePosts } from '../content/wine'
import PixelIcon from '../components/PixelIcon'
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

function Rating({ value }: { value: number }) {
  return (
    <span className="rating">
      <span className="sr-only">Rated {value} out of 5</span>
      {Array.from({ length: 5 }, (_, i) => (
        <PixelIcon key={i} name="heart" size={14} className={i < value ? '' : 'dim'} />
      ))}
    </span>
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
      intro={<p>Writing about teaching, learning, and designing for real classrooms. Pinned like post-its, newest first.</p>}
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
