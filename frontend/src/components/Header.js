"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "./Logo";
import { useCart } from "./CartProvider";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/track-order", label: "Track Order" },
];

export default function Header() {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="no-print sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-coffee/10">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center gap-2 sm:gap-3">
        <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
          <Logo size={38} />
          <span className="leading-tight">
            <span className="block font-display text-xl font-semibold text-coffee">CST Café</span>
            <span className="hidden sm:block text-[11px] uppercase tracking-[0.14em] text-slate-ink">Rinchending · Phuentsholing</span>
          </span>
        </Link>

        <nav className="ml-auto hidden md:flex items-center gap-1" aria-label="Main">
          {NAV.map((n) => {
            const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  active ? "bg-coffee text-foam" : "text-coffee hover:bg-coffee/10"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/cart"
          className="ml-auto md:ml-2 relative inline-flex items-center gap-2 rounded-full bg-ember text-white pl-3.5 pr-4 h-11 font-semibold hover:brightness-110"
          aria-label={`Cart, ${ready ? count : 0} items`}
        >
          <CartIcon />
          <span className="hidden min-[400px]:inline text-sm">Cart</span>
          <span
            className={`min-w-6 h-6 px-1.5 rounded-full grid place-items-center text-xs font-bold ${
              count > 0 ? "bg-foam text-ember" : "bg-white/25 text-white"
            }`}
          >
            {ready ? count : 0}
          </span>
        </Link>

        <button
          className="md:hidden h-11 w-11 grid place-items-center rounded-full text-coffee hover:bg-coffee/10"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label="Menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-coffee/10 bg-cream px-4 py-2" aria-label="Mobile">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-lg font-semibold text-coffee border-b border-coffee/5 last:border-0"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
      <div className="kira-band h-1.5" aria-hidden="true" />
    </header>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 7h12l-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
