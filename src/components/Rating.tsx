import PixelIcon from './PixelIcon'

export default function Rating({ value }: { value: number }) {
  return (
    <span className="rating">
      <span className="sr-only">Rated {value} out of 5</span>
      {Array.from({ length: 5 }, (_, i) => (
        <PixelIcon key={i} name="heart" size={14} className={i < value ? '' : 'dim'} />
      ))}
    </span>
  )
}
