# FinFlow

A personal finance dashboard I built for the frontend intern assignment. Uses React + Recharts, no backend — everything runs off localStorage.

## Getting started

```bash
npm install
npm start
```

Opens at `http://localhost:3000`. Needs Node 16+.

Also runs at the live link 
https://finance-tracker-one-ruddy.vercel.app/

## What it does

The dashboard shows a summary of your income, expenses, and balance for the current month, with charts for trends over the last 6 months and a spending breakdown by category.

The Transactions page has full CRUD, filters (type, category, date range, amount range), search, sorting, and pagination. You can export filtered results as CSV or JSON. There's also a backup/restore feature in the sidebar if you want to save and reload a snapshot.

The Insights page has a few more charts (monthly income vs expenses, net cash flow, category share bars) plus a key observations panel.

A few other things:
- Light/dark theme toggle (persists across refreshes)
- Role toggle between Admin (can edit) and Viewer (read-only)
- Savings target slider — set a goal, the dashboard card shows how you're tracking
- Keyboard shortcuts: `Ctrl+1/2/3` to switch sections, `N` to open the add dialog
- Undo delete for transactions
- Profile icon customization (text, color, or photo upload)

## Folder structure

```
src/
  context/FinanceContext.jsx   global state (useReducer)
  hooks/useTransactions.js     derived data hook
  utils/finance.js             formatting + calculation helpers
  data/transactions.js         seed transactions + constants
  services/mockApi.js          fake async API over localStorage
  components/
    Sidebar.jsx
    SummaryCards.jsx
    Charts.jsx
    TransactionList.jsx
    AddTransaction.jsx
    Insights.jsx
    Toast.jsx
    ErrorBoundary.jsx
  App.jsx
  index.js
```

## Notes

State lives in a single `useReducer` in context. `useTransactions` is a hook that derives all the chart/summary data from the raw transaction list so each component doesn't have to do its own filtering.

The date math anchors to the latest month present in the data, which means the dashboard stays meaningful even when the seed data is old.

The mock API adds a small delay to simulate a real fetch — it's just localStorage underneath but it keeps the loading state logic honest.
