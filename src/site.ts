// Site-wide details. Edit these first.
export const site = {
  name: 'Aryn Davis',
  shortName: 'ARYN DAVIS',
  roles: ['Curriculum designer', 'Educator', 'Wine nerd'],
  status: 'Open to curriculum projects for 2027',
  email: 'hello@example.com',
  substack: 'https://arynlynn.substack.com',
  year: new Date().getFullYear(),
}

export type SectionKey = 'portfolio' | 'education' | 'wine'

export const sections: Record<SectionKey, { path: string; label: string; file: string; blurb: string }> = {
  portfolio: {
    path: '/portfolio',
    label: 'Portfolio',
    file: 'portfolio.exe',
    blurb: 'Curriculum design work: units, courses, toolkits, and professional learning.',
  },
  education: {
    path: '/education',
    label: 'Education blog',
    file: 'edu_notes.txt',
    blurb: 'Notes on teaching, learning, and designing for real classrooms.',
  },
  wine: {
    path: '/wine',
    label: 'Wine blog',
    file: 'wine_cellar.dat',
    blurb: 'Tasting notes, regions, and bottles worth talking about.',
  },
}
