import { useEffect, useId, useRef, useState, type PointerEvent, type ReactNode, type RefObject } from 'react'

export type Tone = 'cream' | 'pink' | 'lilac' | 'mint' | 'yellow' | 'blue' | 'peach'

let topLayer = 10

interface PixelWindowProps {
  title: string
  tone?: Tone
  children: ReactNode
  className?: string
  /** Lets the window be dragged by its title bar on large screens with a mouse. */
  movable?: boolean
  /** Shows working minimize/close buttons. Close calls this handler. */
  onClose?: () => void
  as?: 'section' | 'article' | 'aside' | 'div'
  labelledBy?: string
}

const canDrag = () => window.matchMedia('(min-width: 960px) and (pointer: fine)').matches

export default function PixelWindow({ title, tone = 'cream', children, className = '', movable = false, onClose, as: Tag = 'section', labelledBy }: PixelWindowProps) {
  const titleId = useId()
  const bodyId = useId()
  const ref = useRef<HTMLElement>(null)
  const [collapsed, setCollapsed] = useState(false)
  const drag = useRef({ active: false, startX: 0, startY: 0, x: 0, y: 0 })

  // Position is applied straight to the element so dragging doesn't re-render.
  const place = () => {
    if (ref.current) ref.current.style.translate = `${drag.current.x}px ${drag.current.y}px`
  }

  useEffect(() => {
    if (!movable) return
    const reset = () => {
      if (!canDrag()) {
        drag.current.x = 0
        drag.current.y = 0
        place()
      }
    }
    window.addEventListener('resize', reset)
    return () => window.removeEventListener('resize', reset)
  }, [movable])

  const raise = () => {
    if (movable && ref.current) ref.current.style.zIndex = String(++topLayer)
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!movable || !canDrag() || (event.target as HTMLElement).closest('button')) return
    raise()
    drag.current.active = true
    drag.current.startX = event.clientX - drag.current.x
    drag.current.startY = event.clientY - drag.current.y
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return
    drag.current.x = event.clientX - drag.current.startX
    drag.current.y = event.clientY - drag.current.startY
    place()
  }

  const onPointerUp = () => {
    drag.current.active = false
  }

  return (
    <Tag
      ref={ref as RefObject<never>}
      className={`pixel-window tone-${tone} ${movable ? 'movable' : ''} ${collapsed ? 'collapsed' : ''} ${className}`}
      aria-labelledby={labelledBy ?? titleId}
      onPointerDown={raise}
    >
      <div className="titlebar" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        <span className="titlebar-name" id={titleId}>{title}</span>
        <span className="titlebar-stripes" aria-hidden="true" />
        {onClose ? (
          <span className="titlebar-buttons">
            <button type="button" aria-label={collapsed ? `Expand ${title}` : `Minimize ${title}`} aria-expanded={!collapsed} aria-controls={bodyId} onClick={() => setCollapsed((value) => !value)}>
              <span aria-hidden="true">{collapsed ? '□' : '_'}</span>
            </button>
            <button type="button" aria-label={`Close ${title}`} onClick={onClose}>
              <span aria-hidden="true">×</span>
            </button>
          </span>
        ) : (
          <span className="titlebar-buttons decorative" aria-hidden="true">
            <span>_</span>
            <span>□</span>
            <span>×</span>
          </span>
        )}
      </div>
      <div className="window-body" id={bodyId} hidden={collapsed}>
        {children}
      </div>
    </Tag>
  )
}
