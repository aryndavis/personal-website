## Project
- Personal website: about-me home page, curriculum design portfolio, education blog, and wine blog, each as a separate page.
- React, TypeScript, and Vite with a tiny hash router in `src/router.ts`; use npm scripts to develop and build.
- Visual direction: dark liquid-chrome holographic background (WebGL) with pastel pixel-art pop-up windows and post-it notes. Preserve keyboard access, reduced-motion support, and responsive layouts.

## Implementation Notes
- Content lives in typed data in `src/content/` and `src/site.ts`; never render untrusted HTML.
- Every entry must stay reachable by a regular link as well as by its pop-up window.
- Keep dependencies lean; no backend, analytics, or third-party scripts or fonts without explicit approval.
- Maintain the strict CSP and security headers in both `vite.config.ts` and `public/_headers`.
- Run `npm run build` after changes that affect the app.
