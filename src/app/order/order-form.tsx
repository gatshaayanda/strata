"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { getIdToken, signInAnonymously } from "firebase/auth";
import { auth, hasFirebaseWebConfig } from "@/lib/firebase/client";
import { subscribeToMenuItems, type MenuItem } from "@/lib/firebase/data";

type Branch = "Gaborone" | "Francistown";
type Mode = "pickup" | "delivery";
type Cart = Record<string, number>;
const money = (value: number) => "P" + value.toFixed(2);

export default function OrderForm() {
  const [branch, setBranch] = useState<Branch>("Gaborone");
  const [mode, setMode] = useState<Mode>("pickup");
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<Cart>({});
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [scheduledFor, setScheduledFor] = useState("ASAP");
  const [instructions, setInstructions] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<{ id: string; total: number } | null>(null);
  const orderIdRef = useRef("");

  useEffect(() => {
    const initialBranch = new URLSearchParams(window.location.search).get("branch");
    if (initialBranch === "Gaborone" || initialBranch === "Francistown") setBranch(initialBranch);
    if (!hasFirebaseWebConfig) {
      setMenuLoading(false);
      setMenuError("The live menu is not connected in this environment yet.");
      return;
    }
    const stopMenu = subscribeToMenuItems(
      items => { setMenu(items.filter(item => item.available)); setMenuLoading(false); setMenuError(""); },
      () => { setMenuLoading(false); setMenuError("We couldn’t load the menu. Check your connection and retry."); }
    );
    return () => { stopMenu(); };
  }, []);

  const cartItems = useMemo(() => menu.filter(item => (cart[item.id] || 0) > 0).map(item => ({ item, quantity: cart[item.id] })), [menu, cart]);
  const displayedTotal = cartItems.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0);

  function changeQuantity(id: string, delta: number) {
    setCart(current => {
      const next = { ...current };
      const quantity = (next[id] || 0) + delta;
      if (quantity <= 0) delete next[id];
      else next[id] = Math.min(20, quantity);
      return next;
    });
    setMessage("");
    setConfirmedOrder(null);
    orderIdRef.current = "";
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setMessage("");
    if (!hasFirebaseWebConfig) { setMessage("Ordering is not connected in this environment yet. Nothing has been sent."); return; }
    if (!cartItems.length) { setMessage("Add at least one item from the current menu."); return; }
    if (!name.trim() || !phone.trim()) { setMessage("Add your name and contact number."); return; }
    if (mode === "delivery" && !location.trim()) { setMessage("Add a delivery address or nearby landmark."); return; }

    setBusy(true);
    try {
      let currentUser = auth.currentUser;
      if (!currentUser) currentUser = (await signInAnonymously(auth)).user;
      const token = await getIdToken(currentUser);
      if (!orderIdRef.current) orderIdRef.current = crypto.randomUUID();
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderIdRef.current,
          branch,
          customerName: name.trim(),
          phone: phone.trim(),
          mode,
          scheduledFor: scheduledFor.trim() || "ASAP",
          deliveryLocation: mode === "delivery" ? location.trim() : "",
          instructions: instructions.trim(),
          items: cartItems.map(({ item, quantity }) => ({ menuItemId: item.id, quantity }))
        })
      });
      const result = await response.json().catch(() => ({})) as { orderId?: string; total?: number; error?: string };
      if (!response.ok || !result.orderId || typeof result.total !== "number") {
        setMessage(result.error || "We couldn’t confirm your order. Your details remain on this page; please retry.");
        return;
      }
      setConfirmedOrder({ id: result.orderId, total: result.total });
      setMessage("Your order was saved. The team still needs to accept it and confirm fulfilment.");
      setCart({});
    } catch {
      setMessage("We couldn’t confirm your order. Keep this page open and retry; do not assume it was received.");
    } finally {
      setBusy(false);
    }
  }

  if (confirmedOrder) {
    return <main className="strataCheckoutPage"><div className="strataCheckoutWrap"><Link href="/" className="strataBrand"><span className="strataBrandMark">S</span><span><strong>STRATA SA’O BITSA</strong><small>COME GET HOOKED.</small></span></Link><section className="strataConfirmation"><span className="strataConfirmationMark" aria-hidden="true">✓</span><p className="strataEyebrow">ORDER RECEIVED</p><h1>YOU’RE ON<br /><em>THE LIST.</em></h1><p>Your order details have been saved. The team must still accept the order and confirm the fulfilment details.</p><div className="strataOrderReference"><span>ORDER REFERENCE</span><strong>{confirmedOrder.id}</strong><span>Item total: {money(confirmedOrder.total)}. Delivery charges, if any, are not included yet.</span></div><div className="strataCheckoutActions"><Link href="/my-orders" className="strataButton">Track my order <span aria-hidden="true">→</span></Link><Link href="/" className="strataCheckoutBack">Back to home</Link></div></section></div></main>;
  }

  return (
    <main className="strataCheckoutPage">
      <div className="strataCheckoutWrap">
        <header className="strataCheckoutHeader">
          <Link href="/" className="strataBrand"><span className="strataBrandMark">S</span><span><strong>STRATA SA’O BITSA</strong><small>COME GET HOOKED.</small></span></Link>
          <Link href="/" className="strataCheckoutBack">← Back to menu</Link>
        </header>
        <div className="strataCheckoutIntro"><p className="strataEyebrow">YOUR CRAVING STARTS HERE</p><h1>BUILD YOUR<br /><em>ORDER.</em></h1><p>Choose from the published menu, add your details and send your order. No account is required to start.</p></div>

        <form className="strataCheckoutGrid" onSubmit={submit}>
          <section className="strataCheckoutPanel">
            <div className="strataPanelHeading"><span>01</span><h2>THE MENU</h2></div>
            <div className="strataChoiceGroup"><span>ORDERING FOR</span>{(["Gaborone", "Francistown"] as const).map(value => <button type="button" key={value} className={branch === value ? "isSelected" : ""} aria-pressed={branch === value} onClick={() => { setBranch(value); setMessage(""); }}>{value}</button>)}</div>
            {menuLoading ? <p className="strataInlineState" role="status">Loading the current menu…</p> : null}
            {!menuLoading && menuError ? <div className="strataInlineNotice" role="status">{menuError}</div> : null}
            {!menuLoading && !menuError && menu.length === 0 ? <div className="strataInlineNotice"><strong>Menu coming online.</strong><p>Only confirmed dishes and prices will be listed here. The team needs to publish the menu before orders can be submitted.</p></div> : null}
            <div className="strataOrderMenu">{menu.map(item => <article key={item.id} className="strataOrderMenuItem">
              <div className="strataOrderThumb">{item.imageUrl ? <Image src={item.imageUrl} alt="" width={80} height={80} sizes="80px" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span aria-hidden="true">SSB</span>}</div>
              <div className="strataOrderItemCopy"><h3>{item.name}</h3>{item.description ? <p>{item.description}</p> : null}<strong>{money(item.price)}</strong></div>
              <div className="strataQuantity" aria-label={item.name + " quantity"}><button type="button" aria-label={"Remove one " + item.name} disabled={!cart[item.id]} onClick={() => changeQuantity(item.id, -1)}>−</button><span>{cart[item.id] || 0}</span><button type="button" aria-label={"Add one " + item.name} onClick={() => changeQuantity(item.id, 1)}>＋</button></div>
            </article>)}</div>
          </section>

          <section className="strataCheckoutPanel">
            <div className="strataPanelHeading"><span>02</span><h2>YOUR DETAILS</h2></div>
            <label className="strataField">Your name<input autoComplete="name" maxLength={120} value={name} onChange={event => setName(event.target.value)} required /></label>
            <label className="strataField">Phone / WhatsApp<input autoComplete="tel" inputMode="tel" maxLength={60} value={phone} onChange={event => setPhone(event.target.value)} required /></label>
            <div className="strataChoiceGroup"><span>FULFILMENT</span><button type="button" className={mode === "pickup" ? "isSelected" : ""} aria-pressed={mode === "pickup"} onClick={() => setMode("pickup")}>Pickup</button><button type="button" className={mode === "delivery" ? "isSelected" : ""} aria-pressed={mode === "delivery"} onClick={() => setMode("delivery")}>Delivery</button></div>
            {mode === "delivery" ? <label className="strataField">Delivery address / landmark<textarea maxLength={500} value={location} onChange={event => setLocation(event.target.value)} required rows={3} placeholder="Area, street, building or nearby landmark" /></label> : <p className="strataFieldHint">The team will confirm the pickup point for {branch} before the order is accepted.</p>}
            <label className="strataField">When would you like it?<select value={scheduledFor} onChange={event => setScheduledFor(event.target.value)}><option value="ASAP">As soon as possible</option><option value="Later today">Later today — confirm with me</option><option value="Schedule with team">Arrange a time with the team</option></select></label>
            <label className="strataField">Notes for the team <span>(optional)</span><textarea maxLength={1200} rows={3} value={instructions} onChange={event => setInstructions(event.target.value)} placeholder="Anything we should know?" /></label>
            <div className="strataCartSummary"><div><span>ITEMS</span><strong>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</strong></div><div><span>ITEM TOTAL</span><strong>{money(displayedTotal)}</strong></div><p>Delivery fees and final availability are not yet included. The team will confirm these before accepting your order. No online payment is taken here.</p></div>
            {message ? <p className="strataFormMessage" role="status">{message}</p> : null}
            <button className="strataButton strataSubmitOrder" type="submit" disabled={busy || menuLoading || menu.length === 0 || cartItems.length === 0}>{busy ? "SENDING ORDER…" : "Send order request"} <span aria-hidden="true">→</span></button>
            <p className="strataPrivacyNote">Submitting sends your order details for review. It is not a payment, confirmed delivery time or guarantee of availability.</p>
          </section>
        </form>
      </div>
    </main>
  );
}
