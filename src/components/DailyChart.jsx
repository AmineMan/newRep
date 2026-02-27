import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'
import styles from './DailyChart.module.css'

function fmt(v) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`
  return `$${Math.round(v)}`
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const baseline = payload.find(p => p.dataKey === 'baseline')
  const promo = payload.find(p => p.dataKey === 'promo')
  const uplift = promo && baseline ? promo.value - baseline.value : 0
  const upliftPct = baseline?.value ? ((uplift / baseline.value) * 100).toFixed(1) : 0

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipDate}>{label}</p>
      <div className={styles.tooltipRow}>
        <span className={styles.dot} style={{ background: '#D1C5B0' }} />
        <span>Baseline</span>
        <span className={styles.val}>{fmt(baseline?.value || 0)}</span>
      </div>
      <div className={styles.tooltipRow}>
        <span className={styles.dot} style={{ background: '#1A1A1A' }} />
        <span>With Promo</span>
        <span className={styles.val}>{fmt(promo?.value || 0)}</span>
      </div>
      <div className={styles.tooltipUplift}>
        <span>Uplift</span>
        <span className={uplift >= 0 ? styles.pos : styles.neg}>
          {uplift >= 0 ? '+' : ''}{fmt(uplift)} ({upliftPct >= 0 ? '+' : ''}{upliftPct}%)
        </span>
      </div>
    </div>
  )
}

export default function DailyChart({ result }) {
  // Show up to 14 tick labels to avoid crowding
  const tickInterval = result.days <= 14 ? 0 : Math.ceil(result.days / 14) - 1

  return (
    <div className={styles.wrap}>
      <h3 className={styles.chartTitle}>Daily Revenue Timeline</h3>
      <p className={styles.chartSub}>Day-by-day baseline vs promo projection across the promotion window</p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={result.dailyData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E1D8" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            interval={tickInterval}
          />
          <YAxis
            tickFormatter={fmt}
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            formatter={v => v === 'baseline' ? 'Baseline Revenue' : 'Promo Revenue'}
          />
          <Line
            type="monotone"
            dataKey="baseline"
            stroke="#D1C5B0"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#D1C5B0' }}
          />
          <Line
            type="monotone"
            dataKey="promo"
            stroke="#1A1A1A"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#1A1A1A' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
