import { useState } from "react";
import { deleteExpense } from "../services/api";
import { getCat }        from "../constants/categories";
import EditModal         from "../components/EditModal";

const safeN = (v) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));
const fmt   = (v) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(safeN(v));

const FILTERS = [
  { key: "all",   label: "All Time"   },
  { key: "today", label: "Today"      },
  { key: "week",  label: "This Week"  },
  { key: "month", label: "This Month" },
];

export default function ExpenseList({ expenses, onRefresh, onToast }) {
  const [filter,     setFilter]     = useState("all");
  const [search,     setSearch]     = useState("");
  const [editTarget, setEditTarget] = useState(null);

  const todayStr = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();

  const filterFn = (e) => {
    const d = new Date(e.date);
    if (filter === "today") return e.date === todayStr;
    if (filter === "week")  return (new Date() - d) / 864e5 <= 7 && (new Date() - d) / 864e5 >= 0;
    if (filter === "month") return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
    return true;
  };

  const list = expenses
    .filter(filterFn)
    .filter((e) =>
      search === "" ||
      e.category.toLowerCase().includes(search.toLowerCase()) ||
      String(e.amount).includes(search)
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const total = list.reduce((s, e) => s + safeN(e.amount), 0);

  const handleDelete = async (id) => {
    await deleteExpense(id);
    onRefresh();
    onToast("🗑️ Expense deleted");
  };

  return (
    <div className="fade-up">
      {editTarget && (
        <EditModal
          expense={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { onRefresh(); onToast("✏️ Expense updated!"); }}
        />
      )}

      {/* Filters + Search */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {FILTERS.map((f) => (
          <button key={f.key} className={`chip ${filter === f.key ? "active" : ""}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
        <input
          className="inp"
          placeholder="🔍 Search by category or amount…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ margin: 0, flex: 1, minWidth: 200 }}
        />
      </div>

      {/* Summary */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, padding: "0 4px" }}>
        <span style={{ fontSize: 14, color: "var(--text3)" }}>
          {list.length} result{list.length !== 1 ? "s" : ""}
        </span>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#c4b5fd" }}>
          Total: ₹{fmt(total)}
        </span>
      </div>

      {/* List */}
      <div className="card" style={{ padding: 16 }}>
        {list.length === 0 ? (
          <div style={{ textAlign: "center", padding: 56, color: "var(--text3)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text2)" }}>No expenses found</p>
          </div>
        ) : (
          list.map((e) => {
            const cat = getCat(e.category);
            return (
              <div key={e.id} className="expense-row">
                {/* Left: icon + info */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 12, fontSize: 20,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: `${cat.color}1a`, border: `1px solid ${cat.color}35`, flexShrink: 0,
                  }}>
                    {cat.icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 17 }}>₹{fmt(safeN(e.amount))}</p>
                    <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 3 }}>
                      <span className="badge" style={{ background: `${cat.color}18`, color: cat.color, marginRight: 8 }}>
                        {e.category}
                      </span>
                      {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* Right: action buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                  <button className="btn-edit" onClick={() => setEditTarget(e)}>
                    ✏️ Edit
                  </button>
                  <button className="btn-del" onClick={() => handleDelete(e.id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}