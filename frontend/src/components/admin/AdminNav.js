"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "../Logo";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/orders", label: "Orders", icon: "🧾" },
  { href: "/admin/menu", label: "Menu", icon: "🍲" },
  { href: "/admin/qr", label: "QR codes", icon: "🔳" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function AdminNav({ name, email }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className="no-print bg-coffee text-crema lg:sticky lg:top-0 lg:h-dvh lg:flex lg:flex-col">
      <div className="flex items-center gap-2.5 px-4 py-4 lg:px-5 lg:py-6">
        <Logo size={36} />
        <div className="leading-tight">
          <p className="font-display text-lg font-semibold text-foam">CST Café</p>
          <p className="text-[11px] uppercase tracking-[0.14em] text-crema/70">Admin</p>
        </div>
        <Link href="/" target="_blank" className="ml-auto text-xs font-semibold text-saffron hover:underline lg:hidden">
          View site ↗
        </Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3" aria-label="Admin">
        {LINKS.map((l) => {
          const active = pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                active ? "bg-foam text-coffee" : "text-crema hover:bg-white/10"
              }`}
            >
              <span aria-hidden="true">{l.icon}</span> {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="hidden lg:block mt-auto border-t border-white/10 p-4 text-sm">
        <p className="font-semibold text-foam truncate">{name}</p>
        <p className="text-xs text-crema/70 truncate">{email}</p>
        <div className="mt-3 flex gap-2">
          <Link href="/" target="_blank" className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20">View site ↗</Link>
          <button onClick={logout} className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-chili">Log out</button>
        </div>
      </div>
      <div className="lg:hidden flex justify-end px-4 pb-3">
        <button onClick={logout} className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-white/10">Log out</button>
      </div>
    </aside>
  );
}
