import { reducer } from "./FinanceContext";
import { INITIAL_TRANSACTIONS } from "../data/transactions";

const base = {
  transactions: INITIAL_TRANSACTIONS,
  role: "admin",
  activeSection: "dashboard",
  transactionCategory: null,
  theme: "dark",
  savingsGoalPct: 20,
  loading: false,
};

test("ADD_TRANSACTION prepends to transactions", () => {
  const tx = { id: 999, desc: "New one", amount: 500, type: "expense", category: "food", date: "2026-04-05" };
  const next = reducer(base, { type: "ADD_TRANSACTION", payload: tx });
  expect(next.transactions[0]).toEqual(tx);
  expect(next.transactions.length).toBe(INITIAL_TRANSACTIONS.length + 1);
});

test("DELETE_TRANSACTION removes the right item", () => {
  const next = reducer(base, { type: "DELETE_TRANSACTION", payload: 1 });
  expect(next.transactions.find(t => t.id === 1)).toBeUndefined();
  expect(next.transactions.length).toBe(INITIAL_TRANSACTIONS.length - 1);
});

test("UPDATE_TRANSACTION replaces matching transaction", () => {
  const updated = { ...INITIAL_TRANSACTIONS[0], desc: "Updated salary" };
  const next = reducer(base, { type: "UPDATE_TRANSACTION", payload: updated });
  expect(next.transactions[0].desc).toBe("Updated salary");
  expect(next.transactions.length).toBe(INITIAL_TRANSACTIONS.length);
});

test("WIPE_DATA clears all transactions", () => {
  const next = reducer(base, { type: "WIPE_DATA" });
  expect(next.transactions).toHaveLength(0);
});

test("SET_ROLE changes role", () => {
  const next = reducer(base, { type: "SET_ROLE", payload: "viewer" });
  expect(next.role).toBe("viewer");
});

test("SET_SAVINGS_GOAL clamps to 1-100", () => {
  expect(reducer(base, { type: "SET_SAVINGS_GOAL", payload: 150 }).savingsGoalPct).toBe(100);
  expect(reducer(base, { type: "SET_SAVINGS_GOAL", payload: 0 }).savingsGoalPct).toBe(1);
  expect(reducer(base, { type: "SET_SAVINGS_GOAL", payload: 35 }).savingsGoalPct).toBe(35);
});
