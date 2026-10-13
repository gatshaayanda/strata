import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import PwaRegister from "@/app/pwa-register";
import "./globals.css";
import "./pwa.css";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://strata.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Strata Sa’o Bitsa | Come Get Hooked", template: "%s | Strata Sa’o Bitsa" },
  description: "Fish, chips and good times. Contact Strata Sa’o Bitsa for today’s menu, prices and ordering in Gaborone and Francistown, Botswana.",
  applicationName: "Strata Sa’o Bitsa",
  keywords: ["Strata Sa’o Bitsa", "fish and chips", "food", "Botswana", "Gaborone", "Francistown"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: siteUrl, siteName: "Strata Sa’o Bitsa", title: "Strata Sa’o Bitsa | Come Get Hooked", description: "Fish, chips and good times. Come get hooked." },
  twitter: { card: "summary", title: "Strata Sa’o Bitsa | Come Get Hooked", description: "Fish, chips and good times. Come get hooked." },
  icons: { icon: "/strata-icon.svg", apple: "/strata-icon.svg" },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Strata", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#101010", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><PwaRegister />{children}<Analytics /><SpeedInsights /></body></html>;
}
