const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function CalendarHeatmap({ expenses }) {
  // Build map: dateStr -> total amount
  const dayMap = {};
  expenses.forEach((e) => {
    dayMap[e.date] = (dayMap[e.date] || 0) + e.amount;
  });

  const maxAmt = Math.max(...Object.values(dayMap), 1);

  // Build last 91 days (13 weeks)
  const today   = new Date();
  const cells   = [];
  const headers = [];
  let lastMonth = null;

  for (let i = 90; i >= 0; i--) {
    const d   = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const amt = dayMap[key] || 0;
    const intensity = amt === 0 ? 0 : Math.max(0.15, amt / maxAmt);

    const month = d.getMonth();
    if (month !== lastMonth && d.getDay() === 0) {
      headers.push({ col: Math.floor((90 - i) / 7), label: MONTHS[month] });
      lastMonth = month;
    }

    cells.push({ key, amt, intensity, day: d.getDay(), week: Math.floor((90 - i) / 7), date: d });
  }

  const weeks = 13;

  return (
    <div>
      {/* Month labels */}
      <div style={{ position: "relative", height: 18, marginBottom: 4, marginLeft: 32 }}>
        {headers.map((h) => (
          <span key={h.col} style={{
            position: "absolute",
            left: h.col * 17,
            fontSize: 10,
            color: "var(--text3)",
            fontWeight: 600,
          }}>
            {h.label}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", gap: 4 }}>
        {/* Day labels */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 0 }}>
          {DAYS.map((d, i) => (
            <div key={d} style={{ height: 12, fontSize: 9, color: "var(--text3)", fontWeight: 600, lineHeight: "12px", width: 26, textAlign: "right" }}>
              {i % 2 === 1 ? d : ""}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: weeks }).map((_, w) => (
            <div key={w} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {Array.from({ length: 7 }).map((_, d) => {
                const cell = cells.find((c) => c.week === w && c.day === d);
                if (!cell) return <div key={d} style={{ width: 12, height: 12 }} />;

                const alpha = cell.intensity;
                const color = alpha === 0
                  ? "rgba(255,255,255,0.05)"
                  : `rgba(139,92,246,${alpha})`;

                return (
                  <div
                    key={d}
                    className="hcell"
                    title={cell.amt > 0 ? `${cell.key}: ₹${cell.amt.toFixed(0)}` : cell.key}
                    style={{ background: color, border: `1px solid rgba(139,92,246,${alpha * 0.5 + 0.05})` }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, justifyContent: "flex-end" }}>
        <span style={{ fontSize: 10, color: "var(--text3)" }}>Less</span>
        {[0, 0.2, 0.4, 0.65, 1].map((a) => (
          <div key={a} className="hcell" style={{
            background: a === 0 ? "rgba(255,255,255,0.05)" : `rgba(139,92,246,${a})`,
          }} />
        ))}
        <span style={{ fontSize: 10, color: "var(--text3)" }}>More</span>
      </div>
    </div>
  );
}