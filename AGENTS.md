# Strata Sa’o Bitsa — Project Operating Contract

## Product
Strata Sa’o Bitsa is a Botswana fish-and-chips/food business using **COME GET HOOKED**, with intended launch markets Gaborone and Francistown. The public product is an in-app ordering journey; do not publish business phone numbers or send customers to WhatsApp.

The product goal is a mobile-first storefront and ordering/operations PWA. Browsing, guest ordering and website access must not require installation or customer sign-in. The approved starter menu is Fish & Chips and Fish & Rice; both are seeded with editable provisional P70 prices. Fish & Chips at P70 is benchmarked against Lion Park Resort's published Gaborone menu; Fish & Rice at P70 is a provisional suggestion, not a verified Strata price. The business must confirm or edit these values. Never invent additional menu items, opening hours, service points, delivery zones/fees, payment methods, delivery timing or customer demand.

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
- Menu: `src/lib/firebase/strata-menu.ts` owns the public `strataMenu` collection and two starter records (Fish & Chips, Fish & Rice). The storefront and order form subscribe to current records. `/operations` supports publishing the starter items once, create/edit/delete, price changes, and show/hide. Public reads are allowed; only the Operations role can mutate menu records under `firestore.rules`. The P70 starter values are provisional and the business must confirm them. The order form displays a menu estimate and stores item/quantity/price snapshots in each request; no online payment, inventory, branch-specific pricing or stock control is implemented.\n- Remaining business gaps: delivery assignment, push notification and outbound notification delivery. Do not describe these as implemented.
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
- Do not collect or display customer phone numbers or publish business phone numbers. Do not add WhatsApp links, telephone links, external messaging handoffs or contact-us detours. Customers follow request status and staff messages inside My Requests. Legacy phone values may remain in old records for compatibility, but must not be surfaced in the current UI or copied into new requests.
- Use the two approved starter items only as seeded editable suggestions: Fish & Chips and Fish & Rice. Starter prices are provisional (P70 each); the business must confirm or edit them. Do not invent additional menu items, stock, delivery fee, service radius, opening hours, payment options, collection slot or ETA. The order form calculates a clearly labelled menu estimate from current editable prices but remains an order request, not a payment checkout.
- A submitted request is not a confirmed order, payment receipt, delivery guarantee, or evidence that the branch has accepted the request. Only display a reference after Firestore confirms the write.
- No installation or account is required to browse or submit an order. Google linking is optional and must never block a guest order.

### Canonical customer flow

1. **Discover:** one concise hero with the Strata promise and a single primary action, “Choose your branch”. Keep “My Requests” available but secondary.
2. **Choose location:** the customer explicitly chooses Gaborone or Francistown. Branch choice travels into /order?city=Gaborone or /order?city=Francistown; a direct visit to /order must not silently default the customer to a city.
3. **Choose food and describe the order:** show the editable Fish & Chips and Fish & Rice starter catalogue with prices and quantity selectors; let customers choose quantities and add an optional special request. Collect name, branch and fulfilment method; request a delivery location only for delivery. Do not collect a customer phone number. Use persistent labels, explicit required/optional language, sensible input autocomplete and only reveal conditional fields when needed.
4. **Review and submit:** the submit label says “Submit order request”, not “Pay”, “Buy now” or “Confirm order”. Disable duplicate submission while saving. Retain entered details after offline/network errors. Do not ask for phone/contact details; tell customers to follow progress and staff messages in My Requests.
5. **Confirm receipt:** show success only after the Firestore write resolves. Display the request reference, selected branch, clear next steps, and the difference between saved request and confirmed order. If saving fails, do not show a reference or claim success.
6. **Return:** My Requests shows the current browser session's requests and status/staff messages. Never expose another customer's requests. A request/status change does not imply payment or delivery is complete.
7. **Optional account continuity:** after a request is saved, offer a calm, skippable explanation that Google can help retain access to order history on another device. Do not interrupt order completion with forced registration. Do not promise histories from separate Firebase identities will merge automatically.
8. **Staff handoff:** the Operations queue is the internal source of truth for reviewing requests and writing status/messages. Staff messages appear in My Requests; do not claim SMS, push, email or WhatsApp notification delivery unless that integration is implemented and receipt verified.

