import Link from "next/link";
import MenuShowcase from "./menu-showcase";

const cities = [
  { name: "Gaborone", number: "01", image: "/strata-assets/groupline.jpeg", description: "Choose Gaborone for your order request." },
  { name: "Francistown", number: "02", image: "/strata-assets/customers.jpeg", description: "Choose Francistown for your order request." },
] as const;

export default function Home() {
  return (
    <main className="strataSite strataOrderFirstHome strataCompactHome">
      <header className="strataHeader">
        <Link href="/" className="strataBrand" aria-label="Strata Sa’o Bitsa home">
          <img src="/strata-brand-logo.svg" alt="" width="48" height="48" />
          <span><strong>STRATA</strong><small>SA’O BITSA</small></span>
        </Link>
        <nav aria-label="Main navigation">
          <a href="#menu">THE MENU</a>
          <a href="#locations">CHOOSE A BRANCH</a>
          <Link href="/account">MY REQUESTS</Link>
          <Link href="/admin">ADMIN</Link>
        </nav>
        <Link className="strataHeaderCta" href="#locations">START AN ORDER <span>↗</span></Link>
      </header>

      <section className="strataHero strataCompactHero">
        <div className="strataHeroCopy">
          <p className="strataEyebrow"><span /> GOOD FOOD. GOOD MOOD. BOTSWANA.</p>
          <h1>COME GET<br /><em>HOOKED.</em></h1>
          <p className="strataLead">Your Strata order starts here. Choose your branch, pick your favourites and keep your request updates together in one place.</p>
          <div className="strataHeroActions">
            <a className="strataButton strataButtonRed" href="#locations">START YOUR ORDER <span>↓</span></a>
            <Link className="strataButton strataButtonOutline" href="/account">MY REQUESTS</Link>
          </div>
          <div className="strataHeroFoot"><span className="strataLiveDot" /> GABORONE <span className="strataFootDivider">/</span> FRANCISTOWN <span className="strataFootDivider">/</span> ORDER AS A GUEST</div>
        </div>
        <div className="strataHeroVisual">
          <img src="/strata-assets/fish.jpeg" alt="Strata Sa’o Bitsa fish and chips" fetchPriority="high" />
          <div className="strataImageStamp"><span>FRESH</span><strong>FISH<br />FIRST.</strong><small>STRATA SA’O BITSA</small></div>
          <span className="strataImageCorner">COME GET HOOKED</span>
        </div>
      </section>

      <section className="strataLocations strataCompactLocations sectionAnchor" id="locations">
        <div className="strataBranchIntro">
          <p className="strataEyebrow">01 / CHOOSE YOUR BRANCH</p>
          <h2>YOUR CITY.<br /><em>YOUR ORDER.</em></h2>
          <p>Choose where you want your request handled. Your branch selection carries into the order form.</p>
        </div>
        <div className="strataCityList strataBranchCards">
          {cities.map((city) => (
            <Link className="strataBranchCard" href={"/order?city=" + encodeURIComponent(city.name)} key={city.name}>
              <img src={city.image} alt="" loading="lazy" />
              <span className="strataBranchCardShade" />
              <span className="strataBranchNumber">{city.number} / STRATA BRANCH</span>
              <strong>{city.name.toUpperCase()}</strong>
              <small>{city.description}</small>
              <b aria-hidden="true">CHOOSE BRANCH ↗</b>
            </Link>
          ))}
        </div>
      </section>

      <MenuShowcase />

      <section className="strataCompactPromise">
        <div><p className="strataEyebrow">GOOD FOOD. NO LONG STORY.</p><h2>YOUR REQUEST.<br /><em>ALL IN ONE PLACE.</em></h2></div>
        <div><p>Choose your branch, tell us what you’d like and submit an order request. Follow its status and staff updates in My Requests.</p><p className="strataCompactTruth">A submitted request is not a confirmed order or payment. The branch confirms availability, final price, delivery arrangements and timing.</p><Link className="strataButton strataButtonRed" href="/account">VIEW MY REQUESTS <span>↗</span></Link></div>
      </section>

      <footer className="strataFooter">
        <Link href="/" className="strataBrand"><img src="/strata-brand-logo.svg" alt="" width="42" height="42" /><span><strong>STRATA</strong><small>SA’O BITSA</small></span></Link>
        <span>FISH. CHIPS. GOOD TIMES.</span>
        <Link href="#locations">CHOOSE A BRANCH ↗</Link>
        <Link href="/account">MY REQUESTS ↗</Link>
        <Link href="/admin">ADMIN ↗</Link>
        <small>© {new Date().getFullYear()} STRATA SA’O BITSA · BOTSWANA</small>
      </footer>

      <nav className="strataMobileNav" aria-label="Quick navigation">
        <a href="#"> <span>⌂</span>HOME</a>
        <a href="#menu"><span>≡</span>MENU</a>
        <a href="#locations"><span>＋</span>ORDER</a>
        <Link href="/account"><span>◎</span>MY REQUESTS</Link>
        <Link href="/admin"><span>⚙</span>ADMIN</Link>
      </nav>
    </main>
  );
}
