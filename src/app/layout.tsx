import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import PwaRegister from "@/app/pwa-register";
import Script from "next/script";
import "./globals.css";
import "./pwa.css";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://strata-wheat-gamma.vercel.app";
const strataLogo = "/stratalogo.jpeg";
const EMBEDDED_BROWSER_PATTERN = /WhatsApp|Instagram|FBAN|FBAV|Messenger|Line[/]|Twitter|TikTok|Snapchat/i;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Strata Sa’o Bitsa | Come Get Hooked", template: "%s | Strata Sa’o Bitsa" },
  description: "Order from Strata Sa’o Bitsa in Gaborone or Francistown. Choose your branch, send an order request and track updates in one place.",
  applicationName: "Strata Sa’o Bitsa",
  keywords: ["Strata Sa’o Bitsa", "fish and chips", "food", "Botswana", "Gaborone", "Francistown"],
  openGraph: { type: "website", siteName: "Strata Sa’o Bitsa", title: "Strata Sa’o Bitsa | Come Get Hooked", description: "Fish, chips and good times. Come get hooked.", images: [{ url: strataLogo, alt: "Strata Sa’o Bitsa original logo" }] },
  twitter: { card: "summary", title: "Strata Sa’o Bitsa | Come Get Hooked", description: "Fish, chips and good times. Come get hooked.", images: [{ url: strataLogo, alt: "Strata Sa’o Bitsa original logo" }] },
  icons: { icon: [{ url: "/strata-brand-logo.svg", type: "image/svg+xml" }], apple: "/apple-touch-icon.png" },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Strata", statusBarStyle: "black-translucent" },
};
export const viewport: Viewport = { themeColor: "#101010", colorScheme: "light" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get("user-agent") || "";
  const requestedWith = requestHeaders.get("x-requested-with") || "";
  const embedded = EMBEDDED_BROWSER_PATTERN.test(userAgent)
    || (/Android/i.test(userAgent) && /\bwv\b/i.test(userAgent))
    || /^(com\.whatsapp|com\.instagram\.android|com\.facebook\.katana|com\.facebook\.lite|com\.facebook\.orca)$/i.test(requestedWith);
  const android = /Android/i.test(userAgent);
  return <html lang="en"><body style={embedded ? { overflow: "hidden" } : undefined}>
    <Script id="strata-early-install-capture" strategy="beforeInteractive">{String.raw\`
(function () {
  window.addEventListener("beforeinstallprompt", function (event) {
    var standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    if (standalone || window.__strataPwaListenerReady === true) return;
    event.preventDefault();
    window.__strataInstallPrompt = event;
  });
})();
\`}</Script>
    <PwaRegister initialEmbedded={embedded} initialAndroid={android} />
    {children}<Analytics /><SpeedInsights />
  </body></html>;
}
