import { fetchTransactions } from "./mockApi";
import { INITIAL_TRANSACTIONS } from "../data/transactions";

// mock localStorage - jsdom provides it but let's be explicit
beforeEach(() => {
  localStorage.clear();
});

test("fetchTransactions returns seed data when localStorage is empty", async () => {
  const result = await fetchTransactions();
  expect(result).toEqual(INITIAL_TRANSACTIONS);
});

test("fetchTransactions returns stored data if present", async () => {
  const fakeTx = [{ id: 99, desc: "Test", amount: 100, type: "expense", category: "food", date: "2026-04-01" }];
  localStorage.setItem("finflow_mock_api_transactions", JSON.stringify(fakeTx));
  const result = await fetchTransactions();
  expect(result).toEqual(fakeTx);
});
