"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LIMITS } from "@/lib/constants";
import { round2 } from "@/lib/format";

/**
 * Cart state, saved in localStorage so it survives page refreshes.
 * Prices here are for DISPLAY ONLY – the server recalculates everything
 * from the database when the order is placed.
 */
const CartContext = createContext(null);
const STORAGE_KEY = "cst-cafe-cart-v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{ id, name, price, image, quantity }]
  const [orderType, setOrderType] = useState("TAKEAWAY");
  const [tableNumber, setTableNumber] = useState("");
  const [ready, setReady] = useState(false);

  // Load once on the client
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && Array.isArray(saved.items)) {
        setItems(saved.items.filter((i) => i && i.id && i.quantity > 0));
        if (saved.orderType === "DINE_IN" || saved.orderType === "TAKEAWAY") setOrderType(saved.orderType);
        if (saved.tableNumber) setTableNumber(String(saved.tableNumber));
      }
    } catch {
      /* corrupted storage – start fresh */
    }
    setReady(true);
  }, []);

  // Save on every change
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, orderType, tableNumber }));
    } catch {
      /* private mode / storage full – cart still works for this visit */
    }
  }, [items, orderType, tableNumber, ready]);

  const addItem = useCallback((item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: Math.min(LIMITS.MAX_QTY_PER_ITEM, p.quantity + quantity) } : p
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image || "",
          quantity: Math.min(LIMITS.MAX_QTY_PER_ITEM, quantity),
        },
      ];
    });
  }, []);

  const setQuantity = useCallback((id, quantity) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((p) => p.id !== id)
        : prev.map((p) => (p.id === id ? { ...p, quantity: Math.min(LIMITS.MAX_QTY_PER_ITEM, quantity) } : p))
    );
  }, []);

  const removeItem = useCallback((id) => setItems((prev) => prev.filter((p) => p.id !== id)), []);
  const clearCart = useCallback(() => setItems([]), []);

  /** Refresh names/prices from the live menu and flag items that can't be ordered now. */
  const syncWithMenu = useCallback((menuItems) => {
    const byId = new Map(menuItems.map((m) => [m.id, m]));
    setItems((prev) =>
      prev.map((p) => {
        const m = byId.get(p.id);
        return m
          ? { ...p, name: m.name, price: m.price, image: m.image, unavailable: !m.isAvailable }
          : { ...p, unavailable: true };
      })
    );
  }, []);

  const value = useMemo(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = round2(items.reduce((s, i) => s + i.price * i.quantity, 0));
    return {
      ready,
      items,
      count,
      subtotal,
      orderType,
      setOrderType,
      tableNumber,
      setTableNumber,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      syncWithMenu,
    };
  }, [ready, items, orderType, tableNumber, addItem, setQuantity, removeItem, clearCart, syncWithMenu]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
