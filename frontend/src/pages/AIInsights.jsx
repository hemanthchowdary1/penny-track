import { useState } from "react";

const fmt = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

function buildPrompt(expenses) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const catTotals = {};
  expenses.forEach((e) => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });

  const monthMap = {};
  expenses.forEach((e) => {
    const k = new Date(e.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    monthMap[k] = (monthMap[k] || 0) + e.amount;
  });

  return `You are a personal finance advisor. Analyze this user's expense data and give practical, specific advice.

EXPENSE SUMMARY:
- Total spent: ₹${fmt(total)}
- Number of transactions: ${expenses.length}
- Date range: ${expenses[0]?.date || "N/A"} to ${expenses[expenses.length - 1]?.date || "N/A"}

CATEGORY BREAKDOWN:
${Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`  - ${k}: ₹${fmt(v)} (${((v/total)*100).toFixed(1)}%)`).join("\n")}

MONTHLY BREAKDOWN:
${Object.entries(monthMap).map(([k,v])=>`  - ${k}: ₹${fmt(v)}`).join("\n")}

Please respond with a JSON object (no markdown, no backticks) in this exact format:
{
  "summary": "2-3 sentence overall spending summary",
  "insights": [
    { "type": "warning|tip|positive|forecast", "title": "short title", "body": "detailed insight in 1-2 sentences" }
  ],
  "forecast": "predicted spending next month based on trends (just a number, no ₹ sign)",
  "score": "a financial health score from 1-100 as a number",
  "scoreLabel": "one word label: Excellent|Good|Fair|Poor"
}

Give exactly 4 insights. Be specific with numbers. Be direct and conversational.`;
}

export default function AIInsights({ expenses, apiKey }) {
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const analyze = async () => {
    if (!apiKey) { setError("Add your Groq API key in Settings first."); return; }
    if (expenses.length < 3) { setError("Add at least 3 expenses for a meaningful analysis."); return; }

    setLoading(true); setError(null); setResult(null);

    try {
      // Gemini API endpoint
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: buildPrompt(expenses) }],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const text  = data.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error("Empty response from Groq");

      const clean  = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);

    } catch (e) {
      setError(`Analysis failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const typeStyle = {
    warning:  { bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)",  label: "⚠️ Watch Out", color: "#f59e0b" },
    tip:      { bg: "rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.3)",   label: "💡 Tip",        color: "#06b6d4" },
    positive: { bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.3)",  label: "✅ Good Job",   color: "#10b981" },
    forecast: { bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.3)",  label: "🔮 Forecast",  color: "#8b5cf6" },
  };

  const scoreColor = (s) => s >= 75 ? "#10b981" : s >= 50 ? "#f59e0b" : "#f43f5e";

  return (
    <div>

      {/* Trigger card */}
      {!result && !loading && (
        <div className="card fade-up" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>✨</div>
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Analyze My Spending</h3>
          <p style={{ fontSize: 15, color: "var(--text2)", maxWidth: 420, margin: "0 auto 28px", lineHeight: 1.6 }}>
            Groq will analyze your {expenses.length} transaction{expenses.length !== 1 ? "s" : ""} and give you
            personalised insights, a health score, and a forecast.
          </p>
          <button className="btn-primary" onClick={analyze} style={{ maxWidth: 280, margin: "0 auto" }}>
            <span>✨ Generate AI Analysis</span>
          </button>
          {error && (
            <p style={{ color: "var(--rose)", fontSize: 14, marginTop: 18, fontWeight: 600 }}>{error}</p>
          )}

          {/* How to get key hint */}
          {!apiKey && (
            <div style={{ marginTop: 24, padding: "14px 20px", borderRadius: 12, background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.2)", maxWidth: 420, margin: "24px auto 0" }}>
              <p style={{ fontSize: 13, color: "#67e8f9", lineHeight: 1.7 }}>
                🔑 No API key found. Go to <strong>Settings</strong> and paste your free Groq key.<br />
                Get one free at <strong>console.groq.com</strong> → API Keys → Create key
              </p>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="card" style={{ padding: 56, textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "3px solid var(--border)", borderTopColor: "var(--violet)", borderRadius: "50%", margin: "0 auto 20px", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Groq is analyzing your finances…</p>
          <p style={{ fontSize: 14, color: "var(--text2)" }}>Reading {expenses.length} transactions</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Row 1: Score + Summary + Forecast in one horizontal bar */}
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 220px", gap: 16, alignItems: "stretch" }}>

            {/* Score circle */}
            <div className="card" style={{ padding: "28px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <svg width="120" height="120" viewBox="0 0 120 120" style={{ marginBottom: 14 }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none"
                  stroke={scoreColor(result.score)} strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(result.score / 100) * (2 * Math.PI * 50)} ${2 * Math.PI * 50}`}
                  transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dasharray 1.4s ease", filter: `drop-shadow(0 0 8px ${scoreColor(result.score)}88)` }}
                />
                <text x="60" y="55" textAnchor="middle" dominantBaseline="middle"
                  style={{ fontFamily: "Outfit,sans-serif", fontSize: 28, fontWeight: 900, fill: scoreColor(result.score) }}>
                  {result.score}
                </text>
                <text x="60" y="74" textAnchor="middle"
                  style={{ fontFamily: "Outfit,sans-serif", fontSize: 9, fontWeight: 700, fill: "var(--text3)", letterSpacing: "0.1em" }}>
                  OUT OF 100
                </text>
              </svg>
              <p style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Health Score</p>
              <p style={{ fontSize: 18, fontWeight: 900, color: scoreColor(result.score) }}>{result.scoreLabel}</p>
            </div>

            {/* Summary */}
            <div className="card" style={{ padding: 28, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p className="slabel">AI Summary</p>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--text1)" }}>{result.summary}</p>
            </div>

            {/* Forecast */}
            <div className="card" style={{ padding: 28, background: "rgba(139,92,246,0.08)", borderColor: "rgba(139,92,246,0.3)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p className="slabel">Next Month</p>
              <p style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8 }}>Predicted spend</p>
              <p style={{ fontSize: 32, fontWeight: 900, color: "#c4b5fd", letterSpacing: "-0.02em" }}>
                ₹{new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(result.forecast)}
              </p>
              <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 8, lineHeight: 1.5 }}>Based on your current spending trends</p>
            </div>
          </div>

          {/* Row 2: 4 insight cards in a 2x2 grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {result.insights?.map((ins, i) => {
              const s = typeStyle[ins.type] || typeStyle.tip;
              return (
                <div key={i} style={{
                  padding: "22px 24px", borderRadius: 16,
                  background: s.bg, border: `1px solid ${s.border}`,
                  position: "relative", overflow: "hidden",
                }}>
                  {/* Left accent bar */}
                  <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: s.color, borderRadius: "2px 0 0 2px" }} />
                  {/* Type label */}
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                    <p style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</p>
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--text1)" }}>{ins.title}</p>
                  <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>{ins.body}</p>
                </div>
              );
            })}
          </div>

          {/* Re-analyze */}
          <div style={{ textAlign: "center", paddingTop: 4 }}>
            <button className="btn-ghost" onClick={() => { setResult(null); setError(null); }}>
              🔄 Run New Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}