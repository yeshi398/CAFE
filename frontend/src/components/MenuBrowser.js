"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import MenuItemCard from "./MenuItemCard";
import { useCart } from "./CartProvider";
import { formatNu } from "@/lib/format";

export default function MenuBrowser({ categories, items, table }) {
  const { setOrderType, setTableNumber, count, subtotal, ready } = useCart();
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");

  // Came from a table QR code → dine-in at that table.
  // Wait until the saved cart has loaded, otherwise it would overwrite this.
  useEffect(() => {
    if (ready && table) {
      setOrderType("DINE_IN");
      setTableNumber(String(table));
    }
  }, [ready, table, setOrderType, setTableNumber]);

  const iconFor = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.icon])), [categories]);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .filter((c) => active === "all" || c.id === active)
      .map((c) => ({
        ...c,
        items: items
          .filter((i) => i.categoryId === c.id)
          .filter((i) => !q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
          // available first
          .sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable)),
      }))
      .filter((c) => c.items.length > 0);
  }, [categories, items, active, query]);

  return (
    <div className="pb-28">
      {table && (
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-sage-soft px-4 py-2 font-semibold text-sage">
          🍽 Dine-in · Table {table} selected
        </p>
      )}

      {/* Sticky search + category tabs */}
      <div className="sticky top-[70px] z-30 -mx-4 mt-5 bg-cream/95 px-4 py-3 backdrop-blur">
        <label className="relative block">
          <span className="sr-only">Search the menu</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search momo, coffee, thukpa…"
            className="field pl-11"
          />
          <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-ink/60" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
        </label>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" role="tablist" aria-label="Categories">
          <Tab selected={active === "all"} onClick={() => setActive("all")}>All</Tab>
          {categories.map((c) => (
            <Tab key={c.id} selected={active === c.id} onClick={() => setActive(c.id)}>
              <span aria-hidden="true">{c.icon}</span> {c.name}
            </Tab>
          ))}
        </div>
      </div>

      {sections.length === 0 && (
        <div className="card mt-6 p-8 text-center text-slate-ink">
          {query ? <>Nothing matches “{query}”. Try another word.</> : "No items in this category yet."}
        </div>
      )}

      {sections.map((section) => (
        <section key={section.id} className="mt-8" aria-labelledby={`cat-${section.id}`}>
          <h2 id={`cat-${section.id}`} className="flex items-center gap-2 text-2xl font-semibold">
            <span aria-hidden="true">{section.icon}</span> {section.name}
            <span className="ml-1 text-sm font-sans font-medium text-slate-ink">({section.items.length})</span>
          </h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item) => (
              <MenuItemCard key={item.id} item={item} icon={iconFor[item.categoryId]} />
            ))}
          </div>
        </section>
      ))}

      {/* Floating cart bar on mobile */}
      {ready && count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-4 no-print">
          <Link
            href="/cart"
            className="mx-auto flex max-w-xl items-center justify-between rounded-full bg-coffee px-5 py-3.5 text-foam shadow-2xl hover:bg-coffee-light"
          >
            <span className="font-semibold">
              {count} item{count > 1 ? "s" : ""} · {formatNu(subtotal)}
            </span>
            <span className="font-bold text-saffron">View cart →</span>
          </Link>
        </div>
      )}
    </div>
  );
}

function Tab({ selected, onClick, children }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 h-10 text-sm font-semibold transition border-2 ${
        selected ? "bg-coffee text-foam border-coffee" : "bg-foam text-coffee border-coffee/10 hover:border-coffee/30"
      }`}
    >
      {children}
    </button>
  );
}
