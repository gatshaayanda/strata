import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const criticalFiles = [
  "src/app/page.tsx",
  "src/app/order/page.tsx",
  "src/app/account/page.tsx",
  "src/app/operations/page.tsx",
  "src/app/layout.tsx",
  "src/app/pwa-register.tsx",
  "public/manifest.webmanifest",
  "public/sw.js",
  "public/strata-icon.svg",
  "public/strata-brand-logo.svg"
];
const forbidden = [
  /the plug/i,
  /theplug/i,
  /plug-icon/i,
  /sneakers\s*[·&]\s*apparel/i,
  /boemo-joos-food-deals/i,
  /meating[ -]?place/i,
  /namane[ -]?tyres/i,
  /atlas[ -]?service[ -]?centre/i
];
const failures = [];

for (const rel of criticalFiles) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    failures.push(`${rel}: required Strata identity/PWA file is missing`);
    continue;
  }
  const content = fs.readFileSync(file, "utf8");
  for (const pattern of forbidden) {
    if (pattern.test(content)) failures.push(`${rel}: inherited identity match ${pattern}`);
  }
}

const manifestPath = path.join(root, "public/manifest.webmanifest");
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (manifest.name !== "Strata Sa’o Bitsa — Come Get Hooked") failures.push("manifest: wrong full app name");
  if (manifest.short_name !== "Strata") failures.push("manifest: wrong short app name");
  if (manifest.theme_color !== "#101010") failures.push("manifest: wrong theme color");
  if (!manifest.icons?.some(icon => icon.src === "/strata-brand-logo.svg")) failures.push("manifest: original Strata logo SVG missing");
  if (!manifest.icons?.some(icon => icon.src === "/stratalogo.jpeg")) failures.push("manifest: original Strata logo image missing");
}
const swPath = path.join(root, "public/sw.js");
if (fs.existsSync(swPath)) {
  const sw = fs.readFileSync(swPath, "utf8");
  if (!/strata-shell-v\d+/.test(sw)) failures.push("service worker: missing Strata-specific cache namespace");
  if (!sw.includes("/strata-brand-logo.svg")) failures.push("service worker: original Strata logo SVG missing from app shell");
  if (!sw.includes("/stratalogo.jpeg")) failures.push("service worker: original Strata logo image missing from app shell");
  if (/theplug-shell-|plug-icon\.svg|firebase-messaging-compat/.test(sw)) failures.push("service worker: inherited cache, icon, or messaging dependency remains");
}

const publicJourneyFiles = [
  "src/app/page.tsx",
  "src/app/order/page.tsx",
  "src/app/account/page.tsx"
];
const forbiddenPublicContact = [
  /wa\.me/i,
  /api\.whatsapp\.com/i,
  /whatsapp/i,
  /tel:/i,
  /77762614/
];
for (const rel of publicJourneyFiles) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, "utf8");
  for (const pattern of forbiddenPublicContact) {
    if (pattern.test(content)) failures.push(rel + ": public ordering must not hand off to messaging or publish a business contact number (" + pattern + ")");
  }
}
const homePath = path.join(root, "src/app/page.tsx");
const orderPath = path.join(root, "src/app/order/page.tsx");
if (fs.existsSync(homePath)) {
  const home = fs.readFileSync(homePath, "utf8");
  if (!home.includes('name: "Gaborone"') || !home.includes('name: "Francistown"') || !home.includes('"/order?city=" + encodeURIComponent(city.name)')) failures.push("storefront: both branch cards must route their selected city into the order form");
}
if (fs.existsSync(orderPath)) {
  const order = fs.readFileSync(orderPath, "utf8");
  if (!order.includes("Choose a city")) failures.push("order form: direct entry must require explicit branch selection");
}


const installPath = path.join(root, "src/app/pwa-register.tsx");
if (fs.existsSync(installPath)) {
  const install = fs.readFileSync(installPath, "utf8");
  if (!install.includes('src="/strata-brand-logo.svg"')) failures.push("PWA install UI: original Strata logo must be displayed in install surfaces");
  if (!install.includes("beforeinstallprompt") || !install.includes("prompt.prompt()")) failures.push("PWA install: native prompt must be retained and invoked from the branded install action");
  if (!install.includes("isIosSafari") || !install.includes("Add to Home Screen")) failures.push("PWA install: iOS Safari Add to Home Screen guidance is missing");
  if (!install.includes('Boolean(deferredPrompt || isIosSafari())')) failures.push("PWA install: install card must only appear for a native prompt or iOS Safari");
}
const layoutPath = path.join(root, "src/app/layout.tsx");
if (fs.existsSync(layoutPath)) {
  const layout = fs.readFileSync(layoutPath, "utf8");
  if (!layout.includes("strata-early-install-capture") || !layout.includes("beforeInteractive") || !layout.includes("__strataInstallPrompt")) failures.push("PWA install: early beforeinstallprompt capture is missing");
}

if (failures.length) {
  console.error("STRATA IDENTITY VERIFICATION FAILED");
  for (const failure of failures) console.error(" - " + failure);
  process.exit(1);
}
console.log("STRATA IDENTITY VERIFIED — active storefront and PWA shell use Strata branding and an isolated cache.");
console.log("Note: /admin remains redirected; the Strata-native staff queue is available at /operations after Firebase setup.");
