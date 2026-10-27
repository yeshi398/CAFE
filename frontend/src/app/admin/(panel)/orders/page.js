import { Suspense } from "react";
import OrdersManager from "@/components/admin/OrdersManager";

export const metadata = { title: "Orders" };

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<p className="text-slate-ink">Loading orders…</p>}>
      <OrdersManager />
    </Suspense>
  );
}
