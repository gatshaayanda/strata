# Strata Sa’o Bitsa — Project Operating Contract

## Product
Strata Sa’o Bitsa is a Botswana fish-and-chips/food business using **COME GET HOOKED**, with intended launch markets Gaborone and Francistown. The public product is an in-app ordering journey; do not publish business phone numbers or send customers to WhatsApp.

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
- Staff operations: `/operations` (and `/admin` redirects there) uses a server-checked access word at `src/app/api/operations-login/route.ts`, then a Firebase custom token and `admins/{uid}` role check. The server creates its fixed temporary operations role document; clients cannot write admin roles.
- Data helpers: `src/lib/firebase/strata-orders.ts`; Firebase client and offline Firestore cache: `src/lib/firebase/client.ts`.
- Firestore rules: `firestore.rules` is Strata-only. Customers can create/read their own request; owner/staff can update status/message; all other collections are denied. The server-side Operations endpoint provisions its fixed role document with Firebase Admin. Firebase Storage client rules remain deny-all; media upload is intended to use UploadThing, not Firebase Storage.
- Firebase client configuration is documented in `.env.example`; real Web App values must be configured in the deployment environment. Do not guess credentials.
- PWA: `src/app/pwa-register.tsx`, `src/app/pwa.css`, `src/app/manifest.ts`, `public/manifest.webmanifest`, `public/sw.js`. Public homepage, order-form shell, five local JPEGs and `public/strata-assets/stat.mp4` are precached under `strata-shell-v3`; public same-origin images/videos can also be cached after being viewed. Customer records and operations pages are not cached. Order submission/history require connectivity; offline submission is explicitly blocked.
- The customer account page has been replaced. Legacy Plug request/admin subroutes remain redirected; `/admin` is now an alias redirecting to Strata `/operations`.
- The Strata server endpoint `/api/operations-login` checks `STRATA_OPERATIONS_WORD` and issues a Firebase custom token using `FIREBASE_ADMIN_KEY`. UploadThing handler is enabled at `/api/uploadthing`; configure `UPLOADTHING_TOKEN` before expecting uploads to work. The endpoint currently accepts the legacy image/PDF router limits; no upload UI or upload persistence workflow is yet part of the customer ordering journey.
- Removed inherited Firebase rules deployment workflow and scheduled Plug production reminder workflow. Workflow run `38371808720` failed while writing the Firebase service account; the deployment step was skipped. No Firebase rules deployment was performed by that run.
- Known business gaps: no verified live menu/price catalogue, total calculation, online payment, delivery assignment, push notification or automatic outbound WhatsApp messaging. Do not describe these as implemented.
- Missing visual asset at prior copy checkpoint: `image_987b17.png`.
- No local build, live Firebase rules test, deployed customer journey, PWA install, or physical-device iOS test has been verified in this checkpoint.

## Firebase setup gate
1. Configure the actual Web App values for project `strata-6706b` using `NEXT_PUBLIC_FIREBASE_*` variables documented in `.env.example`.
2. Enable Anonymous and Google providers in Firebase Authentication and add the deployed hostname to authorised domains.
3. Publish `firestore.rules`.
4. Configure server-only `FIREBASE_ADMIN_KEY` for the same Firebase project and set a private `STRATA_OPERATIONS_WORD` in the deployment environment. Never expose either through a `NEXT_PUBLIC_*` variable.
5. Configure `UPLOADTHING_TOKEN` if/when the UploadThing upload UI is added.
6. Test guest request → reference → My Requests → Operations access-word login → status/message update → customer live update.
7. Test offline shell/form reopening and all precached JPEG/video assets separately from online submission; test Android and iOS installation separately.

## Next acceptance criteria
- Firebase web configuration and Firestore rules are set; the private Operations word and matching Firebase Admin service account are configured server-side.
- Identity check, typecheck, lint and production build pass on the exact pushed commit.
- Deployed customer request can be created, read only by its owner, and updated only by staff.
- Unauthorized users cannot read the queue or change status; customer cannot edit/delete a saved request.
- PWA public shell works offline without caching private records; actual install and iOS behavior tested on devices.
- Business confirms actual menu, prices, hours, locations, delivery terms and payment methods before full checkout is built.


---

## Customer journey contract — reviewed 2026-10-18

This section supersedes any earlier public-flow notes that imply customers should contact Strata outside the app.

### Product promise and exclusions

- The public app exists to help customers submit and follow food-order requests for the **Gaborone** or **Francistown** branch.
- No public WhatsApp links, messaging handoffs, business phone numbers, telephone CTAs, or "contact us for the menu" detours. The primary and secondary customer actions must remain within Strata.
- Customer contact details entered on an order are different from business contact details. Collect a customer phone number only as an optional fulfilment aid, explain why it may be used, and never display the business phone number.
- Do not invent a live menu, product names, prices, stock, delivery fee, service radius, opening hours, payment options, collection slot, or ETA. The current order form accepts an item-and-quantity description because an approved structured catalogue and prices have not yet been evidenced. Do not call it a full cart/checkout until a real catalogue, price calculation and fulfilment rules exist.
- A submitted request is not a confirmed order, payment receipt, delivery guarantee, or evidence that the branch has accepted the request. Only display a reference after Firestore confirms the write.
- No installation or account is required to browse or submit an order. Google linking is optional and must never block a guest order.

### Canonical customer flow

