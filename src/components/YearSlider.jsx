import { useRef } from 'react'
import './YearSlider.css'

export default function YearSlider({ years, value, onChange }) {
  const trackRef = useRef(null)

  const getIdxFromClientX = (clientX) => {
    const rect = trackRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round(pct * (years.length - 1))
  }

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    onChange(years[getIdxFromClientX(e.clientX)])
  }

  const handlePointerMove = (e) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    onChange(years[getIdxFromClientX(e.clientX)])
  }

  const handleKeyDown = (e) => {
    const idx = years.indexOf(value)
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange(years[Math.min(idx + 1, years.length - 1)])
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange(years[Math.max(idx - 1, 0)])
  }

  const currentIdx = years.indexOf(value)
  const pct = years.length > 1 ? (currentIdx / (years.length - 1)) * 100 : 0

  return (
    <div className="year-slider" onKeyDown={handleKeyDown} tabIndex={0} role="slider"
      aria-valuemin={years[0]} aria-valuemax={years[years.length - 1]} aria-valuenow={value}>
      <div className="year-slider__heading">
        <span className="year-slider__label">Select Year</span>
        <span className="year-slider__value-badge">{value}</span>
      </div>

      <div
        className="year-slider__track"
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        {/* Rail */}
        <div className="year-slider__rail" />
        {/* Colored fill up to thumb */}
        <div className="year-slider__fill" style={{ width: `${pct}%` }} />

        {/* Year stop marks */}
        {years.map((y, i) => {
          const p = years.length > 1 ? (i / (years.length - 1)) * 100 : 0
          const isActive = y === value
          const isPast = i < currentIdx
          return (
            <div
              key={y}
              className="year-slider__stop"
              style={{ left: `${p}%` }}
              onClick={(e) => { e.stopPropagation(); onChange(y) }}
            >
              <div className={`year-slider__tick ${isActive ? 'active' : isPast ? 'past' : ''}`} />
              <span className={`year-slider__year-label ${isActive ? 'active' : isPast ? 'past' : ''}`}>{y}</span>
            </div>
          )
        })}

        {/* Draggable thumb */}
        <div className="year-slider__thumb" style={{ left: `${pct}%` }} />
      </div>
    </div>
  )
}
