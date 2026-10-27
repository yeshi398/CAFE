import QRCode from "qrcode";
import { getSiteUrl, isLocalUrl, menuUrl } from "@/lib/site";
import { backendGet } from "@/lib/backend";
import QrTools from "@/components/admin/QrTools";

export const dynamic = "force-dynamic";
export const metadata = { title: "QR codes" };

export default async function QrPage() {
  const [siteUrl, settings] = await Promise.all([getSiteUrl(), backendGet("/api/settings")]);
  const url = menuUrl(siteUrl);
  const preview = await QRCode.toDataURL(url, { width: 480, margin: 2, color: { dark: "#3b2416", light: "#ffffff" } });
  const local = isLocalUrl(siteUrl);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="no-print text-3xl font-semibold">QR codes</h1>
      <p className="no-print text-sm text-slate-ink">Customers scan with their phone camera — no app needed. The code opens the menu.</p>

      {local && (
        <p role="alert" className="no-print mt-4 rounded-xl bg-chili-soft px-4 py-3 text-sm font-semibold text-chili">
          ⚠ These codes point to <code>{siteUrl}</code>, which only works on this computer. Before printing, deploy the
          site and set <code>NEXT_PUBLIC_SITE_URL</code> to the real public address (see README → “QR codes”).
        </p>
      )}

      <QrTools siteUrl={siteUrl} menuLink={url} preview={preview} tableCount={settings.tableCount} cafeName={settings.cafeName} />
    </div>
  );
}
