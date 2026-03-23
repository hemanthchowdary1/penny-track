import { useState } from "react";

export const AVATARS = [
  { id: 1,  bg: "#7c3aed", emoji: "🦁" },
  { id: 2,  bg: "#0e7490", emoji: "🐯" },
  { id: 3,  bg: "#b45309", emoji: "🦊" },
  { id: 4,  bg: "#047857", emoji: "🐸" },
  { id: 5,  bg: "#be123c", emoji: "🦄" },
  { id: 6,  bg: "#7e22ce", emoji: "🐼" },
  { id: 7,  bg: "#c2410c", emoji: "🐺" },
  { id: 8,  bg: "#1d4ed8", emoji: "🦋" },
  { id: 9,  bg: "#0f766e", emoji: "🐉" },
  { id: 10, bg: "#9f1239", emoji: "🦅" },
  { id: 11, bg: "#6d28d9", emoji: "🦚" },
  { id: 12, bg: "#92400e", emoji: "🐻" },
];

const safeN = (v) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));
const fmt   = (v) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(safeN(v));

export default function ProfileModal({ user, expenses, onClose, onLogout, onAvatarChange, currentAvatarId }) {
  const [picking,  setPicking]  = useState(false);
  const [selected, setSelected] = useState(currentAvatarId || 1);

  const avatar   = AVATARS.find((a) => a.id === selected) || AVATARS[0];
  const allTotal = expenses.reduce((s, e) => s + safeN(e.amount), 0);
  const cats     = new Set(expenses.map((e) => e.category)).size;
  const topCat   = (() => {
    const t = {};
    expenses.forEach((e) => { t[e.category] = (t[e.category] || 0) + safeN(e.amount); });
    const top = Object.entries(t).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : "—";
  })();

  const handlePick = (id) => {
    setSelected(id);
    onAvatarChange(id);
    setTimeout(() => setPicking(false), 250);
  };

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="scale-in" style={{
        width: picking ? 500 : 380,
        maxWidth: "94vw",
        background: "rgba(8,12,30,0.97)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24,
        overflow: "hidden",
        transition: "width 0.3s ease",
      }}>

        {/* ── Top section: avatar + name ── */}
        <div style={{
          padding: "36px 32px 28px",
          background: "linear-gradient(160deg, rgba(139,92,246,0.18) 0%, rgba(6,182,212,0.08) 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          textAlign: "center",
        }}>
          {/* Avatar circle */}
          <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: avatar.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36,
              boxShadow: `0 0 0 3px rgba(255,255,255,0.08), 0 0 24px ${avatar.bg}55`,
              margin: "0 auto",
            }}>
              {avatar.emoji}
            </div>
            {/* Edit button */}
            <button
              onClick={() => setPicking(!picking)}
              style={{
                position: "absolute", bottom: -2, right: -2,
                width: 26, height: 26, borderRadius: "50%",
                background: "#8b5cf6", border: "2px solid #02040f",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 12,
              }}
            >
              ✏️
            </button>
          </div>

          {/* Username */}
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#eef2ff", marginBottom: 4 }}>
            {user?.username}
          </h2>
          <p style={{ fontSize: 12, color: "var(--text3)", fontWeight: 600 }}>
            PennyTrack Member
          </p>
        </div>

        {/* ── Avatar picker (slides open) ── */}
        {picking && (
          <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(139,92,246,0.05)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
              Choose Avatar
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10 }}>
              {AVATARS.map((a) => (
                <div
                  key={a.id}
                  onClick={() => handlePick(a.id)}
                  style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: a.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, cursor: "pointer",
                    outline: selected === a.id ? `3px solid #8b5cf6` : "3px solid transparent",
                    outlineOffset: 2,
                    transform: selected === a.id ? "scale(1.12)" : "scale(1)",
                    transition: "all 0.15s",
                    boxShadow: selected === a.id ? `0 0 14px ${a.bg}99` : "none",
                  }}
                >
                  {a.emoji}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Stats ── */}
        <div style={{ padding: "22px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
            Your Stats
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {[
              { label: "Total Spent",  value: `₹${fmt(allTotal)}`, color: "#8b5cf6" },
              { label: "Transactions", value: expenses.length,      color: "#06b6d4" },
              { label: "Categories",   value: cats,                 color: "#10b981" },
            ].map((s) => (
              <div key={s.label} style={{
                padding: "14px 10px", borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                textAlign: "center",
              }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</p>
                <p style={{ fontSize: 10, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {topCat !== "—" && (
            <div style={{ marginTop: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 600 }}>Top spending category</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>{topCat}</span>
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div style={{ padding: "18px 28px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={onClose} style={{
            width: "100%", padding: "13px", borderRadius: 12,
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--text2)", cursor: "pointer", fontFamily: "Outfit,sans-serif",
            fontSize: 14, fontWeight: 600, transition: "all 0.2s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text1)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text2)"}
          >
            Close
          </button>
          <button onClick={onLogout} style={{
            width: "100%", padding: "13px", borderRadius: 12,
            background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)",
            color: "#f43f5e", cursor: "pointer", fontFamily: "Outfit,sans-serif",
            fontSize: 14, fontWeight: 700, transition: "all 0.2s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(244,63,94,0.15)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(244,63,94,0.08)"}
          >
            🚪 Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}