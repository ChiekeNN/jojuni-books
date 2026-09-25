"use client";

import { useEffect, useState } from "react";
import { COA_GROUPS, groupForCode } from "@/db/chart-of-accounts";

interface Account {
  id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  description: string | null;
  isActive: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  asset: "bg-blue-100 text-blue-700",
  liability: "bg-red-100 text-red-700",
  equity: "bg-purple-100 text-purple-700",
  revenue: "bg-emerald-100 text-emerald-700",
  expense: "bg-amber-100 text-amber-700",
};

const TYPE_OPTIONS = ["asset", "liability", "equity", "revenue", "expense"] as const;

const emptyForm: { code: string; name: string; type: "asset" | "liability" | "equity" | "revenue" | "expense"; description: string; isActive: boolean } = { code: "", name: "", type: "asset", description: "", isActive: true };

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loadingStandard, setLoadingStandard] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/accounts");
    const data = await res.json();
    setAccounts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await fetch("/api/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing, ...form }),
      });
    } else {
      await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    await load();
  };

  const handleEdit = (a: Account) => {
    setForm({ code: a.code, name: a.name, type: a.type, description: a.description ?? "", isActive: a.isActive });
    setEditing(a.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this account?")) return;
    await fetch(`/api/accounts?id=${id}`, { method: "DELETE" });
    await load();
  };

  const handleLoadStandard = async () => {
    if (!confirm("Load the standard Jojuni chart of accounts? Existing accounts are kept; only missing codes are added.")) return;
    setLoadingStandard(true);
    const res = await fetch("/api/accounts/standard", { method: "POST" });
    const data = await res.json();
    setLoadingStandard(false);
    setNotice(
      res.ok
        ? `Standard chart loaded: ${data.added} account(s) added, ${data.skipped} already existed.`
        : "Failed to load the standard chart of accounts."
    );
    await load();
  };

  // Group accounts under their section heading, in the standard order.
  const grouped = accounts.reduce<Record<string, Account[]>>((acc, a) => {
    const g = groupForCode(a.code);
    (acc[g] ||= []).push(a);
    return acc;
  }, {});
  const groupOrder = [
    ...COA_GROUPS.filter((g) => grouped[g]),
    ...Object.keys(grouped).filter((g) => !(COA_GROUPS as readonly string[]).includes(g)).sort(),
  ];

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chart of Accounts</h1>
          <p className="mt-1 text-sm text-slate-500">
            {accounts.length} accounts configured · 1xxx Assets · 2xxx Liabilities · 3xxx Equity · 4xxx Income · 5xxx Expenses
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleLoadStandard}
            disabled={loadingStandard}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {loadingStandard ? "Loading..." : "Load Standard Chart"}
          </button>
          <button
            onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            + New Account
          </button>
        </div>
      </div>

      {notice && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-xs font-medium text-emerald-700 hover:text-emerald-900">Dismiss</button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">{editing ? "Edit Account" : "New Account"}</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600">Code</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe exactly what should be recorded in this account" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
                <label className="text-sm text-slate-700">Active</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                  {editing ? "Update" : "Create"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accounts Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left font-medium text-slate-600">Code</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">What to record here</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groupOrder.map((group) => (
              <FragmentGroup key={group} title={group} accounts={grouped[group]} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </tbody>
        </table>
        {accounts.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">No accounts configured</div>
        )}
      </div>
    </div>
  );
}

function FragmentGroup({
  title,
  accounts,
  onEdit,
  onDelete,
}: {
  title: string;
  accounts: Account[];
  onEdit: (a: Account) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      <tr className="border-b border-slate-200 bg-slate-100/70">
        <td colSpan={6} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
          {title}
        </td>
      </tr>
      {accounts.map((a) => (
        <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
          <td className="px-4 py-3 font-mono font-medium text-slate-900">{a.code}</td>
          <td className="px-4 py-3 font-medium text-slate-900">{a.name}</td>
          <td className="px-4 py-3">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[a.type]}`}>
              {a.type}
            </span>
          </td>
          <td className="max-w-md px-4 py-3 text-slate-500">{a.description ?? "—"}</td>
          <td className="px-4 py-3">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${a.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              {a.isActive ? "Active" : "Inactive"}
            </span>
          </td>
          <td className="px-4 py-3 text-right whitespace-nowrap">
            <button onClick={() => onEdit(a)} className="mr-2 text-xs font-medium text-blue-600 hover:text-blue-800">Edit</button>
            <button onClick={() => onDelete(a.id)} className="text-xs font-medium text-red-600 hover:text-red-800">Delete</button>
          </td>
        </tr>
      ))}
    </>
  );
}
