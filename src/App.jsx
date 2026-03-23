import { useState, useEffect, useRef } from 'react'
import ProgressChart from './components/ProgressChart'
import YearSlider from './components/YearSlider'
import { YEARS } from './data'
import './App.css'

const AUTO_SEQUENCE = [2022, 2023, 2024, 2025]

export default function App() {
  const [selectedYear, setSelectedYear] = useState(2022)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const autoTimerRef = useRef(null)

  useEffect(() => {
    if (!isAutoPlaying) return
    let idx = 0
    setSelectedYear(AUTO_SEQUENCE[idx])

    function step() {
      idx++
      if (idx < AUTO_SEQUENCE.length) {
        setSelectedYear(AUTO_SEQUENCE[idx])
        if (idx < AUTO_SEQUENCE.length - 1) {
          autoTimerRef.current = setTimeout(step, 900)
        } else {
          setTimeout(() => setIsAutoPlaying(false), 600)
        }
      }
    }
    autoTimerRef.current = setTimeout(step, 900)
    return () => clearTimeout(autoTimerRef.current)
  }, [isAutoPlaying])

  function handleYearChange(year) {
    clearTimeout(autoTimerRef.current)
    setIsAutoPlaying(false)
    setSelectedYear(year)
  }

  return (
    <div className="app">
      <div className="chart-wrapper">
        <ProgressChart selectedYear={selectedYear} />
        <div className="slider-wrapper">
          <YearSlider
            years={YEARS}
            value={selectedYear}
            onChange={handleYearChange}
            pulse={isAutoPlaying}
          />
        </div>
      </div>
    </div>
  )
}
