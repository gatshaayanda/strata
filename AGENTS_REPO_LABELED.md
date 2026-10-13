# Strata Sa’o Bitsa — Labelled Repository Map

## Evidence boundary
Repository source inspected through GitHub connector on 13 October 2026. The branch is a working implementation checkpoint, not a verified release. No local Node/npm runtime, Firebase Emulator, browser/device session, Firebase deployment or Vercel deployment has been executed from this workspace.

## Runtime and identity

| Label | Path | Responsibility / state |
|---|---|---|
| A01 | src/app/page.tsx | New customer landing page; area selection, Firestore menu preview, honest empty/error state, links to ordering. |
| A02 | src/app/layout.tsx | Strata metadata, canonical URL from NEXT_PUBLIC_BASE_URL, theme, icons and early install prompt capture. |
| A03 | src/app/manifest.ts | Generated PWA manifest for Strata Sa’o Bitsa. |
| A04 | public/manifest.webmanifest | Static manifest kept aligned with generated manifest. |
| A05 | public/strata-icon.svg | New Strata fish mark. PNG icon assets and real device installation remain to verify. |
| A06 | scripts/identity.config.json | Expected app name, short name, theme, icon, cache prefix and identity-sensitive file list. |
| A07 | scripts/verify-identity.mjs | Checks identity surfaces, manifest consistency, icon existence, cache namespace and target Firebase ID. |
| A08 | public/sw.js | Strata shell/media cache namespaces; private order/admin routes are network-only; offline route is a fallback, not an order-delivery claim. |
| A09 | src/app/pwa-register.tsx and src/app/pwa.css | Single install controller, explicit CTA, iOS/manual fallback, embedded-browser handoff and connectivity messages. Device verification NOT RUN. |

## Customer flow

| Label | Path | Responsibility / state |
|---|---|---|
| C01 | src/app/order/page.tsx | Routes to guest order form. |
| C02 | src/app/order/order-form.tsx | Reads published menu, supports Gaborone/Francistown selection, cart, pickup/delivery, contact details, notes, submission and confirmation. |
| C03 | src/app/api/orders/route.ts | Server endpoint verifies Firebase ID token, validates form and item IDs, reloads current menu prices, computes total and creates idempotent order record. Requires a matching Firebase Admin service account. |
| C04 | src/app/my-orders/page.tsx | Lists current UID's orders; guest history remains browser/session-bound. |
| C05 | src/app/offline/page.tsx | Honest offline boundary and return paths. |
| C06 | src/app/request/page.tsx | Legacy route redirects to /order. |
| C07 | src/app/account/page.tsx | Legacy route redirects to /my-orders. |

## Operations and data

| Label | Path | Responsibility / state |
|---|---|---|
| O01 | src/app/admin/page.tsx | Protected operations route. |
| O02 | src/app/admin/admin-gate.tsx | Shared-word bootstrap login and Firebase admins/{uid} role check; isolated variable STRATA_OPERATIONS_WORD. This is a temporary bootstrap pattern and needs an owner-controlled long secret. |
| O03 | src/app/api/operations-login/route.ts | Creates isolated strata-temporary-operations admin record only after access-word validation and project-ID checks. Requires FIREBASE_ADMIN_KEY. |
| O04 | src/components/StrataOperationsDashboard.tsx | Live order queue, order-status transitions, manual payment records, menu CRUD and simple item-quantity reporting. |
| O05 | src/lib/firebase/data.ts | Order/menu types and Firestore helpers. Starter menu seeding was disabled; menu cache key is now Strata-specific. Legacy fields/functions remain for review. |
| O06 | firestore.rules | Public menu reads, owner/admin order reads, staff/admin updates; direct client order creation disabled so the API must validate price. Source rules are NOT deployed. |
| O07 | storage.rules | Strata menu-media path replaces the inherited BOEMO media path. Upload UX/rules integration not tested or deployed. |
| O08 | .firebaserc | Firebase CLI default pinned to strata-6706b. No Firebase CLI operation has been run. |
| O09 | .env.example | Supplied public Firebase web config; server Admin credential and operations word remain blank. |

## Inherited subsystem disposition

- KEEP/ADAPT: PWA registration/install mechanics, Firebase anonymous-auth pattern, basic menu/order types and admin-role rule pattern—subject to runtime/rules verification.
- ADAPT: order data and menu CRUD helpers; menu availability/prices must be owner-confirmed and recalculated server-side when ordering.
- REPLACE: The Plug homepage, customer order route, account route, offline copy, PWA brand, operations dashboard, app metadata and identity verification.
- EXCLUDE/REDIRECT: old sourcing request/account/saved-find/community admin routes are redirected where known. Do not delete underlying legacy components, collections, API routes, storage paths or scheduled jobs until callers and data implications have been traced.
- NOT YET CLASSIFIED: inherited notifications, upload endpoints, old conversation collections, community feeds, analytics, scheduled jobs and remaining storage rules. They must not be assumed reusable or enabled in Strata.

## Configuration gates

1. Copy .env.example to .env.local in the local checkout. The public web config is already supplied in the template; set NEXT_PUBLIC_BASE_URL=http://localhost:3000 for local work.
2. In Firebase Console for strata-6706b, enable Anonymous Authentication and create/verify Firestore. Confirm target project and authorized domains before tests.
3. Create a service account for the same Firebase project and set its JSON as server-only FIREBASE_ADMIN_KEY in local environment. Confirm its project_id equals strata-6706b and set FIREBASE_PROJECT_ID to the same value.
4. Set a long unique STRATA_OPERATIONS_WORD in local server environment. Do not commit it.
5. Add owner-confirmed menu items through /admin after admin access is configured. No sample menu is seeded.
6. Run identity, typecheck, lint, build and diff checks. Then test auth/rules in Firebase Emulator before deploying rules. No rules or Vercel deployment without explicit authorization.

## Verification status

- Identity and customer/operations implementation: source changes committed on working branch; static/runtime checks NOT RUN from a local checkout.
- TypeScript, lint, build, Firebase Emulator tests: NOT RUN.
- Firebase Authentication/Firestore/Storage configured in console: NOT VERIFIED.
- Order endpoint end-to-end save and retry: NOT RUN; BLOCKED until Admin credentials and owner-confirmed menu records are configured.
- Native install, embedded-browser handoff, offline/reconnect, real-device testing: NOT RUN.
- Firebase rules deployment and Vercel deployment: NOT RUN.