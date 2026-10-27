import Link from "next/link";
import { backendGet } from "@/lib/backend";

export default async function Footer() {
  let s = null;
  try {
    s = await backendGet("/api/settings");
  } catch {
    /* backend down – show a minimal footer */
  }
  return (
    <footer className="no-print mt-16 bg-coffee text-crema">
      <div className="kira-band h-1.5" aria-hidden="true" />
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 sm:grid-cols-3 text-sm">
        <div>
          <p className="font-display text-xl text-foam">{s?.cafeName || "CST Café"}</p>
          <p className="mt-2 text-crema/80 leading-relaxed">
            Fresh food for the CST community – order online, pay at the counter.
          </p>
        </div>
        {s && (
          <div>
            <p className="font-semibold text-foam">Find us</p>
            <p className="mt-2 text-crema/80 leading-relaxed">{s.location}</p>
            <p className="mt-2 text-crema/80">
              {s.phone}
              {s.email ? ` · ${s.email}` : ""}
            </p>
          </div>
        )}
        <div>
          <p className="font-semibold text-foam">Quick links</p>
          <ul className="mt-2 space-y-1.5">
            <li><Link className="hover:text-saffron" href="/menu">Menu</Link></li>
            <li><Link className="hover:text-saffron" href="/track-order">Track your order</Link></li>
            <li><Link className="hover:text-saffron" href="/admin/login">Staff login</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-crema/60">
        College of Science and Technology · Royal University of Bhutan
      </p>
    </footer>
  );
}
