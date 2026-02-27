import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.icon}>◈</span>
          <div>
            <h1 className={styles.title}>Promo Impact Calculator</h1>
            <p className={styles.subtitle}>Fashion Revenue Simulation Engine</p>
          </div>
        </div>
        <div className={styles.badge}>PoC · Simulation Model v1</div>
      </div>
    </header>
  )
}
