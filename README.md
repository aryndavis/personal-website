# Personal website

Aryn Davis's personal site: an about-me home page, a curriculum design portfolio, an education blog, and a wine blog. It has a Y2K desktop look: a liquid-chrome holographic background with pixel pop-up windows and post-it notes. Built with React, TypeScript, and Vite.

## Run locally

Requires Node.js LTS and npm (with nvm: `nvm install --lts && nvm use --lts`).

```sh
npm install
npm run dev       # live preview at http://localhost:5173
npm run build     # type-check and build to dist/
npm run preview   # serve the production build at http://localhost:4173
```

## Pages

| URL | Page | Content file |
| --- | --- | --- |
| `#/` | About me (home) | `src/pages/Home.tsx` |
| `#/portfolio` | Curriculum portfolio | `src/content/portfolio.ts` |
| `#/education` | Education blog | `src/content/education.ts` |
| `#/wine` | Wine blog | `src/content/wine.ts` |

Every project and post has its own link (for example `#/wine/weeknight-white-under-20`). Opening it shows the entry in a pop-up window, and each section also has a plain `index.txt` list of links. Routes use the `#/` form so the site works on any static host without server rewrite rules.

## Editing content

- **Name, email, tagline:** `src/site.ts`
- **About me text:** `src/pages/Home.tsx`
- **Projects and posts:** add an object to the array in the matching `src/content/*.ts` file. Bodies are lists of blocks (`p`, `h`, `list`, `quote`); see `src/content/types.ts`. Content is rendered as text, never as raw HTML.
- **Wine posts** can include an optional `wine` tasting card with a 1 to 5 heart rating.

All sample content is placeholder text; replace it before publishing.

## Design pieces

- `src/components/HoloBackground.tsx`: animated WebGL liquid-chrome background. It pauses when the tab is hidden, shows a still frame for reduced-motion users, and falls back to CSS gradients without WebGL.
- `src/components/PixelWindow.tsx`: the pixel window frame. On the home page, windows can be dragged by their title bars (desktop with a mouse), minimized, and closed.
- `src/components/PixelIcon.tsx`: pixel-art icons drawn from small character grids.
- Fonts (Pixelify Sans, VT323) are bundled from npm via Fontsource, so nothing loads from a third party.

## Security

- The Content Security Policy only allows scripts, styles, fonts, and images from the site itself. No third-party scripts, no inline scripts, no framing, and forms are disabled. Assets are never inlined as `data:` URIs.
- `vite.config.ts` sends these headers from the dev and preview servers. `public/_headers` carries the same headers for hosts that support that file (Netlify, Cloudflare Pages). For other hosts, set equivalent headers in the host's settings. Keep the two files in sync.
- Serve production over HTTPS. Only add `includeSubDomains` or `preload` to HSTS if every subdomain is HTTPS-ready.
- Run `npm audit` periodically and keep `package-lock.json` committed.
