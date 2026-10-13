# Strata Sa’o Bitsa

**COME GET HOOKED.** A mobile-first food storefront and progressive web app for Strata Sa’o Bitsa in Botswana, intended for Gaborone and Francistown.

## Current implementation checkpoint

- Branded storefront with supplied food/customer photography and short video.
- Guest order-request form at `/order`. The customer does not need to sign in or install the PWA. The app silently creates a Firebase anonymous-auth session, saves a request to Firestore, and displays a request reference only after Firestore confirms the write.
- `/account` lists requests belonging to the current browser/customer UID and receives live status updates. Customers can optionally link Google sign-in to their anonymous session.
- `/operations` is a separate staff queue. Access requires Google sign-in and a manually provisioned `admins/{uid}` document with role `owner` or `staff`. Staff can update request status and a customer-facing note.
- WhatsApp follow-up is available from the order confirmation and request history.
- The PWA caches the public homepage, the order-form shell and visual assets. Offline, customers can open the saved shell and fill in the form; submission and request history require a connection. The UI explicitly blocks submission while offline.
- Customer and staff data are not cached by the service worker. The app is usable without installation.

**Important boundary:** this is an order-request and fulfilment-status flow, not full online checkout. There is no verified menu/price catalogue, automatic total calculation, online payment, guaranteed delivery availability, push notification or automatic WhatsApp message delivery. Strata must confirm price, availability, delivery charge and timing with the customer.

## Firebase setup required before testing

Firebase web configuration is intentionally not guessed. The project identifier known for Strata is `strata-6706b`, but the actual Web App values and console configuration must be confirmed in Firebase Console.

1. Open Firebase Console and select project `strata-6706b`.
2. Under **Project settings → General → Your apps**, register or select a Web app and copy its config values.
3. Set these values in Vercel Environment Variables for the deployment you will test, and in a local `.env.local` if testing locally:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (must be `strata-6706b`)
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
4. In **Authentication → Sign-in method**, enable **Anonymous** and **Google**.
5. In **Authentication → Settings → Authorized domains**, add the exact deployed hostname you will use. Add `localhost` if running locally.
6. In **Firestore Database → Rules**, paste the contents of `firestore.rules` from this repository and publish them. These are Strata-only rules; they intentionally deny access to all other collections.
7. To provision the owner: visit `/operations` and attempt Google sign-in. In **Authentication → Users**, find that Google user and copy its UID. In **Firestore → Data**, create a document in collection `admins` whose document ID is exactly that UID, with one field: `role` (string) = `owner`. The rules intentionally prohibit clients from creating or changing admin roles. Return to `/operations` and sign in again. Add staff the same way with role `staff`.

The web config values are public client configuration, not service-account credentials. Never put a Firebase Admin service-account JSON, private key or other server secret in a `NEXT_PUBLIC_*` variable.

## QA flow

1. Open the deployed site in a normal phone browser. The site should browse without signing in or installing.
2. Open **Build Order**, complete the form and submit while online.
3. Confirm that a reference is displayed only after the save succeeds.
4. Open **My Requests** in the same browser. Confirm the request appears and its status is `New`.
5. Open `/operations` with the provisioned owner account. Update the request status and add a message.
6. Return to **My Requests** and confirm the status and message update live.
7. Install the PWA if the browser offers it. Reopen it and confirm the same customer session/requests remain available.
8. Load the homepage and order form while online, then turn on airplane mode. Confirm the public shell and form reopen, the offline notice appears, and the form cannot claim to submit. Restore the connection and submit a test request.
9. Test iOS Safari separately; this repository has not yet been verified on a physical iPhone.

## Development and checks

```bash
npm install
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

The additionally expected `image_987b17.png` was not found at the asset-copy checkpoint.

## Evidence and deployment boundary

GitHub commits do not prove that Firebase has been configured, that a deployment is current, that a production build passes, or that a phone install/customer journey works. No deployment or live Firebase mutation has been performed by this implementation. The owner must complete the Firebase console setup and run the QA flow above; report actual results before treating the flow as production-ready.
