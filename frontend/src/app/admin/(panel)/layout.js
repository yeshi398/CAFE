import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/backend";
import AdminNav from "@/components/admin/AdminNav";

export const metadata = { title: { default: "Admin", template: "%s · CST Café Admin" }, robots: { index: false } };

// Every page inside admin/(panel) requires a valid admin session (checked by the backend).
export default async function AdminPanelLayout({ children }) {
  const session = await getAdmin();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      <AdminNav name={session.name} email={session.email} />
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
