import { INITIAL_TRANSACTIONS } from "../data/transactions";

const API_KEY = "finflow_mock_api_transactions";

// using a write queue so rapid saves don't overlap
// probably overkill for a mock but good practice
let writeQueue = Promise.resolve();

function delay(ms = 280) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStore() {
  try {
    const raw = localStorage.getItem(API_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (e) {
    console.warn("Failed to read from localStorage", e);
    return null;
  }
}

function writeStore(transactions) {
  try {
    localStorage.setItem(API_KEY, JSON.stringify(transactions));
  } catch(e) {
    // storage full or private mode, just silently skip
    console.warn("localStorage write failed:", e);
  }
}

export async function fetchTransactions() {
  await delay();
  const stored = readStore();
  return stored !== null ? stored : INITIAL_TRANSACTIONS;
}

export async function saveTransactions(transactions) {
  writeQueue = writeQueue.then(async () => {
    await delay(180);
    writeStore(transactions);
    return transactions;
  });
  return writeQueue;
}

// not wired to a button yet, might add a reset option later
export async function resetTransactions() {
  writeQueue = writeQueue.then(async () => {
    await delay(180);
    writeStore(INITIAL_TRANSACTIONS);
    return INITIAL_TRANSACTIONS;
  });
  return writeQueue;
}
