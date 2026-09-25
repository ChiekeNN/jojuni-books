"use client";

import { useEffect, useState } from "react";

interface TxLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: string;
  credit: string;
  description: string | null;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  reference: string | null;
  contactId: string | null;
  status: "draft" | "posted";
  lines: TxLine[];
}

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    reference: "",
    status: "draft" as "draft" | "posted",
    lines: [{ accountId: "", debit: "0.00", credit: "0.00" }, { accountId: "", debit: "0.00", credit: "0.00" }],
  });

  const load = async () => {
    const [txRes, accRes] = await Promise.all([fetch("/api/transactions"), fetch("/api/accounts")]);
    setTransactions(await txRes.json());
    setAllAccounts(await accRes.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({
      date: new Date().toISOString().split("T")[0],
      description: "",
      reference: "",
      status: "draft",
      lines: [{ accountId: "", debit: "0.00", credit: "0.00" }, { accountId: "", debit: "0.00", credit: "0.00" }],
    });
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
    await load();
  };

  const handlePost = async (tx: Transaction) => {
    await fetch("/api/transactions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...tx, status: "posted" }),
    });
    await load();
  };

  const updateLine = (idx: number, field: string, value: string) => {
    const newLines = [...form.lines];
    newLines[idx] = { ...newLines[idx], [field]: value };
    setForm({ ...form, lines: newLines });
  };

  const addLine = () => {
    setForm({ ...form, lines: [...form.lines, { accountId: "", debit: "0.00", credit: "0.00" }] });
  };

  const removeLine = (idx: number) => {
    if (form.lines.length <= 2) return;
    setForm({ ...form, lines: form.lines.filter((_, i) => i !== idx) });
  };

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
          <p className="mt-1 text-sm text-slate-500">{transactions.length} journal entries</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          + New Transaction
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">New Journal Entry</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Reference</label>
                  <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "posted" })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option value="draft">Draft</option>
                  <option value="posted">Posted</option>
                </select>
              </div>

              {/* Lines */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-600">Journal Lines</label>
                  <button type="button" onClick={addLine} className="text-xs font-medium text-emerald-600 hover:text-emerald-800">+ Add Line</button>
                </div>
                <div className="mt-2 space-y-2">
                  {form.lines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2">
                      <select value={line.accountId} onChange={(e) => updateLine(idx, "accountId", e.target.value)} className="col-span-5 rounded-lg border border-slate-300 px-2 py-1.5 text-xs">
                        <option value="">Select account...</option>
                        {allAccounts.map((a) => (
                          <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                        ))}
                      </select>
                      <input placeholder="Debit" value={line.debit} onChange={(e) => updateLine(idx, "debit", e.target.value)} className="col-span-3 rounded-lg border border-slate-300 px-2 py-1.5 text-xs" />
                      <input placeholder="Credit" value={line.credit} onChange={(e) => updateLine(idx, "credit", e.target.value)} className="col-span-3 rounded-lg border border-slate-300 px-2 py-1.5 text-xs" />
                      <button type="button" onClick={() => removeLine(idx)} className="col-span-1 text-red-500 hover:text-red-700 text-xs">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">Create</button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div key={tx.id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div
              className="flex cursor-pointer items-center justify-between px-6 py-4"
              onClick={() => setExpanded(expanded === tx.id ? null : tx.id)}
            >
              <div className="flex items-center gap-4">
                <span className="text-lg">{expanded === tx.id ? "▼" : "▶"}</span>
                <div>
                  <p className="text-sm font-medium text-slate-900">{tx.description}</p>
                  <p className="text-xs text-slate-500">{tx.date} {tx.reference && `· ${tx.reference}`}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tx.status === "posted" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {tx.status}
                </span>
                {tx.status === "draft" && (
                  <button onClick={(e) => { e.stopPropagation(); handlePost(tx); }} className="text-xs font-medium text-blue-600 hover:text-blue-800">Post</button>
                )}
                <button onClick={(e) => { e.stopPropagation(); handleDelete(tx.id); }} className="text-xs font-medium text-red-600 hover:text-red-800">Delete</button>
              </div>
            </div>
            {expanded === tx.id && (
              <div className="border-t border-slate-100 px-6 py-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-500">
                      <th className="py-1 text-left">Account</th>
                      <th className="py-1 text-right">Debit</th>
                      <th className="py-1 text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tx.lines.map((line) => (
                      <tr key={line.id} className="text-slate-900">
                        <td className="py-1">{line.accountCode} — {line.accountName}</td>
                        <td className="py-1 text-right">{parseFloat(line.debit) > 0 ? fmt(parseFloat(line.debit)) : ""}</td>
                        <td className="py-1 text-right">{parseFloat(line.credit) > 0 ? fmt(parseFloat(line.credit)) : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200 font-semibold">
                      <td className="py-1">Total</td>
                      <td className="py-1 text-right">{fmt(tx.lines.reduce((s, l) => s + parseFloat(l.debit), 0))}</td>
                      <td className="py-1 text-right">{fmt(tx.lines.reduce((s, l) => s + parseFloat(l.credit), 0))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        ))}
        {transactions.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400">
            No transactions yet
          </div>
        )}
      </div>
    </div>
  );
}
