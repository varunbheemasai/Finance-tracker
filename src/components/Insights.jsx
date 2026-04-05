import React from "react";
import { CAT_COLORS } from "../data/transactions";
import { fmt, calcSummary, getLatestMonthKey, monthKey } from "../utils/finance";
import { IncomeSourcesChart, MonthlyBarChart, NetCashFlowChart } from "./Charts";
import "./Insights.css";

export default function Insights({
  transactions,
  trendData,
  catTotals,
  incomeTotals,
  netFlowData,
  onCategoryDrilldown
}) {
  const currentMonth = getLatestMonthKey(transactions);
  const lastMonth = currentMonth
    ? monthKey(new Date(Number(currentMonth.slice(0, 4)), Number(currentMonth.slice(5, 7)) - 2, 1))
    : null;

  const thisMonth = calcSummary(transactions, currentMonth);
  const lastMonthSummary = calcSummary(transactions, lastMonth);

  const totalExp = Object.values(catTotals).reduce((s, v) => s + v, 0) || 0;
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  const expDiff = thisMonth.expense - lastMonthSummary.expense;
  const savingsRate = thisMonth.income > 0
    ? Math.round(((thisMonth.income - thisMonth.expense) / thisMonth.income) * 100)
    : 0;

  // category spend share data for the bar chart
  const catData = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      rawName: name,
      value,
      pct: totalExp ? Math.round((value / totalExp) * 100) : 0,
    }));

  const observations = [
    {
      label: "Highest Spending Category",
      value: topCat ? topCat[0].charAt(0).toUpperCase() + topCat[0].slice(1) : "-",
      sub: topCat && totalExp
        ? `${fmt(topCat[1])} · ${Math.round((topCat[1] / totalExp) * 100)}% of expenses`
        : "No expense data yet",
      color: topCat ? CAT_COLORS[topCat[0]] : "#9ca3af",
      pct: topCat && totalExp ? topCat[1] / totalExp : 0,
      category: topCat ? topCat[0] : null,
      highlight: true,
    },
    {
      label: "Month-over-Month Spending",
      value: `${expDiff >= 0 ? "UP +" : "DOWN "}${fmt(Math.abs(expDiff))}`,
      sub: expDiff >= 0 ? "Expenses rose vs last month" : "Expenses fell vs last month",
      color: expDiff >= 0 ? "#f87171" : "#4ade80",
      pct: Math.min(1, Math.abs(expDiff) / (lastMonthSummary.expense || 1)),
    },
    {
      label: "Savings Rate (This Month)",
      value: `${savingsRate}%`,
      sub: savingsRate > 30
        ? "Strong savings discipline"
        : savingsRate > 15
          ? "Decent, room to improve"
          : "Low savings, review expenses",
      color: savingsRate > 30 ? "#4ade80" : savingsRate > 15 ? "#fbbf24" : "#f87171",
      pct: savingsRate / 100,
    },
    {
      label: "Total Transactions on Record",
      value: `${transactions.length} entries`,
      sub: currentMonth
        ? `${transactions.filter((t) => t.date.startsWith(currentMonth)).length} added this month`
        : "No data yet",
      color: "#60a5fa",
      pct: Math.min(1, transactions.length / 50),
    },
  ];

  return (
    <div>
      <div className="insights-grid fade-up">
        <MonthlyBarChart data={trendData} />
        <NetCashFlowChart data={netFlowData} />
      </div>

      <div className="insights-split fade-up delay-1" style={{ marginTop: 16 }}>
        <div className="chart-card">
          <div className="chart-title">Spend by Category</div>
          <div className="chart-sub">% share of total expenses</div>
          {catData.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>No expense data yet</div>
          ) : (
            <div className="horiz-bars">
              {catData.map((d) => (
                <button
                  type="button"
                  key={d.rawName}
                  className="horiz-row horiz-button"
                  onClick={() => onCategoryDrilldown && onCategoryDrilldown(d.rawName)}
                >
                  <div className="horiz-label">{d.name}</div>
                  <div className="horiz-track">
                    <div
                      className="horiz-fill"
                      style={{ width: `${d.pct}%`, background: CAT_COLORS[d.rawName] || "#9ca3af" }}
                    />
                  </div>
                  <div className="horiz-pct" style={{ color: CAT_COLORS[d.rawName] }}>{d.pct}%</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <IncomeSourcesChart incomeTotals={incomeTotals} onCategoryDrilldown={onCategoryDrilldown} />
      </div>

      <div className="chart-card fade-up delay-2" style={{ marginTop: 16 }}>
        <div className="chart-title" style={{ marginBottom: 14 }}>Key Observations</div>
        <div className="obs-grid">
          {observations.map((o) => (
            <button
              type="button"
              key={o.label}
              className={`obs-card obs-button ${o.highlight ? "highlight" : ""}`}
              onClick={() => o.category && onCategoryDrilldown && onCategoryDrilldown(o.category)}
            >
              <div className="obs-label">{o.label}</div>
              <div className="obs-value" style={{ color: o.color }}>{o.value}</div>
              <div className="obs-sub">{o.sub}</div>
              <div className="obs-bar-bg">
                <div
                  className="obs-bar-fill"
                  style={{ width: `${Math.round(o.pct * 100)}%`, background: o.color }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
