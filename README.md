# Strata Sa’o Bitsa

**COME GET HOOKED.**

Mobile-first food-ordering and operations PWA for Strata Sa’o Bitsa, serving the intended Gaborone and Francistown markets.

## Current product scope

- Customer storefront with branch/area selection and a menu read from the dedicated Firebase project.
- Guest-first order form with pickup/delivery choice, customer contact details, itemized total and order reference.
- Private guest order history in the same browser session.
- Operations workflows for reviewing orders, maintaining menu data, tracking fulfilment and reconciling payments are the next implementation stage.

## Local development

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Update `.env.local` only with Strata’s Firebase web-app configuration. The web config is public client configuration; never place Firebase Admin service-account JSON in a `NEXT_PUBLIC_*` variable or commit it.

The order submission API requires `FIREBASE_ADMIN_KEY` to verify the guest’s Firebase ID token, re-check current menu availability/prices server-side, and write an idempotent order record. If it is absent, submission fails safely and the form explains that the order was not sent.

## Quality gates

```bash
npm run verify:identity
npx tsc --noEmit
npm run lint
npm run build
git diff --check
```

A successful build does not prove that Firebase Authentication, Firestore rules, Storage, messaging, payment providers, delivery partners, PWA installation, or real-device flows work. Verify each separately before launch.

## Launch boundaries

- No menu items, prices, branch addresses, delivery zones, fees, order volumes, or payment methods are invented. Publish owner-confirmed menu data before accepting orders.
- Orders are requests until staff explicitly accept them. Delivery fees and payment are separate from the item total.
- Online payments, external delivery integrations, live GPS, loyalty wallets and advanced stock/procurement automation are not enabled by this code checkpoint.
- Firebase rules and indexes are source-controlled only; do not deploy them without explicit authorization.
- Do not deploy to Vercel as part of routine implementation.
