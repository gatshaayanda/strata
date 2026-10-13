"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { browserLocalPersistence, GoogleAuthProvider, linkWithPopup, onAuthStateChanged, setPersistence, signInAnonymously, signInWithPopup, type User } from "firebase/auth";
import { auth, hasFirebaseWebConfig } from "@/lib/firebase/client";
import { subscribeToMyStrataOrders, type StrataOrderRequest } from "@/lib/firebase/strata-orders";

function authError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code) : "";
  if (code === "auth/operation-not-allowed") return "Enable Anonymous and Google sign-in providers in Firebase Authentication.";
  if (code === "auth/unauthorized-domain") return "Add this website’s domain to Firebase Authentication’s authorised domains.";
  if (code === "auth/popup-closed-by-user") return "Google sign-in was cancelled.";
  if (code === "auth/credential-already-in-use" || code === "auth/account-exists-with-different-credential") return "That Google account already exists. To avoid losing access to this guest session’s requests, we have not switched accounts or merged histories. Keep using this browser session or ask Strata for help.";
  if (code === "permission-denied" || code === "firestore/permission-denied") return "Firebase denied access to these requests. Check that the current Strata Firestore rules are published.";
  return "We could not complete that action. Check your connection and Firebase setup, then try again.";
}

const statusCopy: Record<string, string> = {
  New: "Sent to Strata. Awaiting review.",
  Received: "Strata has received your request.",
  Confirmed: "Strata has confirmed the request details.",
  Preparing: "Your order is being prepared.",
  "Ready for pickup": "Your order is marked ready for pickup.",
  "Out for delivery": "Your order is marked out for delivery.",
  Completed: "Marked completed by Strata.",
  Cancelled: "This request has been cancelled."
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<StrataOrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!hasFirebaseWebConfig) {
      setLoading(false);
      setMessage("My Requests needs Strata’s Firebase web configuration. The public storefront remains available.");
      return;
    }
    let stopOrders = () => {};
    let disposed = false;
    void setPersistence(auth, browserLocalPersistence).catch(() => {});
    const stopAuth = onAuthStateChanged(auth, async current => {
      stopOrders();
      stopOrders = () => {};
      if (!current) {
        setUser(null);
        try { await signInAnonymously(auth); }
        catch (error) { if (!disposed) { setLoading(false); setMessage(authError(error)); } }
        return;
      }
      if (disposed) return;
      setUser(current);
      stopOrders = subscribeToMyStrataOrders(current.uid,
        items => { if (!disposed) { setOrders(items); setLoading(false); } },
        error => { if (!disposed) { setLoading(false); setMessage(authError(error)); } }
      );
    });
    return () => { disposed = true; stopOrders(); stopAuth(); };
  }, []);

  async function connectGoogle() {
    if (!user || busy || !hasFirebaseWebConfig) return;
    setBusy(true);
    setMessage("");
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      if (user.isAnonymous) await linkWithPopup(user, provider);
      else if (!user.providerData.some(item => item.providerId === "google.com")) await signInWithPopup(auth, provider);
      setMessage("Google sign-in is connected to this customer session. Your saved requests remain associated with this account.");
    } catch (error) { setMessage(authError(error)); }
    finally { setBusy(false); }
  }

  return <main className="strataSite strataAccountPage">
    <header className="strataHeader">
      <Link href="/" className="strataBrand"><img src="/strata-icon.svg" alt="" width="48" height="48"/><span><strong>STRATA</strong><small>SA’O BITSA</small></span></Link>
      <Link href="/order" className="strataHeaderCta">NEW REQUEST ↗</Link>
    </header>
    <section className="strataAccountLayout">
      <div className="strataAccountIntro">
        <p className="strataEyebrow">YOUR STRATA · YOUR REQUESTS</p>
        <h1>GOOD TO<br/><em>SEE YOU.</em></h1>
        <p>Track requests sent from this browser. You can browse and order as a guest; connecting Google is optional and helps you return to this account.</p>
        <div className="strataOrderNotice"><strong>ORDER STATUS</strong><span>A status update is not a payment receipt or delivery guarantee. Strata must confirm price, availability and fulfilment details directly with you.</span></div>
        <button className="strataButton strataButtonOutline strataGoogleButton" type="button" onClick={() => void connectGoogle()} disabled={busy || !user || !hasFirebaseWebConfig}>{busy ? "CONNECTING…" : user?.isAnonymous ? "CONNECT GOOGLE ACCOUNT ↗" : user ? (user.providerData.some(item => item.providerId === "google.com") ? "GOOGLE ACCOUNT CONNECTED" : "CONNECT GOOGLE ACCOUNT ↗") : "GOOGLE SIGN-IN UNAVAILABLE"}</button>
        {user && <p className="strataAccountIdentity">{user.isAnonymous ? "Guest session active on this browser." : "Connected account: " + (user.email || user.displayName || "Google account")}</p>}
        {message && <p className="strataConnectionNotice" role="status">{message}</p>}
      </div>
      <section className="strataAccountOrders" aria-live="polite">
        <div className="strataSectionHead"><div><p className="strataEyebrow">REQUEST HISTORY</p><h2>YOUR<br/><em>ORDERS.</em></h2></div><span className="strataOrderCount">{orders.length} {orders.length === 1 ? "REQUEST" : "REQUESTS"}</span></div>
        {loading ? <p className="strataAccountEmpty">Loading your requests…</p> : !orders.length ? <div className="strataAccountEmpty"><strong>Nothing here yet.</strong><p>When you send a request through this browser, it will appear here.</p><Link className="strataButton strataButtonRed" href="/order">START AN ORDER ↗</Link></div> : <div className="strataAccountOrderList">
          {orders.map(order => <article className="strataAccountOrder" key={order.id}>
            <div className="strataAccountOrderTop"><span>{new Date(order.createdAt).toLocaleString()}</span><b data-status={order.status}>{order.status}</b></div>
            <h3>{order.itemsText}</h3>
            <p>{order.city} · {order.fulfilment}{order.deliveryLocation ? " · " + order.deliveryLocation : ""}</p>
            <p className="strataAccountStatus">{statusCopy[order.status] || "Strata will update this request as it progresses."}</p>
            {order.staffNote && <p className="strataAccountStaffNote"><strong>Message from Strata</strong><br/>{order.staffNote}</p>}
            <small>Reference: {order.id}</small>
            <a href={"https://wa.me/26777762614?text=" + encodeURIComponent("Dumela Strata Sa’o Bitsa. I’m following up on request " + order.id + ".")} target="_blank" rel="noreferrer">FOLLOW UP ON WHATSAPP ↗</a>
          </article>)}
        </div>}
      </section>
    </section>
    <footer className="strataFooter"><Link href="/" className="strataBrand"><img src="/strata-icon.svg" alt="" width="42" height="42"/><span><strong>STRATA</strong><small>SA’O BITSA</small></span></Link><a href="tel:+26777762614">77 762 614</a><small>© {new Date().getFullYear()} STRATA SA’O BITSA · BOTSWANA</small></footer>
  </main>;
}
