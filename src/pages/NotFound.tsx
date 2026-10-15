import PixelWindow from '../components/PixelWindow'
import { href } from '../router'

export default function NotFound() {
  return (
    <section className="not-found" aria-labelledby="nf-title">
      <h1 id="nf-title" className="mega">
        404
      </h1>
      <PixelWindow title="error.exe" tone="pink" className="error-window">
        <p className="error-line">
          <span className="error-badge" aria-hidden="true">×</span> ERROR! This page wandered off.
        </p>
        <a className="pixel-button" href={href('/')}>
          OK, take me home
        </a>
      </PixelWindow>
    </section>
  )
}
