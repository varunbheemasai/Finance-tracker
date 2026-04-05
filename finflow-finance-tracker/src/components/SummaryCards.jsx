import React from "react";
import { fmt } from "../utils/finance";
import "./SummaryCards.css";

export default function SummaryCards({ summary, lastMonthSummary, txCount, savingsGoalPct = 20 }) {
  const balDiff = summary.balance - lastMonthSummary.balance;
  const savingsRate = summary.income > 0 ? Math.max(0, Math.round(((summary.income - summary.expense) / summary.income) * 100)) : 0;
  const savingsGoal = Math.min(100, Math.max(1, Math.round(savingsGoalPct || 20)));
  const goalProgress = summary.income > 0 ? Math.min(100, Math.round((savingsRate / savingsGoal) * 100)) : 0;

  const cards = [
    {
      label: "Total Balance",
      value: fmt(summary.balance),
      valueClass: "blue",
      icon: "$",
      delta: `${balDiff >= 0 ? "UP" : "DOWN"} ${fmt(Math.abs(balDiff))} vs last month`,
      deltaClass: balDiff >= 0 ? "up" : "dn",
      barPct: Math.max(0, Math.min(100, (summary.balance / Math.max(summary.income, 1)) * 100)),
      barColor: "var(--accent3)",
      delay: "delay-1",
    },
    {
      label: "Total Income",
      value: fmt(summary.income),
      valueClass: "green",
      icon: "+",
      delta: `${txCount.income} income transactions`,
      deltaClass: "up",
      barPct: 100,
      barColor: "var(--accent)",
      delay: "delay-2",
    },
    {
      label: "Total Expenses",
      value: fmt(summary.expense),
      valueClass: "red",
      icon: "-",
      delta: `${txCount.expense} expense transactions`,
      deltaClass: "dn",
      barPct: summary.income > 0 ? Math.max(0, Math.min(100, (summary.expense / summary.income) * 100)) : 0,
      barColor: "var(--red)",
      delay: "delay-3",
    },
    {
      label: "Savings %",
      value: `${savingsRate}%`,
      valueClass: "blue",
      icon: "%",
      delta: savingsRate >= savingsGoal ? `Goal met (${savingsGoal}%)` : `${Math.max(0, savingsGoal - savingsRate)}% below goal`,
      deltaClass: savingsRate >= savingsGoal ? "up" : "dn",
      barPct: goalProgress,
      barColor: "var(--accent3)",
      delay: "delay-4",
    },
  ];

  return (
    <div className="summary-grid">
      {cards.map((c) => (
        <div key={c.label} className={`summary-card fade-up ${c.delay}`}>
          <span className="card-bg-icon">{c.icon}</span>
          <div className="card-label">{c.label}</div>
          <div className={`card-value ${c.valueClass}`}>{c.value}</div>
          <div className={`card-delta ${c.deltaClass}`}>{c.delta}</div>
          <div className="card-bar">
            <div
              className="card-bar-fill"
              style={{ width: `${Math.min(100, c.barPct)}%`, background: c.barColor }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
