import './YearSlider.css'

export default function YearSlider({ years, value, onChange, pulse, showCta }) {
  return (
    <div className="year-slider">
      <div className="year-slider__heading">
        <span className="year-slider__label">Select Year</span>
        <span className="year-slider__value-badge">{value}</span>
      </div>

      <div className="year-slider__btns">
        {years.map(y => (
          <button
            key={y}
            className={`year-slider__btn${y === value ? ' active' : ''}`}
            onClick={() => onChange(y)}
          >
            {y}
          </button>
        ))}
      </div>

      <input
        type="range"
        className="year-slider__range glow"
        min={years[0]}
        max={years[years.length - 1]}
        step={1}
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
      />
      {showCta && <span className="year-slider__cta">← click a year or drag →</span>}
    </div>
  )
}
