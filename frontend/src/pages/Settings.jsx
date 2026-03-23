const safeN = (v) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));
const fmt   = (v) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(safeN(v));

export default function Settings({ expenses, budget, setBudget, apiKey, setApiKey }) {
  const allTotal = expenses.reduce((s, e) => s + safeN(e.amount), 0);
  const cats     = new Set(expenses.map((e) => e.category)).size;
  const topCat   = (() => {
    const t = {};
    expenses.forEach((e) => { t[e.category] = (t[e.category] || 0) + safeN(e.amount); });
    const e = Object.entries(t).sort((a, b) => b[1] - a[1])[0];
    return e ? e[0] : "—";
  })();

  return (
    <div className="fade-up" style={{ maxWidth: 580 }}>

      {/* Budget */}
      <div className="card" style={{ padding: 32, marginBottom: 18 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Monthly Budget</h3>
        <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 22 }}>
          Set a spending limit — a health bar will appear on your dashboard
        </p>
        <label className="flabel">Budget Amount (₹)</label>
        <input className="inp" type="number" placeholder="e.g. 20000"
          value={budget} onChange={(e) => setBudget(e.target.value)} />
      </div>

      {/* AI Key */}
      <div className="card" style={{ padding: 32, marginBottom: 18 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>AI Insights</h3>
        <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 22 }}>
          Add your free Groq API key to unlock AI-powered spending analysis
        </p>
        <label className="flabel">Groq API Key</label>
        <input className="inp" type="password" placeholder="gsk_..."
          value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
        <div style={{ padding: "14px 16px", borderRadius: 11, background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.2)" }}>
          <p style={{ fontSize: 13, color: "#67e8f9", lineHeight: 1.7 }}>
            🔑 Get your <strong>free</strong> key at <strong>console.groq.com</strong> → API Keys → Create key.
            No credit card needed. Stored only in your browser.
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
        <StatBox label="Total Transactions" value={String(expenses.length)} />
        <StatBox label="All-Time Spent"     value={`₹${fmt(allTotal)}`}    accent="#8b5cf6" />
        <StatBox label="Top Category"       value={topCat}                 accent="#f59e0b" />
        <StatBox label="Categories Used"    value={String(cats)}           />
      </div>
    </div>
  );
}

function StatBox({ label, value, accent }) {
  return (
    <div className="card" style={{ padding: "20px 24px" }}>
      <p style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 800, color: accent || "var(--text1)" }}>{value}</p>
    </div>
  );
}