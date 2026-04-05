import React from "react";
import { useFinance } from "../context/FinanceContext";
import "./Sidebar.css";

const NAV = [
  { id: "dashboard",    icon: "D", label: "Dashboard" },
  { id: "transactions", icon: "T", label: "Transactions" },
  { id: "insights",     icon: "I", label: "Insights" },
];

// checks if an object looks like a valid transaction before importing
function isImportedTransaction(tx) {
  return (
    tx &&
    typeof tx === "object" &&
    Number.isFinite(Number(tx.id)) &&
    typeof tx.date === "string" &&
    typeof tx.desc === "string" &&
    typeof tx.category === "string" &&
    (tx.type === "income" || tx.type === "expense") &&
    Number.isFinite(Number(tx.amount))
  );
}

export default function Sidebar({ mobileOpen, onClose, onToast }) {
  const { state, dispatch } = useFinance();
  const { activeSection, role, theme, transactions, savingsGoalPct } = state;
  const fileInputRef = React.useRef(null);
  const [goalDraft, setGoalDraft] = React.useState(String(savingsGoalPct));

  React.useEffect(() => {
    setGoalDraft(String(savingsGoalPct));
  }, [savingsGoalPct]);

  function navigate(id) {
    dispatch({ type: "SET_ACTIVE_SECTION", payload: id });
    onClose();
  }

  function switchRole(e) {
    dispatch({ type: "SET_ROLE", payload: e.target.value });
    if (onToast) onToast(`Role switched to ${e.target.value}`);
  }

  function handleReset() {
    if (role !== "admin") return;
    const ok = window.confirm("Reset all transactions to seed data?");
    if (!ok) return;
    dispatch({ type: "RESET_DATA" });
    if (onToast) onToast("Data reset to seed set");
  }

  function handleWipeAll() {
    if (role !== "admin") return;
    const ok = window.confirm("Wipe all transactions? This cannot be undone.");
    if (!ok) return;
    dispatch({ type: "WIPE_DATA" });
    dispatch({ type: "SET_TRANSACTION_CATEGORY", payload: null });
    if (onToast) onToast("All transaction data wiped");
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    dispatch({ type: "SET_THEME", payload: next });
    if (onToast) onToast(`${next === "dark" ? "Dark" : "Light"} mode enabled`);
  }

  function saveGoal() {
    const parsed = Number(goalDraft);
    if (!Number.isFinite(parsed)) {
      if (onToast) onToast("Enter a valid savings goal");
      return;
    }
    const next = Math.min(100, Math.max(1, Math.round(parsed)));
    dispatch({ type: "SET_SAVINGS_GOAL", payload: next });
    setGoalDraft(String(next));
    if (onToast) onToast(`Savings goal set to ${next}%`);
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(transactions, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "finflow-backup.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (onToast) onToast("Backup exported");
  }

  function openImport() {
    fileInputRef.current?.click();
  }

  function handleImport(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "[]"));
        if (!Array.isArray(parsed) || !parsed.every(isImportedTransaction)) {
          throw new Error("Invalid backup format");
        }
        dispatch({ type: "SET_TRANSACTION_CATEGORY", payload: null });
        dispatch({
          type: "HYDRATE_TRANSACTIONS",
          payload: parsed.map((tx) => ({
            ...tx,
            id: Number(tx.id),
            amount: Number(tx.amount),
          })),
        });
        if (onToast) onToast("Backup imported");
      } catch (err) {
        console.error("Import failed:", err);
        if (onToast) onToast("Could not import backup");
      }
    };
    reader.readAsText(file);
  }

  return (
    <>
      <div
        className={`sidebar-backdrop ${mobileOpen ? "open" : ""}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">FF</div>
          <span>FinFlow</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${activeSection === n.id ? "active" : ""}`}
              onClick={() => navigate(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="role-area">
          <div className="role-label">Active Role</div>
          <select className="role-select" value={role} onChange={switchRole}>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
          <span className={`role-badge ${role}`}>
            {role === "admin" ? "Admin - full access" : "Viewer - read only"}
          </span>
          {role === "admin" && (
            <button className="role-reset" onClick={handleReset}>
              Reset data
            </button>
          )}
          {role === "admin" && (
            <button className="role-reset danger" onClick={handleWipeAll}>
              Wipe all data
            </button>
          )}
        </div>

        <div className="theme-area">
          <div className="role-label">Theme</div>
          <button
            className={`theme-switch ${theme}`}
            onClick={toggleTheme}
            aria-pressed={theme === "dark"}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            type="button"
          >
            <span className="theme-switch-icon sun" aria-hidden="true">☀</span>
            <span className="theme-switch-track" aria-hidden="true">
              <span className="theme-switch-thumb" />
            </span>
            <span className="theme-switch-icon moon" aria-hidden="true">☾</span>
          </button>
          <span className="theme-hint">
            {theme === "dark" ? "Dark mode active" : "Light mode active"}
          </span>
        </div>

        <div className="goal-area">
          <div className="role-label">Savings Target</div>
          <div className="goal-row">
            <input
              className="goal-range"
              type="range"
              min="1"
              max="100"
              step="1"
              value={goalDraft}
              onChange={(e) => setGoalDraft(e.target.value)}
              aria-label="Savings goal percentage"
            />
            <div className="goal-value">{goalDraft}%</div>
          </div>
          <button className="backup-btn" onClick={saveGoal}>Save target</button>
          <span className="theme-hint">Used by the Savings % card on the dashboard.</span>
        </div>

        <div className="backup-area">
          <div className="role-label">Backup</div>
          <div className="backup-actions">
            <button className="backup-btn" onClick={exportBackup}>Export JSON</button>
            <button className="backup-btn secondary" onClick={openImport}>Import JSON</button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImport}
              className="backup-input"
              aria-hidden="true"
              tabIndex={-1}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
