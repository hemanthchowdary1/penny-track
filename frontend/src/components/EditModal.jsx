import { useState } from "react";
import { CATS } from "../constants/categories";
import { updateExpense } from "../services/api";

export default function EditModal({ expense, onClose, onSaved }) {
  const [form, setForm] = useState({
    amount: expense.amount, category: expense.category, date: expense.date,
  });

  const save = async () => {
    await updateExpense(expense.id, { ...form, amount: parseFloat(form.amount) });
    onSaved(); onClose();
  };

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card scale-in" style={{ padding: 32, width: 420, maxWidth: "92vw" }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>Edit Expense</h3>

        <label className="flabel">Amount (₹)</label>
        <input className="inp" type="number" value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })} />

        <label className="flabel">Category</label>
        <select className="inp" value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {CATS.map((c) => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
        </select>

        <label className="flabel">Date</label>
        <input className="inp" type="date" value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })} />

        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button className="btn-primary" onClick={save} style={{ flex: 1 }}><span>Save Changes</span></button>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}