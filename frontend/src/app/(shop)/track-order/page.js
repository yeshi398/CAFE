import { Suspense } from "react";
import OrderTracker from "@/components/OrderTracker";

export const metadata = { title: "Track your order" };

export default function TrackOrderPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-8">
      <h1 className="text-4xl font-semibold">Track your order</h1>
      <p className="mt-1 text-slate-ink">Enter the Order ID from your receipt, e.g. CST-20261020-001.</p>
      <Suspense fallback={null}>
        <OrderTracker />
      </Suspense>
    </div>
  );
}
