"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { browserLocalPersistence, setPersistence, signInAnonymously } from "firebase/auth";
import { auth, hasFirebaseWebConfig } from "@/lib/firebase/client";
import { createStrataOrderRequest } from "@/lib/firebase/strata-orders";

const PHONE = "26777762614";

function friendlyError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code)
    : "";
  if (code === "auth/operation-not-allowed") return "Guest ordering is not enabled in Firebase yet. Enable Anonymous sign-in in Firebase Authentication, then try again.";
  if (code === "permission-denied" || code === "firestore/permission-denied") return "Firebase rejected this request. Check that the latest Strata Firestore rules are published.";
  if (code === "auth/network-request-failed" || code === "unavailable") return "We could not reach Strata right now. Check your connection and try again.";
  if (code === "auth/unauthorized-domain") return "This website is not on Firebase Authentication’s authorised domains yet. Add the current website domain in Firebase Console.";
  return "Your request was not confirmed. Please try again; if this keeps happening, contact Strata on WhatsApp.";
}

export default function OrderPage() {
  const [name, setName] = useState("");
  const [city, setCity] = useState<"Gaborone" | "Francistown">("Gaborone");
  const [fulfilment, setFulfilment] = useState<"Delivery" | "Pickup" | "Need help deciding">("Delivery");
  const [items, setItems] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    setOffline(!navigator.onLine);
    const online = () => setOffline(false);
    const offlineNow = () => setOffline(true);
    window.addEventListener("online", online);
    window.addEventListener("offline", offlineNow);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offlineNow);
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!navigator.onLine) {
      setOffline(true);
      setMessage("You’re offline. Your details are still in this form; reconnect before sending so we can confirm that Strata received your request.");
      return;
    }
    if (!hasFirebaseWebConfig) {
      setMessage("Online order requests are not connected yet. The website needs the Strata Firebase web configuration before it can save a request.");
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
        phone: phone.trim(),
        city,
        fulfilment,
        itemsText: items.trim(),
        deliveryLocation: fulfilment === "Delivery" ? address.trim() : "",
        notes: notes.trim(),
        status: "New",
        source: "website",
        createdAt: now,
        updatedAt: now
      });
      setOrderId(id);
      setMessage("Your request has been saved. Strata still needs to confirm availability, final price, delivery charge and timing. Nothing has been charged.");
    } catch (error) {
      setMessage(friendlyError(error));
    } finally {
      setBusy(false);
    }
  }

  const whatsappMessage = orderId
    ? "Dumela Strata Sa’o Bitsa. I submitted order request " + orderId + " on your website. Please confirm availability, final price and fulfilment details."
    : "Dumela Strata Sa’o Bitsa! I’d like to check today’s menu and prices.";

  return <main className="strataSite strataOrderPage">
    <header className="strataHeader">
      <Link href="/" className="strataBrand"><img src="/strata-icon.svg" alt="" width="48" height="48"/><span><strong>STRATA</strong><small>SA’O BITSA</small></span></Link>
      <div className="strataOrderHeaderLinks"><Link href="/account" className="strataHeaderCta">MY REQUESTS</Link><Link href="/" className="strataHeaderCta">← HOME</Link></div>
    </header>
    <section className="strataOrderLayout">
      <div className="strataOrderIntro">
        <p className="strataEyebrow">COME GET HOOKED · ORDER REQUEST</p>
        <h1>LET’S GET<br/><em>YOU FED.</em></h1>
        <p>Tell us what you’re after. We’ll save your request so you can check its status later, then you can message the Strata team to discuss the details.</p>
        <div className="strataOrderNotice"><strong>GOOD TO KNOW</strong><span>This is an order request, not a confirmed order. Strata must confirm availability, final price, delivery charge and timing. No online payment is taken here.</span></div>
        <img src="/strata-assets/fish.jpeg" alt="Strata Sa’o Bitsa fish and chips" loading="lazy"/>
        {offline && <p className="strataConnectionNotice" role="status">You’re offline. The saved app shell and this form can open, but sending and checking requests require a connection.</p>}
      </div>
      {orderId ? <section className="strataOrderForm strataOrderSuccess" aria-live="polite">
        <p className="strataEyebrow">REQUEST SAVED</p>
        <h2>WE’VE GOT<br/><em>YOUR REQUEST.</em></h2>
        <p>Your reference is:</p><code className="strataOrderReference">{orderId}</code>
        <p>{message}</p>
        <Link className="strataButton strataButtonRed" href="/account">CHECK REQUEST STATUS <span>→</span></Link>
        <a className="strataButton strataButtonOutline" href={"https://wa.me/" + PHONE + "?text=" + encodeURIComponent(whatsappMessage)} target="_blank" rel="noreferrer">MESSAGE STRATA ON WHATSAPP ↗</a>
        <button type="button" className="strataTextButton" onClick={() => { setOrderId(""); setItems(""); setNotes(""); setMessage(""); }}>Start another request</button>
      </section> : <form className="strataOrderForm" onSubmit={submit}>
        <label>Your name<input required maxLength={80} autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Name for the order"/></label>
        <div className="strataFormRow">
          <label>City<select value={city} onChange={e=>setCity(e.target.value as "Gaborone" | "Francistown")}><option>Gaborone</option><option>Francistown</option></select></label>
          <label>How would you like it?<select value={fulfilment} onChange={e=>setFulfilment(e.target.value as "Delivery" | "Pickup" | "Need help deciding")}><option>Delivery</option><option>Pickup</option><option>Need help deciding</option></select></label>
        </div>
        <label>What would you like?<textarea required minLength={3} maxLength={1200} rows={4} value={items} onChange={e=>setItems(e.target.value)} placeholder="List the items and quantities. Ask us on WhatsApp if you need today’s menu first."/></label>
        {fulfilment === "Delivery" && <label>Delivery location / area<input required maxLength={240} autoComplete="street-address" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Area, plot or useful landmark"/></label>}
        <label>Contact number (recommended)<input type="tel" maxLength={40} autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Number the team can reach you on"/></label>
        <label>Anything else? (optional)<textarea maxLength={600} rows={2} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Timing, directions or other details"/></label>
        <button className="strataButton strataButtonRed strataSubmitOrder" type="submit" disabled={busy || offline || !hasFirebaseWebConfig}>{busy ? "SAVING REQUEST…" : offline ? "CONNECT TO SEND REQUEST" : "SAVE ORDER REQUEST"} <span>↗</span></button>
        {!hasFirebaseWebConfig && <p className="strataFormFootnote" role="status">Firebase web configuration is missing, so saving is disabled until the deployment environment is configured.</p>}
        {message && <p className="strataConnectionNotice" role="alert">{message}</p>}
        <p className="strataFormFootnote">Your request is saved under a private customer session. You can later connect Google sign-in on My Requests to make returning to this browser session easier. Your order is not confirmed until Strata replies.</p>
      </form>}
    </section>
    <footer className="strataFooter"><Link href="/" className="strataBrand"><img src="/strata-icon.svg" alt="" width="42" height="42"/><span><strong>STRATA</strong><small>SA’O BITSA</small></span></Link><span>FISH. CHIPS. GOOD TIMES.</span><a href="tel:+26777762614">77 762 614</a><small>© {new Date().getFullYear()} STRATA SA’O BITSA · BOTSWANA</small></footer>
  </main>;
}
