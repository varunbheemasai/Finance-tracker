import React, { useState, useCallback, useEffect } from "react";
import { useFinance } from "./context/FinanceContext";
import { useTransactions } from "./hooks/useTransactions";
import Sidebar from "./components/Sidebar";
import SummaryCards from "./components/SummaryCards";
import { TrendChart, SpendingDonut } from "./components/Charts";
import TransactionList from "./components/TransactionList";
import AddTransaction from "./components/AddTransaction";
import Insights from "./components/Insights";
import Toast from "./components/Toast";
import "./App.css";

const PROFILE_KEY = "finflow_profile";

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return { label: "B", bg: "linear-gradient(135deg, var(--accent), var(--accent3))", image: "" };
    const parsed = JSON.parse(raw);
    return {
      label: typeof parsed.label === "string" && parsed.label.trim()
        ? parsed.label.trim().slice(0, 2).toUpperCase()
        : "B",
      bg: typeof parsed.bg === "string" && parsed.bg
        ? parsed.bg
        : "linear-gradient(135deg, var(--accent), var(--accent3))",
      image: typeof parsed.image === "string" ? parsed.image : "",
    };
  } catch (e) {
    return { label: "B", bg: "linear-gradient(135deg, var(--accent), var(--accent3))", image: "" };
  }
}

function saveProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    // storage probably full, not worth crashing over
  }
}

