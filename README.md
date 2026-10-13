# Strata Sa’o Bitsa

**COME GET HOOKED.** A mobile-first food storefront and progressive web app for Strata Sa’o Bitsa in Botswana, serving the intended markets of Gaborone and Francistown.

## Current checkpoint

The active homepage has been rebranded for Strata, uses the committed photography/video assets, and gives customers direct access to the business by phone or WhatsApp. The website does not require installation to use. PWA registration starts on page load; installation is an optional action, with platform-specific help when the browser does not provide a native prompt.

The current public ordering handoff asks the business to confirm the current menu, prices, availability and delivery options. It does **not** claim that a web order was saved, a payment was taken, or delivery was booked.

## Visual assets

- `public/strata-assets/fish.jpeg`
- `public/strata-assets/groupline.jpeg`
- `public/strata-assets/groupline1.jpeg`
- `public/strata-assets/customer.jpeg`
- `public/strata-assets/customers.jpeg`
- `public/strata-assets/stat.mp4`

The separately mentioned `image_987b17.png` was not found in Downloads at the asset-copy checkpoint and has not been added.

## Development

```bash
npm install
npm run dev
```

Quality gates:

```bash
npm run verify:identity
npx tsc --noEmit
npm run lint
npm run build
```

## Next implementation gates

1. Inspect and replace inherited customer/account/admin routes; do not expose The Plug operations UI as Strata.
2. Confirm the real menu, prices, hours, branch/service-point details, delivery zones and delivery charges.
3. Implement guest cart/checkout, server-validated order totals, durable order records, customer confirmation and an owner/staff fulfilment queue.
4. Confirm Firebase project setup, Authentication needs, Firestore/Storage rules and secure server-side authorization before enabling persistence.
5. Add cash and only those online payment methods that are actually configured and verified.
6. Test the manifest, service-worker registration/update/cache isolation, Android install, iOS Add to Home Screen, embedded-browser handoff, and deployed behavior separately.

## Release boundary

No production deployment is implied by a GitHub commit. The current build and live website still require verification in the local workspace and on the actual deployment. PWA installation is optional; ordering functionality must remain available in the browser.
