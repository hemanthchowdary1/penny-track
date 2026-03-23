const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SpendingHeatmap({ expenses }) {
  // Group by day-of-week
  const dayTotals   = Array(7).fill(0);
  const dayCounts   = Array(7).fill(0);

  expenses.forEach((e) => {
    const dow = new Date(e.date).getDay();
    dayTotals[dow] += e.amount;
    dayCounts[dow] += 1;
  });

  const maxAmt = Math.max(...dayTotals, 1);

  // Top spending day
  const topDayIdx = dayTotals.indexOf(Math.max(...dayTotals));

  const fmt = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

  return (
    <div>
      {/* Bar-style heatmap by day */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 90, marginBottom: 10 }}>
        {DAYS.map((day, i) => {
          const pct       = dayTotals[i] / maxAmt;
          const isTop     = i === topDayIdx && dayTotals[i] > 0;
          const barHeight = Math.max(pct * 75, dayTotals[i] > 0 ? 6 : 2);

          return (
            <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              {/* Amount on hover via title */}
              <div
                title={`${day}: ₹${fmt(dayTotals[i])} (${dayCounts[i]} transactions)`}
                style={{
                  width: "100%",
                  height: barHeight,
                  borderRadius: 4,
                  background: isTop
                    ? "linear-gradient(180deg, #c4b5fd, #8b5cf6)"
                    : dayTotals[i] > 0
                    ? `rgba(139,92,246,${0.2 + pct * 0.7})`
                    : "rgba(255,255,255,0.05)",
                  border: isTop ? "1px solid rgba(139,92,246,0.6)" : "1px solid rgba(255,255,255,0.06)",
                  transition: "all 0.3s",
                  cursor: "pointer",
                  boxShadow: isTop ? "0 0 12px rgba(139,92,246,0.4)" : "none",
                  alignSelf: "flex-end",
                }}
              />
              <span style={{
                fontSize: 10, fontWeight: isTop ? 700 : 500,
                color: isTop ? "#c4b5fd" : "var(--text3)",
              }}>
                {day.slice(0, 3)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        {dayTotals[topDayIdx] > 0 && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
            background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd",
          }}>
            🔥 Most spent: {DAYS[topDayIdx]}
          </span>
        )}
        {(() => {
          const weekend  = dayTotals[0] + dayTotals[6];
          const weekday  = dayTotals.slice(1, 6).reduce((a, b) => a + b, 0);
          if (weekend === 0 && weekday === 0) return null;
          const moreWeekend = weekend / 2 > weekday / 5;
          return (
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
              background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", color: "#67e8f9",
            }}>
              {moreWeekend ? "🛍️ Weekend spender" : "📅 Weekday spender"}
            </span>
          );
        })()}
      </div>
    </div>
  );
}