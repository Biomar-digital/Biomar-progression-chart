import { useState } from 'react'
import ProgressChart from './components/ProgressChart'
import YearSlider from './components/YearSlider'
import { YEARS } from './data'
import './App.css'

export default function App() {
  const [selectedYear, setSelectedYear] = useState(2025)

  return (
    <div className="app">
      <div className="chart-wrapper">
        <ProgressChart selectedYear={selectedYear} />
        <div className="slider-wrapper">
          <YearSlider
            years={YEARS}
            value={selectedYear}
            onChange={setSelectedYear}
          />
        </div>
      </div>
    </div>
  )
}
