// ──────────────────────────────────────────────────────────────────────────────
// Fashion Promo Impact Simulation Engine
// Assumes backend ML models are available; this is a front-end PoC that
// approximates results using price-elasticity demand models.
// ──────────────────────────────────────────────────────────────────────────────

const CATEGORY_DATA = {
  "Women's Denim Slim": {
    baselineDailyRevenue: 5200,
    priceElasticity: 1.8,
    avgUnitPrice: 89,
    volatility: 0.07,
  },
  "Women's Denim Bootcut": {
    baselineDailyRevenue: 3800,
    priceElasticity: 1.6,
    avgUnitPrice: 85,
    volatility: 0.08,
  },
  "Women's Denim Wide Leg": {
    baselineDailyRevenue: 4100,
    priceElasticity: 2.0,
    avgUnitPrice: 92,
    volatility: 0.09,
  },
  "Men's Denim Slim": {
    baselineDailyRevenue: 4500,
    priceElasticity: 1.5,
    avgUnitPrice: 79,
    volatility: 0.06,
  },
  "Men's Denim Regular": {
    baselineDailyRevenue: 3200,
    priceElasticity: 1.4,
    avgUnitPrice: 75,
    volatility: 0.07,
  },
  "Women's Tops": {
    baselineDailyRevenue: 6800,
    priceElasticity: 2.2,
    avgUnitPrice: 45,
    volatility: 0.10,
  },
  "Women's Dresses": {
    baselineDailyRevenue: 7200,
    priceElasticity: 2.4,
    avgUnitPrice: 110,
    volatility: 0.11,
  },
  "Men's Shirts": {
    baselineDailyRevenue: 3900,
    priceElasticity: 1.6,
    avgUnitPrice: 55,
    volatility: 0.07,
  },
  Outerwear: {
    baselineDailyRevenue: 8500,
    priceElasticity: 1.3,
    avgUnitPrice: 180,
    volatility: 0.09,
  },
  Accessories: {
    baselineDailyRevenue: 2800,
    priceElasticity: 2.5,
    avgUnitPrice: 35,
    volatility: 0.12,
  },
};

const PROMO_CONFIG = {
  "10% Off": { discountRate: 0.10, label: "10% Off" },
  "20% Off": { discountRate: 0.20, label: "20% Off" },
  "30% Off": { discountRate: 0.30, label: "30% Off" },
  "40% Off": { discountRate: 0.40, label: "40% Off" },
  "Buy 1 Get 1 50% Off": { discountRate: 0.25, label: "BOGO 50%" },
  "Buy 1 Get 1 Free": { discountRate: 0.50, label: "BOGO Free" },
  "Buy 2 Get 1 Free": { discountRate: 0.333, label: "B2G1 Free" },
};

export const CATEGORY_OPTIONS = Object.keys(CATEGORY_DATA);
export const PROMO_OPTIONS = Object.keys(PROMO_CONFIG);

// Seeded pseudo-random for deterministic noise per (category + date)
function seededRand(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function getDaysBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
}

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d;
}

function formatDate(d) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isWeekend(d) {
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function runSimulation(category, startDate, endDate, promoMechanism) {
  const cat = CATEGORY_DATA[category];
  const promo = PROMO_CONFIG[promoMechanism];
  if (!cat || !promo) return null;

  const d = promo.discountRate;
  const days = getDaysBetween(startDate, endDate);

  // Price-elasticity demand model:
  //   ΔQ% = elasticity × Δp/(1-Δp)   (arc elasticity form)
  //   Revenue multiplier = (1 - d) × (1 + unitUplift)
  const unitUpliftFactor = cat.priceElasticity * (d / (1 - d));
  const revenueMultiplier = (1 - d) * (1 + unitUpliftFactor);

  // Confidence band: ±1.5 × daily volatility, scaled by √days
  const confidencePct = cat.volatility * 1.5 * Math.sqrt(days) * 0.3;

  const dailyData = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    const weekendBoost = isWeekend(date) ? 1.22 : 1.0;
    // Ramp: promo awareness builds mid-week, slight dip on last day
    const ramp = i === 0 ? 0.82 : i === days - 1 ? 0.91 : 1.0;
    // Deterministic noise (seed = day index * category length)
    const noise = 1 + (seededRand(i * category.length + promoMechanism.length) - 0.5) * cat.volatility * 2;

    const baseline = cat.baselineDailyRevenue * weekendBoost * noise;
    const promoRev = baseline * revenueMultiplier * ramp;

    dailyData.push({
      date: formatDate(date),
      baseline: Math.round(baseline),
      promo: Math.round(promoRev),
    });
  }

  const totalBaseline = dailyData.reduce((s, r) => s + r.baseline, 0);
  const totalPromo = dailyData.reduce((s, r) => s + r.promo, 0);
  const totalUplift = totalPromo - totalBaseline;
  const upliftPercent = (totalUplift / totalBaseline) * 100;

  const baselineUnitsTotal = Math.round(totalBaseline / cat.avgUnitPrice);
  const promoUnitsTotal = Math.round(totalPromo / (cat.avgUnitPrice * (1 - d)));

  return {
    // Summary KPIs
    totalBaseline,
    totalPromo,
    totalUplift,
    upliftPercent,
    // Unit metrics
    baselineUnitsTotal,
    promoUnitsTotal,
    unitUpliftPercent: unitUpliftFactor * 100,
    // Pricing
    discountRate: d * 100,
    avgUnitPrice: cat.avgUnitPrice,
    avgPromoPrice: Math.round(cat.avgUnitPrice * (1 - d)),
    // Confidence
    confidenceLow: upliftPercent - confidencePct * 100,
    confidenceHigh: upliftPercent + confidencePct * 100,
    // Time series
    dailyData,
    days,
    category,
    promoMechanism,
    promoLabel: promo.label,
  };
}
