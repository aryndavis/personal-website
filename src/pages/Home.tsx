import { useState } from 'react'
import PixelIcon, { type IconName } from '../components/PixelIcon'
import PixelWindow from '../components/PixelWindow'
import { educationPosts } from '../content/education'
import { projects } from '../content/portfolio'
import { newestFirst, type Entry } from '../content/types'
import { winePosts } from '../content/wine'
import { href } from '../router'
import { currentlyReading } from '../content/books'
import { school } from '../content/school'
import { bookshelf, sections, site, type SectionKey } from '../site'

const latest = <T extends Entry>(entries: T[], count = 2) => newestFirst(entries).slice(0, count)
// The featured project is the newest one people can open and try.
const featuredProject = latest(projects.filter((project) => project.links?.length), 1)[0]

const folders: { key: SectionKey; icon: IconName; tone: 'yellow' | 'mint' | 'pink'; entries: Entry[] }[] = [
  { key: 'portfolio', icon: 'folder', tone: 'yellow', entries: latest(projects) },
  { key: 'education', icon: 'notebook', tone: 'mint', entries: latest(educationPosts) },
  { key: 'wine', icon: 'glass', tone: 'pink', entries: latest(winePosts) },
]

type WindowId = 'about' | 'currently' | 'school' | 'mail' | SectionKey

