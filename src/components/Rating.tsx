import PixelIcon from './PixelIcon'

/** 1 to 5 hearts. Halves (4.5) show a half-filled heart. */
export default function Rating({ value }: { value: number }) {
  return (
    <span className="rating">
      <span className="sr-only">Rated {value} out of 5</span>
      {Array.from({ length: 5 }, (_, i) =>
        value >= i + 1 ? (
          <PixelIcon key={i} name="heart" size={14} />
        ) : value > i ? (
          <span key={i} className="half-heart">
            <PixelIcon name="heart" size={14} className="dim" />
            <span className="half-heart-fill">
              <PixelIcon name="heart" size={14} />
            </span>
          </span>
        ) : (
          <PixelIcon key={i} name="heart" size={14} className="dim" />
        ),
      )}
    </span>
  )
}
