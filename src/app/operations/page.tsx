"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { auth, hasFirebaseWebConfig } from "@/lib/firebase/client";
import { isAdminUser } from "@/lib/firebase/data";
import { STRATA_ORDER_STATUSES, subscribeToAllStrataOrders, updateStrataOrder, type StrataOrderRequest, type StrataOrderStatus } from "@/lib/firebase/strata-orders";

export default function OperationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [orders, setOrders] = useState<StrataOrderRequest[]>([]);
  const [statusDrafts, setStatusDrafts] = useState<Record<string, StrataOrderStatus>>({});
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!hasFirebaseWebConfig) { setChecking(false); setMessage("Firebase web configuration is missing."); return; }
    let stopOrders = () => {};
    let disposed = false;
    const stopAuth = onAuthStateChanged(auth, async current => {
      stopOrders();
      stopOrders = () => {};
      if (!current) {
        if (!disposed) { setUser(null); setAuthorized(false); setChecking(false); }
        return;
      }
      if (!disposed) { setUser(current); setChecking(true); }
      let allowed = false;
      try { allowed = await isAdminUser(current.uid); } catch { allowed = false; }
      if (disposed) return;
      setAuthorized(allowed);
      setChecking(false);
      if (!allowed) {
        setMessage("This Google account does not have a Strata owner/staff role. Sign out and use an authorised account.");
        await signOut(auth);
        return;
      }
      setMessage("");
      stopOrders = subscribeToAllStrataOrders(setOrders, error => setMessage(error.message));
    });
    return () => { disposed = true; stopOrders(); stopAuth(); };
  }, []);

  async function signIn() {
    setMessage("");
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code) : "";
      setMessage(code === "auth/unauthorized-domain" ? "Add this website’s domain to Firebase Authentication’s authorised domains." : code === "auth/operation-not-allowed" ? "Enable Google sign-in in Firebase Authentication." : "Sign-in failed. Check the connection and Firebase Authentication setup.");
    }
  }

  async function save(order: StrataOrderRequest) {
    setBusyId(order.id);
    setMessage("");
    try {
      await updateStrataOrder(order.id, statusDrafts[order.id] ?? order.status, noteDrafts[order.id] ?? order.staffNote ?? "");
      setMessage("Request " + order.id + " updated. The customer’s My Requests page will receive the status change.");
    } catch {
      setMessage("Could not update this request. Check that your account has an owner/staff role and the latest Firestore rules are published.");
    } finally { setBusyId(""); }
  }

  return <main className="strataSite strataOperationsPage">
    <header className="strataHeader">
      <Link href="/" className="strataBrand"><img src="/strata-icon.svg" alt="" width="48" height="48"/><span><strong>STRATA</strong><small>SA’O BITSA</small></span></Link>
      <div className="strataOrderHeaderLinks"><Link href="/account" className="strataHeaderCta">CUSTOMER VIEW</Link>{user && <button className="strataHeaderCta" type="button" onClick={() => void signOut(auth)}>SIGN OUT</button>}</div>
    </header>
    <section className="strataOperationsWrap">
      <p className="strataEyebrow">STRATA · PRIVATE OPERATIONS</p>
      <h1>THE ORDER<br/><em>QUEUE.</em></h1>
      <p className="strataOperationsLead">Review customer requests, update the status, and leave a short message for the customer. No price, payment or delivery promise is created automatically.</p>
      {checking ? <p className="strataAccountEmpty">Checking access…</p> : !authorized ? <section className="strataOperationsLogin">
        <h2>Staff sign-in</h2><p>Use a Google account that has been explicitly authorised in the Strata Firebase project.</p>
        <button className="strataButton strataButtonRed" type="button" onClick={() => void signIn()} disabled={!hasFirebaseWebConfig}>SIGN IN WITH GOOGLE ↗</button>
      </section> : <section className="strataOperationsQueue">
        <div className="strataOperationsBar"><span>{orders.length} {orders.length === 1 ? "REQUEST" : "REQUESTS"}</span><span>{user?.email}</span></div>
        {!orders.length ? <div className="strataAccountEmpty"><strong>No website requests yet.</strong><p>When a customer submits an online request, it will appear here.</p></div> : orders.map(order => <article className="strataOperationsOrder" key={order.id}>
          <div className="strataOperationsOrderTop"><div><span className="strataEyebrow">{order.city} · {order.fulfilment}</span><h2>{order.customerName}</h2><small>{new Date(order.createdAt).toLocaleString()} · {order.id}</small></div><b data-status={order.status}>{order.status}</b></div>
          <p className="strataOperationsItems">{order.itemsText}</p>
          {order.phone && <p>Contact: <a href={"tel:" + order.phone}>{order.phone}</a></p>}
          {order.deliveryLocation && <p>Delivery location: {order.deliveryLocation}</p>}
          {order.notes && <p>Customer note: {order.notes}</p>}
          <div className="strataOperationsControls">
            <label>Status<select value={statusDrafts[order.id] ?? order.status} onChange={event => setStatusDrafts(prev => ({ ...prev, [order.id]: event.target.value as StrataOrderStatus }))}>{STRATA_ORDER_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}</select></label>
            <label>Message to customer<textarea rows={2} maxLength={1000} value={noteDrafts[order.id] ?? order.staffNote ?? ""} onChange={event => setNoteDrafts(prev => ({ ...prev, [order.id]: event.target.value }))} placeholder="e.g. Please call us to confirm availability and delivery details."/></label>
            <button className="strataButton strataButtonRed" type="button" disabled={busyId === order.id} onClick={() => void save(order)}>{busyId === order.id ? "SAVING…" : "SAVE UPDATE ↗"}</button>
          </div>
        </article>)}
      </section>}
      {message && <p className="strataConnectionNotice" role="status">{message}</p>}
      <p className="strataOperationsFootnote">Only accounts with a matching <code>admins/{'{uid}'}</code> Firestore document and role <code>owner</code> or <code>staff</code> can access this queue. Do not make the admins collection publicly writable.</p>
    </section>
    <footer className="strataFooter"><Link href="/" className="strataBrand"><img src="/strata-icon.svg" alt="" width="42" height="42"/><span><strong>STRATA</strong><small>SA’O BITSA</small></span></Link><a href="tel:+26777762614">77 762 614</a><small>© {new Date().getFullYear()} STRATA SA’O BITSA · BOTSWANA</small></footer>
  </main>;
}