export default function Home() {
  const [closed, setClosed] = useState<WindowId[]>([])
  const close = (id: WindowId) => () => setClosed((list) => [...list, id])
  const isOpen = (id: WindowId) => !closed.includes(id)
  const featured = featuredProject

  return (
    <>
      <section className="home-hero" aria-labelledby="hero-title">
        <ul className="hero-tags">
          <li>/ Software engineering</li>
          <li>/ Curriculum design</li>
          <li>/ Education writing</li>
          <li>/ Wine notes</li>
        </ul>

        <PixelWindow title="y2k_boot.exe" tone="pink" className="boot-window">
          <p className="boot-text">
            CURIOSITY<span className="dots" aria-hidden="true">............</span>LOADING
          </p>
          <div className="progress" aria-hidden="true">
            <span className="progress-fill" />
          </div>
        </PixelWindow>

        <h1 id="hero-title" className="mega hero-headline">
          Curious
          <br />
          by design
        </h1>

        {featured && (
          <PixelWindow title="featured_project.cur" tone="cream" className="featured">
            <div className="featured-screen" aria-hidden="true">
              <span className="eq">
                {Array.from({ length: 12 }, (_, i) => (
                  <i key={i} />
                ))}
              </span>
              <PixelIcon name="star" size={40} />
            </div>
            <p className="featured-label">▶ Latest project</p>
            <a className="featured-link" href={href(`${sections.portfolio.path}/${featured.slug}`)}>
              {featured.title}
            </a>
          </PixelWindow>
        )}
      </section>

      <section className="desktop" aria-labelledby="about-title">
        <div className="desktop-windows">
          {isOpen('about') && (
            <PixelWindow title="about_me.txt" tone="cream" className="about-window" movable onClose={close('about')} labelledBy="about-title">
              <div className="about-head">
                <PixelIcon name="smile" size={64} />
                <h2 id="about-title">Hi, I’m {site.name.split(' ')[0]}.</h2>
              </div>
              <p>
                I’m a software engineer and a curriculum designer, and I love the places where the two meet. I spent five years as a software engineer at Microsoft, building the
                checkout experiences behind Microsoft 365 and Copilot and serving as my team’s security point of contact. Now I’m in New York, studying Technology, Media, and
                Learning for a Master of Education at Teachers College, Columbia University.
              </p>
              <p>
                Along the way I’ve designed and taught Python and Django for adult learners, web development courses for CodePath, coding clubs for Black Girls Code, and
                hand-sewing classes at Made Space Seattle. I still build things for fun, like a library catalog for my books and a scrapbook closet that cuts my clothes out of photos.
                This site has rooms for all of it. Pick a folder below or use the menu up top.
              </p>
              <ul className="quick-facts">
                <li>
                  <PixelIcon name="star" size={16} /> Based in: New York City
                </li>
                <li>
                  <PixelIcon name="smile" size={16} /> Sign: Gemini {'\u264A\uFE0E'}, which explains the engineer-and-educator double life
                </li>
                <li>
                  <PixelIcon name="heart" size={16} /> Loves: crochet, sewing, golf, and Riesling above all
                </li>
                <li>
                  <PixelIcon name="floppy" size={16} /> Studying: M.Ed. in Technology, Media, and Learning, Teachers College, Columbia University (expected May 2028)
                </li>
                <li>
                  <PixelIcon name="books" size={16} /> Background: B.S. in Computer Science (Intelligent Systems), minor in Sociology, Columbia University; software engineer at
                  Microsoft, 2021–2026
                </li>
              </ul>
              <p className="social-links">
                <a className="pixel-button" href={site.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn ↗
                </a>
                <a className="pixel-button" href={site.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram: @aryn.creates ↗
                </a>
              </p>
            </PixelWindow>
          )}

          {folders.map(
            ({ key, icon, tone, entries }) =>
              isOpen(key) && (
                <PixelWindow key={key} title={sections[key].file} tone={tone} className={`folder-window folder-${key}`} movable onClose={close(key)}>
                  <div className="folder-head">
                    <PixelIcon name={icon} size={44} />
                    <div>
                      <h2>
                        <a href={href(sections[key].path)}>{sections[key].label}</a>
                      </h2>
                      <p>{sections[key].blurb}</p>
                    </div>
                  </div>
                  <p className="folder-recent">{entries.length ? 'Recent:' : 'Nothing here yet. Check back soon!'}</p>
                  <ul className="folder-list">
                    {entries.map((entry) => (
                      <li key={entry.slug}>
                        <a href={href(`${sections[key].path}/${entry.slug}`)}>{entry.title}</a>
                      </li>
                    ))}
                  </ul>
                  <div className="folder-actions">
                    <a className="pixel-button" href={href(sections[key].path)}>
                      Open folder ▶
                    </a>
                    {key === 'education' && (
                      <a className="pixel-button substack-link" href={site.substack} target="_blank" rel="noopener noreferrer">
                        ✉ Substack ↗
                      </a>
                    )}
                  </div>
                </PixelWindow>
              ),
          )}

          {isOpen('currently') && (
            <PixelWindow title="currently.txt" tone="lilac" className="currently-window" movable onClose={close('currently')}>
              <dl className="currently">
                <div>
                  <dt>Building</dt>
                  <dd>
                    <a href={href(`${sections.portfolio.path}/${featuredProject?.slug ?? ''}`)}>{featuredProject?.title ?? 'something new'}</a>
                  </dd>
                </div>
                <div>
                  <dt>Reading</dt>
                  <dd>
                    {currentlyReading.length > 0 ? (
                      currentlyReading.map((book, i) => (
                        <span key={book.slug}>
                          {i > 0 && ' & '}
                          <a href={href(`${bookshelf.path}/${book.slug}`)}>{book.title}</a>
                        </span>
                      ))
                    ) : (
                      <a href={href(bookshelf.path)}>between books</a>
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Sipping</dt>
                  <dd>something interesting</dd>
                </div>
              </dl>
            </PixelWindow>
          )}

          {isOpen('school') && (
            <PixelWindow title="school_notes.txt" tone="peach" className="school-window" movable onClose={close('school')} labelledBy="school-title">
              <div className="folder-head">
                <PixelIcon name="notebook" size={40} />
                <div>
                  <h2 id="school-title">Back in school</h2>
                  <p>
                    {school.program}, {school.school} · expected {school.expected}
                  </p>
                </div>
              </div>
              <p className="folder-recent">Relevant courses:</p>
              <ul className="folder-list">
                {school.courses.map((course) => (
                  <li key={course}>{course}</li>
                ))}
              </ul>
              <p className="folder-recent">Assignments:</p>
              {school.assignments.filter((a) => /^https?:\/\//i.test(a.href)).length ? (
                <ul className="folder-list">
                  {school.assignments
                    .filter((a) => /^https?:\/\//i.test(a.href))
                    .map((assignment) => (
                      <li key={assignment.href}>
                        <a href={assignment.href} target="_blank" rel="noopener noreferrer">
                          {assignment.title}
                        </a>
                        {assignment.course && <span className="school-course"> · {assignment.course}</span>}
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="school-soon">Coming soon, once there’s something to share!</p>
              )}
            </PixelWindow>
          )}

          {isOpen('mail') && (
            <PixelWindow title="mail.exe" tone="blue" className="mail-window" movable onClose={close('mail')}>
              <div className="folder-head">
                <PixelIcon name="mail" size={44} />
                <p>
                  Have a project, a question, or a bottle recommendation?
                  <br />
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                  <br />
                  Or find me on{' '}
                  <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>{' '}
                  and, for creative stuff,{' '}
                  <a href={site.instagram} target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                  .
                </p>
              </div>
            </PixelWindow>
          )}

          {closed.length > 0 && (
            <button type="button" className="pixel-button reopen" onClick={() => setClosed([])}>
              ↺ Reopen {closed.length} {closed.length === 1 ? 'window' : 'windows'}
            </button>
          )}
        </div>

        <nav className="desktop-icons" aria-label="Shortcuts">
          <a href={href(sections.portfolio.path)}>
            <PixelIcon name="folder" size={40} />
            <span>Portfolio</span>
          </a>
          <a href={href(sections.education.path)}>
            <PixelIcon name="notebook" size={36} />
            <span>Edu blog</span>
          </a>
          <a href={href(sections.wine.path)}>
            <PixelIcon name="glass" size={30} />
            <span>{sections.wine.label}</span>
          </a>
          <a href={href(bookshelf.path)}>
            <PixelIcon name="books" size={36} />
            <span>Bookshelf</span>
          </a>
          <a href={`mailto:${site.email}`}>
            <PixelIcon name="mail" size={40} />
            <span>Email</span>
          </a>
        </nav>
      </section>
    </>
  )
}
