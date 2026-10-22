import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import PwaRegister from "@/app/pwa-register";
import "./globals.css";
import "./pwa.css";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: { default: "Strata Sa’o Bitsa | Come Get Hooked", template: "%s | Strata Sa’o Bitsa" },
  description: "Order from Strata Sa’o Bitsa in Gaborone or Francistown. Choose your branch, send an order request and track updates in one place.",
  applicationName: "Strata Sa’o Bitsa",
  keywords: ["Strata Sa’o Bitsa", "fish and chips", "food", "Botswana", "Gaborone", "Francistown"],
  openGraph: { type: "website", siteName: "Strata Sa’o Bitsa", title: "Strata Sa’o Bitsa | Come Get Hooked", description: "Fish, chips and good times. Come get hooked." },
  twitter: { card: "summary", title: "Strata Sa’o Bitsa | Come Get Hooked", description: "Fish, chips and good times. Come get hooked." },
  icons: { icon: "/strata-icon.svg", apple: "/stratalogo.jpeg" },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Strata", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#101010", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><PwaRegister />{children}<Analytics /><SpeedInsights /></body></html>;
}
