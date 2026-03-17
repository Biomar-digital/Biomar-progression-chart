import { useRef, useLayoutEffect, useState } from 'react'
import { TRACKS, YEARS, VB_W, VB_H, getTrackPath } from '../data'
import './ProgressChart.css'

// Icon components (SVG-based, matching image icons)
function ClimateIcon({ x, y, size = 32, color }) {
  return (
    <g transform={`translate(${x - size / 2}, ${y - size / 2})`}>
      {/* Footprint icon */}
      <ellipse cx={size * 0.38} cy={size * 0.45} rx={size * 0.13} ry={size * 0.22} fill={color} transform={`rotate(-15, ${size * 0.38}, ${size * 0.45})`} />
      <ellipse cx={size * 0.62} cy={size * 0.5} rx={size * 0.13} ry={size * 0.22} fill={color} transform={`rotate(15, ${size * 0.62}, ${size * 0.5})`} />
      <circle cx={size * 0.25} cy={size * 0.2} r={size * 0.07} fill={color} />
      <circle cx={size * 0.38} cy={size * 0.14} r={size * 0.065} fill={color} />
      <circle cx={size * 0.52} cy={size * 0.12} r={size * 0.065} fill={color} />
      <circle cx={size * 0.65} cy={size * 0.17} r={size * 0.06} fill={color} />
    </g>
  )
}

function CircularIcon({ x, y, size = 32, color }) {
  const r = size * 0.4
  const cx2 = x
  const cy2 = y
  return (
    <g>
      <circle cx={cx2} cy={cy2} r={r} fill="none" stroke={color} strokeWidth={size * 0.12} />
      {/* Arrow */}
      <polygon
        points={`${cx2},${cy2 - r - size * 0.1} ${cx2 - size * 0.12},${cy2 - r + size * 0.12} ${cx2 + size * 0.12},${cy2 - r + size * 0.12}`}
        fill={color}
      />
      <polygon
        points={`${cx2},${cy2 + r + size * 0.1} ${cx2 - size * 0.12},${cy2 + r - size * 0.12} ${cx2 + size * 0.12},${cy2 + r - size * 0.12}`}
        fill={color}
      />
    </g>
  )
}

function PeopleIcon({ x, y, size = 32, color }) {
  const headR = size * 0.14
  return (
    <g>
      {/* Three people silhouettes */}
      {[-size * 0.35, 0, size * 0.35].map((dx, i) => (
        <g key={i} transform={`translate(${x + dx}, ${y})`}>
          <circle cx={0} cy={-size * 0.28} r={headR} fill={color} />
          <ellipse cx={0} cy={size * 0.06} rx={size * 0.14} ry={size * 0.2} fill={color} />
        </g>
      ))}
    </g>
  )
}

function TrackIcon({ track, x, y }) {
  const size = 36
  if (track.id === 'climate') return <ClimateIcon x={x} y={y} size={size} color={track.color} />
  if (track.id === 'circular') return <CircularIcon x={x} y={y} size={size} color={track.color} />
  return <PeopleIcon x={x} y={y} size={size} color={track.color} />
}

// Get the value for a given track + year (find most recent year ≤ selectedYear)
function getValueForYear(track, year) {
  for (let y = year; y >= YEARS[0]; y--) {
    if (track.history[y] !== undefined) return { value: track.history[y], year: y }
  }
  return null
}

// Get all historical entries for a track up to selectedYear
function getHistoricalEntries(track, selectedYear) {
  return Object.entries(track.history)
    .filter(([y]) => Number(y) <= selectedYear)
    .sort(([a], [b]) => Number(a) - Number(b))
}

