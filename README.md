# Personal website

Live at **[arynlynn.com](https://arynlynn.com)**. The apps live on subdomains: [library.arynlynn.com](https://library.arynlynn.com) (bookshelf) and [closet.arynlynn.com](https://closet.arynlynn.com) (Aryn’s Closet).

Aryn Davis's personal site: an about-me home page, a portfolio (curriculum design and software engineering), an education blog, and a wine blog. It has a Y2K desktop look: a liquid-chrome holographic background with pixel pop-up windows and post-it notes. Built with React, TypeScript, and Vite.

## Screenshots

Taken from the production build at 1280×800. Update them whenever a page's look changes (they live in `docs/screenshots/`).

| Home (about me) | Portfolio |
| --- | --- |
| ![Home page](docs/screenshots/home.jpg) | ![Portfolio](docs/screenshots/portfolio.jpg) |
| **Education blog** | **Gen Z With A Glass (wine blog)** |
| ![Education blog](docs/screenshots/education.jpg) | ![Gen Z With A Glass wine rack](docs/screenshots/wine.jpg) |
| **Bookshelf** | |
| ![Bookshelf](docs/screenshots/bookshelf.jpg) | |

## Run locally

Requires Node.js LTS and npm (with nvm: `nvm install --lts && nvm use --lts`).

```sh
npm install
npm run dev       # live preview at http://localhost:5173
npm run build     # type-check and build to dist/
npm run preview   # serve the production build at http://localhost:4173
npm test          # content, Substack-sync and text-posting tests
npm run lint      # ESLint (TypeScript + React hooks rules)
```

Every pull request runs lint, type-check, tests and a build in GitHub Actions (`.github/workflows/ci.yml`).

**What the tests cover** (`npm test`):
- **Text posting** (`scripts/text-posting.test.mjs`):
  - parsing, every validation error, Twilio signatures, the sender allowlist, preview → YES / NO, expiry, daily limits
  - storage and GitHub failures: a clear reply instead of silence, the preview kept for retry, and never posting a note twice
- **Publishing to GitHub** (`scripts/github-publish.test.mjs`): retrying a conflict, never appending a note that is already there (two quick YES replies), giving up, other errors, a malformed file, and accents and emoji surviving encoding.
- **Substack sync** (`scripts/sync-substack.test.mjs`, `scripts/substack-html.test.mjs`): HTML conversion, the image host allowlist, type and size limits, archive paging, and network failures.
- **Tasting notes** (`scripts/tasting-notes.test.mjs`): the defaults, style and sweetness guesses, pairings, stable links, and how full each profile meter is (bone dry and none fill nothing).
- **Search and link previews** (`scripts/seo.test.mjs`): the home title and description, preview tags and the 1200×630 image, the structured data matching the site's profile links, robots.txt and the sitemap.
- **Tasting card icons** (`scripts/flavor-icons.test.mjs`): every drawing is a clean rectangle of palette colors; every pleasant aroma-wheel term gets an icon and every fault gets none; the most specific wording wins (strawberry jam, bell pepper).

## Pages

| URL | Page | Content file |
| --- | --- | --- |
| `/` | About me (home) | `src/pages/Home.tsx` |
| `/portfolio` | Portfolio: curriculum design and software engineering | `src/content/portfolio.ts` |
| `/education` | Education blog | `src/content/education.ts` |
| `/wine` | Gen Z With A Glass (wine blog) | `src/content/wine.ts` |
| `/bookshelf` | Bookshelf (reading list) | `src/content/books.ts` |

Every project and post has its own address (for example `/wine/weeknight-white-under-20`). Opening it shows the entry in a pop-up window, and each section also has a plain `index.txt` list of links. Moving around never reloads the page: the app handles its own links (`src/router.ts`). For first visits, search engines and link previews, `npm run build` also writes a page for every address with its own title, description and preview tags, plus `sitemap.xml` and a `404.html` (`scripts/prerender.mjs`, from the list in `src/routes.ts`). Old `#/` links still work: they're swapped for the new address on load.

## Editing content

- **Name, email, tagline:** `src/site.ts`
- **About me text:** `src/pages/Home.tsx`
- **Portfolio projects** (`src/content/portfolio.ts`) have a `track`: `'curriculum'` or `'software'`. Each shows under its own heading on the Portfolio page. Software projects can add a `cover` screenshot for the card and `links` (live site, code) as buttons in the pop-up. Put images in `public/images/portfolio/`.
- **Projects and posts:** add an object to the array in the matching `src/content/*.ts` file. Bodies are lists of blocks (`p`, `h`, `list`, `quote`); see `src/content/types.ts`. Content is rendered as text, never as raw HTML.
- **Books:** add or move books in `src/content/books.ts`. Set `status` to `'reading'` (shown face-out and on the home page's currently.txt), `'read'` or `'want'`, and pick a spine `color`. `rating` and `note` are optional.
- **Wine posts (Gen Z With A Glass)** come in two kinds, both in `src/content/wine.ts`:
  - **Tasting notes** show as pixel bottles on a wine rack, colored by style. Only four fields are required:

    ```ts
    { wine: 'Domaine Example Poulsard', grape: 'Poulsard', vintage: 2022, date: '2026-10-20' },
    ```

    The title, link (`/wine/domaine-example-poulsard-2022`), tags and layout are made for you, and the style (red, white, rosé, orange, sparkling, dessert) is guessed from the grape and name. Optional extras fill in the tasting card and the post:
    - **Card basics:** `producer`, `region`, `price` (`'$'` to `'$$$$'`), `rating` (1–5 hearts), `buyAgain` (`'yes' | 'maybe' | 'no'`), `style`.
    - **Review:** `verdict` (a one-line review at the top of the card), `flavors` (tasting notes, e.g. `'red currant, rose petal'`).
    - **Profile meters:** `sweetness` (bone dry → sweet), `body` (light → full), `acidity` and `tannin` (low → high). Sweetness is guessed for reds, orange and dessert wines if left out.
    - **Pairings:** `pairedWith` (what you ate). Without it, the card shows "Try it with" suggestions from the grape or style, or your own `suggestedPairings`.
    - **The post:** `moment`, `look`, `nose`, `palate`, `finish`, `thoughts`. See `src/content/tastingNotes.ts`.
  - **Guides** show as pinned recipe cards and are written like any other post, with `kind: 'guide'`.
- **Links and italics** go inside a paragraph as a list of parts: `text: ['Read ', { text: 'this', href: 'https://…' }, ' and ', { text: 'that', em: true }]`. Only `http(s)` links become clickable.
- **Images** are `{ type: 'image', src: 'images/…/file.jpg', alt: '…' }`, with the file saved in `public/images/`. Images must live in this repo; the security policy blocks images from other sites.

### Education blog ↔ Substack

The education blog mirrors [arynlynn.substack.com](https://arynlynn.substack.com), and one command copies new posts over:

- `npm run sync:substack` downloads every free, public post into `src/content/education.substack.ts` and its images into `public/images/education/substack/`. Substack's HTML is converted into the typed blocks above (paragraphs with links and italics, headings, lists, quotes, images); subscribe boxes, buttons and embeds are dropped, and nothing is rendered as HTML.
- After publishing on Substack, run it, then commit and push the changes so the host redeploys:

  ```sh
  npm run sync:substack
  git add src/content/education.substack.ts public/images/education/substack
  git commit -m "Sync education posts from Substack" && git push
  ```

  It runs from your computer rather than on a schedule in GitHub Actions, because Substack refuses requests from GitHub's servers.
- Each synced post gets a "Read & subscribe on Substack" button and an "also on Substack" tag.
- Substack usually leaves image alt text empty, so synced images fall back to the caption or "Image from “Post title”". To polish a post, copy it from `education.substack.ts` into `src/content/education.ts` and edit it there: a hand-written post wins over a synced post with the same slug.
- Paid-only posts, podcasts and threads aren't synced.
- `npm run test:substack` checks the HTML conversion.


### Post tasting notes by text

Text a tasting note to the site's Twilio number and it shows up on Gen Z With A Glass. Only texts from your own number work.

```
wine: Domaine Example Poulsard, Poulsard, 2022
rating: 4
buy again: yes
flavors: red currant, rose petal
paired with: roast chicken
notes:
Anything after "notes:" becomes the post's extra notes.
```

- **Format:** only the first line (wine, grape, year or `NV`) is required. Text `wine help` for every label. Bad values are explained, never guessed.
- **Preview first:** you get a preview back, and nothing posts until you reply `YES`. `NO` discards it. Previews expire after an hour.
- **What happens on YES:** the note is added to `src/content/wine.texts.json` with a commit to `main`, Netlify redeploys, and the reply has the post's link. To edit or delete a texted post, edit that file.
- **Code:** `netlify/functions/sms.ts`, served at `/api/sms`. The flow lives in `netlify/lib/sms.ts`, and the parser in `src/content/textNote.ts`.

**Security**
- Every request must carry a valid Twilio signature.
- Texts from any other number get no reply.
- A spoofed sender never sees the preview, so it can't confirm a post.
- Limits: 60 texts and 10 posts a day.
- `SMS_PUBLISHING` is a kill switch.
- Texted content is stored as data and shown as plain text.

**Setup (one time)**
1. **Twilio:** create an account at twilio.com and buy a phone number with SMS (about $1.15/month plus about 1¢ per text). US numbers must be registered before they can reply: start **toll-free verification** (for a toll-free number) or **A2P 10DLC sole proprietor** (for a local number) in the Twilio console. It takes a few days. Until then, a trial account can still text your own verified number.
2. **Webhook:** in Twilio, open **Phone Numbers → your number → Messaging configuration**. Under "A message comes in", choose Webhook, enter `https://arynlynn.com/api/sms`, and pick **HTTP POST**.
3. **GitHub token:** on GitHub, go to **Settings → Developer settings → Fine-grained tokens → Generate new token**.
   - **Repository access:** only `aryndavis/personal-website`.
   - **Permissions:** Contents **Read and write**, and nothing else.
   - **Expiration:** set one, and put a reminder on your calendar to renew it.
4. **Netlify environment variables** (personal-website site → Site configuration → Environment variables). Mark the two secret ones **Contains secret values**, then redeploy.

   | Key | Value |
   | --- | --- |
   | `TWILIO_AUTH_TOKEN` | Twilio console → Account info → Auth token (**secret**) |
   | `SMS_ALLOWED_FROM` | your cell number, like `+15551234567` |
   | `SMS_WEBHOOK_URL` | `https://arynlynn.com/api/sms` (exactly what's in Twilio) |
   | `GITHUB_TOKEN` | the fine-grained token (**secret**) |
   | `SMS_PUBLISHING` | `on` (set to `off` to pause posting) |
   | `SMS_TIMEZONE` | optional, for post dates, e.g. `America/Chicago` (default `America/New_York`) |

5. **Test:** text `wine help` to the number.

## Design pieces

- `src/components/HoloBackground.tsx`: animated WebGL liquid-chrome background. It pauses when the tab is hidden, shows a still frame for reduced-motion users, and falls back to CSS gradients without WebGL.
- `src/components/PixelWindow.tsx`: the pixel window frame. On the home page, windows can be dragged by their title bars (desktop with a mouse), minimized, and closed.
- `src/components/PixelIcon.tsx`: pixel-art icons drawn from small character grids.
- Fonts (Pixelify Sans, VT323) are bundled from npm via Fontsource, so nothing loads from a third party.

## Deploy on Netlify

1. In Netlify, **Add new site → Import an existing project → GitHub** and pick this repo. `netlify.toml` already sets the build (`npm run build`, publish `dist`, Node 22), so leave the defaults.
2. **Domain:** `arynlynn.com` (registered at Porkbun) uses **Netlify DNS**: Porkbun's nameservers point to Netlify, and the records for `arynlynn.com`, `www`, `library` and `closet` live in Netlify. HTTPS is set up automatically.
3. Every push to `main` redeploys. Security headers come from `public/_headers`.

## Security

- The Content Security Policy only allows scripts, styles, fonts, and images from the site itself. No third-party scripts, no inline scripts, no framing, and forms are disabled. Assets are never inlined as `data:` URIs.
- `vite.config.ts` sends these headers from the dev and preview servers. `public/_headers` carries the same headers for hosts that support that file (Netlify, Cloudflare Pages). For other hosts, set equivalent headers in the host's settings. Keep the two files in sync.
- Serve production over HTTPS. Only add `includeSubDomains` or `preload` to HSTS if every subdomain is HTTPS-ready.
- Run `npm audit` periodically and keep `package-lock.json` committed.
