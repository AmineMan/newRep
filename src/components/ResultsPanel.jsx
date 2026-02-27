import MetricCard from './MetricCard'
import RevenueChart from './RevenueChart'
import DailyChart from './DailyChart'
import styles from './ResultsPanel.module.css'

function fmt(v) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}M`
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`
  return `$${Math.round(v).toLocaleString()}`
}

function fmtNum(v) {
  return Math.round(v).toLocaleString()
}

export default function ResultsPanel({ result, isLoading }) {
  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner} />
        <p className={styles.loadingTitle}>Running simulation...</p>
        <p className={styles.loadingText}>Applying price-elasticity demand model</p>
      </div>
    )
  }

  if (!result) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>◈</div>
        <h2 className={styles.emptyTitle}>Configure & Run Simulation</h2>
        <p className={styles.emptyText}>
          Select a fashion category, promotion period, and promo mechanism on the left —
          then click <strong>Run Simulation</strong> to see projected revenue uplift vs baseline.
        </p>
        <div className={styles.emptyFeatures}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>◆</span>
            Price-elasticity demand model
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>◆</span>
            Day-by-day revenue breakdown
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>◆</span>
            Confidence intervals
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>◆</span>
            Unit volume uplift estimate
          </div>
        </div>
      </div>
    )
  }

  const upliftVariant = result.upliftPercent >= 0 ? 'positive' : 'negative'
  const upliftSign = result.upliftPercent >= 0 ? '+' : ''

  return (
    <div className={styles.results}>
      {/* Result header */}
      <div className={styles.resultHeader}>
        <div>
          <h2 className={styles.resultTitle}>Simulation Results</h2>
          <p className={styles.resultSub}>
            {result.category} · {result.promoMechanism} · {result.days}-day window
          </p>
        </div>
        <div className={styles.confidenceBadge}>
          Uplift range: {result.confidenceLow.toFixed(1)}% – {result.confidenceHigh.toFixed(1)}%
        </div>
      </div>

      {/* Primary KPIs */}
      <div className={styles.kpiGrid}>
        <MetricCard
          label="Baseline Revenue"
          value={fmt(result.totalBaseline)}
          sub={`Without promotion`}
          variant="default"
        />
        <MetricCard
          label="Projected Revenue"
          value={fmt(result.totalPromo)}
          sub={`With ${result.promoLabel}`}
          variant="accent"
        />
        <MetricCard
          label="Revenue Uplift"
          value={`${upliftSign}${fmt(result.totalUplift)}`}
          sub={`${upliftSign}${result.upliftPercent.toFixed(1)}% vs baseline`}
          variant={upliftVariant}
        />
      </div>

      {/* Secondary KPIs */}
      <div className={styles.kpiGridSmall}>
        <MetricCard
          label="Unit Volume Uplift"
          value={`+${result.unitUpliftPercent.toFixed(0)}%`}
          sub={`${fmtNum(result.baselineUnitsTotal)} → ${fmtNum(result.promoUnitsTotal)} units`}
          variant="blue"
        />
        <MetricCard
          label="Avg Selling Price"
          value={`$${result.avgPromoPrice}`}
          sub={`Down from $${result.avgUnitPrice} (${result.discountRate.toFixed(0)}% off)`}
          variant="default"
        />
        <MetricCard
          label="Promotion Duration"
          value={`${result.days} days`}
          sub={`${result.dailyData[0]?.date} – ${result.dailyData[result.dailyData.length - 1]?.date}`}
          variant="default"
        />
        <MetricCard
          label="Avg Daily Uplift"
          value={fmt(result.totalUplift / result.days)}
          sub="Incremental revenue per day"
          variant={upliftVariant}
        />
      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <RevenueChart result={result} />
        </div>
        <div className={`${styles.chartCard} ${styles.chartCardWide}`}>
          <DailyChart result={result} />
        </div>
      </div>

      {/* Insights */}
      <div className={styles.insights}>
        <h3 className={styles.insightsTitle}>Model Insights</h3>
        <div className={styles.insightsList}>
          <Insight
            icon="◆"
            text={`A ${result.discountRate.toFixed(0)}% discount is projected to drive a
              ${result.unitUpliftPercent.toFixed(0)}% increase in unit volume, yielding a net
              revenue ${result.upliftPercent >= 0 ? 'uplift' : 'loss'} of
              ${upliftSign}${result.upliftPercent.toFixed(1)}% over the period.`}
          />
          <Insight
            icon="◆"
            text={`Estimated incremental units: ${fmtNum(result.promoUnitsTotal - result.baselineUnitsTotal)}
              units vs the ${fmtNum(result.baselineUnitsTotal)}-unit baseline. Average promo price drops
              from $${result.avgUnitPrice} to $${result.avgPromoPrice}.`}
          />
          <Insight
            icon="◆"
            text={`Model confidence range for revenue uplift: ${result.confidenceLow.toFixed(1)}% to
              ${result.confidenceHigh.toFixed(1)}%. Actual results depend on traffic, competitive
              activity, and inventory availability.`}
          />
        </div>
      </div>
    </div>
  )
}

function Insight({ icon, text }) {
  return (
    <div className={styles.insight}>
      <span className={styles.insightIcon}>{icon}</span>
      <p className={styles.insightText}>{text}</p>
    </div>
  )
}
