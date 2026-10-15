import { useEffect, useRef, type ReactNode } from 'react'
import PixelIcon, { type IconName } from '../components/PixelIcon'
import PixelWindow, { type Tone } from '../components/PixelWindow'
import PostDialog from '../components/PostDialog'
import { formatDate, newestFirst, type Entry } from '../content/types'
import { href } from '../router'
import { sections, type SectionKey } from '../site'

const noteTones: Tone[] = ['yellow', 'pink', 'mint', 'lilac', 'blue']

interface CollectionProps<T extends Entry> {
  sectionKey: SectionKey
  entries: T[]
  slug?: string
  headline: ReactNode
  intro: ReactNode
  icon: IconName
  /** 'windows' for portfolio case studies, 'notes' for post-it blog posts. */
  layout: 'windows' | 'notes'
  fileExtension: string
  cardExtra?: (entry: T) => ReactNode
  dialogMeta?: (entry: T) => ReactNode
}

export default function Collection<T extends Entry>({ sectionKey, entries, slug, headline, intro, icon, layout, fileExtension, cardExtra, dialogMeta }: CollectionProps<T>) {
  const section = sections[sectionKey]
  const sorted = newestFirst(entries)
  const index = slug ? sorted.findIndex((entry) => entry.slug === slug) : -1
  const open = index >= 0 ? sorted[index] : undefined
  const missing = slug !== undefined && !open

  // When a pop-up closes, return focus to the link that opened it.
  const lastSlug = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (!slug && lastSlug.current) {
      document.querySelector<HTMLElement>(`[data-slug="${CSS.escape(lastSlug.current)}"]`)?.focus()
    }
    lastSlug.current = slug
  }, [slug])

  const link = (entry: T) => href(`${section.path}/${entry.slug}`)

  return (
    <div className={`collection collection-${sectionKey}`}>
      <section className="page-hero" aria-labelledby="page-title">
        <p className="page-path">
          <a href={href('/')}>C:\HOME</a> \ {section.file.toUpperCase()}
        </p>
        <h1 id="page-title" className="mega">
          {headline}
        </h1>
        <PixelWindow title={`readme_${sectionKey}.txt`} tone="lilac" className="page-intro">
          <div className="intro-row">
            <PixelIcon name={icon} size={56} />
            <div>{intro}</div>
          </div>
        </PixelWindow>
      </section>

      {missing && (
        <PixelWindow title="error.exe" tone="pink" className="error-window">
          <p className="error-line">
            <span className="error-badge" aria-hidden="true">×</span> ERROR! That post could not be found.
          </p>
          <a className="pixel-button" href={href(section.path)}>
            OK
          </a>
        </PixelWindow>
      )}

      <section aria-label={`${section.label} posts`}>
        {layout === 'notes' ? (
          <ul className="note-board">
            {sorted.map((entry, i) => (
              <li key={entry.slug} className={`note tone-${noteTones[i % noteTones.length]}`}>
                <span className="note-tape" aria-hidden="true" />
                <p className="note-date">
                  <time dateTime={entry.date}>{formatDate(entry.date)}</time>
                </p>
                <h2 className="note-title">
                  <a className="stretched" href={link(entry)} data-slug={entry.slug}>
                    {entry.title}
                  </a>
                </h2>
                <p className="note-summary">{entry.summary}</p>
                {cardExtra?.(entry)}
                <span className="note-open" aria-hidden="true">
                  open ▶
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="window-board">
            {sorted.map((entry, i) => (
              <li key={entry.slug}>
                <PixelWindow as="article" title={`${entry.slug}.${fileExtension}`} tone={noteTones[(i + 1) % noteTones.length]} labelledBy={`card-${entry.slug}`} className="card-window">
                  {cardExtra?.(entry)}
                  <h2 className="card-title" id={`card-${entry.slug}`}>
                    <a className="stretched" href={link(entry)} data-slug={entry.slug}>
                      {entry.title}
                    </a>
                  </h2>
                  <p>{entry.summary}</p>
                  <ul className="tag-list" aria-label="Tags">
                    {entry.tags.map((tag) => (
                      <li key={tag}>#{tag}</li>
                    ))}
                  </ul>
                  <span className="pixel-button card-open" aria-hidden="true">
                    Open case study ▶
                  </span>
                </PixelWindow>
              </li>
            ))}
          </ul>
        )}
      </section>

      <PixelWindow title="index.txt" tone="cream" className="archive">
        <h2 className="archive-title">All {section.label.toLowerCase()} entries</h2>
        <ol className="archive-list">
          {sorted.map((entry) => (
            <li key={entry.slug}>
              <time dateTime={entry.date}>{entry.date}</time>
              <a href={link(entry)}>{entry.title}</a>
            </li>
          ))}
        </ol>
      </PixelWindow>

      {open && (
        <PostDialog
          entry={open}
          fileName={`${section.path.slice(1)}/${open.slug}.${fileExtension}`}
          closePath={section.path}
          prev={sorted[index + 1]}
          next={sorted[index - 1]}
          meta={dialogMeta?.(open)}
        />
      )}
    </div>
  )
}
