// The school note on the home page. Add assignments as you have them; until then the note says they're coming soon.
// Only http(s) links are shown.

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
  assignments: [] as { title: string; course?: string; href: string }[],
}
