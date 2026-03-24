import { useEffect, useRef, useState } from 'react'
import ProgressChart from './components/ProgressChart'
import YearSlider from './components/YearSlider'
import { YEARS } from './data'
import './App.css'

export default function App() {
  const [selectedYear, setSelectedYear] = useState(2025)

  function handleYearChange(year) {
    setSelectedYear(year)
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight') handleYearChange(Math.min(selectedYear + 1, YEARS[YEARS.length - 1]))
      if (e.key === 'ArrowLeft')  handleYearChange(Math.max(selectedYear - 1, YEARS[0]))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedYear])

  return (
    <div className="app">
      <div className="chart-wrapper">
        <ProgressChart selectedYear={selectedYear} />
        <div className="slider-wrapper">
          <YearSlider
            years={YEARS}
            value={selectedYear}
            onChange={handleYearChange}
            pulse={false}
            showCta={false}
          />
        </div>
      </div>
    </div>
  )
}
