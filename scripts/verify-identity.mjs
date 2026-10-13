import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const criticalFiles = [
  "src/app/page.tsx",
  "src/app/layout.tsx",
  "src/app/manifest.ts",
  "src/app/pwa-register.tsx",
  "public/manifest.webmanifest",
  "public/sw.js",
  "public/strata-icon.svg"
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
  if (!manifest.icons?.some(icon => icon.src === "/strata-icon.svg")) failures.push("manifest: Strata icon missing");
}
const swPath = path.join(root, "public/sw.js");
if (fs.existsSync(swPath)) {
  const sw = fs.readFileSync(swPath, "utf8");
  if (!/strata-shell-v\d+/.test(sw)) failures.push("service worker: missing Strata-specific cache namespace");
  if (!sw.includes("/strata-icon.svg")) failures.push("service worker: Strata icon missing from app shell");
  if (/theplug-shell-|plug-icon\.svg|firebase-messaging-compat/.test(sw)) failures.push("service worker: inherited cache, icon, or messaging dependency remains");
}
if (failures.length) {
  console.error("STRATA IDENTITY VERIFICATION FAILED");
  for (const failure of failures) console.error(" - " + failure);
  process.exit(1);
}
console.log("STRATA IDENTITY VERIFIED — active storefront and PWA shell use Strata branding and an isolated cache.");
console.log("Note: legacy inherited account/admin routes still require separate replacement before operations launch.");
