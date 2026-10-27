import Link from "next/link";
import { notFound } from "next/navigation";
import { backendGet } from "@/lib/backend";
import AdminOrderDetail from "@/components/admin/AdminOrderDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { orderId } = await params;
  return { title: orderId };
}

export default async function AdminOrderPage({ params }) {
  const { orderId } = await params;
  const [data, cafe] = await Promise.all([
    backendGet(`/api/admin/orders/${encodeURIComponent(orderId)}`, { auth: true }),
    backendGet("/api/settings"),
  ]);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/orders" className="no-print text-sm font-semibold text-ember hover:underline">← All orders</Link>
      <AdminOrderDetail initialOrder={data.order} cafe={cafe} />
    </div>
  );
}
