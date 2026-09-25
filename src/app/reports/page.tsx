"use client";

import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/format-currency";

type ReportType = "pnl" | "balance" | "trial";

interface PnLData {
  type: "pnl";
  revenue: { id: string; code: string; name: string; balance: number }[];
  expenses: { id: string; code: string; name: string; balance: number }[];
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

interface BalanceData {
  type: "balance";
  assets: { id: string; code: string; name: string; balance: number }[];
  liabilities: { id: string; code: string; name: string; balance: number }[];
  equity: { id: string; code: string; name: string; balance: number }[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

interface TrialData {
  type: "trial";
  accounts: { id: string; code: string; name: string; type: string; debit: string; credit: string }[];
  totalDebit: number;
  totalCredit: number;
}

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>("pnl");
  const [data, setData] = useState<PnLData | BalanceData | TrialData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports?type=${activeReport}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeReport]);

  const tabs: { key: ReportType; label: string }[] = [
    { key: "pnl", label: "Profit & Loss" },
    { key: "balance", label: "Balance Sheet" },
    { key: "trial", label: "Trial Balance" },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Financial Reports</h1>
        <p className="mt-1 text-sm text-slate-500">Generate and review financial statements</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveReport(tab.key)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeReport === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Generating report...</div>
      ) : !data ? (
        <div className="py-20 text-center text-slate-400">No data available</div>
      ) : activeReport === "pnl" ? (
        <PnLReport data={data as PnLData} />
      ) : activeReport === "balance" ? (
        <BalanceReport data={data as BalanceData} />
      ) : (
        <TrialReport data={data as TrialData} />
      )}
    </div>
  );
}

function PnLReport({ data }: { data: PnLData }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Profit & Loss Statement</h2>
        <p className="text-xs text-slate-500">For the current period</p>
      </div>
      <div className="p-6">
        {/* Revenue Section */}
        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700">Revenue</h3>
        <table className="mt-2 w-full text-sm">
          <tbody>
            {data.revenue.map((a) => (
              <tr key={a.id} className="border-b border-slate-50">
                <td className="py-2 text-slate-600">{a.code} — {a.name}</td>
                <td className="py-2 text-right font-medium text-slate-900">{formatNaira(a.balance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-emerald-200">
              <td className="py-2 font-bold text-emerald-800">Total Revenue</td>
              <td className="py-2 text-right font-bold text-emerald-800">{formatNaira(data.totalRevenue)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Expenses Section */}
        <h3 className="mt-6 text-sm font-bold uppercase tracking-wider text-red-700">Expenses</h3>
        <table className="mt-2 w-full text-sm">
          <tbody>
            {data.expenses.map((a) => (
              <tr key={a.id} className="border-b border-slate-50">
                <td className="py-2 text-slate-600">{a.code} — {a.name}</td>
                <td className="py-2 text-right font-medium text-slate-900">{formatNaira(a.balance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-red-200">
              <td className="py-2 font-bold text-red-800">Total Expenses</td>
              <td className="py-2 text-right font-bold text-red-800">{formatNaira(data.totalExpenses)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Net Income */}
        <div className="mt-6 rounded-lg bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-slate-900">Net Income</span>
            <span className={`text-xl font-bold ${data.netIncome >= 0 ? "text-emerald-700" : "text-red-700"}`}>
              {formatNaira(data.netIncome)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BalanceReport({ data }: { data: BalanceData }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Balance Sheet</h2>
        <p className="text-xs text-slate-500">As of today</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Assets */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-700">Assets</h3>
            <table className="mt-2 w-full text-sm">
              <tbody>
                {data.assets.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50">
                    <td className="py-2 text-slate-600">{a.code} — {a.name}</td>
                    <td className="py-2 text-right font-medium text-slate-900">{formatNaira(a.balance)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-blue-200">
                  <td className="py-2 font-bold text-blue-800">Total Assets</td>
                  <td className="py-2 text-right font-bold text-blue-800">{formatNaira(data.totalAssets)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Liabilities & Equity */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-700">Liabilities</h3>
            <table className="mt-2 w-full text-sm">
              <tbody>
                {data.liabilities.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50">
                    <td className="py-2 text-slate-600">{a.code} — {a.name}</td>
                    <td className="py-2 text-right font-medium text-slate-900">{formatNaira(a.balance)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-red-200">
                  <td className="py-2 font-bold text-red-800">Total Liabilities</td>
                  <td className="py-2 text-right font-bold text-red-800">{formatNaira(data.totalLiabilities)}</td>
                </tr>
              </tfoot>
            </table>

            <h3 className="mt-6 text-sm font-bold uppercase tracking-wider text-purple-700">Equity</h3>
            <table className="mt-2 w-full text-sm">
              <tbody>
                {data.equity.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50">
                    <td className="py-2 text-slate-600">{a.code} — {a.name}</td>
                    <td className="py-2 text-right font-medium text-slate-900">{formatNaira(a.balance)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-purple-200">
                  <td className="py-2 font-bold text-purple-800">Total Equity</td>
                  <td className="py-2 text-right font-bold text-purple-800">{formatNaira(data.totalEquity)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-4 rounded-lg bg-slate-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-slate-900">Liabilities + Equity</span>
                <span className="font-bold text-slate-900">{formatNaira(data.totalLiabilities + data.totalEquity)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrialReport({ data }: { data: TrialData }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Trial Balance</h2>
        <p className="text-xs text-slate-500">All accounts with debit/credit balances</p>
      </div>
      <div className="p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-2 text-left font-medium text-slate-600">Code</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Account</th>
              <th className="px-4 py-2 text-left font-medium text-slate-600">Type</th>
              <th className="px-4 py-2 text-right font-medium text-slate-600">Debit</th>
              <th className="px-4 py-2 text-right font-medium text-slate-600">Credit</th>
            </tr>
          </thead>
          <tbody>
            {data.accounts.map((a) => (
              <tr key={a.id} className="border-b border-slate-50">
                <td className="px-4 py-2 font-mono text-slate-900">{a.code}</td>
                <td className="px-4 py-2 text-slate-900">{a.name}</td>
                <td className="px-4 py-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{a.type}</span>
                </td>
                <td className="px-4 py-2 text-right font-mono text-slate-900">{parseFloat(a.debit) > 0 ? formatNaira(parseFloat(a.debit)) : ""}</td>
                <td className="px-4 py-2 text-right font-mono text-slate-900">{parseFloat(a.credit) > 0 ? formatNaira(parseFloat(a.credit)) : ""}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 bg-slate-50">
              <td className="px-4 py-2 font-bold" colSpan={3}>Totals</td>
              <td className="px-4 py-2 text-right font-bold font-mono">{formatNaira(data.totalDebit)}</td>
              <td className="px-4 py-2 text-right font-bold font-mono">{formatNaira(data.totalCredit)}</td>
            </tr>
          </tfoot>
        </table>
        <div className="mt-4 rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-600">
            Difference: <span className="font-mono font-bold">{formatNaira(data.totalDebit - data.totalCredit)}</span>
            {Math.abs(data.totalDebit - data.totalCredit) < 0.01 ? (
              <span className="ml-2 text-emerald-600">✓ Balanced</span>
            ) : (
              <span className="ml-2 text-red-600">⚠ Out of balance</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
