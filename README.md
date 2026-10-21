# Strata Sa’o Bitsa

**COME GET HOOKED.** A mobile-first ordering PWA for Strata Sa’o Bitsa in Botswana, serving the intended Gaborone and Francistown markets.

## Customer journey

1. The homepage introduces Strata and asks customers to choose **Gaborone** or **Francistown**.
2. The selected city is carried into the order request. Visiting `/order` directly does not silently choose a branch.
3. Customers choose from the editable Fish & Chips and Fish & Rice starter menu, set quantities, enter their name and fulfilment preference, provide a delivery location only for delivery, and optionally add a special request.
4. Customers submit a request without creating an account or installing the PWA. A reference appears only after Firestore confirms the save.
5. The success view summarises the branch, fulfilment choice, requested items and delivery location when applicable.
6. **My Requests** (`/account`) shows the current customer session’s request history and live staff status/messages. Google linking is optional and offered as account continuity, not as a prerequisite to order.

The customer-facing journey has no WhatsApp handoff, business phone number, telephone CTA or customer phone-number field. Staff updates are shown inside My Requests; there is no implemented SMS, email, push or external messaging delivery. Older Firestore records may still contain a legacy `phone` field, but the current interface no longer displays or collects it.

## Important product boundaries

This is an **order-request workflow**, not a payment checkout. The starter catalogue contains Fish & Chips (P70) and Fish & Rice (P70); these are editable provisional values, not confirmed Strata prices. Fish & Chips P70 is benchmarked against Lion Park Resort’s published Gaborone menu; Fish & Rice P70 is a placeholder requiring owner confirmation. Staff can add, edit, hide/show or delete menu items in Operations. The order form calculates a clearly labelled estimate from current menu prices, but there is no online payment, inventory integration, delivery-zone/fee engine, guaranteed availability, confirmed collection slot or ETA. Staff must review and update each request before it is represented as confirmed.

The app is usable in a normal browser and does not require installation. The service worker caches public shell/media assets; submitting a request and loading private request history require connectivity. Offline cache configuration alone does not prove actual device playback or installation behavior.

## Firebase setup

The known Firebase project identifier is `strata-6706b`; verify the real Firebase Web App configuration in Firebase Console instead of guessing it.

1. In **Project settings → General → Your apps**, select/register the Web app and configure these deployment variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (expected: `strata-6706b`)
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
2. In **Authentication → Sign-in method**, enable **Anonymous**. Enable **Google** only for the optional account-linking flow.
3. Add the exact deployed hostname under **Authentication → Settings → Authorized domains**.
4. Publish the current `firestore.rules`. It allows guest-created order requests without a phone field, permits legacy phone fields for compatibility, keeps customer reads scoped to their own UID, allows public read-only access to `strataMenu`, and restricts menu writes to the Operations admin role. It does not delete or migrate existing order records.
5. Configure server-only `FIREBASE_ADMIN_KEY` with the service-account JSON for the same Firebase project and a private `STRATA_OPERATIONS_WORD`. Never expose these values using `NEXT_PUBLIC_*` variables. The Operations endpoint validates the word server-side and issues a Firebase custom token; the Operations UI still checks the admin role before subscribing to the order queue.
6. `UPLOADTHING_TOKEN` is only needed if a future upload interface is added; no customer upload workflow is currently part of ordering. Firebase Storage client access remains denied.

## Operations

- Staff queue: `/operations`; `/admin` redirects to it.
- Staff can review branch, fulfilment, requested items, delivery location and notes; update status and save a customer-facing message. In Menu Management, staff can publish the starter menu once, add/edit/delete items, update prices, and hide/show items on the public menu. The seed action never overwrites an existing menu.
- Customer updates are visible in My Requests when connected. No external notification delivery is implemented.
- The Operations access-word endpoint currently uses a fixed temporary operations role document. Use a strong private word and treat this as a controlled interim access method, not a substitute for a fully managed staff identity lifecycle. Rate limiting has not been verified as implemented.

## QA acceptance checklist

- [ ] Homepage displays Fish & Chips and Fish & Rice with editable starter prices and no public WhatsApp/phone contact CTA.\n- [ ] Operations can publish starter menu once, add/edit/delete menu items, change prices, and hide/show items; non-admin users cannot write `strataMenu`.
- [ ] Gaborone and Francistown links carry the correct city into `/order`; direct visits require an explicit branch selection.
- [ ] Pickup does not request a delivery location; delivery does.
- [ ] No customer phone field is shown or collected; old phone values are not rendered by the Operations UI.
- [ ] Invalid, offline or failed submissions retain form values and never display a successful reference.
- [ ] Successful submission shows the reference and accurate request summary only after the Firestore write resolves.
- [ ] My Requests displays only the current UID’s history; status and staff-message updates appear there.
- [ ] Google linking is optional and does not interrupt ordering.
- [ ] Publish and test the current Firestore rules in Firebase before relying on the deployed order flow.
- [ ] Run identity verification, TypeScript, lint and production build on the exact candidate commit.
- [ ] Separately test the deployed customer journey, PWA install, offline shell/media and Android/iOS behavior on real devices.

## Development

```bash
npm ci
npm run dev
npm run verify:identity
npx tsc --noEmit
npm run lint
npm run build
```

## Visual assets

- `public/strata-assets/fish.jpeg`
- `public/strata-assets/groupline.jpeg`
- `public/strata-assets/groupline1.jpeg`
- `public/strata-assets/customer.jpeg`
- `public/strata-assets/customers.jpeg`
- `public/strata-assets/stat.mp4`

## Evidence boundary

A GitHub commit is not proof of a successful build, deployed behavior, configured Firebase rules, or real-device PWA behavior. GitHub Actions is configured to run TypeScript, lint and production build on pushes to `main`; report the exact run result before treating those checks as passed. Do not deploy manually from this workflow unless the product owner explicitly asks.
