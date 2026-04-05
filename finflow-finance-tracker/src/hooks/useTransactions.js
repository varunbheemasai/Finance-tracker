import { useMemo } from "react";
import { useFinance } from "../context/FinanceContext";
import {
  calcSummary,
  categoryTotals,
  incomeCategoryTotals,
  getLastNMonths,
  getMonthLabel,
  monthKey,
  getLatestMonthKey,
} from "../utils/finance";

// centralises all the derived data so components don't each do their own filtering
export function useTransactions() {
  const { state } = useFinance();
  const { transactions } = state;

  const currentMonth = useMemo(
    () => getLatestMonthKey(transactions),
    [transactions]
  );

  // compute previous month from current
  const lastMonth = useMemo(() => {
    if (!currentMonth) return null;
    const [year, month] = currentMonth.split("-").map(Number);
    const prev = new Date(year, month - 2, 1);
    return monthKey(prev);
  }, [currentMonth]);

  const summary = useMemo(
    () => calcSummary(transactions, currentMonth),
    [transactions, currentMonth]
  );

  const lastMonthSummary = useMemo(
    () => calcSummary(transactions, lastMonth),
    [transactions, lastMonth]
  );

  const catTotals = useMemo(() => categoryTotals(transactions), [transactions]);
  const incomeTotals = useMemo(() => incomeCategoryTotals(transactions), [transactions]);

  // trend chart data - running balance + monthly in/out
  const trendData = useMemo(() => {
    const months = getLastNMonths(6, currentMonth ? `${currentMonth}-01` : new Date());
    return months.map((m) => {
      const prior = transactions.filter((t) => monthKey(t.date) <= m);
      const inc = prior.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const exp = prior.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

      // monthly totals for the bar chart
      const mInc = transactions
        .filter((t) => t.type === "income" && monthKey(t.date) === m)
        .reduce((s, t) => s + t.amount, 0);
      const mExp = transactions
        .filter((t) => t.type === "expense" && monthKey(t.date) === m)
        .reduce((s, t) => s + t.amount, 0);

      return {
        month: getMonthLabel(m),
        balance: inc - exp,
        income: mInc,
        expense: mExp,
      };
    });
  }, [transactions, currentMonth]);

  const netFlowData = useMemo(() => {
    const months = getLastNMonths(6, currentMonth ? `${currentMonth}-01` : new Date());
    return months.map((m) => {
      const inc = transactions
        .filter((t) => t.type === "income" && monthKey(t.date) === m)
        .reduce((s, t) => s + t.amount, 0);
      const exp = transactions
        .filter((t) => t.type === "expense" && monthKey(t.date) === m)
        .reduce((s, t) => s + t.amount, 0);
      return { month: getMonthLabel(m), net: inc - exp };
    });
  }, [transactions, currentMonth]);

  return {
    transactions,
    summary,
    lastMonthSummary,
    catTotals,
    incomeTotals,
    trendData,
    netFlowData,
    currentMonth,
  };
}
