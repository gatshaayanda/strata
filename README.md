# Strata Sa’o Bitsa

**COME GET HOOKED.** A mobile-first food storefront and progressive web app for Strata Sa’o Bitsa in Botswana, targeting Gaborone and Francistown.

## Current checkpoint

- Branded responsive storefront with the provided food/customer photography and short video.
- Guest order-request form at `/order`. It prepares a message and hands it to WhatsApp; the business must confirm availability, price, delivery charge and timing.
- PWA service-worker registration starts on page load. Installation is optional; the site is usable without installing. The install action provides native prompt support where offered and platform-specific guidance otherwise.
- Inherited The Plug account/admin/request routes are redirected until Strata-native replacements exist.

**Important boundary:** the current order-request flow does not persist an order in a database, calculate a server-validated total, take payment or confirm delivery. Do not describe it as full online checkout.

## Visual assets

- `public/strata-assets/fish.jpeg`
- `public/strata-assets/groupline.jpeg`
- `public/strata-assets/groupline1.jpeg`
- `public/strata-assets/customer.jpeg`
- `public/strata-assets/customers.jpeg`
- `public/strata-assets/stat.mp4`

The additionally expected `image_987b17.png` was not found in Downloads at the asset-copy checkpoint.

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

1. Sync the local workspace with `origin/main`, then run the identity, typecheck, lint and build checks.
2. Test the PWA on Android and iOS Safari, including manifest, icon, install guidance, embedded-browser access, service-worker update and cache isolation.
3. Confirm the actual menu, prices, hours, service points, delivery zones/fees and payment methods.
4. Inspect Firebase project setup and rules before implementing durable guest orders, confirmation/reference, customer status tracking and owner/staff fulfilment queues.
5. Add phone/WhatsApp/Facebook/walk-in orders to the same queue, delivery assignment, payment reconciliation and reporting.
6. Verify locally and in the deployed environment only when authorized.

No production deployment is implied by a GitHub commit. Build and live behavior remain unverified until checks are run against the exact commit and environment.
