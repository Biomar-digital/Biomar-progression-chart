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
// The U-turn is on the LEFT. Path goes:
//   START (bottom-right) → left along bottom arm → CCW semicircle → right along top arm → GOAL (top-right)
// Tracks are concentric with the same center; outer track has the biggest radius.
export const LEFT_CX = 240    // U-turn center X
export const LEFT_CY = 390    // U-turn center Y (slightly below chart mid)
export const TRACK_RX = 1050  // right-side X where arms terminate
export const R_BASE = 175     // radius for track 0 (outermost / climate)
export const GAP = 60         // gap between tracks

// Build the open-horseshoe path for a track.
// Direction: START bottom-right → bottom arm left → U-turn CCW → top arm right → GOAL top-right
export function getTrackPath(trackIndex) {
  const r = R_BASE - trackIndex * GAP
  const lx = LEFT_CX
  const ly = LEFT_CY
  const rx = TRACK_RX
  return [
    `M ${rx} ${ly + r}`,
    `L ${lx} ${ly + r}`,
    `A ${r} ${r} 0 0 0 ${lx} ${ly - r}`,
    `L ${rx} ${ly - r}`,
  ].join(' ')
}

export function getGhostPath(trackIndex) {
  return getTrackPath(trackIndex)
}

// 2030 goal sits at the TOP-RIGHT end of the track (end of the top arm)
export function getGoalPosition(trackIndex) {
  const r = R_BASE - trackIndex * GAP
  return { x: TRACK_RX, y: LEFT_CY - r }
}
