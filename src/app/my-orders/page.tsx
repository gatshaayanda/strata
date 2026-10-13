"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, hasFirebaseWebConfig } from "@/lib/firebase/client";
import { subscribeToCustomerOrders, type FoodOrder } from "@/lib/firebase/data";

const money = (value: number) => "P" + value.toFixed(2);
const dateLabel = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-BW", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Gaborone" }).format(date);
};

export default function MyOrdersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!hasFirebaseWebConfig) {
      setLoading(false);
      setMessage("Order history is not connected in this environment yet.");
      return;
    }
    let stopOrders = () => {};
    const stopAuth = onAuthStateChanged(auth, next => {
      stopOrders();
      stopOrders = () => {};
      setUser(next);
      if (!next) {
        if (!next) setOrders([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      stopOrders = subscribeToCustomerOrders(next.uid, items => {
        setOrders(items);
        setLoading(false);
        setMessage("");
      }, () => {
        setLoading(false);
        setMessage("We couldn’t load orders for this browser session. Check your connection and try again.");
      });
    });
    return () => { stopOrders(); stopAuth(); };
  }, []);

  return <main className="strataCheckoutPage"><div className="strataCheckoutWrap">
    <header className="strataCheckoutHeader"><Link href="/" className="strataBrand"><span className="strataBrandMark">S</span><span><strong>STRATA SA’O BITSA</strong><small>COME GET HOOKED.</small></span></Link><Link href="/" className="strataCheckoutBack">← Back home</Link></header>
    <div className="strataCheckoutIntro"><p className="strataEyebrow">YOUR ORDER HISTORY</p><h1>MY<br /><em>ORDERS.</em></h1><p>Order status is based on the latest update recorded by the team. A saved order is not automatically an accepted order.</p></div>
    {loading ? <p className="strataInlineState" role="status">Loading your orders…</p> : null}
    {!loading && message ? <div className="strataInlineNotice" role="status">{message}</div> : null}
    {!loading && !message && !user ? <section className="strataOrderHistoryEmpty"><h2>YOUR ORDERS LIVE ON THIS DEVICE.</h2><p>Open this page in the same browser you used to submit an order. Guest order history is tied to that browser session unless an account-linking option is added later.</p><Link href="/order" className="strataButton">Start an order <span aria-hidden="true">→</span></Link></section> : null}
    {!loading && !message && user && orders.length === 0 ? <section className="strataOrderHistoryEmpty"><h2>NOTHING ON THE BOARD YET.</h2><p>When you submit an order from this browser, it will appear here after it is saved.</p><Link href="/order" className="strataButton">Browse the menu <span aria-hidden="true">→</span></Link></section> : null}
    <div className="strataOrderHistory">{orders.map(order => <article className="strataHistoryCard" key={order.id}>
      <div className="strataHistoryTop"><div><span>ORDER REFERENCE</span><strong>#{order.id.slice(0, 8).toUpperCase()}</strong></div><span className="strataStatusPill">{order.status}</span></div>
      <p className="strataHistoryMeta">{order.branch || "Branch to be confirmed"} · {order.mode === "delivery" ? "Delivery" : "Pickup"} · {dateLabel(order.createdAt)}</p>
      <ul>{order.items.map((item, index) => <li key={item.menuItemId || item.name + index}><span>{item.quantity} × {item.name}</span><strong>{money(item.price * item.quantity)}</strong></li>)}</ul>
      <div className="strataHistoryTotal"><span>Item total</span><strong>{money(order.total)}</strong></div>
      <p className="strataHistoryNote">{order.status === "New" ? "Waiting for the team to review and accept this order." : order.status === "Cancelled" ? "This order is cancelled. Contact the team if you need clarification." : "Latest recorded status: " + order.status + ". Delivery fees and payment are tracked separately from the item total."}</p>
    </article>)}</div>
  </div></main>;
}
