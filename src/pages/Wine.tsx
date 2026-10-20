import type { ReactNode } from 'react'
import PixelIcon from '../components/PixelIcon'
import PixelWindow from '../components/PixelWindow'
import { useFocusReturn } from '../components/Popup'
import PostDialog from '../components/PostDialog'
import Rating from '../components/Rating'
import { formatDate, newestFirst, type BuyAgain, type WinePost, type WinePrice, type WineStyle } from '../content/types'
import { winePosts } from '../content/wine'
import { href } from '../router'
import { sections } from '../site'

const section = sections.wine
const postLink = (post: WinePost) => href(`${section.path}/${post.slug}`)

const STYLES: WineStyle[] = ['red', 'white', 'rosé', 'orange', 'sparkling', 'dessert']
// CSS class names can't rely on accents.
const styleClass = (style?: WineStyle) => `bottle-${style === 'rosé' ? 'rose' : (style ?? 'unknown')}`

const priceLabel: Record<WinePrice, string> = { $: 'under $15', $$: '$15–30', $$$: '$30–60', $$$$: 'over $60' }
const buyAgainLabel: Record<BuyAgain, string> = { yes: 'Yes, I’d buy it again', maybe: 'Maybe', no: 'No, once was enough' }

/** The tasting card at the top of a tasting note. */
function TastingCard({ post }: { post: WinePost }) {
  if (!post.wine) return null
  const { name, vintage, producer, grape, region, style, price, rating, buyAgain } = post.wine
  const rows: [string, ReactNode][] = [
    ['Wine', `${name} ${vintage}`],
    ['Producer', producer],
    ['Grape', grape],
    ['Region', region],
    ['Style', style && <span className="style-name">{style}</span>],
    ['Price', price && `${price} · ${priceLabel[price]}`],
    ['Rating', rating !== undefined && <Rating value={rating} />],
    ['Buy again?', buyAgain && <span className={`buy-again buy-${buyAgain}`}>{buyAgainLabel[buyAgain]}</span>],
  ]
  return (
    <div className={`tasting-card ${styleClass(style)}`}>
      <p className="tasting-card-title">
        <PixelIcon name="glass" size={18} /> Tasting card
      </p>
      <dl>
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
      </dl>
    </div>
  )
}

function Bottle({ post }: { post: WinePost }) {
  const wine = post.wine!
  return (
    <li className={`bottle ${styleClass(wine.style)}`}>
      <a className="bottle-link" href={postLink(post)} data-slug={post.slug}>
        <span className="bottle-glass" aria-hidden="true" />
        <span className="bottle-label">
          <span className="bottle-name">{wine.name}</span>
          <span className="bottle-vintage">{wine.vintage}</span>
        </span>
        <span className="sr-only">
          {`: ${post.title}. ${wine.style ? `${wine.style}, ` : ''}${wine.grape}${wine.rating ? `, ${wine.rating} out of 5 hearts` : ''}.`}
        </span>
      </a>
      {wine.buyAgain === 'yes' && (
        <span className="bottle-tag" aria-hidden="true">
          ♥ again
        </span>
      )}
    </li>
  )
}

export default function WinePage({ slug }: { slug?: string }) {
  useFocusReturn(slug)
  const sorted = newestFirst(winePosts)
  const bottles = sorted.filter((post) => post.kind === 'tasting' && post.wine)
  const guides = sorted.filter((post) => post.kind === 'guide')
  const index = slug ? sorted.findIndex((post) => post.slug === slug) : -1
  const open = index >= 0 ? sorted[index] : undefined
  const stylesShown = STYLES.filter((style) => bottles.some((post) => post.wine?.style === style))

  return (
    <div className="collection collection-wine">
      <section className="page-hero" aria-labelledby="page-title">
        <p className="page-path">
          <a href={href('/')}>C:\HOME</a> \ {section.file.toUpperCase()}
        </p>
        <h1 id="page-title" className="mega">
          {section.label}
        </h1>
        <PixelWindow title="readme_wine.txt" tone="lilac" className="page-intro">
          <div className="intro-row">
            <PixelIcon name="glass" size={56} />
            <p>
              Honest tasting notes and easy guides, for anyone who likes wine and doesn’t speak sommelier. Every bottle on the rack is one I opened; pick one to read
              my notes.
            </p>
          </div>
        </PixelWindow>
      </section>

      {slug !== undefined && !open && (
        <PixelWindow title="error.exe" tone="pink" className="error-window">
          <p className="error-line">
            <span className="error-badge" aria-hidden="true">×</span> ERROR! That bottle isn’t in the cellar.
          </p>
          <a className="pixel-button" href={href(section.path)}>
            OK
          </a>
        </PixelWindow>
      )}

      <PixelWindow title="wine_rack.dat" tone="cream" className="rack-window">
        <section aria-labelledby="rack-title">
          <h2 id="rack-title" className="shelf-label">
            Tasting notes ({bottles.length})
          </h2>
          {bottles.length ? (
            <ul className="wine-rack">
              {bottles.map((post) => (
                <Bottle key={post.slug} post={post} />
              ))}
            </ul>
          ) : (
            <p className="rack-empty">The rack is empty… for now.</p>
          )}
          {stylesShown.length > 0 && (
            <ul className="rack-legend" aria-label="Bottle colors">
              {stylesShown.map((style) => (
                <li key={style} className={styleClass(style)}>
                  <span className="legend-swatch" aria-hidden="true" /> {style}
                </li>
              ))}
            </ul>
          )}
        </section>
      </PixelWindow>

      {guides.length > 0 && (
        <section className="guides" aria-labelledby="guides-title">
          <h2 id="guides-title" className="section-heading">
            Guides
          </h2>
          <ul className="recipe-board">
            {guides.map((post) => (
              <li key={post.slug} className="recipe-card">
                <span className="recipe-pin" aria-hidden="true" />
                <p className="recipe-kicker">
                  Guide · <time dateTime={post.date}>{formatDate(post.date)}</time>
                </p>
                <h3 className="recipe-title">
                  <a className="stretched" href={postLink(post)} data-slug={post.slug}>
                    {post.title}
                  </a>
                </h3>
                <p className="recipe-summary">{post.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <PixelWindow title="index.txt" tone="cream" className="archive">
        <h2 className="archive-title">Everything in the cellar</h2>
        <ol className="archive-list">
          {sorted.map((post) => (
            <li key={post.slug}>
              <time dateTime={post.date}>{post.date}</time>
              <a href={postLink(post)}>{post.title}</a>
              <span className="archive-meta">{post.kind === 'guide' ? 'guide' : post.wine?.style ?? 'tasting note'}</span>
            </li>
          ))}
        </ol>
      </PixelWindow>

      {open && (
        <PostDialog
          entry={open}
          fileName={`${section.path.slice(1)}/${open.slug}.dat`}
          closePath={section.path}
          prev={sorted[index + 1]}
          next={sorted[index - 1]}
          meta={<TastingCard post={open} />}
        />
      )}
    </div>
  )
}
