import { OrderForm } from "../components/order-form";
import { giftingOffers, processSteps, trustPoints, vpOffers } from "../lib/catalog";

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="ambient ambient-orange" />
      <div className="ambient ambient-cyan" />
      <div className="grid-overlay" />

      <section className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">V</span>
          <div>
            <strong>VYPE Store</strong>
            <p>VALORANT digital orders</p>
          </div>
        </div>
        <a className="button button-secondary" href="#order-form">
          Start an order
        </a>
      </section>

      <section className="hero">
        <div className="hero-copy panel">
          <div className="eyebrow">VALORANT points and gifting requests</div>
          <h1>
            Build the storefront first, handle fulfillment second.
          </h1>
          <p className="lede">
            This project is set up as a modern digital shop for VALORANT point
            packs and gifting requests. Customers can browse offers, submit an
            order, and land in your Supabase dashboard for review.
          </p>

          <div className="hero-actions">
            <a className="button button-primary" href="#launch">
              Browse offers
            </a>
            <a className="button button-secondary" href="#order-form">
              Open order form
            </a>
          </div>

          <div className="mini-stats">
            <div className="stat-card">
              <span className="stat-value">VP packs</span>
              <span className="stat-label">Ready-made cards for top-up offers</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">Gift requests</span>
              <span className="stat-label">Manual intake with Riot ID and region</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">Supabase</span>
              <span className="stat-label">Stores incoming orders immediately</span>
            </div>
          </div>
        </div>

        <div className="hero-panel panel">
          <div className="panel-tag">Store highlights</div>
          <h2>What this version already does</h2>
          <ul className="checklist">
            {trustPoints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="panel-note">
            It is built to look like a live digital store, while keeping the
            operational flow simple for your first launch.
          </p>
        </div>
      </section>

      <section className="catalog-section" id="launch">
        <div className="section-heading">
          <div className="eyebrow">VALORANT Points</div>
          <h2>Point packs that feel like real store inventory</h2>
          <p>
            Use these cards as your default catalog blocks, then update prices,
            copy, or pack sizes to match your operation.
          </p>
        </div>

        <div className="product-grid">
          {vpOffers.map((offer) => (
            <article className="product-card panel" key={offer.title}>
              <div className="product-badge">{offer.badge}</div>
              <h3>{offer.title}</h3>
              <div className="product-price">{offer.price}</div>
              <p>{offer.summary}</p>
              <a className="button button-secondary" href="#order-form">
                Order this pack
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="catalog-section">
        <div className="section-heading">
          <div className="eyebrow">Gifting</div>
          <h2>Accept gift requests as a service flow</h2>
          <p>
            This section is designed for manual handling. The customer submits
            the request, you review the details, then continue the order outside
            the site if everything checks out.
          </p>
        </div>

        <div className="product-grid gifting-grid">
          {giftingOffers.map((offer) => (
            <article className="product-card panel" key={offer.title}>
              <div className="product-badge">{offer.badge}</div>
              <h3>{offer.title}</h3>
              <div className="product-price">{offer.price}</div>
              <p>{offer.summary}</p>
              <a className="button button-secondary" href="#order-form">
                Request gifting
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="split-section" id="guide">
        <div className="section-copy">
          <div className="eyebrow">How it works</div>
          <h2>Simple flow for the first version</h2>
          <p>
            This keeps your launch lightweight. You do not need admin dashboards
            or payment automation on day one to start collecting structured
            demand.
          </p>
        </div>

        <div className="steps-card panel">
          {processSteps.map((step, index) => (
            <div className="step-row" key={step}>
              <span className="step-number">0{index + 1}</span>
              <span className="step-text">{step}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="feature-grid">
        {[
          {
            title: "Fast edits",
            body: "All core storefront copy is in one page file, so you can change names, prices, and categories quickly.",
          },
          {
            title: "Supabase intake",
            body: "Each order request can be inserted into a database table so nothing gets lost in messages.",
          },
          {
            title: "Clean launch",
            body: "The site is built to be uploaded to GitHub, deployed on Vercel, and connected with just two env variables.",
          },
        ].map((card) => (
          <article className="feature-card panel" key={card.title}>
            <span className="feature-index">{card.title}</span>
            <p>{card.body}</p>
          </article>
        ))}
      </section>

      <section className="launch-block" id="order-form">
        <div className="launch-copy">
          <div className="eyebrow">Order intake</div>
          <h2>Collect real requests now</h2>
          <p>
            The form below saves customer requests into an `order_requests`
            table in Supabase. Add your project URL and anon key, run the SQL
            file, and this block becomes your order pipeline.
          </p>
        </div>

        <OrderForm />
      </section>

      <footer className="footer">
        <p>Change product names, prices, and contact flow in one pass before you go live.</p>
      </footer>
    </main>
  );
}
