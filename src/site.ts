// Site-wide details. Edit these first.
export const site = {
  name: 'Aryn Davis',
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
  year: new Date().getFullYear(),
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
