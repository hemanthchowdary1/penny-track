import { Pie, Bar }   from "react-chartjs-2";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  BarElement, CategoryScale, LinearScale,
} from "chart.js";
import StatCard        from "../components/StatCard";
import CalendarHeatmap from "../components/CalendarHeatmap";
import HealthScore     from "../components/HealthScore";
import SpendingHeatmap from "../components/SpendingHeatmap";
import { getCat }      from "../constants/categories";
import useCounter      from "../hooks/useCounter";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Always parse amounts as numbers — fixes ₹NaN everywhere
const safeN = (v) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));
const fmt   = (v) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(safeN(v));
const fmtK  = (v) => safeN(v) >= 1000 ? `${(safeN(v)/1000).toFixed(1)}k` : fmt(v);

export default function Dashboard({ expenses, budget }) {
  // Normalise all amounts to numbers
  const safe = expenses.map((e) => ({ ...e, amount: safeN(e.amount) }));

  const allTotal  = safe.reduce((s, e) => s + e.amount, 0);
  const weekTotal = safe.filter((e) => {
    const diff = (new Date() - new Date(e.date)) / 864e5;
    return diff >= 0 && diff <= 7;
  }).reduce((s, e) => s + e.amount, 0);
  // Use local date string to avoid UTC timezone mismatch (e.g. IST is UTC+5:30)
  const todayStr   = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();
  const todayTotal = safe.filter((e) => e.date === todayStr).reduce((s, e) => s + e.amount, 0);
  const maxSingle = safe.length ? Math.max(...safe.map((e) => e.amount)) : 0;

  const budgetNum = safeN(budget);
  const budgetPct = budgetNum ? Math.min((allTotal / budgetNum) * 100, 100) : 0;

  // Animated counters
  const cTotal = useCounter(Math.round(allTotal));
  const cWeek  = useCounter(Math.round(weekTotal));
  const cToday = useCounter(Math.round(todayTotal));
  const cMax   = useCounter(Math.round(maxSingle));

  // Category totals
  const catTotals = {};
  safe.forEach((e) => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });

  // Monthly (last 6 months)
  const monthMap = {};
  safe.forEach((e) => {
    const k = new Date(e.date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    monthMap[k] = (monthMap[k] || 0) + e.amount;
  });
  const mLabels = Object.keys(monthMap).slice(-6);
  const mVals   = mLabels.map((k) => monthMap[k]);

  // Daily average
  const dailyAvg = (() => {
    if (!safe.length) return 0;
    const oldest = safe.reduce((m, e) => e.date < m ? e.date : m, safe[0].date);
    const days   = Math.max(1, Math.ceil((new Date() - new Date(oldest)) / 864e5));
    return allTotal / days;
  })();

  // Top category
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

  // Trend
  const trend = (() => {
    if (safe.length < 4) return null;
    const sorted = [...safe].sort((a, b) => new Date(a.date) - new Date(b.date));
    const h = Math.floor(sorted.length / 2);
    const p = sorted.slice(0, h).reduce((s, e) => s + e.amount, 0);
    const c = sorted.slice(h).reduce((s, e) => s + e.amount, 0);
    if (!p) return null;
    const d = ((c - p) / p * 100).toFixed(0);
    return c > p
      ? { msg: `📈 Up ${d}% vs prior period`,            color: "var(--rose)"    }
      : { msg: `📉 Down ${Math.abs(d)}% vs prior period`, color: "var(--emerald)" };
  })();

  // Chart data
  const pieData = {
    labels: Object.keys(catTotals),
    datasets: [{
      data: Object.values(catTotals),
      backgroundColor: Object.keys(catTotals).map((n) => getCat(n).color + "bb"),
      borderColor:     Object.keys(catTotals).map((n) => getCat(n).color),
      borderWidth: 2,
    }],
  };

  const barData = {
    labels: mLabels,
    datasets: [{
      label: "₹ Spent",
      data: mVals,
      backgroundColor: "rgba(139,92,246,0.45)",
      borderColor: "#8b5cf6",
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const pieOpts = {
    plugins: {
      legend: {
        labels: {
          color: "#8892b0",
          font: { family: "Outfit", size: 13 },
          padding: 18,
          usePointStyle: true,   // circles instead of checkbox squares
          pointStyle: "circle",
          boxWidth: 8,
          boxHeight: 8,
        },
      },
    },
  };
  const barOpts = {
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: "#4a5580", font: { family: "Outfit", size: 12 } }, grid: { color: "rgba(255,255,255,0.03)" } },
      y: { ticks: { color: "#4a5580", font: { family: "Outfit", size: 12 }, callback: (v) => "₹" + fmtK(v) }, grid: { color: "rgba(255,255,255,0.03)" } },
    },
  };

  if (!safe.length) return (
    <div className="card" style={{ padding: 80, textAlign: "center", color: "var(--text3)" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
      <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text2)" }}>No expenses yet</p>
      <p style={{ fontSize: 15, marginTop: 8 }}>Add your first expense to see your dashboard</p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Stat Cards ── */}
      <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        <StatCard icon="💳" label="Total Spent" value={`₹${fmt(cTotal)}`} sub={`${safe.length} transactions`} accent="#8b5cf6" />
        <StatCard icon="📆" label="This Week"   value={`₹${fmt(cWeek)}`}  sub="last 7 days"                  accent="#06b6d4" />
        <StatCard icon="📅" label="Today"       value={`₹${fmt(cToday)}`} sub="spent today"                  accent="#10b981" />
        <StatCard icon="🔺" label="Largest"     value={`₹${fmt(cMax)}`}   sub="max transaction"              accent="#f59e0b" />
      </div>

      {/* ── Budget bar ── */}
      {budgetNum > 0 && (
        <div className="card" style={{ padding: "18px 24px", display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontSize: 14, color: "var(--text2)", fontWeight: 600, whiteSpace: "nowrap" }}>Monthly Budget</span>
          <div style={{ flex: 1 }}>
            <div className="prog">
              <div className="prog-fill" style={{
                width: `${budgetPct}%`,
                background: budgetPct > 85 ? "linear-gradient(90deg,#f43f5e,#e11d48)" : budgetPct > 65 ? "linear-gradient(90deg,#f59e0b,#d97706)" : "linear-gradient(90deg,#10b981,#059669)",
              }} />
            </div>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", color: budgetPct > 85 ? "var(--rose)" : budgetPct > 65 ? "var(--amber)" : "var(--emerald)" }}>
            ₹{fmt(allTotal)} / ₹{fmt(budgetNum)}
          </span>
          {allTotal > budgetNum && (
            <span style={{ fontSize: 12, background: "rgba(244,63,94,0.15)", color: "var(--rose)", padding: "4px 12px", borderRadius: 20, fontWeight: 700 }}>OVER</span>
          )}
        </div>
      )}

      {/* ── Health Score + Pie + Category bars ── */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 28 }}>
          <p className="slabel">Health Score</p>
          <HealthScore expenses={safe} budget={budget} />
        </div>
        <div className="card" style={{ padding: 28 }}>
          <p className="slabel">By Category</p>
          <Pie data={pieData} options={pieOpts} />
        </div>
        <div className="card" style={{ padding: 28 }}>
          <p className="slabel">Category Breakdown</p>
          {Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([name, amt]) => {
            const cat = getCat(name);
            const pct = allTotal > 0 ? (amt / allTotal) * 100 : 0;
            return (
              <div key={name} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}>
                    <span style={{ fontSize: 17 }}>{cat.icon}</span>{name}
                  </span>
                  <span style={{ color: cat.color, fontWeight: 700, fontSize: 13 }}>
                    ₹{fmt(amt)} <span style={{ color: "var(--text3)", fontWeight: 400 }}>({pct.toFixed(0)}%)</span>
                  </span>
                </div>
                <div className="prog">
                  <div className="prog-fill" style={{ width: `${pct}%`, background: cat.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Monthly bar + Day heatmap ── */}
      {mLabels.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
          <div className="card" style={{ padding: 28 }}>
            <p className="slabel">Monthly Trend</p>
            <Bar data={barData} options={barOpts} />
          </div>
          <div className="card" style={{ padding: 28 }}>
            <p className="slabel">Spending by Day of Week</p>
            <SpendingHeatmap expenses={safe} />
          </div>
        </div>
      )}

      {/* ── Calendar heatmap ── */}
      <div className="card" style={{ padding: 28 }}>
        <p className="slabel">Spending Calendar — Last 13 Weeks</p>
        <CalendarHeatmap expenses={safe} />
      </div>

      {/* ── Smart Insights row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {topCat && (() => {
          const cat = getCat(topCat[0]);
          const pct = allTotal > 0 ? ((topCat[1] / allTotal) * 100).toFixed(0) : 0;
          return (
            <div className="card" style={{ padding: "20px 22px", borderLeft: `3px solid ${cat.color}` }}>
              <p style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Top Category</p>
              <p style={{ fontSize: 17, fontWeight: 700 }}>{cat.icon} {topCat[0]}</p>
              <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 5 }}>₹{fmt(topCat[1])} · {pct}% of total</p>
            </div>
          );
        })()}
        {trend ? (
          <div className="card" style={{ padding: "20px 22px", borderLeft: `3px solid ${trend.color}` }}>
            <p style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Trend</p>
            <p style={{ fontSize: 15, fontWeight: 700 }}>{trend.msg}</p>
          </div>
        ) : (
          <div className="card" style={{ padding: "20px 22px", borderLeft: "3px solid var(--text3)" }}>
            <p style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Trend</p>
            <p style={{ fontSize: 14, color: "var(--text2)" }}>Add more expenses to see trends</p>
          </div>
        )}
        <div className="card" style={{ padding: "20px 22px", borderLeft: "3px solid var(--cyan)" }}>
          <p style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Daily Average</p>
          <p style={{ fontSize: 20, fontWeight: 700 }}>₹{fmt(dailyAvg)}</p>
          <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 5 }}>per day spending</p>
        </div>
      </div>

    </div>
  );
}
