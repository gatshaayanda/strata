"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ORDER_STATUSES, subscribeToFoodOrders, subscribeToMenuItems, saveMenuItem,
  updateFoodOrderPayment, updateFoodOrderStatus, type FoodOrder, type MenuItem,
  type OrderStatus, type PaymentMethod, type PaymentStatus,
} from "@/lib/firebase/data";

type Tab = "orders" | "menu";
type MenuDraft = { id: string; name: string; price: string; category: string; description: string; imageUrl: string; available: boolean; preparationMinutes: string; sortOrder: string };
const money = (value: number) => "P" + value.toFixed(2);
const blankMenu = (): MenuDraft => ({ id: "", name: "", price: "", category: "", description: "", imageUrl: "", available: true, preparationMinutes: "15", sortOrder: "100" });

export default function StrataOperationsDashboard() {
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [notice, setNotice] = useState("");
  const [menuError, setMenuError] = useState("");
  const [draft, setDraft] = useState<MenuDraft>(blankMenu());
  const [savingMenu, setSavingMenu] = useState(false);

  useEffect(() => {
    const stopOrders = subscribeToFoodOrders(items => { setOrders(items); setLoadingOrders(false); }, error => { setNotice(error.message); setLoadingOrders(false); });
    const stopMenu = subscribeToMenuItems(items => { setMenu(items); setLoadingMenu(false); }, error => { setMenuError(error.message); setLoadingMenu(false); });
    return () => { stopOrders(); stopMenu(); };
  }, []);

  const queue = useMemo(() => [...orders].sort((a, b) => {
    const aNew = a.status === "New" ? 0 : 1;
    const bNew = b.status === "New" ? 0 : 1;
    return aNew - bNew || a.createdAt.localeCompare(b.createdAt);
  }), [orders]);
  const openOrders = orders.filter(order => !["Delivered", "Collected", "Cancelled"].includes(order.status));
  const newOrders = orders.filter(order => order.status === "New").length;
  const activeValue = openOrders.reduce((sum, order) => sum + (Number.isFinite(order.total) ? order.total : 0), 0);
  const popularItems = useMemo(() => {
    const counts = new Map<string, number>();
    for (const order of orders) if (order.status !== "Cancelled") for (const item of order.items || []) counts.set(item.name, (counts.get(item.name) || 0) + item.quantity);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [orders]);

  async function changeStatus(order: FoodOrder, status: OrderStatus) {
    setNotice("");
    try { await updateFoodOrderStatus(order.id, status); setNotice("Order status saved."); }
    catch { setNotice("The status was not confirmed. Check Firebase access and retry."); }
  }
  async function changePayment(order: FoodOrder, paymentStatus: PaymentStatus, paymentMethod: PaymentMethod, amountPaid: number) {
    setNotice("");
    try { await updateFoodOrderPayment(order.id, paymentStatus, paymentMethod, amountPaid); setNotice("Payment record saved. This is a manual record, not a payment-provider confirmation."); }
    catch { setNotice("The payment record was not saved. Check Firebase access and retry."); }
  }
  function editMenu(item: MenuItem) {
    setDraft({ id: item.id, name: item.name, price: String(item.price), category: item.category, description: item.description || "", imageUrl: item.imageUrl || "", available: item.available, preparationMinutes: String(item.preparationMinutes || 15), sortOrder: String(item.sortOrder || 100) });
    setMenuError("");
    setTab("menu");
  }
  async function saveMenu(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingMenu) return;
    const price = Number(draft.price), preparationMinutes = Number(draft.preparationMinutes), sortOrder = Number(draft.sortOrder);
    if (!draft.name.trim() || !draft.category.trim() || !Number.isFinite(price) || price < 0 || !Number.isInteger(preparationMinutes) || preparationMinutes < 1 || !Number.isInteger(sortOrder)) {
      setMenuError("Add a name, category, valid price, preparation time and display order.");
      return;
    }
    if (draft.imageUrl.trim()) {
      try { const url = new URL(draft.imageUrl.trim()); if (url.protocol !== "https:") throw new Error(); }
      catch { setMenuError("Menu image URLs must be valid HTTPS links. Image upload will be added after Storage is configured."); return; }
    }
    setSavingMenu(true); setMenuError("");
    const id = draft.id || (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : "menu-" + Date.now().toString(36));
    const item: MenuItem = { id, name: draft.name.trim(), price, category: draft.category.trim(), description: draft.description.trim(), imageUrl: draft.imageUrl.trim() || undefined, available: draft.available, preparationMinutes, sortOrder };
    try {
      await saveMenuItem(item);
      setDraft(blankMenu());
      setMenuError("Menu item saved. Confirm it appears on the customer menu before sharing the ordering link.");
    } catch {
      setMenuError("The menu item was not saved. Check that your account has the Strata owner/staff role and retry.");
    } finally { setSavingMenu(false); }
  }

  return <main className="strataAdminPage">
    <div className="strataAdminWrap">
      <header className="strataAdminHeader">
        <Link href="/" className="strataBrand"><span className="strataBrandMark">S</span><span><strong>STRATA SA’O BITSA</strong><small>OPERATIONS · COME GET HOOKED.</small></span></Link>
        <Link href="/" className="strataAdminCustomerLink">Open customer storefront ↗</Link>
      </header>
      <section className="strataAdminIntro"><p className="strataEyebrow">OWNER & STAFF WORKSPACE</p><h1>THE<br /><em>PASS.</em></h1><p>Review incoming orders, keep the published menu accurate and record fulfilment and payment status. Orders are not counted as paid sales unless payment is recorded separately.</p></section>
      <div className="strataMetricGrid">
        <article><span>NEW ORDERS</span><strong>{newOrders}</strong><small>Waiting for review</small></article>
        <article><span>OPEN ORDERS</span><strong>{openOrders.length}</strong><small>Not yet completed or cancelled</small></article>
        <article><span>OPEN ITEM VALUE</span><strong>{money(activeValue)}</strong><small>Not paid revenue; delivery fees excluded</small></article>
        <article><span>MENU ITEMS</span><strong>{menu.filter(item => item.available).length}</strong><small>Currently marked available</small></article>
      </div>
      <div className="strataAdminTabs" role="tablist" aria-label="Operations sections">
        <button type="button" role="tab" aria-selected={tab === "orders"} className={tab === "orders" ? "isActive" : ""} onClick={() => setTab("orders")}>Order queue <span>{orders.length}</span></button>
        <button type="button" role="tab" aria-selected={tab === "menu"} className={tab === "menu" ? "isActive" : ""} onClick={() => setTab("menu")}>Menu studio <span>{menu.length}</span></button>
      </div>
      {notice ? <p className="strataAdminNotice" role="status">{notice}</p> : null}

      {tab === "orders" ? <section className="strataAdminSection">
        <div className="strataAdminSectionHead"><div><p className="strataEyebrow">LIVE QUEUE</p><h2>ORDERS IN PLAY</h2></div><span>{loadingOrders ? "Connecting…" : "Live updates"}</span></div>
        {loadingOrders ? <p className="strataAdminEmpty">Loading the order queue…</p> : null}
        {!loadingOrders && queue.length === 0 ? <div className="strataAdminEmpty"><h3>THE BOARD IS CLEAR.</h3><p>New customer orders will appear here after the order service and Firebase project are configured.</p></div> : null}
        <div className="strataAdminOrderList">{queue.map(order => <article className="strataAdminOrder" key={order.id}>
          <div className="strataAdminOrderHead"><div><span>#{order.id.slice(0, 8).toUpperCase()}</span><h3>{order.customerName}</h3><p>{order.phone} · {order.branch || "Branch not recorded"} · {order.mode === "delivery" ? "Delivery" : "Pickup"}</p></div><strong>{money(order.total)}</strong></div>
          <ul>{order.items.map((item, index) => <li key={item.menuItemId || item.name + index}><span>{item.quantity} × {item.name}</span><strong>{money(item.price * item.quantity)}</strong></li>)}</ul>
          {order.mode === "delivery" && order.deliveryLocation ? <p className="strataAdminOrderDetail"><b>DELIVERY</b> {order.deliveryLocation}</p> : null}
          <p className="strataAdminOrderDetail"><b>WHEN</b> {order.scheduledFor || "Time to be confirmed"} · <b>CREATED</b> {new Date(order.createdAt).toLocaleString("en-BW", { timeZone: "Africa/Gaborone" })}</p>
          {order.instructions ? <p className="strataAdminOrderDetail"><b>NOTES</b> {order.instructions}</p> : null}
          <div className="strataAdminControls">
            <label>Order status<select value={order.status} onChange={event => void changeStatus(order, event.target.value as OrderStatus)}>{ORDER_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}</select></label>
            <label>Payment status<select value={order.paymentStatus || "unpaid"} onChange={event => void changePayment(order, event.target.value as PaymentStatus, order.paymentMethod || "unpaid", order.amountPaid || 0)}><option value="unpaid">Unpaid</option><option value="partial">Part-paid</option><option value="paid">Paid (manually verified)</option></select></label>
            <label>Payment method<select value={order.paymentMethod || "unpaid"} onChange={event => void changePayment(order, order.paymentStatus || "unpaid", event.target.value as PaymentMethod, order.amountPaid || 0)}><option value="unpaid">Not recorded</option><option value="cash">Cash</option><option value="etransfer">E-transfer / mobile money</option><option value="other">Other</option></select></label>
            <label>Amount received (P)<input type="number" min="0" step="0.01" defaultValue={order.amountPaid || 0} onBlur={event => { const amount = Number(event.currentTarget.value); if (Number.isFinite(amount) && amount >= 0 && amount !== (order.amountPaid || 0)) void changePayment(order, order.paymentStatus || "unpaid", order.paymentMethod || "unpaid", amount); }} /></label>
          </div>
        </article>)}</div>
      </section> : null}

      {tab === "menu" ? <section className="strataAdminSection">
        <div className="strataAdminSectionHead"><div><p className="strataEyebrow">PUBLISHED MENU</p><h2>KEEP IT CURRENT</h2></div><button type="button" className="strataAdminSecondary" onClick={() => { setDraft(blankMenu()); setMenuError(""); }}>+ New item</button></div>
        <p className="strataAdminHelp">Only publish dishes and prices confirmed by the owner. Availability changes are customer-visible. Menu images currently require an HTTPS image URL; upload support depends on Firebase Storage configuration.</p>
        {menuError ? <p className="strataAdminNotice" role="status">{menuError}</p> : null}
        {loadingMenu ? <p className="strataAdminEmpty">Loading menu records…</p> : null}
        {!loadingMenu && menu.length === 0 ? <p className="strataAdminEmpty">No menu items are stored yet. Add only owner-confirmed dishes and prices; no sample menu is seeded.</p> : null}
        <div className="strataAdminMenuList">{menu.map(item => <article key={item.id} className="strataAdminMenuRow"><div><strong>{item.name}</strong><span>{item.category} · {money(item.price)} · {item.available ? "Available" : "Hidden"}</span></div><button type="button" className="strataAdminSecondary" onClick={() => editMenu(item)}>Edit</button></article>)}</div>
        <form className="strataMenuEditor" onSubmit={saveMenu}>
          <div className="strataAdminSectionHead"><div><p className="strataEyebrow">{draft.id ? "EDIT MENU ITEM" : "NEW MENU ITEM"}</p><h2>{draft.id ? "UPDATE THE DISH" : "ADD THE DISH"}</h2></div></div>
          <div className="strataAdminFormGrid">
            <label>Name<input value={draft.name} onChange={event => setDraft(current => ({ ...current, name: event.target.value }))} maxLength={120} required /></label>
            <label>Price (P)<input type="number" min="0" step="0.01" value={draft.price} onChange={event => setDraft(current => ({ ...current, price: event.target.value }))} required /></label>
            <label>Category<input value={draft.category} onChange={event => setDraft(current => ({ ...current, category: event.target.value }))} maxLength={80} required placeholder="e.g. Fish, Sides, Drinks" /></label>
            <label>Preparation time (minutes)<input type="number" min="1" step="1" value={draft.preparationMinutes} onChange={event => setDraft(current => ({ ...current, preparationMinutes: event.target.value }))} required /></label>
            <label>Display order<input type="number" step="1" value={draft.sortOrder} onChange={event => setDraft(current => ({ ...current, sortOrder: event.target.value }))} required /></label>
            <label>Image URL (HTTPS)<input type="url" value={draft.imageUrl} onChange={event => setDraft(current => ({ ...current, imageUrl: event.target.value }))} placeholder="https://…" /></label>
            <label className="strataAdminFormWide">Description<textarea value={draft.description} onChange={event => setDraft(current => ({ ...current, description: event.target.value }))} maxLength={800} rows={3} /></label>
            <label className="strataAdminAvailable"><input type="checkbox" checked={draft.available} onChange={event => setDraft(current => ({ ...current, available: event.target.checked }))} /> Show this item on the customer menu</label>
          </div>
          <div className="strataAdminFormActions"><button className="strataButton" type="submit" disabled={savingMenu}>{savingMenu ? "SAVING…" : "Save menu item"} <span aria-hidden="true">→</span></button><button type="button" className="strataAdminSecondary" onClick={() => setDraft(blankMenu())}>Clear form</button></div>
        </form>
      </section> : null}

      <section className="strataAdminSection strataAdminReport">
        <div className="strataAdminSectionHead"><div><p className="strataEyebrow">ORDER SIGNALS</p><h2>MOST ORDERED</h2></div><span>All recorded orders, excluding cancellations</span></div>
        {popularItems.length ? <ol>{popularItems.map(([name, quantity]) => <li key={name}><span>{name}</span><strong>{quantity} ordered</strong></li>)}</ol> : <p className="strataAdminHelp">Popular dishes will appear after real orders are recorded. These figures are order quantities, not unique customers or paid sales.</p>}
      </section>
      <footer className="strataAdminFooter"><span>STRATA SA’O BITSA · PRIVATE OPERATIONS</span><span>Confirm orders, prices and payments against real records.</span></footer>
    </div>
  </main>;
}
