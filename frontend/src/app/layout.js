import "./globals.css";

export const metadata = {
  title: {
    default: "CST Café – Order Online",
    template: "%s · CST Café",
  },
  description:
    "Browse the CST Café menu at the College of Science and Technology, Bhutan. Order online and pay at the counter.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4a2c1d",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
        />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
