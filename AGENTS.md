# Strata Sa’o Bitsa — Project Contract

## Product
Strata Sa’o Bitsa is a Botswana fish-and-food ordering and operations PWA under the brand line COME GET HOOKED. The intended markets are Gaborone and Francistown. This is the destination product; The Plug is only the inspected software foundation.

## Roles and workflow
- Product owner/final reviewer: user.
- Technical navigator and implementation partner: ChatGPT.
- GitHub is the source of truth; the owner handles Vercel shipping unless explicitly authorized otherwise.
- Workflow: UNDERSTAND → INSPECT → PLAN → IMPLEMENT → VERIFY → CHECKPOINT.
- Unexpected result: STOP → inspect reality → identify first failure → fix → verify.
- Make the smallest controlled change, preserve working behavior, review the diff and report evidence. Never claim runtime, Firebase, payment, notification, install or deployment success without executing the relevant check.

## Customer outcome
- Customers can browse without signing in or installing the PWA.
- The menu is read from Strata's dedicated Firebase project. Do not invent dishes, portions, prices, stock, branch addresses, delivery zones or fees.
- Orders are guest-first and require a selected service area (Gaborone/Francistown), customer name and contact, menu items, pickup/delivery choice, and delivery landmark when applicable.
- A submitted order is a request until staff accepts it. Show a reference only after the server confirms persistence. No online payment is claimed or enabled by the current implementation.
- Order history is private to the Firebase UID and available in the same browser session. Do not imply that anonymous history follows a customer across devices.
- The website must remain usable without installation. Keep one install controller, a single explicit install action, correct iOS Safari guidance, and embedded-browser handoff where required. Never simulate installation.

## Operations and data
- /admin is the protected staff/owner workspace for the order queue, menu CRUD, status transitions, manual payment records and basic order-volume signals.
- Admin access uses the isolated STRATA_OPERATIONS_WORD bootstrap gate and a dedicated Firebase Admin credential. Configure a long, unique value outside source control. Do not reuse The Plug's access word or admin identity.
- /api/orders verifies the Firebase ID token, checks each submitted menu item against the current menu record and recalculates prices server-side. Direct client order creation is disabled in firestore.rules.
- The server-side Firebase Admin service account must belong to the same project as NEXT_PUBLIC_FIREBASE_PROJECT_ID and FIREBASE_PROJECT_ID; the API checks this before initializing Admin SDK.
- Only authorized staff may update orders or menu records through Firestore rules. Public menu reads are allowed; private order reads remain owner/admin scoped.
- The menu collection must contain owner-confirmed items. No inherited starter menu is seeded.
- Manual payment status is an operational record, not proof from a payment provider. Do not call recorded item value revenue or claim online payment.
- Delivery partners, Pata/DuelaEasy, live GPS, rewards wallet, automated inventory and supplier workflows are not integrated until researched and explicitly scoped.

## Configuration and security
- .env.example contains public Firebase web-app configuration for project strata-6706b. Public Firebase web config is not a server secret.
- Keep FIREBASE_ADMIN_KEY and STRATA_OPERATIONS_WORD server-only; never prefix them with NEXT_PUBLIC_ or commit their values.
- .firebaserc defaults Firebase CLI to strata-6706b; verify the active project before any Firebase CLI operation.
- Source rules/indexes are not deployed rules/indexes. Do not deploy Firebase configuration, mutate production data, connect production services, or deploy Vercel without explicit authorization.
- Never reuse The Plug/BOEMO credentials, data, phone numbers, social links, service-account JSON, cache namespaces or identity assets.
- Do not delete inherited collections, routes, storage paths or scheduled jobs until their callers and data implications are checked. Legacy The Plug sourcing/community components are not part of the Strata customer journey and should remain redirected or excluded until their dependencies are deliberately retired.

## Commands and gates
Run npm ci, npm run verify:identity, npx tsc --noEmit, npm run lint, npm run build and git diff --check where those commands exist.

Run only checks that exist and report exact results. A build does not prove Firebase auth/rules, server credentials, push receipt, payment integration, PWA install, or real-device behavior.

## Current checkpoint
- Target repo: gatshaayanda/strata.
- Implementation branch: strata/identity-reset-foundation.
- Identity, customer storefront, guest order form/API, order history and first operations dashboard are in progress on this branch.
- Not yet verified locally: install dependencies, TypeScript, lint, production build, Firebase Emulator/rules tests, real browser/device PWA flow.
- Blockers before an end-to-end order can save: owner-confirmed menu items in Firestore, Anonymous Authentication enabled, Firestore database/rules configured in the target project, a valid matching FIREBASE_ADMIN_KEY, and a unique STRATA_OPERATIONS_WORD.
- Vercel deployment and Firebase rules deployment: NOT RUN.