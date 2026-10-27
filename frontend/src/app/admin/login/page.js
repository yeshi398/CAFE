import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/backend";
import LoginForm from "./LoginForm";
import Logo from "@/components/Logo";

export const metadata = { title: "Admin login", robots: { index: false } };

export default async function AdminLoginPage() {
  if (await getAdmin().catch(() => null)) redirect("/admin/dashboard");
  return (
    <div className="grid min-h-dvh place-items-center bg-coffee px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo size={64} />
          <h1 className="mt-3 text-3xl font-semibold text-foam">CST Café Admin</h1>
          <p className="text-sm text-crema/80">Café staff only</p>
        </div>
        <div className="card p-6">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
