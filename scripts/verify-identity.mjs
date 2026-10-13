import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "scripts/identity.config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const failures = [];

function requireText(file, pattern, description) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) { failures.push(`${file}: missing file required for ${description}`); return; }
  const content = fs.readFileSync(full, "utf8");
  if (!pattern.test(content)) failures.push(`${file}: ${description} not found`);
}

for (const file of config.identityFiles) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) { failures.push(`${file}: identity file missing`); continue; }
  const content = fs.readFileSync(full, "utf8");
  for (const forbidden of config.forbiddenSourcePatterns) {
    if (content.toLowerCase().includes(forbidden.toLowerCase())) failures.push(`${file}: inherited identity remains: ${forbidden}`);
  }
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (pkg.name !== "strata-sao-bitsa") failures.push("package.json: package name must be strata-sao-bitsa");

const publicManifest = JSON.parse(fs.readFileSync(path.join(root, "public/manifest.webmanifest"), "utf8"));
if (publicManifest.name !== config.appName) failures.push("public/manifest.webmanifest: app name does not match identity config");
if (publicManifest.short_name !== config.shortName) failures.push("public/manifest.webmanifest: short name does not match identity config");
if (publicManifest.theme_color !== config.themeColor) failures.push("public/manifest.webmanifest: theme color does not match identity config");
if (!publicManifest.icons?.some(icon => icon.src === config.icon && icon.type === "image/svg+xml")) failures.push("public/manifest.webmanifest: canonical SVG icon missing");
if (!fs.existsSync(path.join(root, "public", config.icon.replace(/^\//, "")))) failures.push("configured icon asset does not exist");

const generatedManifest = fs.readFileSync(path.join(root, "src/app/manifest.ts"), "utf8");
if (!generatedManifest.includes(config.appName) || !generatedManifest.includes(config.shortName) || !generatedManifest.includes(config.themeColor) || !generatedManifest.includes(config.icon)) {
  failures.push("src/app/manifest.ts: generated manifest does not match identity config");
}
const layout = fs.readFileSync(path.join(root, "src/app/layout.tsx"), "utf8");
if (!layout.includes(config.appName) || !layout.includes(config.icon) || !layout.includes(config.themeColor)) failures.push("src/app/layout.tsx: metadata, icon or theme does not match identity config");

const sw = fs.readFileSync(path.join(root, "public/sw.js"), "utf8");
if (!new RegExp(config.cachePrefix + "shell-v\\d+").test(sw)) failures.push("public/sw.js: unique Strata shell cache namespace missing");
if (!sw.includes(config.icon)) failures.push("public/sw.js: Strata icon missing from app shell");

const envExample = fs.readFileSync(path.join(root, ".env.example"), "utf8");
if (!envExample.includes("NEXT_PUBLIC_FIREBASE_PROJECT_ID=strata-6706b")) failures.push(".env.example: target Firebase project ID mismatch");
if (!envExample.includes("STRATA_OPERATIONS_WORD=")) failures.push(".env.example: isolated operations bootstrap variable missing");

if (failures.length) {
  console.error("IDENTITY VERIFICATION FAILED");
  for (const failure of failures) console.error(" - " + failure);
  process.exit(1);
}
console.log("IDENTITY VERIFIED — Strata Sa’o Bitsa metadata, manifest, icon, cache namespace and target Firebase config are aligned.");
