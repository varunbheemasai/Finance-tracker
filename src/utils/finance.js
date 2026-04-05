// helper fns for formatting + summary calcs
// moved these out of App.jsx when it got too big

export const fmt = (n) => "INR " + Number(n).toLocaleString("en-IN");

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDate(d) {
  const dt = new Date(d);
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
}

// returns "2025-11" style key for grouping
export function monthKey(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}

export function getLastNMonths(n, fromDate = new Date()) {
  const result = [];
  const now = new Date(fromDate);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return result;
}

export function getMonthLabel(key) {
  const [, mo] = key.split("-");
  return MONTHS[parseInt(mo, 10) - 1];
}

// not actually used anywhere yet but keeping for now
export function currentMonthKey(ref = new Date()) {
  return monthKey(ref);
}

export function previousMonthKey(ref = new Date()) {
  const d = new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
  return monthKey(d);
}

// finds the most recent month in the transaction list
// needed because seed data might be from months ago
export function getLatestMonthKey(transactions) {
  if (!transactions || transactions.length === 0) return null;
  return transactions.reduce((latest, tx) => {
    const key = monthKey(tx.date);
    if (!latest) return key;
    return key > latest ? key : latest;
  }, null);
}

// TODO: add option to filter by date range not just month prefix
export function calcSummary(transactions, monthPrefix) {
  const tx = monthPrefix
    ? transactions.filter((t) => t.date.startsWith(monthPrefix))
    : transactions;
  const income = tx
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expense = tx
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  return { income, expense, balance: income - expense };
}

export function categoryTotals(transactions) {
  const cats = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
  return cats;
}

export function incomeCategoryTotals(transactions) {
  const cats = {};
  transactions
    .filter((t) => t.type === "income")
    .forEach((t) => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
  return cats;
}
