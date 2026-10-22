import { useId, type CSSProperties, type ReactNode } from 'react'
import PixelIcon from '../components/PixelIcon'
import PixelWindow from '../components/PixelWindow'
import Popup, { useFocusReturn } from '../components/Popup'
import Rating from '../components/Rating'
import { books, type Book, type BookStatus } from '../content/books'
import { formatDate } from '../content/types'
import { href } from '../router'
import { bookshelf, site } from '../site'

const newestFirst = (list: Book[]) => [...list].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
const bookLink = (book: Book) => href(`${bookshelf.path}/${book.slug}`)

const dateLabel: Record<BookStatus, string> = { reading: 'Started', read: 'Finished', want: 'Want to read' }
// Shown when a book has no date.
const statusLabel: Record<BookStatus, string> = { reading: 'Currently reading', read: 'Read', want: 'Want to read' }

// Stable, slightly varied spine sizes so the shelf doesn't look machine-made.
function spineSize(book: Book) {
  let hash = 0
  for (const char of book.slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return { height: 150 + (hash % 50), width: Math.min(60, 38 + Math.round(book.title.length / 2)) }
}

function Shelf({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <section className="shelf" aria-labelledby={id}>
      <h2 id={id} className="shelf-label">
        {label}
      </h2>
      <div className="shelf-scroll">
        <ul className="shelf-row">{children}</ul>
      </div>
      <div className="shelf-plank" aria-hidden="true" />
    </section>
  )
}

function Cover({ book }: { book: Book }) {
  return (
    <li className={`cover spine-${book.color}`}>
      <a className="cover-link" href={bookLink(book)} data-slug={book.slug}>
        <span className="cover-title">{book.title}</span>
        <span className="cover-author">{book.author}</span>
      </a>
      <span className="cover-ribbon" aria-hidden="true">
        now reading
      </span>
    </li>
  )
}

function Spine({ book }: { book: Book }) {
  const { height, width } = spineSize(book)
  return (
    <li className={`spine spine-${book.color}`} style={{ '--spine-h': `${height}px`, '--spine-w': `${width}px` } as CSSProperties}>
      <a className="spine-link" href={bookLink(book)} data-slug={book.slug}>
        <span className="spine-title">{book.title}</span>
        <span className="sr-only">, by {book.author}</span>
      </a>
    </li>
  )
}

function BookPopup({ book }: { book: Book }) {
  const titleId = useId()
  return (
    <Popup fileName={`bookshelf/${book.slug}.book`} closePath={bookshelf.path} titleId={titleId} contentKey={book.slug}>
      <p className="post-date">
        {book.status === 'want' || !book.date ? (
          statusLabel[book.status]
        ) : (
          <>
            {dateLabel[book.status]} <time dateTime={book.date}>{formatDate(book.date)}</time>
          </>
        )}
      </p>
      <div className="book-detail">
        <div className={`cover cover-static spine-${book.color}`} aria-hidden="true">
          <span className="cover-title">{book.title}</span>
          <span className="cover-author">{book.author}</span>
        </div>
        <div>
          <h2 id={titleId} tabIndex={-1} className="post-title">
            {book.title}
          </h2>
          <p className="book-author">by {book.author}</p>
          {book.rating !== undefined && <Rating value={book.rating} />}
          {book.note && <p className="book-note">{book.note}</p>}
        </div>
      </div>
    </Popup>
  )
}

export default function BookshelfPage({ slug }: { slug?: string }) {
  useFocusReturn(slug)
  const open = slug ? books.find((book) => book.slug === slug) : undefined
  const reading = newestFirst(books.filter((book) => book.status === 'reading'))
  const read = newestFirst(books.filter((book) => book.status === 'read'))
  const want = books.filter((book) => book.status === 'want')
  const groups = [
    { label: 'Currently reading', list: reading },
    { label: 'Read', list: read },
    { label: 'Want to read', list: want },
  ]

  return (
    <div className="bookshelf-page">
      <section className="page-hero" aria-labelledby="page-title">
        <p className="page-path">
          <a href={href('/')}>C:\HOME</a> \ {bookshelf.file.toUpperCase()}
        </p>
        <h1 id="page-title" className="mega">
          Bookshelf
          <span className="mega-ext">.db</span>
        </h1>
        <PixelWindow title="readme_bookshelf.txt" tone="lilac" className="page-intro">
          <div className="intro-row">
            <PixelIcon name="books" size={56} />
            <div>
              <p>
                {bookshelf.blurb} This is just the highlight reel. My whole collection lives in my library, if you want to snoop!
              </p>
              <a className="pixel-button library-link" href={site.library} target="_blank" rel="noopener noreferrer">
                📚 Browse my full library ↗
              </a>
            </div>
          </div>
        </PixelWindow>
      </section>

      {slug !== undefined && !open && (
        <PixelWindow title="error.exe" tone="pink" className="error-window">
          <p className="error-line">
            <span className="error-badge" aria-hidden="true">×</span> ERROR! That book isn’t on the shelf.
          </p>
          <a className="pixel-button" href={href(bookshelf.path)}>
            OK
          </a>
        </PixelWindow>
      )}

      <PixelWindow title={bookshelf.file} tone="cream" className="shelf-window">
        {reading.length > 0 && (
          <Shelf id="shelf-reading" label={`Currently reading (${reading.length})`}>
            {reading.map((book) => (
              <Cover key={book.slug} book={book} />
            ))}
          </Shelf>
        )}
        {read.length > 0 && (
          <Shelf id="shelf-read" label={`Read (${read.length})`}>
            {read.map((book) => (
              <Spine key={book.slug} book={book} />
            ))}
          </Shelf>
        )}
        {want.length > 0 && (
          <Shelf id="shelf-want" label={`Want to read (${want.length})`}>
            {want.map((book) => (
              <Spine key={book.slug} book={book} />
            ))}
          </Shelf>
        )}
      </PixelWindow>

      <PixelWindow title="index.txt" tone="cream" className="archive">
        <h2 className="archive-title">Every book on the shelf</h2>
        {groups.map(
          ({ label, list }) =>
            list.length > 0 && (
              <div key={label} className="archive-group">
                <h3>{label}</h3>
                <ul className="archive-list">
                  {list.map((book) => (
                    <li key={book.slug}>
                      <a href={bookLink(book)}>{book.title}</a>
                      <span className="archive-meta">{book.author}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ),
        )}
      </PixelWindow>

      {open && <BookPopup book={open} />}
    </div>
  )
}
