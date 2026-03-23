export default function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="stat-card">
      <div className="corner" style={{ background: `${accent}18` }} />
      <div className="s-icon">{icon}</div>
      <div className="s-label">{label}</div>
      <div className="s-value" style={{ color: accent }}>{value}</div>
      {sub && <div className="s-sub">{sub}</div>}
    </div>
  );
}