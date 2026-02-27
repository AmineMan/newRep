import { useState } from 'react'
import Header from './components/Header'
import InputPanel from './components/InputPanel'
import ResultsPanel from './components/ResultsPanel'
import { runSimulation } from './simulationEngine'
import styles from './App.module.css'

export default function App() {
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCalculate = (inputs) => {
    setIsLoading(true)
    setResult(null)
    // Simulate async backend call latency
    setTimeout(() => {
      const sim = runSimulation(
        inputs.category,
        inputs.startDate,
        inputs.endDate,
        inputs.promoMechanism
      )
      setResult(sim)
      setIsLoading(false)
    }, 900)
  }

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.layout}>
        <aside className={styles.sidebar}>
          <InputPanel onCalculate={handleCalculate} isLoading={isLoading} />
        </aside>
        <section className={styles.content}>
          <ResultsPanel result={result} isLoading={isLoading} />
        </section>
      </main>
    </div>
  )
}
