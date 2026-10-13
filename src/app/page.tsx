import Link from "next/link";

const WHATSAPP = "26777762614";
function orderLink(message: string) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export default function Home() {
  return (
    <main className="strataSite">
      <div className="strataTicker"><span>BOTSWANA · GABORONE + FRANCISTOWN</span><span>FRESH FROM THE KITCHEN</span><span>COME GET HOOKED</span></div>
      <header className="strataHeader">
        <Link href="/" className="strataBrand" aria-label="Strata Sa’o Bitsa home">
          <img src="/strata-icon.svg" alt="" width="48" height="48" />
          <span><strong>STRATA</strong><small>SA’O BITSA</small></span>
        </Link>
        <nav aria-label="Main navigation"><a href="#food">THE FOOD</a><a href="#locations">FIND US</a></nav>
        <a className="strataHeaderCta" href={orderLink("Dumela Strata! I'd like to place an order. Please share today's menu and prices.")} target="_blank" rel="noreferrer">ORDER ON WHATSAPP <span>↗</span></a>
      </header>

      <section className="strataHero">
        <div className="strataHeroCopy">
          <p className="strataEyebrow"><span /> GOOD FOOD. GOOD MOOD. BOTSWANA.</p>
          <h1>COME GET<br/><em>HOOKED.</em></h1>
          <p className="strataLead">Fish, chips and the kind of food worth coming back for. Get in touch for today’s menu, prices and the best way to get your order.</p>
          <div className="strataHeroActions">
            <a className="strataButton strataButtonRed" href={orderLink("Dumela Strata! I'd like to order. Please send me today's menu and prices.")} target="_blank" rel="noreferrer">GET THE MENU <span>↗</span></a>
            <a className="strataButton strataButtonOutline" href="#locations">OUR LOCATIONS ↓</a>
          </div>
          <div className="strataHeroFoot"><span className="strataLiveDot" /> NOW SERVING BOTSWANA <span className="strataFootDivider">/</span> CALL OR WHATSAPP <a href="tel:+26777762614">77 762 614</a></div>
        </div>
        <div className="strataHeroVisual">
          <img src="/strata-assets/fish.jpeg" alt="Strata Sa’o Bitsa fish and chips" fetchPriority="high" />
          <div className="strataImageStamp"><span>FRESH</span><strong>FISH<br/>FIRST.</strong><small>STRATA SA’O BITSA</small></div>
          <span className="strataImageCorner">01 / THE GOOD STUFF</span>
        </div>
        <div className="strataHeroVertical">MADE FOR THE CRAVING · MADE IN BOTSWANA</div>
      </section>

      <section className="strataMarquee" aria-label="Strata slogan"><div>FISH &amp; CHIPS <b>✳</b> COME GET HOOKED <b>✳</b> GOOD FOOD, NO FUSS <b>✳</b> FISH &amp; CHIPS <b>✳</b> COME GET HOOKED <b>✳</b></div></section>

      <section className="strataFood sectionAnchor" id="food">
        <div className="strataSectionHead"><div><p className="strataEyebrow">01 / THE CRAVING</p><h2>GOOD FOOD.<br/><em>NO LONG STORY.</em></h2></div><p>Craving something proper? Message us for the current menu, availability and prices before you order.</p></div>
        <div className="strataPhotoGrid">
          <article className="strataPhotoCard strataPhotoLarge"><img src="/strata-assets/groupline.jpeg" alt="Food and people at Strata Sa’o Bitsa" loading="lazy"/><div><span>01 / THE EXPERIENCE</span><h3>COME HUNGRY.</h3></div></article>
          <article className="strataPhotoCard"><img src="/strata-assets/groupline1.jpeg" alt="Strata Sa’o Bitsa food scene" loading="lazy"/><div><span>02 / MADE TO SHARE</span><h3>STAY FOR MORE.</h3></div></article>
          <article className="strataPhotoCard"><img src="/strata-assets/customer.jpeg" alt="A Strata Sa’o Bitsa customer" loading="lazy"/><div><span>03 / GOOD PEOPLE</span><h3>GOOD COMPANY.</h3></div></article>
          <article className="strataPhotoCard"><img src="/strata-assets/customers.jpeg" alt="Customers enjoying Strata Sa’o Bitsa" loading="lazy"/><div><span>04 / THE STRATA CROWD</span><h3>YOU BELONG HERE.</h3></div></article>
        </div>
        <div className="strataMenuPrompt"><div><span className="strataEyebrow">TODAY’S MENU &amp; PRICES</span><h3>Let’s get your order started.</h3><p>Menu availability and prices can change. Message the team to confirm the current options before placing your order.</p></div><a className="strataButton strataButtonRed" href={orderLink("Dumela Strata! Please send today's menu, prices and availability.")} target="_blank" rel="noreferrer">ASK FOR THE MENU ↗</a></div>
      </section>

      <section className="strataFilm">
        <video autoPlay muted loop playsInline preload="metadata" poster="/strata-assets/fish.jpeg" aria-label="Strata Sa’o Bitsa food and business video"><source src="/strata-assets/stat.mp4" type="video/mp4"/></video>
        <div className="strataFilmOverlay"><p className="strataEyebrow">STRAIGHT FROM THE SCENE</p><h2>YOU KNOW<br/>THE <em>VIBE.</em></h2><a href={orderLink("Dumela Strata! I'm ready to order. Please send me the current menu.")} target="_blank" rel="noreferrer">MAKE IT A STRATA DAY ↗</a></div>
        <span className="strataFilmCaption">STRATA SA’O BITSA · COME GET HOOKED</span>
      </section>

      <section className="strataLocations sectionAnchor" id="locations">
        <div><p className="strataEyebrow">02 / FIND YOUR STRATA</p><h2>YOUR CITY.<br/><em>YOUR ORDER.</em></h2><p>We’re building out service for Gaborone and Francistown. Contact the team to confirm your nearest service point, delivery options and availability.</p></div>
        <div className="strataCityList">
          <a href={orderLink("Dumela Strata! I'm in Gaborone. Please confirm the nearest service point, today's menu, prices and delivery options.")} target="_blank" rel="noreferrer"><span>01</span><strong>GABORONE</strong><small>CHECK MENU &amp; DELIVERY</small><b>↗</b></a>
          <a href={orderLink("Dumela Strata! I'm in Francistown. Please confirm the nearest service point, today's menu, prices and delivery options.")} target="_blank" rel="noreferrer"><span>02</span><strong>FRANCISTOWN</strong><small>CHECK MENU &amp; DELIVERY</small><b>↗</b></a>
          <div className="strataCallout"><span>QUICK QUESTION?</span><a href="tel:+26777762614">77 762 614</a><small>CALL OR WHATSAPP THE TEAM</small></div>
        </div>
      </section>

      <footer className="strataFooter"><Link href="/" className="strataBrand"><img src="/strata-icon.svg" alt="" width="42" height="42"/><span><strong>STRATA</strong><small>SA’O BITSA</small></span></Link><span>FISH. CHIPS. GOOD TIMES.</span><a href={orderLink("Dumela Strata! I'd like to place an order.")} target="_blank" rel="noreferrer">ORDER ON WHATSAPP ↗</a><small>© {new Date().getFullYear()} STRATA SA’O BITSA · BOTSWANA</small></footer>
    </main>
  );
}
