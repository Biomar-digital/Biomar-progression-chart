import './YearSlider.css'

export default function YearSlider({ years, value, onChange }) {
  const min = years[0]
  const max = years[years.length - 1]

  return (
    <div className="year-slider">
      <div className="year-slider__label">Select Year</div>
      <div className="year-slider__track-container">
        <input
          className="year-slider__input"
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
      <div className="year-slider__ticks">
        {years.map((y) => (
          <span
            key={y}
            className={`year-slider__tick${y === value ? ' active' : ''}`}
            onClick={() => onChange(y)}
          >
            {y}
          </span>
        ))}
      </div>
    </div>
  )
}
