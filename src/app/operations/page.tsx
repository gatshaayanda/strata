"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithCustomToken, signOut, type User } from "firebase/auth";
import { auth, hasFirebaseWebConfig } from "@/lib/firebase/client";
import { isAdminUser } from "@/lib/firebase/data";
import { STRATA_ORDER_STATUSES, subscribeToAllStrataOrders, updateStrataOrder, type StrataOrderRequest, type StrataOrderStatus } from "@/lib/firebase/strata-orders";
import { deleteStrataMenuItem, saveStrataMenuItem, seedStrataMenuIfEmpty, slugifyMenuItem, subscribeToStrataMenu, type StrataMenuItem } from "@/lib/firebase/strata-menu";

export default function OperationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [orders, setOrders] = useState<StrataOrderRequest[]>([]);
  const [statusDrafts, setStatusDrafts] = useState<Record<string, StrataOrderStatus>>({});
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [accessWord, setAccessWord] = useState("");
  const [message, setMessage] = useState("");
  const [menuItems, setMenuItems] = useState<StrataMenuItem[]>([]);
  const [editingMenuId, setEditingMenuId] = useState("");
  const [menuName, setMenuName] = useState("");
  const [menuDescription, setMenuDescription] = useState("");
  const [menuPrice, setMenuPrice] = useState("70");
  const [menuActive, setMenuActive] = useState(true);
  const [menuBusy, setMenuBusy] = useState(false);

  useEffect(() => {
    if (!hasFirebaseWebConfig) { setChecking(false); setMessage("Firebase web configuration is missing."); return; }
    let stopOrders = () => {};
    let stopMenu = () => {};
    let disposed = false;
    const stopAuth = onAuthStateChanged(auth, async current => {
      stopOrders();
      stopMenu();
      stopOrders = () => {};
      stopMenu = () => {};
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
        setMessage("That session is not authorised for Strata Operations. Enter the Operations access word to continue.");
        await signOut(auth);
        return;
      }
      setMessage("");
      stopOrders = subscribeToAllStrataOrders(setOrders, error => setMessage(error.message));
      stopMenu = subscribeToStrataMenu(setMenuItems, error => setMessage(error.message));
    });
    return () => { disposed = true; stopOrders(); stopMenu(); stopAuth(); };
  }, []);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoginBusy(true);
    try {
      const response = await fetch("/api/operations-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ word: accessWord }),
        cache: "no-store",
      });
      const payload = await response.json() as { token?: string; error?: string };
      if (!response.ok || !payload.token) {
        setMessage(payload.error ?? "Access denied. Check the Operations access word and try again.");
        return;
      }
      await signInWithCustomToken(auth, payload.token);
      setAccessWord("");
      setMessage("Access verified. Opening the Strata order queue…");
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code) : "";
      setMessage(
        code === "auth/operation-not-allowed"
          ? "Firebase custom-token sign-in was rejected. Check the server service account and Firebase project."
          : code === "auth/network-request-failed"
            ? "We could not reach Firebase. Check your connection and try again."
            : error instanceof Error && error.message
              ? error.message
              : "Operations sign-in failed. Check the access word and server configuration."
      );
    } finally {
      setLoginBusy(false);
    }
  }

  async function save(order: StrataOrderRequest) {
    setBusyId(order.id);
    setMessage("");
    try {
      await updateStrataOrder(order.id, statusDrafts[order.id] ?? order.status, noteDrafts[order.id] ?? order.staffNote ?? "");
      setMessage("Request " + order.id + " updated. The customer’s My Requests page will receive the status and message update when connected.");
    } catch {
      setMessage("Could not update this request. Check the connection and confirm the current session has the Strata owner/staff role and the latest Firestore rules are published.");
    } finally { setBusyId(""); }
  }

  async function saveMenu(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const price = Number(menuPrice);
    if (!menuName.trim() || !Number.isFinite(price) || price < 0 || price > 10000) {
      setMessage("Enter a menu item name and a valid price between P0 and P10,000.");
      return;
    }
    const id = editingMenuId || slugifyMenuItem(menuName);
    setMenuBusy(true);
    setMessage("");
    try {
      const existing = menuItems.find(item => item.id === id);
      await saveStrataMenuItem({
        id,
        name: menuName.trim(),
        description: menuDescription.trim(),
        price,
        active: menuActive,
        sortOrder: existing?.sortOrder ?? menuItems.length + 1,
        updatedAt: new Date().toISOString(),
      });
      setEditingMenuId("");
      setMenuName("");
      setMenuDescription("");
      setMenuPrice("70");
      setMenuActive(true);
      setMessage("Menu item saved. The public menu and order form will update automatically.");
    } catch {
      setMessage("Could not save the menu item. Confirm the current session has a Strata owner/staff role and publish the latest Firestore rules.");
    } finally {
      setMenuBusy(false);
    }
  }

  function editMenu(item: StrataMenuItem) {
    setEditingMenuId(item.id);
    setMenuName(item.name);
    setMenuDescription(item.description);
    setMenuPrice(String(item.price));
    setMenuActive(item.active);
    document.getElementById("strata-menu-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function seedMenu() {
    setMenuBusy(true);
    setMessage("");
    try {
      const result = await seedStrataMenuIfEmpty();
      setMessage(result === "seeded" ? "Starter menu published. You can now change names, descriptions, prices and availability below." : "A menu already exists. No existing menu items were overwritten.");
    } catch {
      setMessage("Could not publish the starter menu. Confirm the Strata Operations role and latest Firestore rules.");
    } finally {
      setMenuBusy(false);
    }
  }

  async function removeMenuItem(item: StrataMenuItem) {
    setMenuBusy(true);
    setMessage("");
    try {
      await deleteStrataMenuItem(item.id);
      if (editingMenuId === item.id) { setEditingMenuId(""); setMenuName(""); setMenuDescription(""); setMenuPrice("70"); setMenuActive(true); }
      setMessage(item.name + " removed from the menu.");
    } catch {
      setMessage("Could not remove this item. Confirm the current session has a Strata owner/staff role and the latest Firestore rules are published.");
    } finally {
      setMenuBusy(false);
    }
  }

  return <main className="strataSite strataOperationsPage">
    <header className="strataHeader">
      <Link href="/" className="strataBrand"><img src="/strata-icon.svg" alt="" width="48" height="48"/><span><strong>STRATA</strong><small>SA’O BITSA</small></span></Link>
      <div className="strataOrderHeaderLinks"><Link href="/account" className="strataHeaderCta">CUSTOMER VIEW</Link>{user && <button className="strataHeaderCta" type="button" onClick={() => void signOut(auth)}>SIGN OUT</button>}</div>
    </header>
    <section className="strataOperationsWrap">
      <p className="strataEyebrow">STRATA · PRIVATE OPERATIONS</p>
      <h1>THE ORDER<br/><em>QUEUE.</em></h1>
      <p className="strataOperationsLead">Review customer requests, update their status, and leave a clear message. This is a request workflow: no price, payment or delivery promise is created automatically.</p>
      {checking ? <p className="strataAccountEmpty">Checking access…</p> : !authorized ? <section className="strataOperationsLogin">
        <h2>Operations sign-in</h2>
        <p>Enter the private Strata Operations access word. Customers can still browse and send requests without signing in here.</p>
        <form onSubmit={event => void signIn(event)}>
          <label>Operations access word<input type="password" value={accessWord} onChange={event => setAccessWord(event.target.value)} autoComplete="current-password" required maxLength={200} autoFocus/></label>
          <button className="strataButton strataButtonRed" type="submit" disabled={loginBusy || !hasFirebaseWebConfig}>{loginBusy ? "VERIFYING ACCESS…" : "ENTER OPERATIONS ↗"}</button>
        </form>
      </section> : <section className="strataOperationsQueue">
        <div className="strataOperationsBar"><span>{orders.length} {orders.length === 1 ? "REQUEST" : "REQUESTS"}</span><span>{user?.email}</span></div>
        {!orders.length ? <div className="strataAccountEmpty"><strong>No website requests yet.</strong><p>When a customer submits an online request, it will appear here.</p></div> : orders.map(order => <article className="strataOperationsOrder" key={order.id}>
          <div className="strataOperationsOrderTop"><div><span className="strataEyebrow">{order.city} · {order.fulfilment}</span><h2>{order.customerName}</h2><small>{new Date(order.createdAt).toLocaleString()} · {order.id}</small></div><b data-status={order.status}>{order.status}</b></div>
          <p className="strataOperationsItems">{order.itemsText}</p>
          {order.deliveryLocation && <p>Delivery location: {order.deliveryLocation}</p>}
          {order.notes && <p>Customer note: {order.notes}</p>}
          <div className="strataOperationsControls">
            <label>Status<select value={statusDrafts[order.id] ?? order.status} onChange={event => setStatusDrafts(prev => ({ ...prev, [order.id]: event.target.value as StrataOrderStatus }))}>{STRATA_ORDER_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}</select></label>
            <label>Message to customer<textarea rows={2} maxLength={1000} value={noteDrafts[order.id] ?? order.staffNote ?? ""} onChange={event => setNoteDrafts(prev => ({ ...prev, [order.id]: event.target.value }))} placeholder="e.g. Dumela, we’re checking availability and will confirm the final price and delivery details with you."/></label>
            <button className="strataButton strataButtonRed" type="button" disabled={busyId === order.id} onClick={() => void save(order)}>{busyId === order.id ? "SAVING…" : "SAVE UPDATE ↗"}</button>
          </div>
        </article>)}
      </section>}
      {authorized && <section className="strataMenuAdmin">
        <div className="strataMenuAdminHead"><div><p className="strataEyebrow">STRATA · MENU MANAGEMENT</p><h2>THE <em>MENU.</em></h2><p>Edit the meals and prices customers see. Changes update the public menu and ordering form automatically.</p></div>
          {!menuItems.length && <button className="strataButton strataButtonRed" type="button" disabled={menuBusy} onClick={() => void seedMenu()}>{menuBusy ? "PUBLISHING…" : "PUBLISH STARTER MENU"}</button>}
        </div>
        {!menuItems.length && <p className="strataMenuAdminEmpty">The starter menu has not been published to the database yet. Publish it once to make the items fully editable.</p>}
        {menuItems.map(item => <article className="strataMenuAdminItem" key={item.id}>
          <div><span className={item.active ? "strataMenuStatus isActive" : "strataMenuStatus"}>{item.active ? "VISIBLE TO CUSTOMERS" : "HIDDEN FROM CUSTOMERS"}</span><h3>{item.name}</h3><p>{item.description || "No description added."}</p></div>
          <strong>P{item.price.toFixed(2)}</strong>
          <div className="strataMenuAdminActions"><button type="button" onClick={() => editMenu(item)}>EDIT</button><button type="button" disabled={menuBusy} onClick={() => void saveStrataMenuItem({ ...item, active: !item.active, updatedAt: new Date().toISOString() }).then(() => setMessage(item.name + (item.active ? " hidden from" : " shown on") + " the public menu.")).catch(() => setMessage("Could not update menu visibility. Check Firestore rules."))}>{item.active ? "HIDE" : "SHOW"}</button><button type="button" disabled={menuBusy} onClick={() => void removeMenuItem(item)}>DELETE</button></div>
        </article>)}
        <form id="strata-menu-editor" className="strataMenuEditor" onSubmit={event => void saveMenu(event)}>
          <p className="strataEyebrow">{editingMenuId ? "EDIT MENU ITEM" : "ADD A MENU ITEM"}</p>
          <label>Meal name<input required maxLength={80} value={menuName} onChange={event => setMenuName(event.target.value)} placeholder="e.g. Fish & Chips" /></label>
          <label>Description (optional)<input maxLength={240} value={menuDescription} onChange={event => setMenuDescription(event.target.value)} placeholder="What comes with the meal?" /></label>
          <div className="strataMenuEditorRow"><label>Price (BWP)<input required type="number" min="0" max="10000" step="0.5" value={menuPrice} onChange={event => setMenuPrice(event.target.value)} /></label><label className="strataMenuActiveToggle"><input type="checkbox" checked={menuActive} onChange={event => setMenuActive(event.target.checked)} /> Show on public menu</label></div>
          <div className="strataMenuEditorActions"><button className="strataButton strataButtonRed" type="submit" disabled={menuBusy}>{menuBusy ? "SAVING…" : editingMenuId ? "SAVE CHANGES" : "ADD MENU ITEM"}</button>{editingMenuId && <button className="strataButton strataButtonOutline" type="button" onClick={() => { setEditingMenuId(""); setMenuName(""); setMenuDescription(""); setMenuPrice("70"); setMenuActive(true); }}>CANCEL EDIT</button>}</div>
        </form>
      </section>}
      {message && <p className="strataConnectionNotice" role="status">{message}</p>}
      <p className="strataOperationsFootnote">Only a server-issued Strata Operations session with a matching <code>admins/{'{uid}'}</code> role document can access this queue. Customer records and the operations queue are not cached for offline access.</p>
    </section>
    <footer className="strataFooter"><Link href="/" className="strataBrand"><img src="/strata-icon.svg" alt="" width="42" height="42"/><span><strong>STRATA</strong><small>SA’O BITSA</small></span></Link><Link href="/">CUSTOMER STOREFRONT ↗</Link><small>© {new Date().getFullYear()} STRATA SA’O BITSA · BOTSWANA</small></footer>
  </main>;
}
