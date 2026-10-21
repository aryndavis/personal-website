import type { ReactElement } from 'react'
import { CARD_ART, FLAVOR_ART } from './flavorIcons'

// Tiny pixel-art icons drawn from character grids.
// Each letter maps to a palette color; '.' is transparent.
const palette: Record<string, string> = {
  k: '#3b2346', // ink
  w: '#fff8ec', // cream
  p: '#ff8fcf', // pink
  d: '#d9468f', // deep pink
  y: '#ffd166', // yellow
  o: '#f2a541', // orange
  m: '#8be0c4', // mint
  b: '#8fb7ff', // blue
  l: '#c9a7ff', // lilac
  r: '#8c1c4a', // wine
  v: 'var(--glass, #8c1c4a)', // the wine's own color inside a tasting card (red, white, rosé…), wine red elsewhere
  // Extra colors for the tasting card's food and flavor icons (flavorIcons.ts).
  W: '#ffffff', // white
  e: '#e6dcf2', // white in shadow
  g: '#c8e07a', // light green
  G: '#8fb84a', // green
  L: '#5e9a2e', // dark green
  O: '#d9822b', // dark orange
  P: '#ffbf94', // peach
  R: '#f0567d', // berry pink
  c: '#e8364f', // red
  B: '#4f6bd8', // blueberry
  V: '#8a4bb0', // purple
  X: '#5a2a78', // dark purple
  Y: '#f7b500', // honey
  n: '#c27a3a', // tan
  N: '#8a4b1f', // brown
  D: '#5a3220', // dark brown
  s: '#c9c4d9', // silver
  S: '#8d86a3', // gray
}

const icons = {
  folder: [
    '.kkkk.......',
    'kyyyyk......',
    'kyyyyykkkkkk',
    'kooooooooook',
    'kyyyyyyyyyyk',
    'kyyyyyyyyyyk',
    'kyyyyyyyyyyk',
    'kyyyyyyyyyyk',
    'kkkkkkkkkkkk',
  ],
  notebook: [
    'kkkkkkkkkk..',
    'kwwwwwwwwkk.',
    'kwkkkkkkwk.k',
    'kwwwwwwwwk.k',
    'kwkkkkkwwk.k',
    'kwwwwwwwwk.k',
    'kwkkkkkkwk.k',
    'kwwwwwwwwk.k',
    'kwwwwwwwwkk.',
    'kkkkkkkkkk..',
  ],
  glass: [
    'kkkkkkkkk',
    'kwwwwwwwk',
    'kvvvvvvvk',
    'kvvvvvvvk',
    '.kvvvvvk.',
    '..kkkkk..',
    '....k....',
    '....k....',
    '....k....',
    '..kkkkk..',
  ],
  mail: [
    'kkkkkkkkkkk',
    'kkwwwwwwwkk',
    'kwkwwwwwkwk',
    'kwwkwwwkwwk',
    'kwwwkpkwwwk',
    'kwwwwkwwwwk',
    'kwwwwwwwwwk',
    'kkkkkkkkkkk',
  ],
  heart: [
    '.kk...kk.',
    'kppk.kppk',
    'kpwppppdk',
    'kppppppdk',
    '.kppppdk.',
    '..kppdk..',
    '...kdk...',
    '....k....',
  ],
  star: [
    '....k....',
    '...kyk...',
    '...kyk...',
    'kkkyyykkk',
    '.kyywyyk.',
    '..kyyyk..',
    '.kyykyyk.',
    'kyk...kyk',
    'kk.....kk',
  ],
  smile: [
    '..kkkkk..',
    '.kpppppk.',
    'kppkpkppk',
    'kppkpkppk',
    'kpppppppk',
    'kpkpppkpk',
    'kppkkkppk',
    '.kpppppk.',
    '..kkkkk..',
  ],
  floppy: [
    'kkkkkkkkkk.',
    'kbbwwwwbbkk',
    'kbbwwwwbbbk',
    'kbbbbbbbbbk',
    'kbwwwwwwwbk',
    'kbwkkkkkwbk',
    'kbwwwwwwwbk',
    'kkkkkkkkkkk',
  ],
  books: [
    'kkkk.......',
    'kppkkkkk...',
    'kwpkyyyk...',
    'kppkyyykkkk',
    'kppkwwwkmmk',
    'kppkyyykmmk',
    'kwpkyyykwmk',
    'kppkyyykmmk',
    'kppkwwwkmmk',
    'kppkyyykmmk',
    'kkkkkkkkkkk',
  ],
  ...CARD_ART,
  ...FLAVOR_ART,
} satisfies Record<string, string[]>

export type IconName = keyof typeof icons

export default function PixelIcon({ name, size = 32, className }: { name: IconName; size?: number; className?: string }) {
  const rows = icons[name]
  const width = Math.max(...rows.map((row) => row.length))
  const rects: ReactElement[] = []
  rows.forEach((row, y) =>
    [...row].forEach((char, x) => {
      if (char !== '.') rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={palette[char]} />)
    }),
  )
  return (
    <svg
      className={`pixel-icon ${className ?? ''}`}
      viewBox={`0 0 ${width} ${rows.length}`}
      width={size}
      height={(size * rows.length) / width}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {rects}
    </svg>
  )
}
