import { fmt, calcSummary, categoryTotals, monthKey } from "./finance";

// quick sanity checks

test("fmt formats numbers in INR locale", () => {
  expect(fmt(10000)).toBe("INR 10,000");
  expect(fmt(0)).toBe("INR 0");
});

test("fmt handles decimal amounts", () => {
  // floats from parseFloat can look weird, make sure it still renders ok
  expect(fmt(1234.5)).toBe("INR 1,234.5");
});

test("calcSummary adds up income and expenses correctly", () => {
  const txs = [
    { id: 1, amount: 5000, type: "income",  date: "2026-04-01", category: "salary" },
    { id: 2, amount: 1200, type: "expense", date: "2026-04-02", category: "food" },
    { id: 3, amount: 800,  type: "expense", date: "2026-04-10", category: "transport" },
  ];
  const result = calcSummary(txs, "2026-04");
  expect(result.income).toBe(5000);
  expect(result.expense).toBe(2000);
  expect(result.balance).toBe(3000);
});

test("calcSummary returns zeros for empty list", () => {
  const result = calcSummary([], null);
  expect(result.income).toBe(0);
  expect(result.expense).toBe(0);
});

test("categoryTotals groups expenses by category", () => {
  const txs = [
    { amount: 500,  type: "expense", category: "food" },
    { amount: 300,  type: "expense", category: "food" },
    { amount: 1000, type: "expense", category: "housing" },
    { amount: 2000, type: "income",  category: "salary" }, // should be ignored
  ];
  const totals = categoryTotals(txs);
  expect(totals.food).toBe(800);
  expect(totals.housing).toBe(1000);
  expect(totals.salary).toBeUndefined();
});

test("monthKey extracts year-month correctly", () => {
  expect(monthKey("2026-04-15")).toBe("2026-04");
  expect(monthKey("2025-11-01")).toBe("2025-11");
});
