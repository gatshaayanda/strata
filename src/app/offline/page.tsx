import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="orderPage">
      <div className="orderWrap">
        <div className="orderHeader">
          <Link href="/" className="logo"><span className="logoMark">S</span><span>Strata Sa’o Bitsa</span></Link>
        </div>
        <section className="orderCard confirm">
          <div className="confirmIcon" aria-hidden="true">📶</div>
          <span className="kicker">Offline mode</span>
          <h1>You’re temporarily offline.</h1>
          <p>You can still view pages already saved on this device, but menu availability and prices may be out of date.</p>
          <p>Orders, order updates and messages cannot be confirmed until you reconnect. Please do not assume an order was received unless the app shows a confirmation.</p>
          <div className="actions centered">
            <Link className="button buttonPrimary" href="/order">Start an order</Link>
            <Link className="button buttonLight" href="/">Return home</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
