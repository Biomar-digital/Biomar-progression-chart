import { useRef, useLayoutEffect, useState, useEffect } from 'react'
import { TRACKS, YEARS, VB_W, VB_H, RIGHT_CX, RIGHT_CY, TRACK_LX, GOAL_LX, R_BASE, getTrackPath, getGhostPath, getGoalPosition } from '../data'
import './ProgressChart.css'

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

// Format an animated (in-between) numeric value the same way as the track's
// formatValue, but with appropriate rounding so it doesn't show 8 decimals.
function formatAnimValue(track, v) {
  if (track.id === 'people') return Math.round(v).toLocaleString('en-US')
  // % tracks — preserve up to 1 decimal
  const r = Math.round(v * 10) / 10
  return `${r}%`
}

// Returns a unit normal pointing OUTWARD (exterior of horseshoe) at the given SVG point.
// On the right arc: radially away from the arc centre.
// On the straight arms: perpendicular to the arm, away from the interior.
function getOutwardNormal(pt) {
  if (pt.x > RIGHT_CX - 50) {
    const dx = pt.x - RIGHT_CX
    const dy = pt.y - RIGHT_CY
    const dist = Math.sqrt(dx * dx + dy * dy) || 1
    return { nx: dx / dist, ny: dy / dist }
  }
  // Top arm (y < RIGHT_CY) → exterior is upward; bottom arm → downward
  return { nx: 0, ny: pt.y < RIGHT_CY ? -1 : 1 }
}

// Build a smooth tapered filled polygon along a SVG path.
// Starts as a sharp point, grows to full halfWidth at the progress tip.
function buildSwooshPath(pathEl, markerLen, halfWidth) {
  if (!pathEl || markerLen < 2 || halfWidth < 1) return null

  const N = 60
  const pts = []
  for (let i = 0; i <= N; i++) {
    pts.push(pathEl.getPointAtLength((i / N) * markerLen))
  }

  const top = []
  const bot = []

  const minW = 6  // rounded start cap radius

  for (let i = 0; i <= N; i++) {
    const a = pts[Math.max(0, i - 1)]
    const b = pts[Math.min(N, i + 1)]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    // Left-hand normal → always points to outer side of horseshoe
    const nx = -dy / len
    const ny = dx / len

    // Taper: starts at minW, grows to full halfWidth at tip
    const t = i / N
    const w = minW + (halfWidth - minW) * Math.pow(t, 1.2)

    top.push([pts[i].x + nx * w, pts[i].y + ny * w])
    bot.push([pts[i].x - nx * w, pts[i].y - ny * w])
  }

  const r = halfWidth.toFixed(2)
  const rStart = minW.toFixed(2)
  const parts = [`M ${top[0][0].toFixed(2)} ${top[0][1].toFixed(2)}`]
  for (let i = 1; i <= N; i++) parts.push(`L ${top[i][0].toFixed(2)} ${top[i][1].toFixed(2)}`)
  // Rounded cap at tip (full width)
  parts.push(`A ${r} ${r} 0 0 0 ${bot[N][0].toFixed(2)} ${bot[N][1].toFixed(2)}`)
  for (let i = N - 1; i >= 0; i--) parts.push(`L ${bot[i][0].toFixed(2)} ${bot[i][1].toFixed(2)}`)
  // Rounded cap at start (minW radius)
  parts.push(`A ${rStart} ${rStart} 0 0 0 ${top[0][0].toFixed(2)} ${top[0][1].toFixed(2)}`)
  parts.push('Z')

  return parts.join(' ')
}

// ── Icons — exact paths from SVG files, original colours ─────────────────────

