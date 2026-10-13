"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

const PHONE = "26777762614";

export default function OrderPage() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("Gaborone");
  const [fulfilment, setFulfilment] = useState("Delivery");
  const [items, setItems] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const lines = [
      "Dumela Strata Sa’o Bitsa! I'd like to make an order request.",
      "",
      "Name: " + name.trim(),
      "City: " + city,
      "Fulfilment: " + fulfilment,
      "Items and quantities: " + items.trim(),
      ...(fulfilment === "Delivery" ? ["Delivery location: " + address.trim()] : []),
      ...(phone.trim() ? ["My contact number: " + phone.trim()] : []),
      ...(notes.trim() ? ["Additional notes: " + notes.trim()] : []),
      "",
      "Please confirm availability, final price, delivery charge and estimated timing. I understand this is a request, not a confirmed order or payment."
    ];
    window.location.assign("https://wa.me/" + PHONE + "?text=" + encodeURIComponent(lines.join("\n")));
  }

  return <main className="strataSite strataOrderPage">
    <header className="strataHeader">
      <Link href="/" className="strataBrand"><img src="/strata-icon.svg" alt="" width="48" height="48"/><span><strong>STRATA</strong><small>SA’O BITSA</small></span></Link>
      <Link href="/" className="strataHeaderCta">← BACK TO HOME</Link>
    </header>
    <section className="strataOrderLayout">
      <div className="strataOrderIntro">
        <p className="strataEyebrow">COME GET HOOKED · ORDER REQUEST</p>
        <h1>LET’S GET<br/><em>YOU FED.</em></h1>
        <p>Tell us what you’re after. We’ll prepare a message for the Strata team on WhatsApp so they can confirm today’s availability, price and fulfilment details.</p>
        <div className="strataOrderNotice"><strong>GOOD TO KNOW</strong><span>This sends a request to the team. Your order, total and delivery are only confirmed after Strata replies. No online payment is taken here.</span></div>
        <img src="/strata-assets/fish.jpeg" alt="Strata Sa’o Bitsa fish and chips" loading="lazy"/>
      </div>
      <form className="strataOrderForm" onSubmit={submit}>
        <label>Your name<input required maxLength={80} autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Name for the order"/></label>
        <div className="strataFormRow">
          <label>City<select value={city} onChange={e=>setCity(e.target.value)}><option>Gaborone</option><option>Francistown</option></select></label>
          <label>How would you like it?<select value={fulfilment} onChange={e=>setFulfilment(e.target.value)}><option>Delivery</option><option>Pickup</option><option>Need help deciding</option></select></label>
        </div>
        <label>What would you like?<textarea required minLength={3} maxLength={1200} rows={4} value={items} onChange={e=>setItems(e.target.value)} placeholder="List the items and quantities. If you need the current menu first, go back and tap “Get the menu”."/></label>
        {fulfilment === "Delivery" && <label>Delivery location / area<input required maxLength={240} autoComplete="street-address" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Area, plot or useful landmark"/></label>}
        <label>Contact number (optional)<input type="tel" maxLength={40} autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Number the team can reach you on"/></label>
        <label>Anything else? (optional)<textarea maxLength={600} rows={2} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Timing, directions or other details"/></label>
        <button className="strataButton strataButtonRed strataSubmitOrder" type="submit">CONTINUE TO WHATSAPP <span>↗</span></button>
        <p className="strataFormFootnote">Your details are placed in a WhatsApp message on your device. This website does not save or submit the request to an order database yet.</p>
      </form>
    </section>
    <footer className="strataFooter"><Link href="/" className="strataBrand"><img src="/strata-icon.svg" alt="" width="42" height="42"/><span><strong>STRATA</strong><small>SA’O BITSA</small></span></Link><span>FISH. CHIPS. GOOD TIMES.</span><a href="tel:+26777762614">77 762 614</a><small>© {new Date().getFullYear()} STRATA SA’O BITSA · BOTSWANA</small></footer>
  </main>;
}
