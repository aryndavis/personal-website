import { projects } from './portfolio'
import { projectPath } from '../site'

// The school note on the home page. Add assignments as you have them; until then the note says they're coming soon.
// An assignment links to its portfolio case study (`project`, the project's slug) or to an outside page (`href`, http(s) only).

type Assignment = { title: string; course?: string } & ({ project: string } | { href: string })

export const school = {
  program: 'M.Ed. in Technology, Media, and Learning',
  school: 'Teachers College, Columbia University',
  expected: 'May 2028',
  courses: [
    'Instructional Design of Education Technology',
    'Ethics, Equity, and Social Justice in Educational Technologies',
    'Culture, Media, and Education',
  ],
  // Example: { title: 'Learning experience design brief', course: 'Instructional Design of Education Technology', href: 'https://…' },
  assignments: [
    { title: 'A critical analysis of Duolingo Chess', course: 'Instructional Design of Education Technology', project: 'duolingo-chess-analysis' },
  ] as Assignment[],
}

/** The assignments that have somewhere to go: a site path for case studies, a full URL for outside links. */
type AssignmentLink = { title: string; course?: string; path: string; external: boolean }

export const assignmentLinks = () =>
  school.assignments.flatMap((assignment): AssignmentLink[] => {
    if ('project' in assignment) {
      const project = projects.find((p) => p.slug === assignment.project)
      return project ? [{ title: assignment.title, course: assignment.course, path: projectPath(project), external: false }] : []
    }
    return /^https?:\/\//i.test(assignment.href) ? [{ title: assignment.title, course: assignment.course, path: assignment.href, external: true }] : []
  })