### Visual hierarchy and behavioural design

- The landing page is a task-entry page, not a contact directory: one strong hero action leads to two unmistakable branch choices. Keep My Requests secondary. Remove redundant repeated CTAs from editorial/photo sections when they compete with the branch chooser.
- The customer confirmation screen must acknowledge the saved request, show a concise summary (branch, fulfilment, requested items, delivery location only when applicable), and provide one dominant next action to My Requests. Avoid two buttons that lead to the same destination.
- Keep updates inside Strata. No customer phone fields, business phone numbers, WhatsApp, SMS, or external contact workflow. Explain this through concise copy so customers know where to return for updates.


- Follow the Sefalana Shop & Collect pattern of a bold, image-led hero, an immediately visible primary action, scannable content blocks and a persistent, understandable route toward the core task. Adapt it to food ordering; do not copy Sefalana's alcohol catalogue, age gate, pilot labels, synthetic products, sample pricing, or nonfunctional demo checkout.
- Follow Tripple S's useful post-submit onboarding pattern: acknowledge the saved request first, explain the next step, and offer optional account continuity without interrupting the task. Do not copy clinic-specific features, health content, appointment flows, or irrelevant profile fields.
- Prefer one primary action per section, concise supporting copy, consistent button labels and clear visual grouping. Avoid duplicate search bars, repeated calls to action, unnecessary decorative panels, competing sticky banners, and dead-end links.
- Keep branch selection visible before order details and preserve the selected city in the order form. The starter menu is shared across Gaborone and Francistown until the business provides verified branch-specific menu or availability data. Never imply that branch stock or price differences are known.
- Use a progressive-disclosure rule: ask only what is needed for the current fulfilment choice. Delivery location is required only for delivery. Optional notes stay optional. Do not add account, payment, address or notification steps without a real product need.
- On narrow screens, keep the primary action visible, use a single-column form, prevent horizontal overflow, ensure focus indicators and readable contrast, respect reduced-motion settings, and use accessible labels/status announcements. Never rely on colour alone for request status.
- Keep public images and the local video as enhancements, not blockers. The site must remain usable if media fails or motion is reduced. Service-worker caching is not proof of offline playback; verify offline media on actual browsers separately.

### Menu and order selection decision

- Start with a deliberately small two-item menu (Fish & Chips, Fish & Rice), not a broad invented catalogue. Customers choose quantities before submitting; free text is reserved for optional exceptions, not the default ordering method.
- Display each current price next to the item and calculate a visible menu estimate from those prices. Label the estimate provisional and state that the branch confirms the final price and availability. Do not add payment collection, delivery fees or inventory claims without real systems and approved business policy.
- Menu CRUD lives in Operations. Staff can create, edit, show/hide and delete items. Public menu reads are read-only; Firestore rules restrict writes to the Strata admin role. The initial seed action must never overwrite an existing menu.
- Price benchmark: Lion Park Resort's official Gaborone menu lists fried hake fillet and chips at P70: https://www.lionpark.co.bw/restuarant-menu/. Fish & Rice is seeded at the same P70 only as an editable placeholder, not as a verified Strata or direct competitor price. Business owner confirmation is required.
- Familiar named choices and quantity selectors make an order more explicit than a blank text box; treat this as a design rationale, not a proven conversion result. Validate through actual customer use. Keep the menu shared across both cities until verified branch-specific data exists.

### Decision science and usability evidence

Use evidence to reduce friction, not to justify arbitrary simplification. The following research informed the journey:

