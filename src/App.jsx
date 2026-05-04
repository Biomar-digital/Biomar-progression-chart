import { useState } from 'react'
import ProgressChart from './components/ProgressChart'
import './App.css'

export default function App() {
  const [selectedYear, setSelectedYear] = useState(2025)

  return (
    <div className="app">
      <div className="chart-wrapper">
        <ProgressChart selectedYear={selectedYear} onYearChange={setSelectedYear} />
      </div>
    </div>
  )
}
