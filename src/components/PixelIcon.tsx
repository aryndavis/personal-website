import type { ReactElement } from 'react'

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
    'krrrrrrrk',
    'krrrrrrrk',
    '.krrrrrk.',
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
  grapes: [
    '....kk...',
    '...km....',
    '.kkkkkkk.',
    'klllklllk',
    'kllklllk.',
    '.klllllk.',
    '..klllk..',
    '...klk...',
    '....k....',
  ],
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
