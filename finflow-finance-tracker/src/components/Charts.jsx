import React from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend, LineChart, Line,
} from "recharts";
import { CAT_COLORS } from "../data/transactions";
import { fmt } from "../utils/finance";
import "./Charts.css";

const TOOLTIP_STYLE = {
  background: "#1e2330",
  border: "1px solid #2a3040",
  borderRadius: 8,
  fontFamily: "'Sora', sans-serif",
  fontSize: 12,
  color: "#e8eaf0",
};

function MoneyTick({ x, y, payload }) {
  return (
    <text x={x} y={y} fill="#6b7280" fontSize={10} fontFamily="JetBrains Mono, monospace" textAnchor="end" dy={4}>
      ₹{Math.round(payload.value / 1000)}k
    </text>
  );
}

export function TrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-card fade-up delay-4">
        <div className="chart-title">Balance Trend</div>
        <div className="chart-sub">Running balance — last 6 months</div>
        <div className="empty-state" style={{ padding: 24 }}>No data yet</div>
      </div>
    );
  }
  return (
    <div className="chart-card fade-up delay-4">
      <div className="chart-title">Balance Trend</div>
      <div className="chart-sub">Running balance — last 6 months</div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "Sora" }} axisLine={false} tickLine={false} />
          <YAxis tick={<MoneyTick />} axisLine={false} tickLine={false} width={48} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v) => [fmt(v), "Balance"]}
          />
          <Area
            type="monotone" dataKey="balance"
            stroke="#60a5fa" strokeWidth={2.5}
            fill="url(#balGrad)"
            dot={{ r: 4, fill: "#60a5fa", stroke: "#0d0f14", strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SpendingDonut({ catTotals }) {
  const data = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  const total = data.reduce((s, d) => s + d.value, 0);
  if (data.length === 0) {
    return (
      <div className="chart-card fade-up delay-5">
        <div className="chart-title">Spending Breakdown</div>
        <div className="chart-sub">Expenses by category</div>
        <div className="empty-state" style={{ padding: 24 }}>No expense data yet</div>
      </div>
    );
  }

  return (
    <div className="chart-card fade-up delay-5">
      <div className="chart-title">Spending Breakdown</div>
      <div className="chart-sub">Expenses by category</div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data} cx="50%" cy="50%"
            innerRadius={55} outerRadius={85}
            paddingAngle={3} dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={CAT_COLORS[entry.name] || "#9ca3af"} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v, name) => [fmt(v), name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-legend">
        {data.map((d) => (
          <div key={d.name} className="legend-item">
            <span className="legend-dot" style={{ background: CAT_COLORS[d.name] }} />
            <span>{d.name}</span>
            <span className="legend-pct">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MonthlyBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-card fade-up">
        <div className="chart-title">Monthly Income vs Expenses</div>
        <div className="chart-sub">Comparison across the last 6 months</div>
        <div className="empty-state" style={{ padding: 24 }}>No data yet</div>
      </div>
    );
  }
  return (
    <div className="chart-card fade-up">
      <div className="chart-title">Monthly Income vs Expenses</div>
      <div className="chart-sub">Comparison across the last 6 months</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={4} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={<MoneyTick />} axisLine={false} tickLine={false} width={48} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v, name) => [fmt(v), name === "income" ? "Income" : "Expenses"]}
          />
          <Legend
            formatter={(v) => (
              <span style={{ color: "#9ca3af", fontSize: 12, fontFamily: "Sora" }}>
                {v === "income" ? "Income" : "Expenses"}
              </span>
            )}
          />
          <Bar dataKey="income"  fill="#4ade80" radius={[4,4,0,0]} maxBarSize={28} />
          <Bar dataKey="expense" fill="#f87171" radius={[4,4,0,0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function NetCashFlowChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-card fade-up">
        <div className="chart-title">Net Cash Flow</div>
        <div className="chart-sub">Monthly income minus expenses</div>
        <div className="empty-state" style={{ padding: 24 }}>No data yet</div>
      </div>
    );
  }

  return (
    <div className="chart-card fade-up delay-1">
      <div className="chart-title">Net Cash Flow</div>
      <div className="chart-sub">Monthly income minus expenses</div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={<MoneyTick />} axisLine={false} tickLine={false} width={48} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v) => [fmt(v), "Net cash flow"]}
          />
          <Line
            type="monotone"
            dataKey="net"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#f59e0b", stroke: "#0d0f14", strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function IncomeSourcesChart({ incomeTotals, onCategoryDrilldown }) {
  const data = Object.entries(incomeTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <div className="chart-card fade-up delay-2">
        <div className="chart-title">Income Sources</div>
        <div className="chart-sub">Where the money comes from</div>
        <div className="empty-state" style={{ padding: 24 }}>No income data yet</div>
      </div>
    );
  }

  return (
    <div className="chart-card fade-up delay-2">
      <div className="chart-title">Income Sources</div>
      <div className="chart-sub">Where the money comes from</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <XAxis type="number" tick={<MoneyTick />} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} width={86} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v, name) => [fmt(v), name]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={CAT_COLORS[entry.name] || "#9ca3af"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="donut-legend">
        {data.map((d) => (
          <button type="button" key={d.name} className="legend-item legend-button" onClick={() => onCategoryDrilldown && onCategoryDrilldown(d.name)}>
            <span className="legend-dot" style={{ background: CAT_COLORS[d.name] }} />
            <span>{d.name}</span>
            <span className="legend-pct">{Math.round((d.value / total) * 100)}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}
