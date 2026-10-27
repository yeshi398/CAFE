"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenFor } from "@/lib/myOrders";

/** If this browser placed the order, reopen the page with its receipt token. */
export default function ReceiptTokenRecovery({ orderId }) {
  const router = useRouter();
  useEffect(() => {
    const t = tokenFor(orderId);
    if (t) router.replace(`/order/${orderId}?t=${encodeURIComponent(t)}`);
  }, [orderId, router]);
  return null;
}
