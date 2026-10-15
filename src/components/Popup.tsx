import { useEffect, useRef, type ReactNode } from 'react'
import { href, navigate } from '../router'

interface PopupProps {
  fileName: string
  /** Page to return to when the pop-up closes. */
  closePath: string
  /** id of the heading inside children; it labels the dialog and gets focus. */
  titleId: string
  /** Changing this scrolls back to the top and refocuses the heading. */
  contentKey: string
  children: ReactNode
}

// A modal pixel window tied to a URL. Closing it (×, Esc, or clicking outside) navigates to closePath.
export default function Popup({ fileName, closePath, titleId, contentKey, children }: PopupProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => dialog?.close()
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
    document.getElementById(titleId)?.focus()
  }, [contentKey, titleId])

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
          {children}
        </div>
      </div>
    </dialog>
  )
}

/** When a pop-up closes, return focus to the link that opened it (marked with data-slug). */
export function useFocusReturn(slug: string | undefined) {
  const lastSlug = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (!slug && lastSlug.current) {
      document.querySelector<HTMLElement>(`[data-slug="${CSS.escape(lastSlug.current)}"]`)?.focus()
    }
    lastSlug.current = slug
  }, [slug])
}
