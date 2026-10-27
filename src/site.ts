// Site-wide details. Edit these first.
export const site = {
  name: 'Aryn Davis',
  /** Every page's address and preview card hang off this. */
  url: 'https://arynlynn.com',
  shortName: 'ARYN DAVIS',
  roles: ['Software engineer', 'Curriculum designer', 'Educator'],
  /** After the name in the home page's title (keep in step with index.html). */
  tagline: 'Software Engineer & Curriculum Designer',
  status: 'Open to curriculum projects',
  // Forwards to my personal inbox (email forwarding on the domain), so the real address stays private.
  email: 'hello@arynlynn.com',
  linkedin: 'https://www.linkedin.com/in/aryn-davis',
  instagram: 'https://www.instagram.com/aryn.creates',
  substack: 'https://arynlynn.substack.com',
  /** The full personal library app (its own repo: aryndavis/bookshelf). */
  library: 'https://library.arynlynn.com',
  year: new Date().getFullYear(),
}

/** The home page's search and link-preview text, and the card every page shares unless it has its own (index.html must match; a test checks). */
export const homePreview = {
  description:
    'Aryn Davis: software engineer and curriculum designer in New York City. Former Microsoft engineer, M.Ed. student at Teachers College, Columbia.',
  previewDescription: 'Software engineer and curriculum designer in New York City. Portfolio, an education blog, and a wine blog.',
  card: { src: '/images/social-card.png', alt: 'Aryn Davis: software engineer, curriculum designer, educator. arynlynn.com' },
}

/**
 * How Gen Z With A Glass links look when shared (and in search results). Its own voice: no day-job details.
 * The tagline is also drawn on the preview card, so after changing it run `npm run social-cards`.
 */
export const winePreview = {
  tagline: 'Grand cru taste, grad school budget',
  subtitle: 'Grapes and gossip from a young, aspiring sommelier in New York City.',
  /** Added after each wine post's own summary. */
  postSignoff: 'Grapes and gossip from Gen Z With A Glass.',
  image: '/images/social-card-wine.png',
  imageAlt: 'Gen Z With A Glass: grand cru taste, grad school budget. Grapes and gossip from a young, aspiring sommelier in New York City.',
}

export const bookshelf = {
  path: '/bookshelf',
  label: 'Bookshelf',
  file: 'bookshelf.db',
  blurb: 'What I’m reading now, what I’ve finished, and what’s up next. Pick any book to see my notes.',
}

export type SectionKey = 'portfolio' | 'education' | 'wine'

export const sections: Record<SectionKey, { path: string; label: string; file: string; blurb: string }> = {
  portfolio: {
    path: '/portfolio',
    label: 'Portfolio',
    file: 'portfolio.exe',
    blurb: 'Software I’ve built, plus the courses, clubs and classes I’ve designed and taught.',
  },
  education: {
    path: '/education',
    label: 'Education blog',
    file: 'edu_notes.txt',
    blurb: 'Notes on teaching, learning, and designing for real classrooms.',
  },
  wine: {
    path: '/wine',
    label: 'Gen Z With A Glass',
    file: 'wine_cellar.dat',
    blurb: 'Honest tasting notes and easy wine guides.',
  },
}
