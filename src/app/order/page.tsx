"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { browserLocalPersistence, setPersistence, signInAnonymously } from "firebase/auth";
import { auth, hasFirebaseWebConfig } from "@/lib/firebase/client";
import { createStrataOrderRequest } from "@/lib/firebase/strata-orders";
import { STARTER_STRATA_MENU, subscribeToStrataMenu, type StrataMenuItem } from "@/lib/firebase/strata-menu";

type StrataCity = "Gaborone" | "Francistown";
type Fulfilment = "Delivery" | "Pickup" | "Need help deciding";

function friendlyError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code)
    : "";
  if (code === "auth/operation-not-allowed") return "Guest ordering is not enabled in Firebase yet. Enable Anonymous sign-in in Firebase Authentication, then try again.";
  if (code === "permission-denied" || code === "firestore/permission-denied") return "Firebase rejected this request. Check that the latest Strata Firestore rules are published.";
  if (code === "auth/network-request-failed" || code === "unavailable") return "We could not reach Strata right now. Check your connection and try again.";
  if (code === "auth/unauthorized-domain") return "This website is not on Firebase Authentication’s authorised domains yet. Add the current website domain in Firebase Console.";
  return "Your request was not saved. Check your connection and try again. Your order has not been confirmed.";
}

export default function OrderPage() {
  const [name, setName] = useState("");
  const [city, setCity] = useState<StrataCity | "">("");
  const [fulfilment, setFulfilment] = useState<Fulfilment | "">("");
  const [items, setItems] = useState("");
  const [submittedItems, setSubmittedItems] = useState("");
  const [menuItems, setMenuItems] = useState<StrataMenuItem[]>(STARTER_STRATA_MENU);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [menuMessage, setMenuMessage] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const stopMenu = subscribeToStrataMenu(
      current => { setMenuItems((current.length ? current : STARTER_STRATA_MENU).filter(item => item.active)); setMenuMessage(""); },
      () => { setMenuItems(STARTER_STRATA_MENU.filter(item => item.active)); setMenuMessage("Showing the starter menu while the live menu reconnects."); },
    );
    const requestedCity = new URLSearchParams(window.location.search).get("city");
    const requestedItem = new URLSearchParams(window.location.search).get("item");
    if (requestedItem) setQuantities({ [requestedItem]: 1 });
    if (requestedCity === "Gaborone" || requestedCity === "Francistown") setCity(requestedCity);
    setOffline(!navigator.onLine);
    const online = () => setOffline(false);
    const offlineNow = () => setOffline(true);
    window.addEventListener("online", online);
    window.addEventListener("offline", offlineNow);
    return () => {
      stopMenu();
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offlineNow);
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (city !== "Gaborone" && city !== "Francistown") {
      setMessage("Choose Gaborone or Francistown so your request reaches the right branch.");
      return;
    }
    if (fulfilment !== "Delivery" && fulfilment !== "Pickup" && fulfilment !== "Need help deciding") {
      setMessage("Choose delivery, pickup, or help deciding before sending your request.");
      return;
    }
    const chosenMenuItems = menuItems.filter(item => (quantities[item.id] ?? 0) > 0);
    const menuLines = chosenMenuItems.map(item => `${item.name} × ${quantities[item.id]} — P${item.price.toFixed(2)} each`);
    const menuEstimate = chosenMenuItems.reduce((total, item) => total + item.price * (quantities[item.id] ?? 0), 0);
    if (chosenMenuItems.length && menuEstimate > 0) menuLines.push(`Listed menu estimate: P${menuEstimate.toFixed(2)} (branch to confirm)`);
    if (items.trim()) menuLines.push(`Additional request: ${items.trim()}`);
    const requestItemsText = menuLines.join("\n");
    if (!requestItemsText.trim()) {
      setMessage("Choose at least one menu item and quantity, or describe a special request.");
      return;
    }
    if (!navigator.onLine) {
      setOffline(true);
      setMessage("You’re offline. Your details remain in this form; reconnect before sending so Strata can confirm receipt.");
      return;
    }
    if (!hasFirebaseWebConfig) {
      setMessage("Online order requests are not connected yet. The website needs Strata’s Firebase web configuration before it can save a request.");
      return;
    }
    setBusy(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
      const now = new Date().toISOString();
      const id = await createStrataOrderRequest({
        customerId: user.uid,
        customerName: name.trim(),
        city,
        fulfilment,
        itemsText: requestItemsText,
        deliveryLocation: fulfilment === "Delivery" ? address.trim() : "",
        notes: notes.trim(),
        status: "New",
        source: "website",
        createdAt: now,
        updatedAt: now
      });
      setSubmittedItems(requestItemsText);
      setOrderId(id);
      setMessage("Your request has been saved. The selected branch still needs to confirm availability, final price, any delivery charge and timing. Nothing has been charged.");
    } catch (error) {
      setMessage(friendlyError(error));
    } finally {
      setBusy(false);
    }
  }

  return <main className="strataSite strataOrderPage">
    <header className="strataHeader">
      <Link href="/" className="strataBrand"><img src="/strata-icon.svg" alt="" width="48" height="48" /><span><strong>STRATA</strong><small>SA’O BITSA</small></span></Link>
      <div className="strataOrderHeaderLinks"><Link href="/account" className="strataHeaderCta">MY REQUESTS</Link><Link href="/" className="strataHeaderCta">← HOME</Link></div>
    </header>
    <section className="strataOrderLayout">
      <div className="strataOrderIntro">
        <p className="strataEyebrow">COME GET HOOKED · ORDER REQUEST</p>
        <h1>LET’S GET<br /><em>YOU FED.</em></h1>
        <p>Choose the branch, list what you want and tell us how you’d like to receive it. Your request and updates stay in Strata.</p>
        <div className="strataOrderNotice"><strong>BEFORE YOU SEND</strong><span>This is a request, not a confirmed order. The branch must confirm item availability, final price, delivery charge and timing. No online payment is taken here.</span></div>
        <img src="/strata-assets/fish.jpeg" alt="Strata Sa’o Bitsa fish and chips" loading="lazy" />
        {offline && <p className="strataConnectionNotice" role="status">You’re offline. The saved app shell and this form can open, but sending and checking requests require a connection.</p>}
      </div>
      {orderId ? <section className="strataOrderForm strataOrderSuccess" aria-live="polite">
        <p className="strataEyebrow">REQUEST SAVED</p>
        <h2>WE’VE GOT<br /><em>YOUR REQUEST.</em></h2>
        <p>Your reference is:</p><code className="strataOrderReference">{orderId}</code>
        <div className="strataOrderSummary" aria-label="Saved request summary">
          <p><strong>Branch</strong><span>{city}</span></p>
          <p><strong>Fulfilment</strong><span>{fulfilment}</span></p>
          <p><strong>Requested items</strong><span>{submittedItems}</span></p>
          {fulfilment === "Delivery" && address.trim() && <p><strong>Delivery location</strong><span>{address}</span></p>}
        </div>
        <p>{message}</p>
        <Link className="strataButton strataButtonRed" href="/account?submitted=1">VIEW REQUEST STATUS <span>→</span></Link>
        <p className="strataFormFootnote">Your request updates stay in My Requests. Account linking is optional and will be offered there after you can see your saved request.</p>
        <button type="button" className="strataTextButton" onClick={() => { setOrderId(""); setSubmittedItems(""); setItems(""); setNotes(""); setAddress(""); setQuantities({}); setMessage(""); }}>Start another request</button>
      </section> : <form className="strataOrderForm" onSubmit={submit}>
        <label>Your name<input required maxLength={80} autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Name for the order" /></label>
        <div className="strataFormRow">
          <label>Which branch?<select required value={city} onChange={e => setCity(e.target.value as StrataCity | "")}><option value="" disabled>Choose a city</option><option value="Gaborone">Gaborone</option><option value="Francistown">Francistown</option></select></label>
          <label>How would you like your order?<select required value={fulfilment} onChange={e => setFulfilment(e.target.value as Fulfilment | "")}><option value="" disabled>Choose fulfilment</option><option value="Delivery">Delivery</option><option value="Pickup">Pickup</option><option value="Need help deciding">Help me decide</option></select></label>
        </div>
        <fieldset className="strataMenuPicker">
          <legend>Choose your food</legend>
          <p>Select meals and quantities. The estimate uses the current menu prices; the branch confirms the final amount.</p>
          {menuItems.length ? menuItems.map(item => <div className="strataMenuPickRow" key={item.id}>
            <div><strong>{item.name}</strong><small>{item.description}</small><b>P{item.price.toFixed(2)}</b></div>
            <label>Qty<select aria-label={`Quantity of ${item.name}`} value={quantities[item.id] ?? 0} onChange={event => setQuantities(previous => ({ ...previous, [item.id]: Number(event.target.value) }))}>
              {Array.from({ length: 11 }, (_, index) => <option key={index} value={index}>{index}</option>)}
            </select></label>
          </div>) : <p>The menu is temporarily unavailable. You can still describe your request below.</p>}
          {menuItems.some(item => (quantities[item.id] ?? 0) > 0) && <div className="strataMenuEstimate"><span>Menu estimate</span><strong>P{menuItems.reduce((sum, item) => sum + item.price * (quantities[item.id] ?? 0), 0).toFixed(2)}</strong></div>}
          {menuMessage && <small role="status">{menuMessage}</small>}
        </fieldset>
        <label>Anything else you’d like? (optional)<textarea maxLength={600} rows={3} value={items} onChange={e => setItems(e.target.value)} placeholder="Extra details or a special request." /></label>
        {fulfilment === "Delivery" && <label>Delivery location / area<input required maxLength={240} autoComplete="street-address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Area, plot or useful landmark" /></label>}
        <label>Anything else? (optional)<textarea maxLength={600} rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Timing, directions or other order details" /></label>
        <button className="strataButton strataButtonRed strataSubmitOrder" type="submit" disabled={busy || offline || !hasFirebaseWebConfig}>{busy ? "SAVING REQUEST…" : offline ? "CONNECT TO SEND REQUEST" : "SUBMIT ORDER REQUEST"} <span>↗</span></button>
        {!hasFirebaseWebConfig && <p className="strataFormFootnote" role="status">Firebase web configuration is missing, so saving is disabled until the deployment environment is configured.</p>}
        {message && <p className="strataConnectionNotice" role="alert">{message}</p>}
        <p className="strataFormFootnote">A request reference appears only after Strata confirms it was saved. Order status is not a payment receipt or delivery guarantee. Submit as a guest; Google is optional for keeping history easier to access later. Check My Requests for updates.</p>
      </form>}
    </section>
    <footer className="strataFooter"><Link href="/" className="strataBrand"><img src="/strata-icon.svg" alt="" width="42" height="42" /><span><strong>STRATA</strong><small>SA’O BITSA</small></span></Link><span>FISH. CHIPS. GOOD TIMES.</span><Link href="/account">MY REQUESTS ↗</Link><small>© {new Date().getFullYear()} STRATA SA’O BITSA · BOTSWANA</small></footer>
  </main>;
}
