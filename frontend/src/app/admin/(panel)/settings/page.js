import { backendGet } from "@/lib/backend";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const settings = await backendGet("/api/admin/settings", { auth: true });
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold">Settings</h1>
      <p className="text-sm text-slate-ink">Café details shown to customers and on receipts, plus ordering options.</p>
      <SettingsForm initial={settings} />
    </div>
  );
}
