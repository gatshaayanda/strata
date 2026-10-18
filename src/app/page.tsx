import Link from "next/link";
import MenuShowcase from "./menu-showcase";

const cities = [
  {
    name: "Gaborone",
    number: "01",
    image: "/strata-assets/groupline.jpeg",
    description: "Choose the Gaborone branch to start your order request.",
  },
  {
    name: "Francistown",
    number: "02",
    image: "/strata-assets/customers.jpeg",
    description: "Choose the Francistown branch to start your order request.",
  },
] as const;

export default function Home() {
  return (
    <main className="strataSite strataOrderFirstHome">
      <div className="strataTicker">
        <span>BOTSWANA · GABORONE + FRANCISTOWN</span>
        <span>ORDER DIRECTLY WITH STRATA</span>
        <span>COME GET HOOKED</span>
      </div>

      <header className="strataHeader">
        <Link href="/" className="strataBrand" aria-label="Strata Sa’o Bitsa home">
          <img src="/strata-icon.svg" alt="" width="48" height="48" />
          <span><strong>STRATA</strong><small>SA’O BITSA</small></span>
        </Link>
        <nav aria-label="Main navigation">
          <a href="#how-it-works">HOW IT WORKS</a>
          <a href="#locations">CHOOSE A BRANCH</a>
          <Link href="/account">MY REQUESTS</Link>
        </nav>
        <Link className="strataHeaderCta" href="#locations">START AN ORDER <span>↗</span></Link>
      </header>

      <section className="strataHero strataOrderFirstHero">
        <div className="strataHeroCopy">
          <p className="strataEyebrow"><span /> GOOD FOOD. GOOD MOOD. BOTSWANA.</p>
          <h1>COME GET<br /><em>HOOKED.</em></h1>
          <p className="strataLead">Your Strata order starts here. Choose your city, tell us what you’re craving, and keep your request and updates together in one place.</p>
          <div className="strataHeroActions">
            <a className="strataButton strataButtonRed" href="#locations">CHOOSE YOUR BRANCH <span>↓</span></a>
            <Link className="strataButton strataButtonOutline" href="/account">VIEW MY REQUESTS</Link>
          </div>
          <div className="strataHeroFoot"><span className="strataLiveDot" /> ONE ORDERING JOURNEY <span className="strataFootDivider">/</span> TWO CITIES <span className="strataFootDivider">/</span> NO ACCOUNT REQUIRED TO START</div>
        </div>
        <div className="strataHeroVisual">
          <img src="/strata-assets/fish.jpeg" alt="Strata Sa’o Bitsa fish and chips" fetchPriority="high" />
          <div className="strataImageStamp"><span>FRESH</span><strong>FISH<br />FIRST.</strong><small>STRATA SA’O BITSA</small></div>
          <span className="strataImageCorner">01 / THE GOOD STUFF</span>
        </div>
        <div className="strataHeroVertical">MADE FOR THE CRAVING · MADE IN BOTSWANA</div>
      </section>

      <MenuShowcase />

      <section className="strataMarquee" aria-label="Strata slogan">
        <div>FISH &amp; CHIPS <b>✳</b> COME GET HOOKED <b>✳</b> GOOD FOOD, NO FUSS <b>✳</b> FISH &amp; CHIPS <b>✳</b></div>
      </section>

      <section className="strataLocations strataBranchChooser sectionAnchor" id="locations">
        <div className="strataBranchIntro">
          <p className="strataEyebrow">01 / FIRST, YOUR LOCATION</p>
          <h2>YOUR CITY.<br /><em>YOUR ORDER.</em></h2>
          <p>Start by choosing the Strata branch that will handle your request. Your choice carries into the order form, so you don’t have to select your city twice.</p>
          <p className="strataBranchTruth">Choose the city where you want your order fulfilled. Availability, final prices and delivery arrangements are confirmed by the team before an order is treated as confirmed.</p>
        </div>
        <div className="strataCityList strataBranchCards">
          {cities.map((city) => (
            <Link className="strataBranchCard" href={"/order?city=" + encodeURIComponent(city.name)} key={city.name}>
              <img src={city.image} alt="" loading="lazy" />
              <span className="strataBranchCardShade" />
              <span className="strataBranchNumber">{city.number} / STRATA BRANCH</span>
              <strong>{city.name.toUpperCase()}</strong>
              <small>{city.description}</small>
              <b aria-hidden="true">START ORDER ↗</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="strataFood sectionAnchor strataOrderSteps" id="how-it-works">
        <div className="strataSectionHead">
          <div><p className="strataEyebrow">02 / EASY DOES IT</p><h2>GOOD FOOD.<br /><em>NO LONG STORY.</em></h2></div>
          <p>A short, clear request flow. No messaging detours, unnecessary account setup or surprise claims about price and delivery.</p>
        </div>
        <div className="strataStepGrid">
          <article><span>01</span><h3>Choose your branch.</h3><p>Select Gaborone or Francistown first so your request goes to the right location.</p></article>
          <article><span>02</span><h3>Tell us what you want.</h3><p>List items and quantities, then choose pickup or delivery and add the details needed to fulfil it.</p></article>
          <article><span>03</span><h3>Track your request.</h3><p>Get a reference when your request is saved. Check status and staff updates under My Requests.</p></article>
        </div>
        <div className="strataMenuPrompt">
          <div><span className="strataEyebrow">A CLEAR PROMISE</span><h3>Your request stays in Strata.</h3><p>Submitting a request does not charge you or automatically confirm availability, final price, delivery fees or timing. Strata will update the request after review.</p></div>
        </div>
      </section>

      <section className="strataPhotoStory">
        <div className="strataPhotoStoryHeading"><p className="strataEyebrow">03 / THE STRATA SCENE</p><h2>COME HUNGRY.<br /><em>STAY FOR MORE.</em></h2><p>Real Strata imagery, with the order action kept close and easy to find.</p></div>
        <div className="strataPhotoGrid">
          <article className="strataPhotoCard strataPhotoLarge"><img src="/strata-assets/groupline.jpeg" alt="People enjoying the Strata experience" loading="lazy" /><div><span>01 / THE EXPERIENCE</span><h3>COME HUNGRY.</h3></div></article>
          <article className="strataPhotoCard"><img src="/strata-assets/groupline1.jpeg" alt="Strata food and people" loading="lazy" /><div><span>02 / MADE TO SHARE</span><h3>GOOD COMPANY.</h3></div></article>
          <article className="strataPhotoCard"><img src="/strata-assets/customer.jpeg" alt="A Strata customer" loading="lazy" /><div><span>03 / THE GOOD PEOPLE</span><h3>GOOD MOOD.</h3></div></article>
          <article className="strataPhotoCard"><img src="/strata-assets/customers.jpeg" alt="Customers at Strata Sa’o Bitsa" loading="lazy" /><div><span>04 / THE STRATA CROWD</span><h3>YOU BELONG HERE.</h3></div></article>
        </div>
      </section>

      <section className="strataFilm">
        <video autoPlay muted loop playsInline preload="metadata" poster="/strata-assets/fish.jpeg" aria-label="Strata Sa’o Bitsa video">
          <source src="/strata-assets/stat.mp4" type="video/mp4" />
        </video>
        <div className="strataFilmOverlay"><p className="strataEyebrow">STRAIGHT FROM THE SCENE</p><h2>YOU KNOW<br />THE <em>VIBE.</em></h2></div>
        <span className="strataFilmCaption">STRATA SA’O BITSA · COME GET HOOKED</span>
      </section>

      <footer className="strataFooter">
        <Link href="/" className="strataBrand"><img src="/strata-icon.svg" alt="" width="42" height="42" /><span><strong>STRATA</strong><small>SA’O BITSA</small></span></Link>
        <span>FISH. CHIPS. GOOD TIMES.</span>
        <Link href="#locations">CHOOSE A BRANCH ↗</Link>
        <Link href="/account">MY REQUESTS ↗</Link>
        <small>© {new Date().getFullYear()} STRATA SA’O BITSA · BOTSWANA</small>
      </footer>
    </main>
  );
}
