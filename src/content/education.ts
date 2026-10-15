import type { Entry } from './types'

// Sample posts. Replace these with your own writing.
export const educationPosts: Entry[] = [
  {
    slug: 'a-classroom-is-a-place-to-get-lost',
    title: 'A classroom is a place to get wonderfully lost',
    date: '2026-09-18',
    summary: 'Designing inquiry that gives students a map, then lets them find their own way.',
    tags: ['inquiry', 'design'],
    body: [
      { type: 'p', text: 'This is a sample post. Write your opening here.' },
      { type: 'h', text: 'A subheading' },
      { type: 'p', text: 'Posts are made of simple blocks: paragraphs, subheadings, lists, and quotes. See src/content/types.ts.' },
      { type: 'list', items: ['First idea', 'Second idea', 'Third idea'] },
    ],
  },
  {
    slug: 'less-worksheet-more-world-building',
    title: 'Less worksheet, more world-building',
    date: '2026-07-02',
    summary: 'Turning a standards-heavy unit into a story students can step inside.',
    tags: ['unit design', 'engagement'],
    body: [
      { type: 'p', text: 'This is a sample post. Write your opening here.' },
      { type: 'quote', text: 'A pull quote looks like this.' },
    ],
  },
  {
    slug: 'feedback-that-travels',
    title: 'Feedback that travels',
    date: '2026-04-11',
    summary: 'Small changes that make feedback something students actually carry forward.',
    tags: ['assessment'],
    body: [{ type: 'p', text: 'This is a sample post. Write your opening here.' }],
  },
]
