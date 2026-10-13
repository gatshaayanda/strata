# Strata Sa’o Bitsa — Project Operating Contract

## Product
Strata Sa’o Bitsa is a Botswana fish-and-chips/food business using **COME GET HOOKED**, with intended launch markets Gaborone and Francistown. Business contact: 77 762 614 (+267 777 62614).

The product goal is a mobile-first storefront and ordering/operations PWA. Browsing, guest ordering and website access must not require installation or customer sign-in. Never invent menu items/prices, opening hours, service points, delivery zones/fees, payment methods, delivery timing or customer demand.

## Workflow and evidence
- User is product owner/final reviewer; ChatGPT is technical navigator/implementation partner.
- Workflow: UNDERSTAND → INSPECT → PLAN → IMPLEMENT → VERIFY → CHECKPOINT.
- GitHub is the source of truth. A commit is not proof of a successful build, current deployment or working production behavior.
- Make small, controlled changes. Do not invent repository/configuration/runtime state.
- User handles Vercel shipping unless explicitly asked otherwise. Do not deploy, merge, mutate live services/data or incur material costs without authorization.
- If a test fails or behavior is unexpected: STOP → inspect actual state → identify the first failure → fix → verify.
- Record material checks as PASS, FAIL, NOT RUN or BLOCKED. Distinguish source inspection from local build, deployed integration and real-device verification.

## Current implementation checkpoint
- Repository: `gatshaayanda/strata`, branch `main`.
- Storefront: `src/app/page.tsx`; styling: `src/app/globals.css`; committed visual assets in `public/strata-assets/`.
- Order request: `src/app/order/page.tsx`. It silently uses Firebase Anonymous Auth, writes customer requests to `orderRequests`, and displays a reference only after the Firestore write resolves. This is a request, not confirmed checkout/payment.
- Customer account: `src/app/account/page.tsx`. It lists only the current UID's requests with live status/message updates and offers optional Google linking to the anonymous session.
- Staff operations: `src/app/operations/page.tsx`. Google sign-in is checked against `admins/{uid}`; only owner/staff roles can read/update the queue.
- Data helpers: `src/lib/firebase/strata-orders.ts`; Firebase client and offline Firestore cache: `src/lib/firebase/client.ts`.
- Firestore rules: `firestore.rules` is now Strata-only. Customers can create/read their own request, staff can update status/message, and all other collections are denied. Admin roles must be provisioned manually in Firebase Console.
- Firebase client configuration is documented in `.env.example`; real Web App values must be configured in the deployment environment. Do not guess credentials.
- PWA: `src/app/pwa-register.tsx`, `src/app/pwa.css`, `src/app/manifest.ts`, `public/manifest.webmanifest`, `public/sw.js`. Public homepage, order-form shell and visual assets are cached. Customer records/admin pages are not cached. Order submission/history require connectivity; offline submission is explicitly blocked.
- Inherited account page has been replaced; `src/middleware.ts` still redirects legacy Plug-only request/admin routes. The Strata operations queue is at `/operations`, not `/admin`.
- Known business gaps: no verified live menu/price catalogue, total calculation, online payment, delivery assignment, push notification or automatic outbound WhatsApp messaging. Do not describe these as implemented.
- Missing visual asset at prior copy checkpoint: `image_987b17.png`.
- No local build, live Firebase rules test, deployed customer journey, PWA install, or physical-device iOS test has been verified in this checkpoint.

## Firebase setup gate
1. Configure the actual Web App values for project `strata-6706b` using `NEXT_PUBLIC_FIREBASE_*` variables documented in `.env.example`.
2. Enable Anonymous and Google providers in Firebase Authentication and add the deployed hostname to authorised domains.
3. Publish `firestore.rules`.
4. Provision `admins/{uid}` manually with `role: "owner"` or `role: "staff"`; clients must never be able to create/change roles.
5. Test guest request → reference → My Requests → staff status/message update → customer live update.
6. Test offline shell/form reopening separately from online submission; test Android and iOS installation separately.

## Next acceptance criteria
- Firebase setup complete and owner account provisioned.
- Identity check, typecheck, lint and production build pass on the exact pushed commit.
- Deployed customer request can be created, read only by its owner, and updated only by staff.
- Unauthorized users cannot read the queue or change status; customer cannot edit/delete a saved request.
- PWA public shell works offline without caching private records; actual install and iOS behavior tested on devices.
- Business confirms actual menu, prices, hours, locations, delivery terms and payment methods before full checkout is built.
