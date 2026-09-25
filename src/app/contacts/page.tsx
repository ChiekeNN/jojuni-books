"use client";

import { useEffect, useState } from "react";

interface Contact {
  id: string;
  name: string;
  type: "vendor" | "client" | "both";
  email: string | null;
  phone: string | null;
  address: string | null;
}

const TYPE_COLORS: Record<string, string> = {
  vendor: "bg-blue-100 text-blue-700",
  client: "bg-emerald-100 text-emerald-700",
  both: "bg-purple-100 text-purple-700",
};

const TYPE_OPTIONS = ["vendor", "client", "both"] as const;

const emptyForm = { name: "", type: "client" as Contact["type"], email: "", phone: "", address: "" };

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const res = await fetch("/api/contacts");
    setContacts(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await fetch("/api/contacts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing, ...form }),
      });
    } else {
      await fetch("/api/contacts", {
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

  const handleEdit = (c: Contact) => {
    setForm({ name: c.name, type: c.type, email: c.email ?? "", phone: c.phone ?? "", address: c.address ?? "" });
    setEditing(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contact?")) return;
    await fetch(`/api/contacts?id=${id}`, { method: "DELETE" });
    await load();
  };

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;

  const clients = contacts.filter((c) => c.type === "client" || c.type === "both");
  const vendors = contacts.filter((c) => c.type === "vendor" || c.type === "both");

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
          <p className="mt-1 text-sm text-slate-500">{contacts.length} contacts · {clients.length} clients · {vendors.length} vendors</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          + New Contact
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">{editing ? "Edit Contact" : "New Contact"}</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Contact["type"] })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Address</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={2} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">{editing ? "Update" : "Create"}</button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contacts.map((c) => (
          <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[c.type]}`}>{c.type}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(c)} className="text-xs font-medium text-blue-600 hover:text-blue-800">Edit</button>
                <button onClick={() => handleDelete(c.id)} className="text-xs font-medium text-red-600 hover:text-red-800">Delete</button>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-xs text-slate-500">
              {c.email && <p>✉ {c.email}</p>}
              {c.phone && <p>📞 {c.phone}</p>}
              {c.address && <p>📍 {c.address}</p>}
            </div>
          </div>
        ))}
      </div>
      {contacts.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400">No contacts yet</div>
      )}
    </div>
  );
}
