import type { Project } from './types'

// Sample projects. Replace these with your own case studies.
export const projects: Project[] = [
  {
    slug: 'the-living-map',
    title: 'The Living Map',
    date: '2026-08-20',
    role: 'Lead curriculum designer',
    audience: 'Grade 8 humanities',
    format: '6-week unit',
    summary: 'A place-based humanities unit where students map the histories hiding in their own neighborhoods.',
    tags: ['unit design', 'inquiry', 'place-based'],
    body: [
      { type: 'h', text: 'The challenge' },
      { type: 'p', text: 'Describe the problem this project set out to solve: who the learners were, what was not working, and what success needed to look like.' },
      { type: 'h', text: 'My approach' },
      { type: 'list', items: ['Backward design from three enduring understandings', 'Weekly field investigations with a shared mapping protocol', 'Student-built exhibit as the summative task'] },
      { type: 'h', text: 'Outcomes' },
      { type: 'p', text: 'Share results, teacher feedback, or student work samples here.' },
    ],
  },
  {
    slug: 'small-worlds-big-questions',
    title: 'Small Worlds, Big Questions',
    date: '2026-05-02',
    role: 'Designer and facilitator',
    audience: 'Middle school teams',
    format: 'Inquiry toolkit',
    summary: 'A set of question protocols and planning templates for making complex ideas feel close.',
    tags: ['toolkit', 'inquiry', 'teacher tools'],
    body: [
      { type: 'h', text: 'The challenge' },
      { type: 'p', text: 'Teachers wanted inquiry that did not fall apart under time pressure.' },
      { type: 'h', text: 'What I built' },
      { type: 'list', items: ['Question formulation protocol', 'Unit planning one-pager', 'Exit ticket bank aligned to inquiry stages'] },
      { type: 'quote', text: 'Add a quote from a teacher or partner here.' },
    ],
  },
  {
    slug: 'make-room-for-wonder',
    title: 'Make Room for Wonder',
    date: '2025-11-10',
    role: 'Program designer',
    audience: 'K-12 instructional coaches',
    format: 'PD series, 4 sessions',
    summary: 'A professional learning series that helps creative teaching teams design for curiosity.',
    tags: ['professional learning', 'facilitation'],
    body: [
      { type: 'h', text: 'Overview' },
      { type: 'p', text: 'Summarize the series: goals, structure, and how participants applied it.' },
      { type: 'h', text: 'Session arc' },
      { type: 'list', items: ['Noticing', 'Questioning', 'Designing', 'Sharing'] },
    ],
  },
]
