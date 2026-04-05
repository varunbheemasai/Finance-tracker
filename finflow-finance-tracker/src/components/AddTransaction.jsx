import React, { useState } from "react";
import { useFinance } from "../context/FinanceContext";
import { CATEGORIES } from "../data/transactions";
import "./AddTransaction.css";

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export default function AddTransaction({ onClose, onSuccess, mode = "add", initial }) {
  const { dispatch } = useFinance();

  const [form, setForm] = useState({
    id: initial?.id || null,
    desc: initial?.desc || "",
    amount: initial?.amount ?? "",
    type: initial?.type || "expense",
    category: initial?.category || "food",
    date: initial?.date || todayISO(),
  });

  const [error, setError] = useState("");

  // shorthand setter
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit() {
    // basic validation
    if (!form.desc.trim()) {
      setError("Description is required.");
      return;
    }
    if (!form.amount || +form.amount <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (!form.date) {
      setError("Date is required.");
      return;
    }

    const payload = {
      id: form.id || Date.now(),
      desc: form.desc.trim(),
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category,
      date: form.date,
    };

    if (mode === "edit") {
      dispatch({ type: "UPDATE_TRANSACTION", payload });
      if (onSuccess) onSuccess("Transaction updated");
    } else {
      dispatch({ type: "ADD_TRANSACTION", payload });
      if (onSuccess) onSuccess("Transaction added");
    }
    if (onClose) onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3>{mode === "edit" ? "Edit Transaction" : "Add Transaction"}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">X</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="form-group">
          <label>Description</label>
          <input
            className="form-input"
            placeholder="e.g. Grocery run"
            value={form.desc}
            onChange={(e) => set("desc", e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Amount (INR)</label>
            <input
              className="form-input"
              type="number"
              min="0"
              placeholder="0"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select className="form-select" value={form.type} onChange={(e) => set("type", e.target.value)}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select className="form-select" value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              className="form-input"
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary-modal" onClick={submit}>
            {mode === "edit" ? "Save Changes" : "Add Transaction"}
          </button>
        </div>
      </div>
    </div>
  );
}
