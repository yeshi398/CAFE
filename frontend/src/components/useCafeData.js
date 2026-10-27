"use client";

import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";

/**
 * Loads live settings (charges, tables, open/closed) and refreshes cart
 * prices against the current menu. Used by the cart and checkout pages.
 */
export function useCafeData() {
  const { syncWithMenu, ready } = useCart();
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      try {
        const [mRes, sRes] = await Promise.all([fetch("/api/menu", { cache: "no-store" }), fetch("/api/settings", { cache: "no-store" })]);
        if (!mRes.ok || !sRes.ok) throw new Error();
        const [menu, s] = await Promise.all([mRes.json(), sRes.json()]);
        if (cancelled) return;
        syncWithMenu(menu.items);
        setSettings(s);
      } catch {
        if (!cancelled) setError("Couldn't refresh the latest prices. Check your connection – the café will confirm the final total.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, syncWithMenu]);

  return { settings, error, loading };
}
