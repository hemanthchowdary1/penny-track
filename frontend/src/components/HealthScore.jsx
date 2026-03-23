const getColor = (s) => s >= 75 ? "#10b981" : s >= 50 ? "#f59e0b" : "#f43f5e";
const getLabel = (s) => s >= 75 ? "Excellent" : s >= 50 ? "Fair" : "Poor";

export default function HealthScore({ expenses, budget }) {
  const total     = expenses.reduce((s, e) => s + e.amount, 0);
  const budgetNum = parseFloat(budget) || 0;

  let score = 65;

  if (budgetNum > 0) {
    const pct = total / budgetNum;
    if      (pct > 1.2)  score -= 30;
    else if (pct > 1.0)  score -= 18;
    else if (pct > 0.85) score -= 8;
    else                 score += 12;
  }

  if (expenses.length >= 4) {
    const sorted = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));
    const half   = Math.floor(sorted.length / 2);
    const prev   = sorted.slice(0, half).reduce((s, e) => s + e.amount, 0);
    const curr   = sorted.slice(half).reduce((s, e) => s + e.amount, 0);
    if      (curr > prev * 1.25) score -= 15;
    else if (curr > prev)        score -= 5;
    else                         score += 8;
  }

  const cats = new Set(expenses.map((e) => e.category)).size;
  if (cats >= 4) score += 5;
  if (expenses.length > 10) score += 5;

  score = Math.max(10, Math.min(100, Math.round(score)));

  const color  = getColor(score);
  const label  = getLabel(score);
  const radius = 48;
  const circ   = 2 * Math.PI * radius;
  const dash   = (score / 100) * circ;

  const rows = [
    budgetNum > 0 && {
      label: "Budget control",
      good:  total <= budgetNum,
      note:  total <= budgetNum ? "✓ Within limit" : "✗ Over budget",
    },
    expenses.length >= 4 && (() => {
      const sorted = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));
      const h    = Math.floor(sorted.length / 2);
      const prev = sorted.slice(0, h).reduce((s, e) => s + e.amount, 0);
      const curr = sorted.slice(h).reduce((s, e) => s + e.amount, 0);
      return { label: "Spending trend", good: curr <= prev, note: curr <= prev ? "✓ Decreasing" : "↑ Increasing" };
    })(),
    { label: "Category diversity", good: cats >= 3, note: `${cats} categor${cats === 1 ? "y" : "ies"} tracked` },
    { label: "Tracking consistency", good: expenses.length >= 5, note: `${expenses.length} transactions logged` },
  ].filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>

      {/* Gauge */}
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="65" cy="65" r={radius}
          fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform="rotate(-90 65 65)"
          style={{ transition: "stroke-dasharray 1.4s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
        <text x="65" y="60" textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily: "Outfit,sans-serif", fontSize: 26, fontWeight: 800, fill: color }}>
          {score}
        </text>
        <text x="65" y="78" textAnchor="middle"
          style={{ fontFamily: "Outfit,sans-serif", fontSize: 9, fontWeight: 700, fill: "var(--text3)", letterSpacing: "0.1em" }}>
          OUT OF 100
        </text>
      </svg>

      {/* Label */}
      <p style={{ fontSize: 17, fontWeight: 800, color, marginTop: 6 }}>{label}</p>
      <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 2, marginBottom: 18 }}>Financial Health</p>

      {/* Breakdown rows */}
      <div style={{ width: "100%", borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "9px 0",
            borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
          }}>
            <span style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500 }}>{r.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: r.good ? "#10b981" : "#f59e0b", whiteSpace: "nowrap", marginLeft: 12 }}>
              {r.note}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}