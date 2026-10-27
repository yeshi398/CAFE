import Link from "next/link";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="card max-w-md p-10 text-center">
        <div className="flex justify-center"><Logo size={64} /></div>
        <h1 className="mt-4 text-3xl font-semibold">Not found</h1>
        <p className="mt-2 text-slate-ink">
          We couldn&apos;t find that page or order. If you typed an Order ID, check it matches your receipt
          (e.g. CST-20261020-001).
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/menu" className="btn-primary">Menu</Link>
          <Link href="/track-order" className="btn-ghost">Track order</Link>
        </div>
      </div>
    </div>
  );
}
