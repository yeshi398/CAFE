"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminFetch } from "./api";
import FoodImage from "../FoodImage";
import { formatNu } from "@/lib/format";

const EMPTY_ITEM = { name: "", description: "", category: "", price: "", image: "", isAvailable: true, isActive: true, isFeatured: false };

export default function MenuManager() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const [editing, setEditing] = useState(null); // item object or EMPTY_ITEM
  const [filterCat, setFilterCat] = useState("all");
  const [query, setQuery] = useState("");
  const [showHidden, setShowHidden] = useState(true);

  const load = useCallback(async () => {
    try {
      const d = await adminFetch("/api/admin/menu");
      setItems(d.items);
      setCategories(d.categories);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function notify(msg) {
    setFlash(msg);
    setTimeout(() => setFlash(""), 2500);
  }

  async function patchItem(item, changes, msg) {
    try {
      const { item: updated } = await adminFetch(`/api/admin/menu/${item.id}`, { method: "PATCH", body: changes });
      setItems((list) => list.map((i) => (i.id === updated.id ? updated : i)));
      if (msg) notify(msg);
    } catch (e) {
      setError(e.message);
    }
  }

  async function deleteItem(item) {
    if (!confirm(`Permanently delete “${item.name}”?\n\nOld receipts keep their own copy, so they won't change. To just hide it, use “Deactivate” instead.`)) return;
    try {
      await adminFetch(`/api/admin/menu/${item.id}`, { method: "DELETE" });
      setItems((list) => list.filter((i) => i.id !== item.id));
      notify("Item deleted");
    } catch (e) {
      setError(e.message);
    }
  }

  const catName = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);
  const visible = items
    .filter((i) => filterCat === "all" || i.categoryId === filterCat)
    .filter((i) => showHidden || i.isActive)
    .filter((i) => !query || i.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Menu</h1>
          <p className="text-sm text-slate-ink">
            {items.filter((i) => i.isActive).length} items on the menu · {items.filter((i) => i.isActive && !i.isAvailable).length} sold out ·{" "}
            {items.filter((i) => !i.isActive).length} hidden
          </p>
        </div>
        <button className="btn-accent" onClick={() => setEditing({ ...EMPTY_ITEM, category: categories[0]?.id || "" })} disabled={!categories.length}>
          + Add item
        </button>
      </div>

      {flash && <p role="status" className="fixed bottom-5 right-5 z-50 rounded-xl bg-sage px-4 py-3 font-semibold text-white shadow-xl">{flash}</p>}
      {error && (
        <p role="alert" className="mt-4 flex justify-between rounded-xl bg-chili-soft px-4 py-3 font-semibold text-chili">
          {error} <button onClick={() => setError("")} aria-label="Dismiss">✕</button>
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px] items-start">
        <section>
          <div className="card flex flex-wrap items-end gap-3 p-4">
            <label className="flex-1 min-w-40">
              <span className="label">Search</span>
              <input className="field" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Item name" />
            </label>
            <label className="min-w-40">
              <span className="label">Category</span>
              <select className="field" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
                <option value="all">All categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 h-12 text-sm font-semibold">
              <input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} className="h-5 w-5 accent-ember" />
              Show hidden
            </label>
          </div>

          {loading ? (
            <p className="mt-4 text-slate-ink">Loading menu…</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {visible.length === 0 && <li className="card p-6 text-center text-slate-ink">No items found.</li>}
              {visible.map((item) => (
                <li key={item.id} className={`card flex flex-wrap gap-4 p-3 sm:flex-nowrap ${!item.isActive ? "opacity-60" : ""}`}>
                  <FoodImage src={item.image} alt={item.name} icon={catName[item.categoryId]?.icon} seed={item.id} className="h-20 w-20 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold">{item.name}</p>
                      {!item.isActive && <span className="chip bg-coffee/10 text-coffee">Hidden</span>}
                      {item.isActive && !item.isAvailable && <span className="chip bg-chili-soft text-chili">Sold out</span>}
                      {item.isFeatured && <span className="chip bg-saffron/30 text-[#7a4c07]">★ Featured</span>}
                    </div>
                    <p className="text-sm text-slate-ink">{catName[item.categoryId]?.name || "—"} · <strong className="text-ember">{formatNu(item.price)}</strong></p>
                    {item.description && <p className="mt-0.5 line-clamp-1 text-sm text-slate-ink">{item.description}</p>}
                  </div>
                  <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-col sm:items-end">
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <span>{item.isAvailable ? "Available" : "Sold out"}</span>
                      <Toggle
                        checked={item.isAvailable}
                        onChange={(v) => patchItem(item, { isAvailable: v }, v ? `${item.name} is available` : `${item.name} marked sold out`)}
                        label={`Availability of ${item.name}`}
                      />
                    </label>
                    <div className="flex gap-1.5">
                      <button className="btn-primary btn-sm" onClick={() => setEditing(item)}>Edit</button>
                      <button className="btn-ghost btn-sm" onClick={() => patchItem(item, { isActive: !item.isActive }, item.isActive ? "Hidden from customers" : "Back on the menu")}>
                        {item.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button className="btn-ghost btn-sm !text-chili" onClick={() => deleteItem(item)} aria-label={`Delete ${item.name}`}>🗑</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <CategoryPanel categories={categories} items={items} onChange={load} notify={notify} setError={setError} />
      </div>

      {editing && (
        <ItemForm
          item={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={(saved, isNew) => {
            setItems((list) => (isNew ? [...list, saved] : list.map((i) => (i.id === saved.id ? saved : i))).sort((a, b) => a.name.localeCompare(b.name)));
            setEditing(null);
            notify(isNew ? "Item added" : "Changes saved");
          }}
        />
      )}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-sage" : "bg-coffee/25"}`}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-6" : "left-1"}`} />
    </button>
  );
}

function ItemForm({ item, categories, onClose, onSaved }) {
  const isNew = !item.id;
  const [form, setForm] = useState({
    name: item.name,
    description: item.description,
    category: item.categoryId || item.category,
    price: item.price,
    image: item.image,
    isAvailable: item.isAvailable,
    isActive: item.isActive,
    isFeatured: item.isFeatured,
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setError("");
    try {
      const body = { ...form, price: Number(form.price) };
      const { item: saved } = isNew
        ? await adminFetch("/api/admin/menu", { method: "POST", body })
        : await adminFetch(`/api/admin/menu/${item.id}`, { method: "PATCH", body });
      onSaved(saved, isNew);
    } catch (err) {
      setErrors(err.fields || {});
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-espresso/50 p-0 sm:p-4" onClick={onClose}>
      <form
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        className="card max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-b-none sm:rounded-b-[var(--radius-card)] p-5"
        role="dialog"
        aria-modal="true"
        aria-label={isNew ? "Add menu item" : `Edit ${item.name}`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{isNew ? "Add menu item" : "Edit item"}</h2>
          <button type="button" onClick={onClose} className="h-10 w-10 rounded-full hover:bg-coffee/10" aria-label="Close">✕</button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <F label="Name *" error={errors.name} className="sm:col-span-2">
            <input className="field" value={form.name} onChange={(e) => set("name", e.target.value)} required maxLength={80} />
          </F>
          <F label="Category *" error={errors.category}>
            <select className="field" value={form.category} onChange={(e) => set("category", e.target.value)}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </F>
          <F label="Price (Nu.) *" error={errors.price}>
            <input className="field" type="number" min="0" step="0.5" inputMode="decimal" value={form.price} onChange={(e) => set("price", e.target.value)} required />
          </F>
          <F label="Description" error={errors.description} className="sm:col-span-2">
            <textarea className="field min-h-20 py-3" value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={300} />
          </F>
          <F label="Image URL or path" error={errors.image} className="sm:col-span-2">
            <input className="field" value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://… or /images/menu/momo.jpg" />
            <span className="mt-1 block text-xs text-slate-ink">Leave empty to show a coloured tile with the category icon.</span>
          </F>
          {form.image && (
            <div className="sm:col-span-2">
              <FoodImage src={form.image} alt="Preview" className="h-32 w-full rounded-xl" />
            </div>
          )}
          <div className="sm:col-span-2 grid gap-2">
            <Check label="Available to order (untick when sold out)" checked={form.isAvailable} onChange={(v) => set("isAvailable", v)} />
            <Check label="Show on the menu (untick to hide/deactivate)" checked={form.isActive} onChange={(v) => set("isActive", v)} />
            <Check label="Featured on the home page" checked={form.isFeatured} onChange={(v) => set("isFeatured", v)} />
          </div>
        </div>
        {error && <p role="alert" className="mt-4 rounded-xl bg-chili-soft px-3 py-2 text-sm font-semibold text-chili">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={saving}>{saving ? "Saving…" : isNew ? "Add item" : "Save changes"}</button>
        </div>
      </form>
    </div>
  );
}

function CategoryPanel({ categories, items, onChange, notify, setError }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🍽️");
  const [busy, setBusy] = useState(false);
  const counts = items.reduce((m, i) => ((m[i.categoryId] = (m[i.categoryId] || 0) + 1), m), {});

  async function call(fn, msg) {
    setBusy(true);
    try {
      await fn();
      await onChange();
      notify(msg);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="card p-4 lg:sticky lg:top-6">
      <h2 className="text-xl font-semibold">Categories</h2>
      <ul className="mt-3 space-y-1.5">
        {categories.map((c, idx) => (
          <li key={c.id} className={`flex items-center gap-2 rounded-xl px-2 py-1.5 ${!c.isActive ? "opacity-50" : ""}`}>
            <span aria-hidden="true">{c.icon}</span>
            <span className="flex-1 text-sm font-semibold">
              {c.name} <span className="font-normal text-slate-ink">({counts[c.id] || 0})</span>
            </span>
            <button
              disabled={busy || idx === 0}
              title="Move up"
              aria-label={`Move ${c.name} up`}
              className="h-7 w-7 rounded hover:bg-coffee/10 disabled:opacity-20"
              onClick={() => {
                // Swap with the one above, then save positions 1..n for all
                const order = [...categories];
                [order[idx - 1], order[idx]] = [order[idx], order[idx - 1]];
                call(
                  () =>
                    Promise.all(
                      order.map((x, j) => adminFetch(`/api/admin/categories/${x.id}`, { method: "PATCH", body: { sortOrder: j + 1 } }))
                    ),
                  "Order updated"
                );
              }}
            >
              ↑
            </button>
            <button
              disabled={busy}
              className="h-7 rounded px-1.5 text-xs font-semibold hover:bg-coffee/10"
              onClick={() =>
                call(
                  () => adminFetch(`/api/admin/categories/${c.id}`, { method: "PATCH", body: { isActive: !c.isActive } }),
                  c.isActive ? `${c.name} hidden` : `${c.name} shown`
                )
              }
            >
              {c.isActive ? "Hide" : "Show"}
            </button>
            <button
              disabled={busy}
              className="h-7 rounded px-1.5 text-xs font-semibold hover:bg-coffee/10"
              onClick={() => {
                const n = prompt("Rename category", c.name);
                if (n && n.trim() !== c.name) call(() => adminFetch(`/api/admin/categories/${c.id}`, { method: "PATCH", body: { name: n.trim() } }), "Renamed");
              }}
            >
              Rename
            </button>
            <button
              disabled={busy}
              aria-label={`Delete ${c.name}`}
              className="h-7 w-7 rounded text-chili hover:bg-chili-soft"
              onClick={() => confirm(`Delete category “${c.name}”?`) && call(() => adminFetch(`/api/admin/categories/${c.id}`, { method: "DELETE" }), "Category deleted")}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-4 border-t border-coffee/10 pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          call(async () => {
            await adminFetch("/api/admin/categories", { method: "POST", body: { name: name.trim(), icon, sortOrder: categories.length + 1 } });
            setName("");
          }, "Category added");
        }}
      >
        <span className="label">Add category</span>
        <div className="flex gap-2">
          <input className="field w-16 px-2 text-center" value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={8} aria-label="Icon (emoji)" />
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Desserts" maxLength={40} />
        </div>
        <button className="btn-primary btn-sm mt-2 w-full" disabled={busy || !name.trim()}>Add</button>
      </form>
    </aside>
  );
}

function F({ label, error, className = "", children }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm font-semibold text-chili">{error}</span>}
    </label>
  );
}

function Check({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 text-sm font-semibold">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-ember" />
      {label}
    </label>
  );
}
