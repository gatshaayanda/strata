# Strata Sa’o Bitsa — Project Operating Contract

## Product and scope
Strata Sa’o Bitsa is a Botswana fish-and-chips/food business using the brand line **COME GET HOOKED**. Intended launch markets: Gaborone and Francistown. Business contact: 77 762 614 (Botswana country code +267).

The product goal is a branded, mobile-first customer ordering PWA and the operations system behind it. Customers must be able to use the website immediately without installing it or signing in. Intended operations include menu/availability by service point, guest ordering, pickup/delivery, a shared order queue for web/phone/WhatsApp/Facebook/walk-in orders, staff fulfilment statuses, delivery assignment for own drivers and partners, payment recording/reconciliation, and owner reporting.

## Evidence and workflow
- Product owner/final reviewer: user.
- Technical navigator and implementation partner: ChatGPT; local coding/testing must use the real checked-out repository.
- GitHub is the source of truth. A GitHub commit is not proof of local build, deployed readiness or production behavior.
- Workflow: UNDERSTAND → INSPECT → PLAN → IMPLEMENT → VERIFY → CHECKPOINT.
- Unexpected result: STOP → inspect reality → identify first failure → fix → verify.
- Inspect the actual Git state, source, route tree, environment variable names, Firebase rules/configuration, workflows and tests before changing dependent layers.
- Make the smallest controlled change; preserve working behavior; review the diff and report exact evidence. Never invent configuration, menu items, prices, delivery coverage, payments or deployment status.
- Do not deploy, merge, alter live services/data, or incur material costs without authorization.

## Current implementation checkpoint
- Repository: `gatshaayanda/strata`, branch `main`.
- Active homepage: Strata branded storefront in `src/app/page.tsx`; styles in `src/app/globals.css`.
- Current assets: `public/strata-assets/fish.jpeg`, `groupline.jpeg`, `groupline1.jpeg`, `customer.jpeg`, `customers.jpeg`, `stat.mp4`. The additionally expected `image_987b17.png` was not found in Downloads during the copy step.
- Brand icon: `public/strata-icon.svg`; manifest: `src/app/manifest.ts` and `public/manifest.webmanifest`.
- PWA lifecycle and optional installation UI: `src/app/pwa-register.tsx`, `src/app/pwa.css`, service worker `public/sw.js`; cache namespace is `strata-shell-v1`.
- `src/app/order/page.tsx` currently creates a guest order-request message and hands it to WhatsApp. It does **not** persist an order, calculate a server-validated total, take payment, or confirm delivery.
- `src/middleware.ts` redirects inherited The Plug account/admin/request screens away from Strata until Strata-native replacements exist.
- A pushed commit is not proof that the local workspace is synced or that the application builds. At this checkpoint, a local build, device installation, deployed PWA and production customer journey have not been verified.

## Business facts — do not fabricate
- Intended markets: Gaborone and Francistown.
- Delivery model under consideration: own drivers plus delivery partners.
- Existing orders currently arrive through mixed channels; order volume is unknown.
- Menus, prices, opening hours, service-point/branch details, delivery zones/fees, preparation timing, active payment methods and current order handling require confirmation before they become live operational promises.
- Firebase web values identify project `strata-6706b`; this alone does not prove that Firestore, Authentication, Storage, rules, or payment integrations are configured.
- No online payment method should be shown as active until configuration and end-to-end payment behavior are verified.

## Required customer experience
- Website works immediately in a mobile browser. Installation is optional and must never gate browsing or ordering.
- Support Android native installation where offered, iOS Safari Add to Home Screen guidance, and embedded-browser handoff without blocking the page.
- Verify manifest recognition, service-worker registration/update, app identity/icon, cache isolation, install behavior and deployed behavior as separate checks.
- Ordering must communicate when a request is merely sent versus when the business has accepted it. Never claim payment, stock, delivery or order persistence without evidence.
- Build accessible loading, empty, validation, offline and failure states. Use readable foreground/background colors and visible keyboard focus; target WCAG 2.2 AA contrast.

## Implementation sequence
1. Complete identity reset across active customer surfaces, metadata, icons, manifest, service worker/cache, package identity and documentation.
2. Verify local install, identity check, typecheck, lint and production build; inspect and resolve the earliest failure.
3. Confirm real menu, prices, hours, locations, delivery terms and payment choices with the business.
4. Implement durable guest orders, server-side total validation, confirmation/reference, customer status view, and owner/staff queue with server-side authorization and secure database rules.
5. Add phone/WhatsApp/Facebook/walk-in order entry into the same queue, driver/partner assignment, status transitions, payment reconciliation and owner reports.
6. Test customer and operational workflows locally, then in preview/deployed environments when authorized. Record PASS / FAIL / NOT RUN / BLOCKED for each material check.

## Verification and checkpoint
- PASS means the specified check was executed and passed; FAIL means it was executed and failed; NOT RUN means not executed; BLOCKED means a stated constraint prevented execution.
- Review actual changed files/diff, run applicable checks, update this file when project state changes, and report commit(s), files, evidence, gaps and next action.
