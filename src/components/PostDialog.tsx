import { useId, type ReactNode } from 'react'
import { formatDate, type Block, type Entry, type Inline } from '../content/types'
import { href } from '../router'
import Popup from './Popup'

const isWebLink = (url: string) => /^https?:\/\//i.test(url)

function InlineText({ text }: { text: string | Inline[] }) {
  if (typeof text === 'string') return text
  return text.map((part, index) => {
    if (typeof part === 'string') return part
    if ('href' in part) {
      // Only plain web links become anchors; anything else stays text.
      return isWebLink(part.href) ? (
        <a key={index} href={part.href} target="_blank" rel="noopener noreferrer">
          {part.text}
        </a>
      ) : (
        part.text
      )
    }
    return <em key={index}>{part.text}</em>
  })
}

export function PostBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="post-body">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'h':
            return <h3 key={index}>{block.text}</h3>
          case 'image':
            return (
              <figure key={index} className="post-figure">
                <img src={`${import.meta.env.BASE_URL}${block.src}`} alt={block.alt} loading="lazy" />
                {block.caption && <figcaption>{block.caption}</figcaption>}
              </figure>
            )
          case 'list':
            return (
              <ul key={index}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )
          case 'quote':
            return <blockquote key={index}>{block.text}</blockquote>
          default:
            return (
              <p key={index}>
                <InlineText text={block.text} />
              </p>
            )
        }
      })}
    </div>
  )
}

interface PostDialogProps {
  entry: Entry
  fileName: string
  /** Section path to return to when the pop-up closes. */
  closePath: string
  prev?: Entry
  next?: Entry
  meta?: ReactNode
}

// Each post has its own URL (#/section/slug) and opens as a modal pop-up window.
export default function PostDialog({ entry, fileName, closePath, prev, next, meta }: PostDialogProps) {
  const titleId = useId()

  return (
    <Popup fileName={fileName} closePath={closePath} titleId={titleId} contentKey={entry.slug}>
      <p className="post-date">
        {entry.period ?? <time dateTime={entry.date}>{formatDate(entry.date)}</time>}
      </p>
      <h2 id={titleId} tabIndex={-1} className="post-title">
        {entry.title}
      </h2>
      {entry.subtitle && <p className="post-subtitle">{entry.subtitle}</p>}
      {meta}
      <ul className="tag-list" aria-label="Tags">
        {entry.tags.map((tag) => (
          <li key={tag}>#{tag}</li>
        ))}
      </ul>
      <PostBody blocks={entry.body} />
      {entry.substackUrl && (
        <p className="substack-note">
          Also published on Substack.{' '}
          <a className="pixel-button" href={entry.substackUrl} target="_blank" rel="noopener noreferrer">
            Read &amp; subscribe on Substack ↗
          </a>
        </p>
      )}
      <nav className="post-nav" aria-label="More posts">
        {prev ? <a href={href(`${closePath}/${prev.slug}`)}>◀ {prev.title}</a> : <span />}
        {next ? <a href={href(`${closePath}/${next.slug}`)}>{next.title} ▶</a> : <span />}
      </nav>
    </Popup>
  )
}