- Baymard Institute, *Checkout UX 2025: 10 Pitfalls and Best Practices* (updated 25 Nov 2025): https://baymard.com/research-articles/current-state-of-checkout-ux — supports prominent guest checkout, clear fulfilment choices, appropriate optional-field handling and adaptive error recovery. Strata intentionally omits contact-number collection because updates are handled inside My Requests.
- Baymard Institute, *Make “Guest Checkout” the Most Prominent Option* (17 Jan 2023): https://baymard.com/research-articles/make-guest-checkout-prominent — supports keeping guest ordering obvious rather than forcing registration or hiding it behind a secondary link.
- Baymard Institute, *Checkout UX: Optimize Your Order Flow*: https://baymard.com/blog/checkout-flow-ux-optimization — supports concise field sets, persistent labels, scannability, transparent progress and retaining a path back without losing entered data.
- Scheibehenne, Greifeneder & Todd, *Choice overload: A conceptual review and meta-analysis*, Journal of Consumer Psychology 25(2), 333–358 (2015), DOI: https://doi.org/10.1016/j.jcps.2014.08.002 — meta-analysis of 99 observations (N=7,202) found that choice overload depends on complexity, task difficulty, preference uncertainty and decision goals. Therefore, keep the first decision to branch choice; do not assume that fewer options alone always improve decisions.
- Nielsen Norman Group, *Onboarding Tutorials vs. Contextual Help*: https://www.nngroup.com/articles/onboarding-tutorials/ — recommends progressive disclosure, contextual help at the point of need, and avoiding unnecessary instruction before users are ready. Strata therefore explains the request outcome first and offers account continuity only after successful submission.
- W3C Web Accessibility Initiative, *Labeling Controls*: https://www.w3.org/WAI/tutorials/forms/labels/ — supports persistent, associated form labels and explicit instructions for all controls.
- Apply these findings contextually: explicit branch choice reduces wrong-branch ambiguity; a short request form reduces irrelevant effort; transparent status copy avoids false expectations; optional account linking preserves autonomy; and clear error recovery helps users continue after connectivity failures.

### Regression gates for the public journey

- Search active customer-facing source for wa.me, api.whatsapp.com, whatsapp, tel: and the former business contact number. No business-contact handoff may remain in homepage, order request, customer history, or public footers.
- Confirm both branch CTAs carry the correct city into the order form, and a direct /order visit requires a city selection.
- Confirm delivery reveals and requires the delivery location; pickup does not ask for a delivery address.
- Confirm the starter menu is visible in the public storefront and order form; staff can add/edit/delete items, change prices, and hide/show items from Operations. Confirm starter prices are clearly marked provisional and the request estimate is not described as a final quote. Confirm menu writes are denied to non-admin users.\n- Confirm no unapproved product prices, availability, delivery fees or ETA are fabricated.
- Confirm failed/offline submission retains form input and never displays a success reference.
- Confirm a successful request can be found in My Requests in the same browser session, with status/message updates still working.
- Confirm new requests omit the phone field; Firestore rules accept the field being absent while continuing to allow older records with a legacy phone field.
- Confirm the Operations UI does not render historical phone values or generate telephone links.
- Confirm Google linking is optional, the post-submit prompt is dismissible by simply continuing, and customer history remains private.
- Run identity verification, TypeScript, lint and production build on the exact candidate commit. Then separately verify deployed behavior and real-device/PWA/offline behavior. Do not infer runtime success from a source diff or build alone.

### Recovery checkpoint

- Pre-change preserved source: main at f64805a369cc96cada54ff4fc59f965eafaca0d3 (13 Oct 2026).
- Exact pre-change baseline for this slice: `main` at `07344a1559c06bac2eb8c573c89a54d5159dd9f7` (18 Oct 2026).
- Preserved recovery branch created before this slice: `checkpoint/strata-before-location-onboarding-2026-10-18`.
- Earlier recovery branch `checkpoint/strata-before-order-flow-2026-10-18` is also retained; do not rewrite or delete either checkpoint.
- Changes for this slice are committed directly to `main` as explicitly requested. If regression occurs, inspect the diff first and recover from the preserved checkpoint; do not force-reset `main` without owner approval.