1. **Discover:** one concise hero with the Strata promise and a single primary action, “Choose your branch”. Keep “My Requests” available but secondary.
2. **Choose location:** the customer explicitly chooses Gaborone or Francistown. Branch choice travels into /order?city=Gaborone or /order?city=Francistown; a direct visit to /order must not silently default the customer to a city.
3. **Describe the order:** collect name, branch, fulfilment method, requested items/quantities, delivery area only when delivery is selected, optional customer phone and optional order note. Use persistent labels, explicit required/optional language, sensible input autocomplete and only reveal conditional fields when needed.
4. **Review and submit:** the submit label says “Submit order request”, not “Pay”, “Buy now” or “Confirm order”. Disable duplicate submission while saving. Retain entered details after offline/network errors. Explain a phone field's fulfilment purpose rather than asking for a number without context.
5. **Confirm receipt:** show success only after the Firestore write resolves. Display the request reference, selected branch, clear next steps, and the difference between saved request and confirmed order. If saving fails, do not show a reference or claim success.
6. **Return:** My Requests shows the current browser session's requests and status/staff messages. Never expose another customer's requests. A request/status change does not imply payment or delivery is complete.
7. **Optional account continuity:** after a request is saved, offer a calm, skippable explanation that Google can help retain access to order history on another device. Do not interrupt order completion with forced registration. Do not promise histories from separate Firebase identities will merge automatically.
8. **Staff handoff:** the Operations queue is the internal source of truth for reviewing requests and writing status/messages. Staff messages appear in My Requests; do not claim SMS, push, email or WhatsApp notification delivery unless that integration is implemented and receipt verified.

### Visual hierarchy and behavioural design

- Follow the Sefalana Shop & Collect pattern of a bold, image-led hero, an immediately visible primary action, scannable content blocks and a persistent, understandable route toward the core task. Adapt it to food ordering; do not copy Sefalana's alcohol catalogue, age gate, pilot labels, synthetic products, sample pricing, or nonfunctional demo checkout.
- Follow Tripple S's useful post-submit onboarding pattern: acknowledge the saved request first, explain the next step, and offer optional account continuity without interrupting the task. Do not copy clinic-specific features, health content, appointment flows, or irrelevant profile fields.
- Prefer one primary action per section, concise supporting copy, consistent button labels and clear visual grouping. Avoid duplicate search bars, repeated calls to action, unnecessary decorative panels, competing sticky banners, and dead-end links.
- Keep branch selection visible before order details. Preserve branch selection when navigating to the order form. If a future catalogue is approved, filter it by the selected branch only when real branch availability data exists.
- Use a progressive-disclosure rule: ask only what is needed for the current fulfilment choice. Delivery location is required only for delivery. Optional notes stay optional. Do not add account, payment, address or notification steps without a real product need.
- On narrow screens, keep the primary action visible, use a single-column form, prevent horizontal overflow, ensure focus indicators and readable contrast, respect reduced-motion settings, and use accessible labels/status announcements. Never rely on colour alone for request status.
- Keep public images and the local video as enhancements, not blockers. The site must remain usable if media fails or motion is reduced. Service-worker caching is not proof of offline playback; verify offline media on actual browsers separately.

### Decision science and usability evidence

Use evidence to reduce friction, not to justify arbitrary simplification. The following research informed the journey:

- Baymard Institute, *Checkout UX 2025: 10 Pitfalls and Best Practices* (updated 25 Nov 2025): https://baymard.com/research-articles/current-state-of-checkout-ux — supports prominent guest checkout, clear fulfilment choices, appropriate optional-field handling, adaptive errors and explaining why a phone number is requested.
- Baymard Institute, *Make “Guest Checkout” the Most Prominent Option* (17 Jan 2023): https://baymard.com/research-articles/make-guest-checkout-prominent — supports keeping guest ordering obvious rather than forcing registration or hiding it behind a secondary link.
- Baymard Institute, *Checkout UX: Optimize Your Order Flow*: https://baymard.com/blog/checkout-flow-ux-optimization — supports concise field sets, persistent labels, scannability, transparent progress and retaining a path back without losing entered data.
- Scheibehenne, Greifeneder & Todd, *Choice overload: A conceptual review and meta-analysis*, Journal of Consumer Psychology 25(2), 333–358 (2015), DOI: https://doi.org/10.1016/j.jcps.2014.08.002 — meta-analysis of 99 observations (N=7,202) found that choice overload depends on complexity, task difficulty, preference uncertainty and decision goals. Therefore, keep the first decision to branch choice; do not assume that fewer options alone always improve decisions.
- Apply these findings contextually: explicit branch choice reduces wrong-branch ambiguity; a short request form reduces irrelevant effort; transparent status copy avoids false expectations; optional account linking preserves autonomy; and clear error recovery helps users continue after connectivity failures.

### Regression gates for the public journey

- Search active customer-facing source for wa.me, api.whatsapp.com, whatsapp, tel: and the former business contact number. No business-contact handoff may remain in homepage, order request, customer history, or public footers.
- Confirm both branch CTAs carry the correct city into the order form, and a direct /order visit requires a city selection.
- Confirm delivery reveals and requires the delivery location; pickup does not ask for a delivery address.
- Confirm no product prices, availability, delivery fees or ETA are fabricated.
- Confirm failed/offline submission retains form input and never displays a success reference.
- Confirm a successful request can be found in My Requests in the same browser session, with status/message updates still working.
- Confirm Google linking is optional, the post-submit prompt is dismissible by simply continuing, and customer history remains private.
- Run identity verification, TypeScript, lint and production build on the exact candidate commit. Then separately verify deployed behavior and real-device/PWA/offline behavior. Do not infer runtime success from a source diff or build alone.

### Recovery checkpoint

- Pre-change preserved source: main at f64805a369cc96cada54ff4fc59f965eafaca0d3 (13 Oct 2026).
- Recovery branch: checkpoint/strata-before-order-flow-2026-10-18.
- Implementation branch for this controlled slice: feat/order-first-customer-flow-2026-10-18.
- Do not rewrite or delete the recovery branch. Keep unrelated operational/PWA/security behavior intact while refining the customer flow.
