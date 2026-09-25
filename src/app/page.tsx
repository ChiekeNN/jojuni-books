"use client";

import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/format-currency";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardData {
  accounts: number;
  contacts: number;
  transactions: number;
  invoices: number;
  revenue: number;
  expenses: number;
  profit: number;
  invoiceByStatus: { status: string; count: number; total: string }[];
  recentTransactions: {
    id: string;
    date: string;
    description: string;
    reference: string | null;
    status: string;
  }[];
  recentInvoices: {
    id: string;
    number: string;
    type: string;
    status: string;
    total: string;
    dueDate: string;
  }[];
  monthlyRevenue: { month: string; total: string }[];
  monthlyExpenses: { month: string; total: string }[];
  accountBalances: { type: string; balance: string }[];
}

const PIE_COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ef4444"];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto mb-4" />
          <p className="text-slate-500">Loading Jojuni Books...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-lg font-semibold text-amber-800">No Data Yet</h2>
          <p className="mt-1 text-amber-700">
            Seed the database with sample data to get started.
          </p>
          <button
            onClick={async () => {
              await fetch("/api/seed", { method: "POST" });
              window.location.reload();
            }}
            className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Seed Sample Data
          </button>
        </div>
      </div>
    );
  }

  // Merge monthly data for bar chart
  const monthLabels = Array.from(
    new Set([
      ...data.monthlyRevenue.map((m) => m.month),
      ...data.monthlyExpenses.map((m) => m.month),
    ])
  ).sort();

  const barData = monthLabels.map((month) => ({
    month,
    Revenue: parseFloat(data.monthlyRevenue.find((m) => m.month === month)?.total ?? "0"),
    Expenses: parseFloat(data.monthlyExpenses.find((m) => m.month === month)?.total ?? "0"),
  }));

  // Pie chart data for account type balances
  const pieData = data.accountBalances
    .filter((a) => parseFloat(a.balance) !== 0)
    .map((a) => ({
      name: a.type.charAt(0).toUpperCase() + a.type.slice(1),
      value: Math.abs(parseFloat(a.balance)),
    }));

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-emerald-100 text-emerald-700",
    overdue: "bg-red-100 text-red-700",
    cancelled: "bg-slate-100 text-slate-500",
    posted: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Financial overview — Jojuni Books
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatNaira(data.revenue)} trend="up" color="emerald" />
        <StatCard label="Total Expenses" value={formatNaira(data.expenses)} trend="down" color="red" />
        <StatCard label="Net Profit" value={formatNaira(data.profit)} trend={data.profit >= 0 ? "up" : "down"} color={data.profit >= 0 ? "blue" : "red"} />
        <StatCard label="Open Invoices" value={String(data.invoices)} trend="neutral" color="amber" />
      </div>

      {/* Charts Row */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue vs Expenses Bar Chart */}
        <div className="col-span-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900">Revenue vs Expenses</h3>
          <p className="text-xs text-slate-500">Monthly breakdown</p>
          <div className="mt-4 h-72">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatNaira(Number(v))} />
                  <Legend />
                  <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* Account Type Distribution Pie Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Account Distribution</h3>
          <p className="text-xs text-slate-500">Balance by account type</p>
          <div className="mt-4 h-72">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatNaira(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Row */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Recent Transactions</h3>
          <p className="text-xs text-slate-500">Latest journal entries</p>
          <div className="mt-4 space-y-3">
            {data.recentTransactions.length > 0 ? (
              data.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{tx.description}</p>
                    <p className="text-xs text-slate-500">{tx.date} {tx.reference && `· ${tx.reference}`}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[tx.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {tx.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No transactions yet</p>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Recent Invoices</h3>
          <p className="text-xs text-slate-500">Latest invoices</p>
          <div className="mt-4 space-y-3">
            {data.recentInvoices.length > 0 ? (
              data.recentInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{inv.number}</p>
                    <p className="text-xs text-slate-500">{inv.type} · Due {inv.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatNaira(parseFloat(inv.total))}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[inv.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No invoices yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  trend,
  color,
}: {
  label: string;
  value: string;
  trend: "up" | "down" | "neutral";
  color: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    red: "bg-red-50 text-red-600 border-red-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
  };
  const cls = colorMap[color] ?? colorMap.emerald;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <span className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
        {trend === "up" ? "↑ Positive" : trend === "down" ? "↓ Outflow" : "— Info"}
      </span>
    </div>
  );
}
