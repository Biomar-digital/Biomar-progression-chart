import { useEffect, useRef, useState } from 'react'
import './BagChart.css'
import { YEARS, TARGET, FINAL_YEAR, FINAL_PCT } from '../data.js'

const VB_W = 291.67
const VB_H = 400
const TOTAL_H = 490

const FILL_TOP    = 33
const FILL_BOTTOM = 395

const BAG_PATHS = [
  'M269.6,11.65c-.7-3.53-2.82-6.35-6.34-7.76-3.52-1.41-6.34-1.41-9.87,0l-14.1,6.35-18.32-9.18c-3.52-1.41-7.05-1.41-10.57,0l-18.32,9.18-18.32-9.18c-3.52-1.41-7.05-1.41-10.57,0l-18.32,9.18L127.24,1.06c-3.52-1.41-7.05-1.41-10.57,0l-18.32,9.18L80.02,1.06c-3.52-1.41-7.05-1.41-10.57,0l-16.91,9.18-14.1-6.35c-2.82-1.41-7.05-1.41-9.87,0-2.82,1.41-5.64,4.24-6.34,7.76-1.41,4.94-2.82,12.71-4.93,21.88h257.24c-2.11-9.18-4.23-16.23-4.93-21.88h0Z',
  'M289.34,381.51l-19.73-25.41c5.64-16.23,16.21-58.59,16.21-151.05,0-51.53-2.82-102.35-8.46-153.17H14.48c-5.64,50.82-8.46,102.35-8.46,153.17,0,89.64,11.28,134.11,16.91,151.05l-20.44,25.41c-2.82,3.53-3.52,9.18-.7,12.71,2.11,4.24,7.05,6.35,11.98,4.94,42.29-11.29,87.39-16.94,132.5-16.94s89.5,5.65,132.5,17.65c4.93.71,9.16-1.41,11.98-4.94,1.41-4.94,1.41-9.88-1.41-13.41h0Z',
]

const DURATION = 3000

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

function pctToY(pct) {
  const clamped = Math.max(0, Math.min(100, pct))
  return FILL_BOTTOM - (clamped / 100) * (FILL_BOTTOM - FILL_TOP)
}

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function BagChart() {
  const rafRef = useRef(null)
  const [displayPct, setDisplayPct] = useState(0)
  const [displayYear, setDisplayYear] = useState(YEARS[0])

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplayPct(FINAL_PCT)
      setDisplayYear(FINAL_YEAR)
      return
    }

    const start = performance.now()

    function tick(now) {
      const t = Math.min((now - start) / DURATION, 1)
      const e = easeInOutQuad(t)
      setDisplayPct(e * FINAL_PCT)
      const idx = Math.min(Math.floor(t * YEARS.length), YEARS.length - 1)
      setDisplayYear(YEARS[idx])
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const fillY   = pctToY((displayPct / TARGET) * 100)
  const targetY = FILL_TOP
  const cx      = VB_W / 2

  return (
    <div className="bag-chart">
      <svg
        viewBox={`0 -70 ${VB_W} ${TOTAL_H + 70}`}
        preserveAspectRatio="xMidYMid meet"
        className="bag-chart__svg"
      >
        <defs>
          <clipPath id="bag-outline-clip">
            <path d={BAG_PATHS[1]} />
          </clipPath>
        </defs>

        <text x={cx} y={-38} textAnchor="middle" fill="#1f3e77" fontSize="22"
          fontFamily="Montserrat, sans-serif" fontWeight="800">
          Circular &amp; Restorative
        </text>
        <text x={cx} y={-14} textAnchor="middle" fill="#1f3e77" fontSize="15"
          fontFamily="Montserrat, sans-serif" fontWeight="600" opacity="0.7">
          50% goal by 2030
        </text>

        <g fill="#eef7fc">
          {BAG_PATHS.map((d, i) => <path key={i} d={d} />)}
        </g>

        <g clipPath="url(#bag-outline-clip)">
          <rect x="0" y={fillY} width={VB_W} height={FILL_BOTTOM - fillY + 20} fill="#1f3e77" />
        </g>

        <line x1={18} y1={targetY} x2={VB_W - 18} y2={targetY}
          stroke="#1f3e77" strokeWidth="3" strokeDasharray="6 4" opacity="0.55" />

        <text x={cx} y={VB_H + 42} textAnchor="middle" fill="#1f3e77"
          fontSize="40" fontFamily="Montserrat, sans-serif" fontWeight="800">
          {displayPct.toFixed(1)}%
        </text>

        <text x={cx} y={VB_H + 66} textAnchor="middle" fill="#1f3e77"
          fontSize="11" fontFamily="Montserrat, sans-serif" fontWeight="600" opacity="0.7">
          Circular &amp; Restorative — {displayYear}
        </text>
      </svg>
    </div>
  )
}
