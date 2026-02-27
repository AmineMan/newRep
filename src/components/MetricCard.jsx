import styles from './MetricCard.module.css'

export default function MetricCard({ label, value, sub, variant = 'default', large = false }) {
  return (
    <div className={`${styles.card} ${styles[variant]} ${large ? styles.large : ''}`}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      {sub && <p className={styles.sub}>{sub}</p>}
    </div>
  )
}
