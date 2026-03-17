export const TRACKS = [
  {
    id: 'climate',
    label: 'Climate Action',
    color: '#7DC242',
    trackOffset: 0,     // outer track
    strokeWidth: 38,
    history: {
      2022: -5.5,
      2023: -11.9,
      2025: -32.1,
    },
    target2030: -33,
    targetLabel: '-33% by 2030',
    formatValue: (v) => `${v}%`,
    getProgress: (v) => Math.min(Math.abs(v) / 33, 1),
  },
  {
    id: 'circular',
    label: 'Circular & Restorative',
    color: '#1A3A8C',
    trackOffset: 1,     // middle track
    strokeWidth: 38,
    history: {
      2021: 23,
      2022: 23,
      2023: 29,
      2024: 27.4,
      2025: 27.5,
    },
    target2030: 50,
    targetLabel: '50% by 2030',
    formatValue: (v) => `${v}%`,
    getProgress: (v) => Math.min(v / 50, 1),
  },
  {
    id: 'people',
    label: 'Enable People',
    color: '#E84713',
    trackOffset: 2,     // inner track
    strokeWidth: 38,
    history: {
      2021: 42300,
      2022: 44200,
      2023: 45009,
      2024: 49096,
      2025: 40855,
    },
    target2030: 100000,
    targetLabel: '100,000 by 2030',
    formatValue: (v) => v.toLocaleString('en-US'),
    getProgress: (v) => Math.min(v / 100000, 1),
  },
]

export const YEARS = [2022, 2023, 2024, 2025]

// SVG viewBox dimensions
export const VB_W = 1140
export const VB_H = 680

// Track path geometry — horizontal U-shape / horseshoe, open on the right
// Left U-turn only. Tracks are concentric, perfectly horizontal arms.
// Path: bottom-right → left along bottom → U-turn left (CCW) → right along top → top-right (= 2030 goal)
export const GAP = 50
export const LEFT_CX = 200   // U-turn center x
export const LEFT_CY = 360   // U-turn center y
export const TRACK_RX = 920  // right-side x where tracks enter/exit
export const R_BASE = 150    // outer track radius (track 0)

// Progress path: open U-shape, starts bottom-right, ends top-right (= 2030 goal)
export function getTrackPath(trackIndex) {
  const r = R_BASE - trackIndex * GAP
  const lx = LEFT_CX, ly = LEFT_CY
  const rx = TRACK_RX
  return [
    `M ${rx} ${ly + r}`,                           // START: bottom-right
    `L ${lx} ${ly + r}`,                           // bottom arm going left (horizontal)
    `A ${r} ${r} 0 0 0 ${lx} ${ly - r}`,          // U-turn left (CCW, curves west)
    `L ${rx} ${ly - r}`,                           // top arm going right (horizontal) → GOAL
  ].join(' ')
}

// Ghost: same open U-shape
export function getGhostPath(trackIndex) {
  return getTrackPath(trackIndex)
}

// Goal position (top-right end of each track)
export function getGoalPosition(trackIndex) {
  const r = R_BASE - trackIndex * GAP
  return { x: TRACK_RX, y: LEFT_CY - r }
}

// Icon SVG paths (simplified)
export const ICONS = {
  climate: `M 12 2 C 8.13 2 5 5.13 5 9 c 0 5.25 7 13 7 13 s 7 -7.75 7 -13 c 0 -3.87 -3.13 -7 -7 -7 z m 0 9.5 c -1.38 0 -2.5 -1.12 -2.5 -2.5 s 1.12 -2.5 2.5 -2.5 2.5 1.12 2.5 2.5 -1.12 2.5 -2.5 2.5 z`,
  circular: `M 12 4 V 1 L 8 5 l 4 4 V 6 c 3.31 0 6 2.69 6 6 0 1.01 -0.27 1.97 -0.71 2.8 l 1.46 1.46 C 19.54 15.03 20 13.57 20 12 c 0 -4.42 -3.58 -8 -8 -8 z m 0 14 c -3.31 0 -6 -2.69 -6 -6 0 -1.01 0.27 -1.97 0.71 -2.8 L 5.25 7.74 C 4.46 8.97 4 10.43 4 12 c 0 4.42 3.58 8 8 8 v 3 l 4 -4 -4 -4 v 3 z`,
  people: `M 16 11 c 1.66 0 2.99 -1.34 2.99 -3 S 17.66 5 16 5 c -1.66 0 -3 1.34 -3 3 s 1.34 3 3 3 z m -8 0 c 1.66 0 2.99 -1.34 2.99 -3 S 9.66 5 8 5 C 6.34 5 5 6.34 5 8 s 1.34 3 3 3 z m 0 2 c -2.33 0 -7 1.17 -7 3.5 V 19 h 14 v -2.5 c 0 -2.33 -4.67 -3.5 -7 -3.5 z m 8 0 c -0.29 0 -0.62 0.02 -0.97 0.05 1.16 0.84 1.97 1.97 1.97 3.45 V 19 h 6 v -2.5 c 0 -2.33 -4.67 -3.5 -7 -3.5 z`,
}
