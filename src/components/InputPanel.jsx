import { useState } from 'react'
import { CATEGORY_OPTIONS, PROMO_OPTIONS } from '../simulationEngine'
import styles from './InputPanel.module.css'

const TODAY = new Date().toISOString().split('T')[0]

export default function InputPanel({ onCalculate, isLoading }) {
  const [category, setCategory] = useState("Women's Denim Slim")
  const [startDate, setStartDate] = useState('2026-03-16')
  const [endDate, setEndDate] = useState('2026-03-23')
  const [promoMechanism, setPromoMechanism] = useState('20% Off')
  const [error, setError] = useState('')

  const validate = () => {
    if (!category) return 'Please select a category.'
    if (!startDate || !endDate) return 'Please select a date range.'
    if (new Date(endDate) < new Date(startDate)) return 'End date must be after start date.'
    const days = Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1
    if (days > 60) return 'Date range cannot exceed 60 days.'
    if (!promoMechanism) return 'Please select a promo mechanism.'
    return ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    onCalculate({ category, startDate, endDate, promoMechanism })
  }

  const days = startDate && endDate
    ? Math.max(0, Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1)
    : 0

  return (
    <form className={styles.panel} onSubmit={handleSubmit}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Simulation Inputs</h2>
        <p className={styles.panelSub}>Configure your promotion parameters</p>
      </div>

      <div className={styles.fields}>
        {/* Category */}
        <div className={styles.field}>
          <label className={styles.label}>
            Item Category
            <span className={styles.required}>*</span>
          </label>
          <select
            className={styles.select}
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {CATEGORY_OPTIONS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className={styles.field}>
          <label className={styles.label}>
            Promotion Period
            <span className={styles.required}>*</span>
          </label>
          <div className={styles.dateRow}>
            <div className={styles.dateField}>
              <span className={styles.dateLabel}>From</span>
              <input
                type="date"
                className={styles.input}
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className={styles.dateSep}>→</div>
            <div className={styles.dateField}>
              <span className={styles.dateLabel}>To</span>
              <input
                type="date"
                className={styles.input}
                value={endDate}
                min={startDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>
          {days > 0 && (
            <p className={styles.hint}>{days} day{days !== 1 ? 's' : ''} selected</p>
          )}
        </div>

        {/* Promo Mechanism */}
        <div className={styles.field}>
          <label className={styles.label}>
            Promo Mechanism
            <span className={styles.required}>*</span>
          </label>
          <div className={styles.promoGrid}>
            {PROMO_OPTIONS.map(p => (
              <button
                key={p}
                type="button"
                className={`${styles.promoChip} ${promoMechanism === p ? styles.promoChipActive : ''}`}
                onClick={() => setPromoMechanism(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner} />
            Running Simulation...
          </>
        ) : (
          'Run Simulation →'
        )}
      </button>

      <p className={styles.disclaimer}>
        Results are model estimates based on price elasticity. Actual performance may vary.
      </p>
    </form>
  )
}
