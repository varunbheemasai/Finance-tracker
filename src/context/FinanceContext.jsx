import React, { createContext, useContext, useReducer, useEffect } from "react";
import { INITIAL_TRANSACTIONS } from "../data/transactions";
import { fetchTransactions, saveTransactions } from "../services/mockApi";

const FinanceContext = createContext(null);

const THEME_KEY = "finflow_theme";
const SAVINGS_GOAL_KEY = "finflow_savings_goal_pct";

function loadThemeFromStorage() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch (_) {}
  // default to system preference
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function saveThemeToStorage(theme) {
  try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
}

function loadSavingsGoalFromStorage() {
  try {
    const stored = localStorage.getItem(SAVINGS_GOAL_KEY);
    if (stored === null) return 20;
    const parsed = Number(stored);
    if (Number.isFinite(parsed)) return Math.min(100, Math.max(1, Math.round(parsed)));
  } catch (_) {}
  return 20;
}

function saveSavingsGoalToStorage(goal) {
  try { localStorage.setItem(SAVINGS_GOAL_KEY, String(goal)); } catch (_) {}
}

export function reducer(state, action) {
  switch (action.type) {
    case "ADD_TRANSACTION": {
      const next = [action.payload, ...state.transactions];
      return { ...state, transactions: next };
    }
    case "DELETE_TRANSACTION": {
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload)
      };
    }
    case "UPDATE_TRANSACTION": {
      const next = state.transactions.map((t) =>
        t.id === action.payload.id ? action.payload : t
      );
      return { ...state, transactions: next };
    }
    case "SET_ROLE":
      return { ...state, role: action.payload };
    case "SET_ACTIVE_SECTION":
      return { ...state, activeSection: action.payload };
    case "SET_TRANSACTION_CATEGORY":
      return { ...state, transactionCategory: action.payload };
    case "SET_THEME":
      saveThemeToStorage(action.payload);
      return { ...state, theme: action.payload };
    case "SET_SAVINGS_GOAL": {
      const next = Math.min(100, Math.max(1, Math.round(Number(action.payload) || 20)));
      saveSavingsGoalToStorage(next);
      return { ...state, savingsGoalPct: next };
    }
    case "HYDRATE_TRANSACTIONS":
      return { ...state, transactions: action.payload, loading: false };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "RESET_DATA":
      return { ...state, transactions: INITIAL_TRANSACTIONS, transactionCategory: null };
    case "WIPE_DATA":
      return { ...state, transactions: [], transactionCategory: null };
    default:
      return state;
  }
}

export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    transactions: [],
    role: "admin",
    activeSection: "dashboard",
    transactionCategory: null,
    theme: loadThemeFromStorage(),
    savingsGoalPct: loadSavingsGoalFromStorage(),
    loading: true,
  });

  // load from "API" on mount
  useEffect(() => {
    let active = true;
    dispatch({ type: "SET_LOADING", payload: true });
    fetchTransactions().then((txs) => {
      if (!active) return;
      dispatch({ type: "HYDRATE_TRANSACTIONS", payload: txs });
    });
    return () => { active = false; };
  }, []);

  // save whenever transactions change (skip while loading)
  useEffect(() => {
    if (state.loading) return;
    saveTransactions(state.transactions);
  }, [state.transactions, state.loading]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.theme);
  }, [state.theme]);

  return (
    <FinanceContext.Provider value={{ state, dispatch }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  return useContext(FinanceContext);
}
