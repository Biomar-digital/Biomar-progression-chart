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
// Each track is a simple horizontal bar (pill shape).
// Progress fills LEFT → RIGHT; goal is at the right end.
export const TRACK_LEFT = 310   // left edge of all bars
export const TRACK_RX = 1050   // right edge (2030 goal) of all bars

// Y-center for each track (top to bottom: climate, circular, people)
const TRACK_Y = [265, 400, 535]

// Build a straight horizontal path for a track.
// Direction: START (left) → right → GOAL (right end)
export function getTrackPath(trackIndex) {
  const y = TRACK_Y[trackIndex]
  return `M ${TRACK_LEFT} ${y} L ${TRACK_RX} ${y}`
}

export function getGhostPath(trackIndex) {
  return getTrackPath(trackIndex)
}

// 2030 goal sits at the RIGHT end of the bar
export function getGoalPosition(trackIndex) {
  return { x: TRACK_RX, y: TRACK_Y[trackIndex] }
}
