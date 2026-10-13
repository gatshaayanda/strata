import type {Metadata,Viewport} from "next";
import {headers} from "next/headers";
import {Analytics} from "@vercel/analytics/next";
import {SpeedInsights} from "@vercel/speed-insights/next";
import PwaRegister from "@/app/pwa-register";
import Script from "next/script";
import "./globals.css"; import "./pwa.css";
const siteUrl=process.env.NEXT_PUBLIC_BASE_URL||"http://localhost:3000";
const EMBEDDED_BROWSER_PATTERN=/WhatsApp|Instagram|FBAN|FBAV|Messenger|Line[/]|Twitter|TikTok|Snapchat/i;
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:"Strata Sa’o Bitsa | Fish & Food",template:"%s | Strata Sa’o Bitsa"},description:"Order fish and food from Strata Sa’o Bitsa. COME GET HOOKED.",applicationName:"Strata Sa’o Bitsa",keywords:["Strata Sa’o Bitsa","fish","food","Gaborone","Francistown","Botswana"],alternates:{canonical:"/"},openGraph:{type:"website",url:siteUrl,siteName:"Strata Sa’o Bitsa",title:"Strata Sa’o Bitsa | Fish & Food",description:"COME GET HOOKED. Fish and food, made easy."},twitter:{card:"summary",title:"Strata Sa’o Bitsa | Fish & Food",description:"COME GET HOOKED. Fish and food, made easy."},icons:{icon:"/strata-icon.svg",apple:"/strata-icon.svg"},manifest:"/manifest.webmanifest",appleWebApp:{capable:true,title:"Strata Sa’o Bitsa",statusBarStyle:"default"}};
export const viewport:Viewport={themeColor:"#D71920",colorScheme:"light"};
export default async function RootLayout({children}:{children:React.ReactNode}){
 const requestHeaders=await headers();
 const userAgent=requestHeaders.get("user-agent")||"";
 const requestedWith=requestHeaders.get("x-requested-with")||"";
 // A social referrer does not prove this browser is embedded: Chrome opened from WhatsApp
 // must not be trapped in the in-app-browser install gate.
 const embedded=EMBEDDED_BROWSER_PATTERN.test(userAgent)
   || (/Android/i.test(userAgent)&&/\bwv\b/i.test(userAgent))
   || /^(com\.whatsapp|com\.instagram\.android|com\.facebook\.katana|com\.facebook\.lite|com\.facebook\.orca)$/i.test(requestedWith);
 const android=/Android/i.test(userAgent);
 return <html lang="en"><body style={embedded?{overflow:"hidden"}:undefined}><Script id="strata-early-install-capture" strategy="beforeInteractive">{`
(function () {
  window.addEventListener("beforeinstallprompt", function (event) {
    var standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    if (standalone || window.__strataPwaListenerReady === true) return;
    event.preventDefault();
    window.__strataInstallPrompt = event;
  });
})();
`}</Script><PwaRegister initialEmbedded={embedded} initialAndroid={android}/>{children}<Analytics/><SpeedInsights/></body></html>
}
