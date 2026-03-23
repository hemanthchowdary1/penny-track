import { useState, useEffect } from "react";
import { createExpense } from "../services/api";
import { CATS }          from "../constants/categories";

const QUICK = [50, 100, 200, 500, 1000, 2000];

// Uses LOCAL date instead of UTC — fixes the IST/timezone bug where
// new Date().toISOString() returns yesterday's date in India after midnight UTC
const localDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function AddExpense({ onRefresh, onToast, onDone }) {
  const [form, setForm] = useState({ amount: "", category: "Food" });

  // Press Enter to add
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Enter" && e.target.tagName === "INPUT") handleAdd();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const handleAdd = async () => {
    if (!form.amount || isNaN(parseFloat(form.amount))) {
      onToast("⚠️ Enter a valid amount"); return;
    }
    await createExpense({
      amount:   parseFloat(form.amount),
      category: form.category,
      date:     localDate(),
    });
    setForm({ amount: "", category: "Food" });
    onRefresh();
    onToast("✅ Expense added!");
    onDone();
  };

  const selected = CATS.find((c) => c.name === form.category) || CATS[0];

  return (
    <div className="fade-up" style={{ maxWidth: 560 }}>
      <div className="card" style={{ padding: 36 }}>

        {/* Amount */}
        <label className="flabel">Amount (₹)</label>
        <input
          className="inp"
          type="number"
          placeholder="0.00"
          value={form.amount}
          autoFocus
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />

        {/* Quick amounts */}
        <label className="flabel">Quick Amounts</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => setForm({ ...form, amount: String(q) })}
              style={{
                padding: "8px 16px", borderRadius: 20,
                background: parseFloat(form.amount) === q ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${parseFloat(form.amount) === q ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
                color: parseFloat(form.amount) === q ? "#c4b5fd" : "var(--text2)",
                cursor: "pointer", fontFamily: "Outfit, sans-serif",
                fontSize: 14, fontWeight: 600, transition: "all 0.2s",
              }}
            >
              ₹{q.toLocaleString("en-IN")}
            </button>
          ))}
        </div>

        {/* Category */}
        <label className="flabel">Category</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {CATS.map((c) => (
            <button
              key={c.name}
              onClick={() => setForm({ ...form, category: c.name })}
              style={{
                padding: "10px 16px", borderRadius: 22, cursor: "pointer",
                fontSize: 14, fontWeight: 600, fontFamily: "Outfit, sans-serif",
                background: form.category === c.name ? `${c.color}22` : "rgba(255,255,255,0.04)",
                border: `1px solid ${form.category === c.name ? c.color + "55" : "rgba(255,255,255,0.07)"}`,
                color:  form.category === c.name ? c.color : "var(--text3)",
                transition: "all 0.2s",
                transform: form.category === c.name ? "scale(1.05)" : "scale(1)",
              }}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {/* Preview */}
        {form.amount && (
          <div style={{
            padding: "16px 20px", borderRadius: 13, marginBottom: 20,
            background: `${selected.color}10`, border: `1px solid ${selected.color}25`,
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <span style={{ fontSize: 26 }}>{selected.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: "var(--text3)", fontWeight: 600 }}>Adding to</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: selected.color }}>{selected.name}</p>
            </div>
            <span style={{ fontSize: 24, fontWeight: 800, color: "var(--text1)" }}>
              ₹{parseFloat(form.amount || 0).toLocaleString("en-IN")}
            </span>
          </div>
        )}

        <button className="btn-primary" onClick={handleAdd}>
          <span>➕ Add Expense</span>
        </button>

        <p style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "var(--text3)" }}>
          Press <kbd style={{ background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: 5, fontSize: 12, border: "1px solid var(--border)" }}>Enter</kbd> to add quickly
        </p>
      </div>
    </div>
  );
}