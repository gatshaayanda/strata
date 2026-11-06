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

  return <section className="strataMenuShowcase strataCompactMenu" id="menu" aria-labelledby="strataMenuTitle">
    <div className="strataMenuShowcaseHead">
      <div><p className="strataEyebrow">02 / THE MENU</p><h2 id="strataMenuTitle">FISH.<br /><em>DONE RIGHT.</em></h2></div>
      <Link className="strataMenuBrowseLink" href="#locations">CHOOSE A BRANCH TO ORDER ↗</Link>
    </div>
    {items.length ? <div className="strataMenuCards">{items.map(item => <article className="strataMenuCard" key={item.id}>
      <div className="strataMenuCardImage"><img src="/strata-assets/fish.jpeg" alt="" loading="lazy" /></div>
      <div className="strataMenuCardBody"><div className="strataMenuCardTitle"><h3>{item.name}</h3><strong>P{item.price.toFixed(2)}</strong></div><p>{item.description}</p></div>
    </article>)}</div> : <p className="strataMenuEmpty">The menu is being updated. Please check back shortly.</p>}
    <p className="strataMenuDisclaimer">Starting prices are editable by the Strata team. Your branch confirms price and availability.</p>
  </section>;
}
