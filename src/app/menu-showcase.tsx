"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { STARTER_STRATA_MENU, subscribeToStrataMenu, type StrataMenuItem } from "@/lib/firebase/strata-menu";

export default function MenuShowcase() {
  const [items, setItems] = useState<StrataMenuItem[]>(STARTER_STRATA_MENU);
  useEffect(() => subscribeToStrataMenu(
    current => setItems((current.length ? current : STARTER_STRATA_MENU).filter(item => item.active)),
    () => setItems(STARTER_STRATA_MENU.filter(item => item.active)),
  ), []);

  return <section className="strataMenuShowcase" id="menu" aria-labelledby="strataMenuTitle">
    <div className="strataMenuShowcaseHead">
      <div><p className="strataEyebrow">01 / THE STARTER MENU</p><h2 id="strataMenuTitle">KEEP IT<br /><em>FISH SIMPLE.</em></h2></div>
      <p>Choose your favourite, then pick the Strata branch that should handle your request. Prices shown are starter prices and can be updated by the team.</p>
    </div>
    {items.length ? <div className="strataMenuCards">{items.map(item => <article className="strataMenuCard" key={item.id}>
      <div className="strataMenuCardImage"><img src="/strata-assets/fish.jpeg" alt="" loading="lazy" /><span>STRATA SA’O BITSA</span></div>
      <div className="strataMenuCardBody"><div className="strataMenuCardTitle"><h3>{item.name}</h3><strong>P{item.price.toFixed(2)}</strong></div><p>{item.description}</p><Link className="strataButton strataButtonRed" href="#locations">CHOOSE BRANCH TO ORDER <span>↗</span></Link></div>
    </article>)}</div> : <p className="strataMenuEmpty">The menu is being updated. Please check back shortly.</p>}
    <p className="strataMenuDisclaimer">Menu prices are editable starting values. The selected branch confirms the current price and availability before accepting a request.</p>
  </section>;
}