function ClimateIcon({ x, y, size = 44 }) {
  const vbW = 109.87, vbH = 142.97
  const scale = size / Math.max(vbW, vbH)
  const ox = x - (vbW * scale) / 2
  const oy = y - (vbH * scale) / 2
  const p = { fill: 'none', stroke: '#a2cb67', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', vectorEffect: 'non-scaling-stroke' }
  return (
    <g transform={`translate(${ox},${oy}) scale(${scale})`}>
      <path {...p} d="M29.83,15.69c2.07-1.5,7.08-6.38,4.26-8.82-.96-.45-2.23.85-1.83,2.4,2.38,5.92,13.24,2.8,14.21-2.72.62-2.72-2-4.61-3.63-2.38-1.51,2.25.33,5.3,2.61,6.29,4.28,2.06,10.71-.04,12.84-4.11.79-1.44.98-3.54-.22-4.73-1.72-1.61-4.21.08-4.71,2.22-.57,1.88-.06,4.11,1.09,5.74,3.8,5.55,12.52,4.25,16.46-.74,1.54-1.83,2.59-5.15.36-6.76-1.46-1.02-3.88-.26-5.26,1.41-2.88,3.6-1.85,9.14,1.06,13.06,3.2,4.02,8.98,6.23,13.98,4.63,5.49-1.53,11.17-9.43,6.52-14.26-6.96-5.3-13.79,3.87-14.03,10.61-.29,3.7.62,6.6-.01,10.24-2.15,13.15-17.32,16.64-28.11,20.2-14.75,4.83-24.92,12.89-33.87,25.55-3.48,4.59-8.27,12.09-4.32,17.42,3.39,4.34,10.41,2.94,14.62.08,8.38-5.12,8.77-13.93,8.6-22.93.36-7.99.25-16.99,7.3-21.41,7.94-5.43,19.08-6.42,26.43-12.52,7.22-7.55,2.86-16.32-6.82-18.44-13.48-4.1-30.4.06-35.19,14.87-1.68,4.59-1.48,9.46-1.83,14.23-.36,5-2.13,10.11-4.77,14.42-4.96,8.05-12.96,14.95-14.44,24.71-2.28,20.62,29.35,17.89,29.15-5.46" />
      <path {...p} d="M100.77,94.47c1.17-2.73,3.43-7.49,6.94-6.78,1.28.61.46,2.29-.68,2.58-.98.34-2.11.02-2.94-.6-3.79-2.61-3.78-11.74,1.19-13.78,2.5-1.11,4.71,1.08,2.96,3.08-1.87,1.99-5.29.94-6.85-1.04-3.1-3.64-2.76-10.38.65-13.43,1.2-1.11,3.2-1.79,4.62-.89.88.55,1.26,1.65.94,2.75-.91,2.97-4.99,3.86-7.72,2.83-6.4-2.12-7.61-10.87-3.86-16.02,1.35-1.99,4.28-3.88,6.45-2.17,1.4,1.13,1.34,3.66.11,5.44-2.72,3.8-8.49,4.27-13.11,2.44-4.73-2.06-8.43-7.04-8.18-12.3.07-5.67,6.14-13.06,11.99-9.92,7.07,5.31.15,14.26-6.34,16.36-3.55,1.3-6.68,1.21-10.07,2.86-11.94,5.71-11.09,21.13-11.51,32.41-.58,15.61-5.46,27.35-15.25,39.48-3.48,4.62-9.42,11.22-15.65,8.88-5.12-2.06-5.75-9.18-4.14-14.03,3.02-10.55,12.46-12.32,21.8-15.08,9.17-2.96,16.3-5.88,17.63-15.87,1.74-8.05.44-17.61,3.84-25.08,2.15-4.23,7.49-7.15,12.21-5.44,6.58,2.61,9.84,10.57,11.98,16.9,3.59,11.14-.61,24.15-11.66,29.62-3.37,1.81-7.02,2.66-10.56,3.97-4.74,1.7-9.18,4.78-12.62,8.49-6.45,6.99-10.93,16.67-20.05,20.65-19.12,7.48-25.27-23.43-2.63-29.56" />
    </g>
  )
}

function CircularIcon({ x, y, size = 44 }) {
  const vbW = 176.66, vbH = 182.46
  const scale = size / Math.max(vbW, vbH)
  const ox = x - (vbW * scale) / 2
  const oy = y - (vbH * scale) / 2
  const base = { fill: 'none', stroke: '#253f72', strokeWidth: '2', strokeLinecap: 'round', vectorEffect: 'non-scaling-stroke' }
  return (
    <g transform={`translate(${ox},${oy}) scale(${scale})`}>
      <path {...base} strokeLinejoin="round" d="M79.97,1c3.85,2.1,7.71,4.2,11.56,6.29-3.8,2.37-7.61,4.73-11.41,7.1" />
      <path {...base} strokeMiterlimit="10" d="M14.61,45.62c-7.13,13.24-11.2,32.41-7.3,50.29,1.16,7.96,4.14,16.5,11.09,21.18,14.79,10.07,25.79-7.16,37.54-13.81,9.14-6.08,18.68-1.96,28.73-1.87,4.23.15,8.31.03,12.57.07,4.19-.21,7.25,2.39,5.47,6.58-2.59,5.02-17.35.53-22.78,3.96-1.01.49-1.42.99-1.41,1.44.01.94,2.05,1.56,2.82,1.79,13.1,3.98,26.99-5.24,26.99-5.24,11.85-7.86,14.46-17.79,21.7-17.01.56.06,3.15.4,3.91,2.09.77,1.68-.52,4.15-6.98,11.05-6.54,6.98-10.43,10.31-16.52,15.21-3.85,3.1-7.16,5.61-11.94,6.84-13.27,3.82-26.34-2.66-38.29,3.94-4.71,2.6-6.16,9.41-5.53,14.22,1.81,13.86,25.76,20.81,39.5,22.19,4.9.49,22.33,1.67,39.76-8.67,0,0,23.03-13.86,31.56-43.04.29-1,.47-1.67.54-1.93.59-2,1.07-4.08,1.63-5.97.42-1.47.82-2.31.96-1.83.34,1.15-.16,3.43-.43,5.33-5.4,34.62-40.61,68.64-80,69.04-32.41.33-63.23-18.76-78.37-49.79" />
      <path {...base} strokeMiterlimit="10" d="M7.73,125.52C-16.32,65.17,27.24,6.24,88.51,7.27" />
      <path {...base} strokeMiterlimit="10" d="M95.83,7.57c49.81,7.7,76.26,50.44,73.17,91.61" />
      <path {...base} strokeLinejoin="round" d="M91.05,101.06c10.87-10.95-1.59-20.71.53-33.09,1.71-9.66,9.83-17.22,18.6-20.73,5.01-2,9.91-2.74,14.87-4.75,7.3-3,9.09-.52,8.3,6.99-1.02,12.15-5.87,24.65-16.9,31.45-3.1,1.97-11.85,6.04-14.87,4.23-1.5-2.09,2.89-7.68,4.81-11.12,2.45-3.86,5.1-7.51,7.98-11.12,2.69-3.44,5.76-7,5.9-8.1.07-.91-1.19-.37-2.88.52-10.62,5.62-20.4,20.87-23.99,30.09-1.43,2.55-3.44,11.77-6.75,10.83-1.03-.48-1.74-2.54-1.98-4.95-.36-4.58.14-9.56-1.86-13.94-3.04-7.76-10.21-11.78-17.55-14.21-3-.74-12.21-5.23-13.96-2.07-1.25,4.81,1.26,12.68,6.24,20.02,3.67,5.61,13.36,12.3,19.21,11.23.12-.04.29-.12.42-.27.64-.75.09-2.84-4.76-9.39-2.08-2.8-5.08-6.61-9.1-10.95,2.79.97,6.61,2.67,10.5,5.71,6.26,4.9,9.43,10.7,10.89,13.95" />
      <path {...base} strokeLinejoin="round" d="M175.66,89.26c-2.21,3.79-4.42,7.58-6.64,11.37-2.25-3.87-4.5-7.75-6.75-11.62" />
      <path {...base} strokeLinejoin="round" d="M9.29,143.78c-.1-4.39-.21-8.77-.31-13.16,3.95,2.12,7.9,4.23,11.85,6.35" />
    </g>
  )
}

function PeopleIcon({ x, y, size = 44 }) {
  const vbW = 196.08, vbH = 132.3
  const scale = size / Math.max(vbW, vbH)
  const ox = x - (vbW * scale) / 2
  const oy = y - (vbH * scale) / 2
  const p = { fill: 'none', stroke: '#ea7131', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', vectorEffect: 'non-scaling-stroke' }
  return (
    <g transform={`translate(${ox},${oy}) scale(${scale})`}>
      <path {...p} d="M2.67,111.44c-6.27-13.41,6.1-34.71,20.93-40.74,6.55-3.1,14.06-3.27,20.17-7.42,10.05-6.93,16.66-18.95,13.11-31.25-2.73-9.8-14.18-15.42-23.68-11.39-15.01,5.77-13.61,25.91-4.5,36.25,5.75,6.76,14.94,8.91,22.78,12.55,16.35,6.17,22.16,11.68,24.8,29.33,1.19,7.26,2.78-.31,6.07-2.88,3.18-2.91,7.67-4.33,11.28-6.8,6.68-3.97,6.33-10.88,8.45-17.45,2.12-6.32,7.23-7.69,12.53-3.69" />
      <path {...p} d="M95.17,66.78c-7.58-9.39-13.93,8.79-15.36-.65-.64-5.71-1.99-11.69,1.26-16.35.6-.8,1.5-1.62,2.5-1.38,1.1.24,1.85,1.75,1.61,3.04-.33,2.03-2.15,2.98-3.82,3.84-2.56,1.29-5.9,2.61-8.23,3.66-4.9,2.09-9.88,5.11-14.81,7.02" />
      <path {...p} d="M29.06,84.52c8.36,10.09,20.88,22.02,38.5,30.47,3.33,1.58,7.02,3.24,10.34,4.64,32.58,14.62,39.71-12.93,72.96,1.22,5.42,2.35,11.14,6.73,14.08,9.74.23.21.38.32.44.34.04.01.05-.02.02-.08-.64-1.6-11.08-11.72-24.5-15.64-3.75-1.62-13.54-1.15-12.33-7.06.67-2.78,2.37-5.39,3.47-8.03,3.54-8.81,11.02-17.68,9.18-27.6-3.17-13.99-26.36-11.04-28.97-27.73-1.06-5.17,1.41-10.04,3.77-14.37.89-1.66,1.77-4.28,1.66-6.04-.02-2.97-2.55-1.46-3.93-.34" />
      <path {...p} d="M81,23.05c-1.06-.59-2.16-1.28-2.91-.13-1.69,5.64,4.38,10.65,5.9,15.8,1.93,4.73,4.98,9.64,9.9,11.65,5.94,2.55,12.72-1.53,15-7.2" />
      <path {...p} d="M73.68,27.04c-3.56-.37-9.88-1.25-10.1-3.26-.08-.77.76-1.87,5.91-4.23,13.7-6.27,32.44-7.09,46.92-1.8,1.39.51,13.16,4.4,12.73,7.22-.24,1.57-4.14,2.29-7.46,2.65" />
      <path {...p} d="M79.62,14.73c1.26-4.93,3.11-12.59,8.92-13.43,3.1-.36,7.65.4,11.18,0,3.73-.28,6.69-.78,8.54.8,3.41,3.28,4.13,8.63,5.06,13.06" />
      <path {...p} d="M165.73,130.28c1.2-4.06,2.4-8.11,3.6-12.17,6-10.87,11.99-21.74,17.99-32.6,2.15-3.51,5.43-4.67,6.74-3.83,1.27.82,1.57,4.1-.4,7.4-5.7,10.47-11.4,20.95-17.1,31.42-3.73,3.6-7.46,7.2-11.19,10.81-1.77-3.48-5.39-9.32-12.12-13.76-14.64-9.66-31.26-4.33-33.62-3.53,6.08-11.9,12.16-23.8,18.24-35.69.54-.99,2.17-3.65,5.42-4.96,2.94-1.18,5.78-.53,7.57-.12,4.23.96,7.18,3.25,8.81,4.79,1.67-.78,5.33-2.19,10.02-1.69,6.88.74,11.08,5.11,12.16,6.3,1.24-1.81,2.52-4.33,1.7-6.52-.58-1.54-1.51-2.7-5.18-4.14-2.99-1.17-5.81-2.79-7.23-5.75-2.16-3.67-.67-7.23,1.31-10.78,1.95-4.05,3.86-8.77,2.56-13.27-.86-2.96-3.41-5.44-5.99-6.57-10.37-4.57-21.69,12.57-35.55,9.2-3.86-.94-6.67-3.16-8.42-4.87" />
      <path {...p} d="M155.17,61.77c-6.93-2.21-12.89-10.03-12.94-17.76-.41-8.07,2.3-16.75,9.29-21.33,7.93-5.02,18.49-2.51,24.02,4.8,5.98,7.26,4.66,19.42.74,26.43" />
      <path {...p} d="M187.6,85.68c2.03,1.04,4.05,2.09,6.08,3.13" />
      <path {...p} d="M169.38,118.37c.67-.01,2.15.05,3.71.94,1.26.72,2,1.65,2.37,2.19" />
      <path {...p} d="M148.01,109.07c-2-7.15,13.94-17.99,12.9-24.41-1.04-2.95-4.71-.72-5.66,1.3-3.4,6.11.54,14.92-3.31,21.33-.76,1.29-2.57,3.21-3.87,1.86l-.06-.08Z" />
      <path {...p} d="M9.13,24.11c1.26,3.17,3.44,7.03,7.33,8.58,4.59,1.83,7.67-1.08,14.66-1.79,1.15-.12,16.06-1.44,21.46,6.97,4.19,6.53.42,15.42-.36,17.17" />
    </g>
  )
}

function TrackIcon({ track, x, y, size = 44 }) {
  if (track.id === 'climate') return <ClimateIcon x={x} y={y} size={size} />
  if (track.id === 'circular') return <CircularIcon x={x} y={y} size={size} />
  return <PeopleIcon x={x} y={y} size={size} />
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getValueForYear(track, year) {
  for (let y = year; y >= YEARS[0]; y--) {
    if (track.history[y] !== undefined) return { value: track.history[y], year: y }
  }
  return null
}

// ── Chart ────────────────────────────────────────────────────────────────────

export default function ProgressChart({ selectedYear }) {
  const pathRefs = useRef([])
  const [pathLengths, setPathLengths] = useState([0, 0, 0])
  const [animProgresses, setAnimProgresses] = useState([0, 0, 0])
  const [animValues, setAnimValues] = useState(TRACKS.map((t) => t.history[2025] ?? 0))
  const [hoveredMilestone, setHoveredMilestone] = useState(null) // { trackIdx, year }
  const animRef = useRef(null)
  const prevProgressRef = useRef([0, 0, 0])
  const prevValuesRef = useRef(TRACKS.map((t) => t.history[2025] ?? 0))

  useLayoutEffect(() => {
    const lengths = pathRefs.current.map((p) => (p ? p.getTotalLength() : 0))
    setPathLengths(lengths)
  }, [])

  useEffect(() => {
    const targets = TRACKS.map((track) => {
      const entry = getValueForYear(track, selectedYear)
      return entry ? track.getProgress(entry.value) : 0
    })
    const targetValues = TRACKS.map((track) => {
      const entry = getValueForYear(track, selectedYear)
      return entry ? entry.value : prevValuesRef.current[TRACKS.indexOf(track)]
    })

    const from       = [...prevProgressRef.current]
    const fromValues = [...prevValuesRef.current]
    const startTime  = performance.now()
    const duration   = 700

    const animate = (time) => {
      const t    = Math.min((time - startTime) / duration, 1)
      const ease = easeInOut(t)
      const current       = from.map((f, i) => f + (targets[i] - f) * ease)
      const currentValues = fromValues.map((f, i) => f + (targetValues[i] - f) * ease)
      setAnimProgresses(current)
      setAnimValues(currentValues)
      if (t < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        prevProgressRef.current = targets
        prevValuesRef.current   = targetValues
      }
    }

    if (animRef.current) cancelAnimationFrame(animRef.current)
    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [selectedYear])

  const trackPaths = TRACKS.map((_, i) => getTrackPath(i))

  return (
    <svg
      className="progress-chart"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="msShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.15)" />
        </filter>
      </defs>

      {/* Background */}
      <rect width={VB_W} height={VB_H} fill="#c3e4ef" rx="12" />

      {/* Title */}
      <text x={VB_W / 2} y={68} textAnchor="middle" className="chart-title-year">{selectedYear}</text>
      <text x={VB_W / 2} y={108} textAnchor="middle" className="chart-title-text">Progress Towards 2030</text>

      {/* Ghost (background) tracks */}
      {TRACKS.map((track, i) => (
        <path
          key={`bg-${i}`}
          d={getGhostPath(i)}
          className="track-bg"
          strokeWidth={track.strokeWidth}
        />
      ))}

      {/* Left-side connector swooshes removed — the rounded stroke endcaps
          of the ghost tracks provide the concentric-arc appearance naturally */}

      {/* Invisible ref paths for length measurement */}
      {trackPaths.map((d, i) => (
        <path
          key={`ref-${i}`}
          ref={(el) => { pathRefs.current[i] = el }}
          d={d}
          fill="none"
          stroke="none"
        />
      ))}

      {/* Progress fills — tapered swoosh polygons */}
      {TRACKS.map((track, i) => {
        const totalLen = pathLengths[i]
        const progressLen = totalLen * animProgresses[i]
        const pathEl = pathRefs.current[i]
        if (totalLen === 0 || progressLen <= 0 || !pathEl) return null
        const swooshD = buildSwooshPath(pathEl, progressLen, track.strokeWidth / 2)
        return swooshD ? (
          <path key={`fill-${i}`} d={swooshD} fill={track.color} stroke="none" />
        ) : null
      })}





      {/* 2030 goal endpoint dots + labels — labels go LEFT of the dot so they
          stay in the clear space to the left of TRACK_LX and never stack with
          adjacent dots or the tip-marker line */}
      {TRACKS.map((track, i) => {
        const { x: goalX, y: goalY } = getGoalPosition(i)
        return (
          <g key={`goal-${track.id}`}>
            <circle cx={goalX} cy={goalY} r={16} fill={track.color} opacity={0.18} />
            <circle cx={goalX} cy={goalY} r={8} fill={track.color} />
            <circle cx={goalX} cy={goalY} r={3.5} fill="white" />
          </g>
        )
      })}

      {/* Legend — left side, aligned with each track's start */}
      {TRACKS.map((track, i) => {
        const { y: goalY } = getGoalPosition(i)
        const startY = 2 * RIGHT_CY - goalY   // top-arm Y for this track
        const iconSize = 44
        const iconX = TRACK_LX - 310   // icon left of the bar start
        return (
          <g key={`legend-${track.id}`}>
            <TrackIcon track={track} x={iconX} y={startY} size={iconSize} />
            <text
              x={iconX + iconSize / 2 + 14}
              y={startY + 7}
              textAnchor="start"
              className="legend-label"
              fill={track.color}
            >
              {track.label}
            </text>
          </g>
        )
      })}

      {/* Target labels — next to each goal dot, to the left */}
      {TRACKS.map((track, i) => {
        const { y: goalY } = getGoalPosition(i)
        const [val] = track.targetLabel.split(' by 2030')
        return (
          <text
            key={`target-${track.id}`}
            x={GOAL_LX - 30} y={goalY + 5}
            textAnchor="end"
            fontFamily="'Montserrat', system-ui, sans-serif"
          >
            <tspan fontWeight="800" fontSize="16" fill={track.color}>{val}</tspan>
            <tspan fontWeight="500" fontSize="12" fill={track.color}> by 2030</tspan>
          </text>
        )
      })}

      {/* Current-year progress tip — rendered last so chips sit above everything */}
      {TRACKS.map((track, i) => {
        const totalLen = pathLengths[i]
        const progressLen = totalLen * animProgresses[i]
        const pathEl = pathRefs.current[i]
        const entry = getValueForYear(track, selectedYear)
        if (!pathEl || totalLen === 0 || progressLen <= 0 || !entry) return null

        const clampedLen = Math.min(progressLen, totalLen - 1)
        const pt = pathEl.getPointAtLength(clampedLen)

        const prevPt = pathEl.getPointAtLength(Math.max(clampedLen - 1, 0))
        const dx = pt.x - prevPt.x
        const dy = pt.y - prevPt.y
        const tlen = Math.sqrt(dx * dx + dy * dy) || 1
        const tx = dx / tlen, ty = dy / tlen

        const halfWidth = track.strokeWidth / 2
        const tipX = pt.x + tx * halfWidth
        const tipY = pt.y + ty * halfWidth

        const { nx: rawNx, ny: rawNy } = getOutwardNormal(pt)
        const isInward = rawNy > 0.1
        const nx = isInward ? -rawNx : rawNx
        const ny = isInward ? -rawNy : rawNy

        const valStr  = formatAnimValue(track, animValues[i])
        const yearStr = String(entry.year)
        const chipW = Math.max(valStr.length * 11 + 28, 72)
        const chipH = 46

        const chipCx = tipX + nx * (chipH / 2 + 10)
        const chipCy = tipY + ny * (chipH / 2 + 10)

        return (
          <g key={`marker-${track.id}`}>
            <rect
              x={chipCx - chipW / 2} y={chipCy - chipH / 2}
              width={chipW} height={chipH}
              rx={11} ry={11}
              fill="white" stroke={track.color} strokeWidth={1.5}
            />
            <text
              x={chipCx} y={chipCy - 8}
              textAnchor="middle" dominantBaseline="middle"
              style={{ fontSize: 11, fontWeight: 500, fontFamily: "'Montserrat', system-ui, sans-serif", opacity: 0.75 }}
              fill={track.color}
            >
              {yearStr}
            </text>
            <text
              x={chipCx} y={chipCy + 9}
              textAnchor="middle" dominantBaseline="middle"
              style={{ fontSize: 15, fontWeight: 800, fontFamily: "'Montserrat', system-ui, sans-serif" }}
              fill={track.color}
            >
              {valStr}
            </text>
          </g>
        )
      })}
      {/* Milestone diamonds — rendered last so they're always on top of everything */}
      {(() => {
        const items = []
        TRACKS.forEach((track, i) => {
          const totalLen = pathLengths[i]
          const pathEl   = pathRefs.current[i]
          if (totalLen === 0 || !pathEl) return
          YEARS.filter(y => y !== selectedYear).forEach(y => {
            const entry = getValueForYear(track, y)
            if (!entry) return
            const len = Math.min(totalLen * track.getProgress(entry.value), totalLen - 1)
            const pt  = pathEl.getPointAtLength(len)
            const isHovered = hoveredMilestone?.trackIdx === i && hoveredMilestone?.year === y
            items.push({ track, i, y, pt, isHovered })
          })
        })
        // hovered item last → paints on top of siblings
        items.sort((a, b) => (a.isHovered ? 1 : 0) - (b.isHovered ? 1 : 0))

        return items.map(({ track, i, y, pt, isHovered }) => {
          const hw = 23  // half of 46
          const scale = isHovered ? 1 : 0.32

          return (
            <g
              key={`ms-${track.id}-${y}`}
              onMouseEnter={() => setHoveredMilestone({ trackIdx: i, year: y })}
              onMouseLeave={() => setHoveredMilestone(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={pt.x - hw} y={pt.y - hw}
                width={46} height={46}
                rx={isHovered ? 8 : 3}
                fill={track.color}
                stroke="white"
                strokeWidth={2}
                style={{
                  transform: `rotate(${isHovered ? 0 : 45}deg) scale(${scale})`,
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  transition: 'transform 0.25s ease, rx 0.25s ease',
                }}
              />
              {isHovered && (
                <text
                  x={pt.x} y={pt.y}
                  textAnchor="middle" dominantBaseline="middle"
                  className="ms-year"
                  style={{ fontSize: 13, fontWeight: 800, fontFamily: "'Montserrat', system-ui, sans-serif", pointerEvents: 'none' }}
                  fill="white"
                >{y}</text>
              )}
            </g>
          )
        })
      })()}
    </svg>
  )
}
