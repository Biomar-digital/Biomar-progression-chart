export const TRACKS = [
  {
    id: 'climate',
    label: 'Climate Action',
    color: '#7DC242',
    trackIndex: 0,  // outermost
    strokeWidth: 42,
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
    trackIndex: 1,  // middle
    strokeWidth: 42,
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
    trackIndex: 2,  // innermost
    strokeWidth: 42,
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
export const VB_W = 1200
export const VB_H = 700

// Track geometry
// The U-turn is on the RIGHT. Each track is a horseshoe opening to the LEFT.
// Path direction: START (top-left) → right along top arm → CW semicircle on right → left along bottom arm → GOAL (bottom-left)
// Tracks are concentric; outer track has the biggest radius.
// RIGHT_CY is placed in the upper portion so tracks span the full chart height diagonally (S-shape).
export const RIGHT_CX = 940   // U-turn center X — pulled left to give label room on the right
export const RIGHT_CY = 355   // U-turn center Y — slightly below mid so top arms clear the title
export const TRACK_LX = 230   // left end of arms (gives left-arc clearance from viewBox edge)
export const R_BASE = 180     // radius for track 0 (outermost / climate)
export const GAP = 55         // gap between tracks

export function getTrackPath(trackIndex) {
  const r = R_BASE - trackIndex * GAP
  const cx = RIGHT_CX, cy = RIGHT_CY, lx = TRACK_LX
  return [
    `M ${lx} ${cy - r}`,                         // START: top-left
    `L ${cx} ${cy - r}`,                          // top arm → right
    `A ${r} ${r} 0 0 1 ${cx} ${cy + r}`,         // CW semicircle on right
    `L ${lx} ${cy + r}`,                          // bottom arm → left (GOAL)
  ].join(' ')
}

export function getGhostPath(trackIndex) {
  return getTrackPath(trackIndex)
}

// Left-side connector swooshes: CCW semicircles on the LEFT connecting
// the bottom arm of one track to the top arm of the next inner track.
// These create the snake/S visual on the left side of the chart.
export function getLeftConnectorPath(outerTrackIndex, innerTrackIndex) {
  const rOuter = R_BASE - outerTrackIndex * GAP
  const rInner = R_BASE - innerTrackIndex * GAP
  const bottomY = RIGHT_CY + rOuter   // bottom arm of outer track
  const topY    = RIGHT_CY - rInner   // top arm of inner track
  const radius  = (bottomY - topY) / 2
  const lx = TRACK_LX
  // CCW arc (sweep=0) curves to the LEFT
  return `M ${lx} ${bottomY} A ${radius} ${radius} 0 0 0 ${lx} ${topY}`
}

// Returns all left-side connector paths (one per adjacent track pair)
export function getLeftConnectorPaths() {
  return [
    getLeftConnectorPath(0, 1),  // track 0 bottom → track 1 top
    getLeftConnectorPath(1, 2),  // track 1 bottom → track 2 top
  ]
}

// 2030 goal sits at the bottom-left end of each track
export function getGoalPosition(trackIndex) {
  const r = R_BASE - trackIndex * GAP
  return { x: TRACK_LX, y: RIGHT_CY + r }
}
