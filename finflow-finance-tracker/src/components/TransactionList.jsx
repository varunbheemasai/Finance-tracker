import React, { useState, useMemo, useEffect } from "react";
import { useFinance } from "../context/FinanceContext";
import { CAT_COLORS, CAT_EMOJI, CATEGORIES } from "../data/transactions";
import { fmt, formatDate } from "../utils/finance";
import AddTransaction from "./AddTransaction";
import "./TransactionList.css";

const PAGE_SIZE = 8;

// download helper - same pattern as sidebar backup
function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toCSV(rows) {
  const headers = ["id", "date", "desc", "category", "type", "amount"];
  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const body = rows.map((r) =>
    [r.id, r.date, r.desc, r.category, r.type, r.amount].map(escape).join(",")
  );
  return [headers.join(","), ...body].join("\n");
}

// handles "2,000" or "$500" style inputs in the search box
function parseMaybeNumber(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/[^0-9.-]/g, "");
  if (!normalized) return null;
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

export default function TransactionList({ transactions, showAdd, onToast, selectedCategory }) {
  const { dispatch, state } = useFinance();

  // filter state
  const [search, setSearch] = useState("");
  const [typeF, setTypeF] = useState("all");
  const [catF, setCatF] = useState("all");
  const [sortF, setSortF] = useState("date-desc");
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amtMin, setAmtMin] = useState("");
  const [amtMax, setAmtMax] = useState("");

  const [editingTx, setEditingTx] = useState(null);
  const [lastDeleted, setLastDeleted] = useState(null);

  // sync category filter when clicked from charts
  useEffect(() => {
    if (selectedCategory !== undefined) {
      setCatF(selectedCategory === null ? "all" : selectedCategory);
      setPage(1);
    }
  }, [selectedCategory]);

  const filtered = useMemo(() => {
    let list = [...transactions];

    if (typeF !== "all") list = list.filter((t) => t.type === typeF);
    if (catF !== "all") list = list.filter((t) => t.category === catF);

    if (search) {
      const term = search.toLowerCase();
      const maybeAmount = parseMaybeNumber(search);
      list = list.filter((t) => {
        return t.desc.toLowerCase().includes(term) ||
          (maybeAmount !== null && t.amount === maybeAmount);
      });
    }

    if (dateFrom) list = list.filter((t) => t.date >= dateFrom);
    if (dateTo) list = list.filter((t) => t.date <= dateTo);
    if (amtMin) list = list.filter((t) => t.amount >= Number(amtMin));
    if (amtMax) list = list.filter((t) => t.amount <= Number(amtMax));

    list.sort((a, b) => {
      if (sortF === "date-desc") return new Date(b.date) - new Date(a.date);
      if (sortF === "date-asc") return new Date(a.date) - new Date(b.date);
      if (sortF === "amount-desc") return b.amount - a.amount;
      if (sortF === "amount-asc") return a.amount - b.amount;
      return 0;
    });

    return list;
  }, [transactions, search, typeF, catF, sortF, dateFrom, dateTo, amtMin, amtMax]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleDelete(tx) {
    if (state.role !== "admin") return;
    dispatch({ type: "DELETE_TRANSACTION", payload: tx.id });
    setLastDeleted(tx);
    if (onToast) onToast("Transaction deleted");
  }

  function handleUndoDelete() {
    if (!lastDeleted) return;
    dispatch({ type: "ADD_TRANSACTION", payload: lastDeleted });
    setLastDeleted(null);
    if (onToast) onToast("Delete undone");
  }

  function clearFilters() {
    setSearch("");
    setTypeF("all");
    setCatF("all");
    setSortF("date-desc");
    setDateFrom("");
    setDateTo("");
    setAmtMin("");
    setAmtMax("");
    dispatch({ type: "SET_TRANSACTION_CATEGORY", payload: null });
    setPage(1);
  }

  function exportCSV() {
    downloadFile("transactions.csv", toCSV(filtered), "text/csv;charset=utf-8;");
    if (onToast) onToast("Exported CSV");
  }

  function exportJSON() {
    downloadFile(
      "transactions.json",
      JSON.stringify(filtered, null, 2),
      "application/json;charset=utf-8;"
    );
    if (onToast) onToast("Exported JSON");
  }

  return (
    <div className="tx-card fade-up">
      <div className="tx-header">
        <div className="tx-title">All Transactions</div>
        <div className="tx-actions">
          <button className="btn-ghost small" onClick={exportCSV}>Export CSV</button>
          <button className="btn-ghost small" onClick={exportJSON}>Export JSON</button>
          {showAdd && (
            <button
              className="btn-primary"
              onClick={() => dispatch({ type: "SET_ACTIVE_SECTION", payload: "__add__" })}
            >
              + Add
            </button>
          )}
        </div>
      </div>

      <div className="filter-row">
        <input
          className="filter-input"
          type="text"
          placeholder="Search description or amount"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          aria-label="Search transactions"
        />
        <select className="filter-select" value={typeF} onChange={(e) => { setTypeF(e.target.value); setPage(1); }}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select className="filter-select" value={catF} onChange={(e) => { setCatF(e.target.value); setPage(1); }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <select className="filter-select" value={sortF} onChange={(e) => setSortF(e.target.value)}>
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="amount-desc">Highest amount</option>
          <option value="amount-asc">Lowest amount</option>
        </select>
      </div>

      {/* secondary filter row - date range + amount range */}
      <div className="filter-row secondary">
        <input className="filter-input" type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} aria-label="Filter from date" />
        <input className="filter-input" type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} aria-label="Filter to date" />
        <input className="filter-input" type="number" placeholder="Min amount" value={amtMin} onChange={(e) => { setAmtMin(e.target.value); setPage(1); }} aria-label="Minimum amount" />
        <input className="filter-input" type="number" placeholder="Max amount" value={amtMax} onChange={(e) => { setAmtMax(e.target.value); setPage(1); }} aria-label="Maximum amount" />
        <button className="btn-ghost small" onClick={clearFilters}>Clear</button>
      </div>

      {lastDeleted && (
        <div className="undo-banner" role="status" aria-live="polite">
          <span>Transaction deleted</span>
          <button className="undo-btn" onClick={handleUndoDelete}>Undo</button>
        </div>
      )}

      <div className="tx-scroll">
        {visible.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">No data</div>
            No transactions match your filters
          </div>
        ) : (
          visible.map((t) => (
            <div key={t.id} className="tx-row">
              <div className="tx-icon" style={{ background: (CAT_COLORS[t.category] || "#9ca3af") + "22" }}>
                {CAT_EMOJI[t.category] || "*"}
              </div>
              <div className="tx-info">
                <div className="tx-name">{t.desc}</div>
                <div className="tx-meta">
                  {formatDate(t.date)}
                  <button
                    className="cat-tag cat-button"
                    style={{ color: CAT_COLORS[t.category] || "#9ca3af", background: (CAT_COLORS[t.category] || "#9ca3af") + "18" }}
                    onClick={() => setCatF(t.category)}
                    aria-label={`Filter by ${t.category}`}
                  >
                    {t.category}
                  </button>
                </div>
              </div>
              <div className={`tx-amount ${t.type}`}>
                {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
              </div>
              {state.role === "admin" && (
                <div className="tx-actions-inline">
                  <button className="tx-edit" onClick={() => setEditingTx(t)} title="Edit" aria-label={`Edit ${t.desc}`}>Edit</button>
                  <button className="tx-delete" onClick={() => handleDelete(t)} title="Delete" aria-label={`Delete ${t.desc}`}>X</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {pages > 1 && (
        <div className="pagination">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} className={`page-btn ${p === safePage ? "active" : ""}`} onClick={() => setPage(p)}>
              {p}
            </button>
          ))}
        </div>
      )}

      {editingTx && (
        <AddTransaction
          mode="edit"
          initial={editingTx}
          onClose={() => setEditingTx(null)}
          onSuccess={(msg) => onToast && onToast(msg)}
        />
      )}
    </div>
  );
}