export default function ProgressChart({ selectedYear }) {
  const pathRefs = useRef([])
  const [pathLengths, setPathLengths] = useState([0, 0, 0])

  useLayoutEffect(() => {
    const lengths = pathRefs.current.map((p) => (p ? p.getTotalLength() : 0))
    setPathLengths(lengths)
  }, [])

  // Compute track paths
  const trackPaths = TRACKS.map((_, i) => getTrackPath(i))

  return (
    <svg
      className="progress-chart"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C8DEF0" />
          <stop offset="50%" stopColor="#E8F4FA" />
          <stop offset="100%" stopColor="#F5FAFD" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width={VB_W} height={VB_H} fill="url(#bgGrad)" rx="12" />

      {/* Title */}
      <text x={55} y={70} className="chart-title-year">{selectedYear}</text>
      <text x={55} y={110} className="chart-title-text">Progress Towards 2030</text>

      {/* Ghost (background) tracks */}
      {trackPaths.map((d, i) => (
        <path
          key={`bg-${i}`}
          d={d}
          className="track-bg"
          strokeWidth={TRACKS[i].strokeWidth}
        />
      ))}

      {/* Progress tracks + markers */}
      {TRACKS.map((track, i) => {
        const totalLen = pathLengths[i]
        const entry = getValueForYear(track, selectedYear)
        const progress = entry ? track.getProgress(entry.value) : 0
        const dashOffset = totalLen > 0 ? totalLen * (1 - progress) : totalLen
        const markerLen = totalLen * progress
        const pathEl = pathRefs.current[i]

        let markerPt = null
        if (pathEl && totalLen > 0 && markerLen > 0) {
          markerPt = pathEl.getPointAtLength(Math.min(markerLen, totalLen - 1))
        }

        // Determine if marker line goes up or down based on track position
        // Green (outer/bottom): line goes down; Blue (middle): line goes up; Orange (inner): line goes up
        const lineDir = i === 0 ? 1 : -1
        const lineLen = i === 0 ? 90 : 110
        const labelOffsetY = i === 0 ? 30 : -25

        const histEntries = getHistoricalEntries(track, selectedYear)

        return (
          <g key={track.id}>
            {/* Progress stroke */}
            <path
              ref={(el) => { pathRefs.current[i] = el }}
              d={trackPaths[i]}
              className="track-progress"
              stroke={track.color}
              strokeWidth={track.strokeWidth}
              strokeDasharray={totalLen}
              strokeDashoffset={dashOffset}
            />

            {/* Marker at progress tip */}
            {markerPt && entry && (
              <g>
                {/* Vertical dashed line */}
                <line
                  x1={markerPt.x}
                  y1={markerPt.y}
                  x2={markerPt.x}
                  y2={markerPt.y + lineDir * lineLen}
                  stroke={track.color}
                  className="marker-line"
                />
                {/* Circle on track */}
                <circle
                  cx={markerPt.x}
                  cy={markerPt.y}
                  r={10}
                  className="marker-circle"
                  stroke={track.color}
                />
                {/* Year label */}
                <text
                  x={markerPt.x}
                  y={markerPt.y + lineDir * lineLen + labelOffsetY * -1 * lineDir}
                  textAnchor="middle"
                  className="marker-year"
                  fill={track.color}
                >
                  {entry.year}
                </text>
                {/* Value label */}
                <text
                  x={markerPt.x}
                  y={markerPt.y + lineDir * lineLen + labelOffsetY * -1 * lineDir + (lineDir > 0 ? 28 : -6)}
                  textAnchor="middle"
                  className="marker-value"
                  fill={track.color}
                >
                  {i === 0 ? `- ${Math.abs(entry.value)}%` : track.formatValue(entry.value)}
                </text>
              </g>
            )}

            {/* Historical labels below green track */}
            {i === 0 && histEntries.map(([yr, val]) => {
              if (!pathEl || totalLen === 0) return null
              const p = track.getProgress(val)
              const histLen = totalLen * p
              if (histLen <= 0) return null
              const pt = pathEl.getPointAtLength(Math.min(histLen, totalLen - 1))
              return (
                <g key={yr} transform={`translate(${pt.x}, ${pt.y + 42})`}>
                  <line x1={0} y1={-42} x2={0} y2={-5} stroke="#aaa" strokeWidth={1} strokeDasharray="2 2" />
                  <text
                    className="hist-label"
                    textAnchor="middle"
                    transform="rotate(-55)"
                    x={0}
                    y={0}
                    fill={track.color}
                  >
                    {yr}: {val}%
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}

      {/* Legend (top-right) */}
      {TRACKS.map((track, i) => {
        const legendY = 75 + i * 58
        const iconX = VB_W - 210
        const iconY = legendY
        return (
          <g key={`legend-${track.id}`}>
            {/* Icon circle background */}
            <circle cx={iconX} cy={iconY} r={22} fill="white" fillOpacity={0.85} />
            <TrackIcon track={track} x={iconX} y={iconY} />
            <text
              x={iconX + 32}
              y={iconY + 6}
              className="legend-label"
              fill={track.color}
            >
              {track.label}
            </text>
          </g>
        )
      })}

      {/* 2030 target labels (bottom-left) */}
      {TRACKS.map((track, i) => {
        const parts = track.targetLabel.split(' by 2030')
        const baseY = VB_H - 80 + i * 26
        return (
          <g key={`target-${track.id}`}>
            <text x={80} y={baseY} className="target-label" fill={track.color}>
              {parts[0]}
            </text>
            <text x={80 + parts[0].length * 9.5} y={baseY} className="target-suffix">
              {' by 2030'}
            </text>
          </g>
        )
      })}

      {/* Circular & People hist labels on right side */}
      {[1, 2].map((i) => {
        const track = TRACKS[i]
        const pathEl = pathRefs.current[i]
        const totalLen = pathLengths[i]
        const histEntries = getHistoricalEntries(track, selectedYear)
        if (!pathEl || totalLen === 0) return null
        return histEntries.map(([yr, val]) => {
          const p = track.getProgress(val)
          const histLen = totalLen * p
          if (histLen <= 0) return null
          const pt = pathEl.getPointAtLength(Math.min(histLen, totalLen - 1))
          const isAbove = i === 1
          const dy = isAbove ? -42 : -22
          return (
            <g key={`${track.id}-hist-${yr}`} transform={`translate(${pt.x}, ${pt.y + dy})`}>
              <line x1={0} y1={0} x2={0} y2={35} stroke="#aaa" strokeWidth={1} strokeDasharray="2 2" />
              <text
                className="hist-label"
                textAnchor="middle"
                transform="rotate(-55)"
                x={0}
                y={0}
                fill={track.color}
              >
                {yr}: {track.formatValue(val)}
              </text>
            </g>
          )
        })
      })}
    </svg>
  )
}
