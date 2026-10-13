"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { hasFirebaseWebConfig } from "@/lib/firebase/client";
import { subscribeToMenuItems, type MenuItem } from "@/lib/firebase/data";

type Area = "Gaborone" | "Francistown";

const money = (value: number) => new Intl.NumberFormat("en-BW", { style: "currency", currency: "BWP", maximumFractionDigits: 2 }).format(value);

export default function HomePage() {
  const [area, setArea] = useState<Area>("Gaborone");
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuError, setMenuError] = useState("");

  useEffect(() => {
    if (!hasFirebaseWebConfig) {
      setLoading(false);
      setMenuError("The live menu will appear here once this app is connected to its Firebase project.");
      return;
    }
    const stop = subscribeToMenuItems(
      items => { setMenu(items.filter(item => item.available)); setLoading(false); setMenuError(""); },
      () => { setLoading(false); setMenuError("We couldn’t load the live menu. Please try again when you have a connection."); }
    );
    return stop;
  }, []);

  const orderHref = `/order?branch=${encodeURIComponent(area)}`;

  return (
    <main className="strataSite">
      <div className="strataTopline"><span>BOTSWANA</span><span>FRESH CRAVINGS. GOOD COMPANY.</span><span>GABORONE · FRANCISTOWN</span></div>
      <header className="strataNav">
        <Link href="/" className="strataBrand" aria-label="Strata Sa’o Bitsa home">
          <span className="strataBrandMark" aria-hidden="true">S</span>
          <span><strong>STRATA SA’O BITSA</strong><small>FISH · FOOD · GOOD TIMES</small></span>
        </Link>
        <nav aria-label="Main navigation" className="strataNavLinks">
          <a href="#menu">Menu</a>
          <a href="#how-it-works">How it works</a>
          <Link href="/my-orders">My orders</Link>
        </nav>
        <div className="strataNavActions"><button type="button" className="strataInstallButton" onClick={() => window.dispatchEvent(new Event("strata-open-install"))}>Install app ↓</button><Link className="strataButton strataButtonSmall" href={orderHref}>Order now <span aria-hidden="true">↗</span></Link></div>
      </header>

      <section className="strataHero">
        <div className="strataHeroCopy">
          <p className="strataEyebrow"><span className="strataDot" /> GOOD FOOD, YOUR WAY</p>
          <h1>COME GET<br /><em>HOOKED.</em></h1>
          <p className="strataHeroLead">Your next fish craving starts here. Explore the menu, choose your area and tell us how you’d like your order.</p>
          <div className="strataAreaPicker" aria-label="Choose your ordering area">
            <span>ORDERING FOR</span>
            <div role="group" aria-label="Ordering area">
              {(["Gaborone", "Francistown"] as const).map(option => (
                <button key={option} type="button" aria-pressed={area === option} className={area === option ? "isSelected" : ""} onClick={() => setArea(option)}>
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="strataHeroActions">
            <Link href={orderHref} className="strataButton">Explore the menu <span aria-hidden="true">→</span></Link>
            <a href="#how-it-works" className="strataTextLink">How ordering works</a>
          </div>
          <p className="strataHonestyNote">Menu items, prices and delivery options shown in the app are subject to confirmation by the team.</p>
        </div>
        <div className="strataHeroArt" aria-label="Strata Sa’o Bitsa brand artwork">
          <div className="strataFishMark"><svg viewBox="0 0 512 512" role="img" aria-label="Fish"><path d="M95 256c57-81 132-122 226-122 45 0 82 10 115 31l-43 51 43 40c-33 21-70 31-115 31-94 0-169-41-226-122Z" fill="currentColor"/><path d="m95 256-47-45v90l47-45Z" fill="currentColor"/><circle cx="359" cy="229" r="13" fill="#111"/></svg></div>
          <div className="strataArtStamp">SA’O<br />BITSA</div>
          <p className="strataArtCaption">A LITTLE TASTE<br />OF SOMETHING GOOD.</p>
          <span className="strataArtRing strataArtRingOne" /><span className="strataArtRing strataArtRingTwo" />
        </div>
      </section>

      <section className="strataMenuSection" id="menu">
        <div className="strataSectionHeading">
          <div><p className="strataEyebrow">THE GOOD STUFF</p><h2>ON THE MENU<span>.</span></h2></div>
          <p>Showing the menu for <strong>{area}</strong>. Choose your area above to start an order.</p>
        </div>
        {loading ? <div className="strataState" role="status">Loading the latest menu…</div> :
          menu.length ? <div className="strataMenuGrid">{menu.slice(0, 6).map(item => (
            <article className="strataMenuCard" key={item.id}>
              {item.imageUrl ? <Image src={item.imageUrl} alt={item.name} width={720} height={480} sizes="(max-width: 560px) 100vw, (max-width: 850px) 50vw, 33vw" style={{ width: "100%", height: "190px", objectFit: "cover" }} /> : <div className="strataMenuCardArt" aria-hidden="true"><span>SSB</span></div>}
              <div className="strataMenuCardBody"><div><p>{item.category || "FROM OUR KITCHEN"}</p><h3>{item.name}</h3></div><strong>{money(item.price)}</strong></div>
              {item.description ? <p className="strataMenuDescription">{item.description}</p> : null}
              <Link href={orderHref} className="strataMenuAction">Add to your order <span aria-hidden="true">＋</span></Link>
            </article>
          ))}</div> :
          <div className="strataMenuEmpty">
            <span className="strataEmptyIcon" aria-hidden="true">✳</span>
            <div><h3>WE’RE GETTING THE MENU READY.</h3><p>{menuError || "The team is preparing the live menu. We’ll show confirmed dishes and prices here—not guesses."}</p></div>
            <Link href={orderHref} className="strataButton strataButtonDark">Start an order <span aria-hidden="true">→</span></Link>
          </div>
        }
        <p className="strataFinePrint">Only menu items published by the team appear here. Prices are displayed in Botswana pula (P).</p>
      </section>

      <section className="strataHowSection" id="how-it-works">
        <div className="strataHowIntro"><p className="strataEyebrow">SIMPLE AS THAT</p><h2>YOUR CRAVING.<br /><em>YOUR CALL.</em></h2><p>Order without creating an account. We’ll confirm your order and the fulfilment details before it’s treated as accepted.</p></div>
        <div className="strataSteps">
          <article><span>01</span><h3>PICK YOUR AREA</h3><p>Choose Gaborone or Francistown so the team knows where your order is for.</p></article>
          <article><span>02</span><h3>BUILD YOUR ORDER</h3><p>Choose from the published menu, then select pickup or delivery.</p></article>
          <article><span>03</span><h3>GET CONFIRMED</h3><p>Keep your order reference and check back for the latest recorded status.</p></article>
        </div>
      </section>

      <footer className="strataFooter">
        <Link href="/" className="strataBrand"><span className="strataBrandMark" aria-hidden="true">S</span><span><strong>STRATA SA’O BITSA</strong><small>COME GET HOOKED.</small></span></Link>
        <span>© {new Date().getFullYear()} STRATA SA’O BITSA</span>
        <Link href="/admin">Staff access</Link>
      </footer>
    </main>
  );
}
