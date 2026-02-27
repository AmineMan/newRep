import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell
} from 'recharts'
import styles from './RevenueChart.module.css'

function fmt(v) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}M`
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`
  return `$${Math.round(v).toLocaleString()}`
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      {payload.map(p => (
        <div key={p.name} className={styles.tooltipRow}>
          <span className={styles.tooltipDot} style={{ background: p.color }} />
          <span className={styles.tooltipLabel}>{p.name}:</span>
          <span className={styles.tooltipVal}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function RevenueChart({ result }) {
  const data = [
    { name: 'Baseline', value: result.totalBaseline },
    { name: 'With Promo', value: result.totalPromo },
  ]

  return (
    <div className={styles.wrap}>
      <h3 className={styles.chartTitle}>Total Revenue Comparison</h3>
      <p className={styles.chartSub}>Baseline vs projected over {result.days}-day period</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={56} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E1D8" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 13, fontWeight: 600, fill: '#6B7280' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmt} tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={64} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            <Cell fill="#D1C5B0" />
            <Cell fill="#1A1A1A" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
