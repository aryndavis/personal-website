import { useEffect, useId, useRef, type ReactNode } from 'react'
import { formatDate, type Block, type Entry } from '../content/types'
import { href, navigate } from '../router'

export function PostBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="post-body">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'h':
            return <h3 key={index}>{block.text}</h3>
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
            return <p key={index}>{block.text}</p>
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
  const ref = useRef<HTMLDialogElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => dialog?.close()
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
    document.getElementById(titleId)?.focus()
  }, [entry.slug, titleId])

  const close = () => navigate(closePath)

  return (
    <dialog
      ref={ref}
      className="popup"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      <div className="pixel-window tone-cream popup-window">
        <div className="titlebar">
          <span className="titlebar-name">{fileName}</span>
          <span className="titlebar-stripes" aria-hidden="true" />
          <span className="titlebar-buttons">
            <a href={href(closePath)} aria-label="Close and go back to the list">
              <span aria-hidden="true">×</span>
            </a>
          </span>
        </div>
        <div className="window-body popup-scroll" ref={scrollRef}>
          <p className="post-date">
            <time dateTime={entry.date}>{formatDate(entry.date)}</time>
          </p>
          <h2 id={titleId} tabIndex={-1} className="post-title">
            {entry.title}
          </h2>
          {meta}
          <ul className="tag-list" aria-label="Tags">
            {entry.tags.map((tag) => (
              <li key={tag}>#{tag}</li>
            ))}
          </ul>
          <PostBody blocks={entry.body} />
          <nav className="post-nav" aria-label="More posts">
            {prev ? <a href={href(`${closePath}/${prev.slug}`)}>◀ {prev.title}</a> : <span />}
            {next ? <a href={href(`${closePath}/${next.slug}`)}>{next.title} ▶</a> : <span />}
          </nav>
        </div>
      </div>
    </dialog>
  )
}