// recent transactions mini-list shown on dashboard
function Dashboard() {
  const { transactions, summary, lastMonthSummary, catTotals, trendData, currentMonth } = useTransactions();
  const { dispatch, state } = useFinance();
  const { savingsGoalPct } = state;

  const txCount = {
    income:  currentMonth ? transactions.filter((t) => t.date.startsWith(currentMonth) && t.type === "income").length  : 0,
    expense: currentMonth ? transactions.filter((t) => t.date.startsWith(currentMonth) && t.type === "expense").length : 0,
  };

  return (
    <div>
      <SummaryCards
        summary={summary}
        lastMonthSummary={lastMonthSummary}
        txCount={txCount}
        savingsGoalPct={savingsGoalPct}
      />
      <div className="charts-row">
        <TrendChart data={trendData} />
        <SpendingDonut catTotals={catTotals} />
      </div>

      <div className="chart-card fade-up">
        <div className="section-header">
          <span className="section-title">Recent Transactions</span>
          <button
            className="link-btn"
            onClick={() => dispatch({ type: "SET_ACTIVE_SECTION", payload: "transactions" })}
          >
            View all -&gt;
          </button>
        </div>
        <div className="recent-list">
          {[...transactions]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map((t) => <RecentRow key={t.id} tx={t} />)}
          {transactions.length === 0 && (
            <div className="empty-state">No transactions yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

const CAT_COLORS_INLINE = {
  salary: "#4ade80", freelance: "#22d3ee", food: "#fbbf24",
  transport: "#60a5fa", housing: "#a78bfa", health: "#34d399",
  entertainment: "#f97316", other: "#9ca3af",
};

function RecentRow({ tx }) {
  const fmt = (n) => "INR " + Number(n).toLocaleString("en-IN");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dt = new Date(tx.date);
  const dateStr = `${dt.getDate()} ${months[dt.getMonth()]}`;
  const color = CAT_COLORS_INLINE[tx.category] || "#9ca3af";

  return (
    <div className="recent-row">
      <div className="tx-icon" style={{ background: color + "22" }}>
        {tx.category?.charAt(0).toUpperCase() || "?"}
      </div>
      <div className="tx-info">
        <div className="tx-name">{tx.desc}</div>
        <div className="tx-meta">
          {dateStr}
          <span className="cat-tag" style={{ color, background: color + "18" }}>
            {tx.category}
          </span>
        </div>
      </div>
      <div className={`tx-amount ${tx.type}`}>
        {tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}
      </div>
    </div>
  );
}

export default function App() {
  const { state, dispatch } = useFinance();
  const { activeSection, role, loading, transactionCategory } = state;
  const { transactions, catTotals, incomeTotals, trendData, netFlowData } = useTransactions();

  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(() => loadProfile());
  const [profileDraft, setProfileDraft] = useState(() => loadProfile());
  const profileFileRef = React.useRef(null);

  const clearToast = useCallback(() => setToast(""), []);
  const pushToast = useCallback((msg) => setToast(msg), []);

  const TITLES = { dashboard: "Dashboard", transactions: "Transactions", insights: "Insights" };
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  function handleAddSuccess(msg) {
    setToast(msg);
    if (activeSection === "__add__") {
      dispatch({ type: "SET_ACTIVE_SECTION", payload: "transactions" });
    }
  }

  function focusCategory(category) {
    dispatch({ type: "SET_TRANSACTION_CATEGORY", payload: category });
    dispatch({ type: "SET_ACTIVE_SECTION", payload: "transactions" });
  }

  function openProfileEditor() {
    setProfileDraft(profile);
    setProfileOpen((v) => !v);
  }

  function handleProfileFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      pushToast("Please choose an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfileDraft({ ...profileDraft, image: String(reader.result || "") });
      setProfileOpen(true);
    };
    reader.readAsDataURL(file);
  }

  function clearProfileImage() {
    setProfileDraft((prev) => ({ ...prev, image: "" }));
  }

  function saveProfileChanges() {
    const label = (profileDraft.label || "").trim().slice(0, 2).toUpperCase() || "B";
    const bg = profileDraft.bg || "linear-gradient(135deg, var(--accent), var(--accent3))";
    const next = { label, bg, image: profileDraft.image || "" };
    setProfile(next);
    setProfileDraft(next);
    setProfileOpen(false);
    pushToast("Profile icon updated");
  }

  // intercept the __add__ section hack used by the sidebar Add button
  useEffect(() => {
    if (activeSection === "__add__") {
      if (role === "admin") setShowAddModal(true);
      dispatch({ type: "SET_ACTIVE_SECTION", payload: "transactions" });
    }
  }, [activeSection, role, dispatch]);

  // keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e) {
      const tag = e.target?.tagName?.toLowerCase() || "";
      if (["input", "textarea", "select"].includes(tag)) return;

      if (e.metaKey || e.ctrlKey || e.altKey) {
        if (e.key === "1") dispatch({ type: "SET_ACTIVE_SECTION", payload: "dashboard" });
        if (e.key === "2") dispatch({ type: "SET_ACTIVE_SECTION", payload: "transactions" });
        if (e.key === "3") dispatch({ type: "SET_ACTIVE_SECTION", payload: "insights" });
      }
      if (e.key.toLowerCase() === "n" && role === "admin") {
        setShowAddModal(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch, role]);

  if (loading) {
    return (
      <div className="loading-shell" aria-busy="true" aria-live="polite">
        <div className="loading-card">
          <div className="loading-mark">FinFlow</div>
          <div className="loading-title">Loading your dashboard</div>
          <div className="loading-sub">Fetching data from the mock API and restoring your saved state.</div>
          <div className="skeleton-blocks" aria-hidden="true">
            <div className="skeleton-line wide" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-grid">
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar
        mobileOpen={mobileSidebar}
        onClose={() => setMobileSidebar(false)}
        onToast={pushToast}
      />

      <main className="main-content">
        <div className="content-shell">
          <header className="topbar fade-up">
            <div className="topbar-left">
              <button className="hamburger" onClick={() => setMobileSidebar(true)} aria-label="Open navigation">Menu</button>
              <div>
                <div className="page-title">{TITLES[activeSection] || "Dashboard"}</div>
                <div className="page-sub">{today}</div>
              </div>
            </div>
            <div className="topbar-right">
              <div className="clock-chip" id="clock">
                {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </div>
              {role === "admin" && activeSection !== "dashboard" && (
                <button className="add-fab" onClick={() => setShowAddModal(true)}>+ Add</button>
              )}
              <div className="profile-wrap">
                <button
                  className="avatar profile-avatar"
                  onClick={openProfileEditor}
                  aria-label="Customize profile icon"
                  aria-expanded={profileOpen}
                  type="button"
                  style={{ background: profile.bg }}
                >
                  {profile.image
                    ? <img className="avatar-image" src={profile.image} alt="" />
                    : <span>{profile.label}</span>
                  }
                </button>
              </div>
            </div>
          </header>

          {activeSection === "dashboard" && <Dashboard />}

          {activeSection === "transactions" && (
            <TransactionList
              transactions={transactions}
              showAdd={role === "admin"}
              onToast={pushToast}
              selectedCategory={transactionCategory}
            />
          )}

          {activeSection === "insights" && (
            <Insights
              transactions={transactions}
              trendData={trendData}
              catTotals={catTotals}
              incomeTotals={incomeTotals}
              netFlowData={netFlowData}
              onCategoryDrilldown={focusCategory}
            />
          )}
        </div>
      </main>

      {profileOpen && (
        <div className="profile-float-layer" onClick={() => setProfileOpen(false)}>
          <div
            className="profile-popover"
            role="dialog"
            aria-label="Profile icon settings"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-pop-title">Profile Icon</div>
            <label className="profile-field">
              <span>Visible text</span>
              <input
                type="text"
                maxLength={2}
                value={profileDraft.label}
                onChange={(e) => setProfileDraft((prev) => ({ ...prev, label: e.target.value, image: "" }))}
                placeholder="B"
              />
            </label>
            <label className="profile-field">
              <span>Background color</span>
              <input
                type="color"
                value={profileDraft.bg && profileDraft.bg.startsWith("#") ? profileDraft.bg : "#4ade80"}
                onChange={(e) => setProfileDraft((prev) => ({ ...prev, bg: e.target.value, image: "" }))}
              />
            </label>
            <label className="profile-field">
              <span>Upload picture</span>
              <button type="button" className="backup-btn secondary" onClick={() => profileFileRef.current?.click()}>
                Choose image
              </button>
            </label>
            {profileDraft.image && (
              <button type="button" className="backup-btn secondary" onClick={clearProfileImage}>
                Remove image
              </button>
            )}
            <input
              ref={profileFileRef}
              type="file"
              accept="image/*"
              onChange={handleProfileFile}
              className="backup-input"
              aria-hidden="true"
              tabIndex={-1}
            />
            <div className="profile-preview">
              <div className="profile-preview-chip" style={{ background: profileDraft.bg }}>
                {profileDraft.image ? <img src={profileDraft.image} alt="" /> : profileDraft.label || "B"}
              </div>
            </div>
            <div className="profile-actions">
              <button className="backup-btn" onClick={saveProfileChanges}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddTransaction
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      <Toast message={toast} onDone={clearToast} />
    </div>
  );
}
