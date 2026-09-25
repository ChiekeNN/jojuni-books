"use client";

import { useEffect, useState } from "react";

interface Contact {
  id: string;
  name: string;
  type: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
}

interface Invoice {
  id: string;
  number: string;
  contactId: string;
  contactName: string;
  type: "sales" | "purchase";
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string;
  subtotal: string;
  taxAmount: string;
  total: string;
  notes: string | null;
  items: InvoiceItem[];
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-500",
};

const emptyItem = { description: "", quantity: "1", unitPrice: "0.00", amount: "0.00" };

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const [form, setForm] = useState({
    number: "",
    contactId: "",
    type: "sales" as "sales" | "purchase",
    status: "draft" as Invoice["status"],
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    notes: "",
    items: [{ ...emptyItem }],
  });

  const load = async () => {
    const [invRes, conRes] = await Promise.all([fetch("/api/invoices"), fetch("/api/contacts")]);
    setInvoices(await invRes.json());
    setAllContacts(await conRes.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const recalc = (items: typeof form.items) => {
    const subtotal = items.reduce((s, i) => s + parseFloat(i.quantity) * parseFloat(i.unitPrice), 0);
    return { subtotal: subtotal.toFixed(2), taxAmount: "0.00", total: subtotal.toFixed(2) };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const calc = recalc(form.items);
    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, ...calc, items: form.items.map((i) => ({ ...i, amount: (parseFloat(i.quantity) * parseFloat(i.unitPrice)).toFixed(2) })) }),
    });
    setShowForm(false);
    await load();
  };

  const handleStatusChange = async (inv: Invoice, status: Invoice["status"]) => {
    await fetch("/api/invoices", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...inv, status, items: inv.items }),
    });
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    await fetch(`/api/invoices?id=${id}`, { method: "DELETE" });
    await load();
  };

  const updateItem = (idx: number, field: string, value: string) => {
    const newItems = [...form.items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setForm({ ...form, items: newItems });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { ...emptyItem }] });
  const removeItem = (idx: number) => {
    if (form.items.length <= 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const filtered = filter === "all" ? invoices : invoices.filter((i) => i.type === filter);

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="mt-1 text-sm text-slate-500">{invoices.length} invoices total</p>
        </div>
        <div className="flex gap-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="all">All Types</option>
            <option value="sales">Sales</option>
            <option value="purchase">Purchase</option>
          </select>
          <button onClick={() => setShowForm(true)} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            + New Invoice
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">New Invoice</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600">Invoice Number</label>
                  <input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "sales" | "purchase" })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                    <option value="sales">Sales</option>
                    <option value="purchase">Purchase</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Contact</label>
                <select value={form.contactId} onChange={(e) => setForm({ ...form, contactId: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required>
                  <option value="">Select contact...</option>
                  {allContacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600">Issue Date</label>
                  <input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-600">Line Items</label>
                  <button type="button" onClick={addItem} className="text-xs font-medium text-emerald-600">+ Add Item</button>
                </div>
                <div className="mt-2 space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2">
                      <input placeholder="Description" value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} className="col-span-5 rounded-lg border border-slate-300 px-2 py-1.5 text-xs" required />
                      <input placeholder="Qty" type="number" step="0.01" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} className="col-span-2 rounded-lg border border-slate-300 px-2 py-1.5 text-xs" />
                      <input placeholder="Price" type="number" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", e.target.value)} className="col-span-3 rounded-lg border border-slate-300 px-2 py-1.5 text-xs" />
                      <button type="button" onClick={() => removeItem(idx)} className="col-span-1 text-red-500 text-xs">✕</button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-right text-sm font-semibold text-slate-900">
                  Total: {fmt(parseFloat(recalc(form.items).total))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={2} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">Create</button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div className="space-y-3">
        {filtered.map((inv) => (
          <div key={inv.id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex cursor-pointer items-center justify-between px-6 py-4" onClick={() => setExpanded(expanded === inv.id ? null : inv.id)}>
              <div className="flex items-center gap-4">
                <span className="text-lg">{expanded === inv.id ? "▼" : "▶"}</span>
                <div>
                  <p className="text-sm font-medium text-slate-900">{inv.number}</p>
                  <p className="text-xs text-slate-500">{inv.contactName} · {inv.type} · Due {inv.dueDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm font-semibold text-slate-900">{fmt(parseFloat(inv.total))}</p>
                <select
                  value={inv.status}
                  onChange={(e) => { e.stopPropagation(); handleStatusChange(inv, e.target.value as Invoice["status"]); }}
                  onClick={(e) => e.stopPropagation()}
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[inv.status]}`}
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(inv.id); }} className="text-xs font-medium text-red-600 hover:text-red-800">Delete</button>
              </div>
            </div>
            {expanded === inv.id && (
              <div className="border-t border-slate-100 px-6 py-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-500">
                      <th className="py-1 text-left">Item</th>
                      <th className="py-1 text-right">Qty</th>
                      <th className="py-1 text-right">Unit Price</th>
                      <th className="py-1 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inv.items.map((item) => (
                      <tr key={item.id} className="text-slate-900">
                        <td className="py-1">{item.description}</td>
                        <td className="py-1 text-right">{item.quantity}</td>
                        <td className="py-1 text-right">{fmt(parseFloat(item.unitPrice))}</td>
                        <td className="py-1 text-right">{fmt(parseFloat(item.amount))}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200 font-semibold">
                      <td className="py-1" colSpan={3}>Total</td>
                      <td className="py-1 text-right">{fmt(parseFloat(inv.total))}</td>
                    </tr>
                  </tfoot>
                </table>
                {inv.notes && <p className="mt-3 text-xs text-slate-500">Notes: {inv.notes}</p>}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400">No invoices yet</div>
        )}
      </div>
    </div>
  );
}
