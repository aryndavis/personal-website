import type { ReactNode } from 'react'
import { flavorIcon } from '../components/flavorIcons'
import PixelIcon, { type IconName } from '../components/PixelIcon'
import PixelWindow from '../components/PixelWindow'
import { useFocusReturn } from '../components/Popup'
import PostDialog from '../components/PostDialog'
import Rating from '../components/Rating'
import { BODY, LEVEL, SWEETNESS, meterFill, formatDate, newestFirst, type BuyAgain, type WinePost, type WinePrice, type WineStyle } from '../content/types'
import { winePosts } from '../content/wine'
import { href } from '../router'
import { sections } from '../site'

const section = sections.wine
const postLink = (post: WinePost) => href(`${section.path}/${post.slug}`)

const STYLES: WineStyle[] = ['red', 'white', 'rosé', 'orange', 'sparkling', 'dessert']
// CSS class names can't rely on accents.
const styleClass = (style?: WineStyle) => `bottle-${style === 'rosé' ? 'rose' : (style ?? 'unknown')}`

const priceLabel: Record<WinePrice, string> = { $: 'under $20', $$: '$20–30', $$$: '$30–50', $$$$: '$50+' }
const buyAgainLabel: Record<BuyAgain, string> = { yes: 'Yes, I’d buy it again', maybe: 'Maybe', no: 'No, once was enough' }

/**
 * A five-step pixel meter: squares, or an icon (sweetness is piles of sugar) with the empty steps faded.
 * "Bone dry" and "none" fill nothing. The text label next to it carries the meaning; the meter is decoration.
 */
function Meter({ scale, value, icon }: { scale: readonly string[]; value: string; icon?: MeterIcon }) {
  const filled = meterFill(scale, value)
  return (
    <span className={icon ? 'meter meter-icons' : 'meter'} aria-hidden="true">
      {scale.map((step, i) =>
        icon ? (
          <PixelIcon key={step} name={icon.name} size={icon.size} className={i < filled ? '' : 'dim'} />
        ) : (
          <span key={step} className={i < filled ? 'on' : ''} />
        ),
      )}
    </span>
  )
}

/** Widths that make each meter icon about 16px tall (the tea cup is wide and short). */
type MeterIcon = { name: IconName; size: number }
const SUGAR: MeterIcon = { name: 'sugar', size: 20 }
const KETTLEBELL: MeterIcon = { name: 'kettlebell', size: 15 }
const BOLT: MeterIcon = { name: 'bolt', size: 13 }
const TEA: MeterIcon = { name: 'tea', size: 22 }

/** A label with a small icon in front of it. */
const withIcon = (icon: IconName, text: ReactNode) => (
  <span className="with-icon">
    <PixelIcon name={icon} size={14} />
    {text}
  </span>
)

/** The tasting card at the top of a tasting note: verdict, ratings, facts, profile, tasting notes and pairings. */
function TastingCard({ post }: { post: WinePost }) {
  if (!post.wine) return null
  const wine = post.wine
  const facts: [string, ReactNode][] = [
    ['Wine', `${wine.name} ${wine.vintage}`],
    ['Producer', wine.producer],
    ['Grape', wine.grape],
    ['Region', wine.region && withIcon('pin', wine.region)],
    ['Bought at', wine.boughtAt && withIcon('bag', wine.boughtAt)],
    ['Style', wine.style && withIcon('bottle', <span className="style-name">{wine.style}</span>)],
    ['Price', wine.price && `${wine.price} · ${priceLabel[wine.price]}`],
  ]
  const profile: [string, readonly string[], string | undefined, MeterIcon?][] = [
    ['Sweetness', SWEETNESS, wine.sweetness, SUGAR],
    ['Body', BODY, wine.body, KETTLEBELL],
    ['Acidity', LEVEL, wine.acidity, BOLT],
    ['Tannin', LEVEL, wine.tannin, TEA],
  ]
  const shownProfile = profile.filter(([, , value]) => value)
  const flavors = wine.flavors ?? []

  return (
    <div className={`tasting-card ${styleClass(wine.style)}`}>
      <p className="tasting-card-title">
        <PixelIcon name="glass" size={18} /> Tasting card
      </p>

      {wine.verdict && <p className="verdict">“{wine.verdict}”</p>}

      {(wine.rating !== undefined || wine.buyAgain) && (
        <div className="card-scores">
          {wine.rating !== undefined && <Rating value={wine.rating} />}
          {wine.buyAgain && <span className={`buy-again buy-${wine.buyAgain}`}>{buyAgainLabel[wine.buyAgain]}</span>}
        </div>
      )}

      <dl className="card-facts">
        {facts
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
      </dl>

      {shownProfile.length > 0 && (
        <section className="card-section">
          <h3>Profile</h3>
          <dl className="card-profile">
            {shownProfile.map(([label, scale, value, icon]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>
                  <Meter scale={scale} value={value!} icon={icon} />
                  <span className="meter-label">{value}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {flavors.length > 0 && (
        <section className="card-section">
          <h3>Tasting notes</h3>
          <ul className="flavor-chips">
            {flavors.map((flavor) => {
              const icon = flavorIcon(flavor)
              return <li key={flavor}>{icon ? withIcon(icon, flavor) : flavor}</li>
            })}
          </ul>
        </section>
      )}

      {wine.pairedWith ? (
        <section className="card-section">
          <h3>{withIcon('cutlery', 'I paired it with')}</h3>
          <p className="pairing">{wine.pairedWith}</p>
          {wine.suggestedPairings && wine.suggestedPairings.length > 0 && (
            <>
              <h3>Would also go with</h3>
              <p className="pairing">{wine.suggestedPairings.join(' · ')}</p>
            </>
          )}
        </section>
      ) : (
        wine.suggestedPairings &&
        wine.suggestedPairings.length > 0 && (
          <section className="card-section">
            <h3>{withIcon('cutlery', 'Try it with')}</h3>
            <p className="pairing">
              {wine.suggestedPairings.join(' · ')} <span className="pairing-hint">(suggested)</span>
            </p>
          </section>
        )
      )}

      {wine.earlier && wine.earlier.length > 0 && (
        <section className="card-section">
          <h3>{wine.earlier.length === 1 ? 'My earlier review' : 'My earlier reviews'}</h3>
          <ul className="earlier-reviews">
            {wine.earlier.map((review) => (
              <li key={review.slug}>
                <a href={href(`${section.path}/${review.slug}`)}>{review.title}</a> · <time dateTime={review.date}>{formatDate(review.date)}</time>
              </li>
            ))}
          </ul>
        </section>
      )}
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
          <p className="rack-disclaimer">
            <strong>The fine print:</strong> I buy every bottle myself. Nothing here is gifted or sponsored. Ratings and notes are my own personal taste, not
            objective truth.
          </p>
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
