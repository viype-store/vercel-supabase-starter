import { WaitlistForm } from "../components/waitlist-form";

const featureCards = [
  {
    title: "Launch fast",
    body: "Push the code to GitHub, import the repo into Vercel, and your site is live in minutes.",
  },
  {
    title: "Collect interest",
    body: "The page includes a working waitlist form that stores leads in Supabase.",
  },
  {
    title: "Edit easily",
    body: "The main copy lives in one file and the visual system lives in one stylesheet.",
  },
];

const steps = [
  "Create a new Supabase project.",
  "Run the SQL in supabase/setup.sql.",
  "Add your Supabase URL and anon key to Vercel.",
  "Push updates to GitHub and Vercel will redeploy automatically.",
];

const checklist = [
  "Next.js app router structure",
  "Vercel-friendly deployment setup",
  "Supabase browser client helper",
  "Waitlist form with graceful error states",
  "A modern landing page you can customize quickly",
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="grid-overlay" />

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">Starter kit for GitHub, Vercel, and Supabase</div>
          <h1>
            Ship a polished landing page before your motivation disappears.
          </h1>
          <p className="lede">
            This starter gives you a stylish homepage, a working waitlist form,
            and a simple structure that is easy to push to GitHub and deploy on
            Vercel.
          </p>

          <div className="hero-actions">
            <a className="button button-primary" href="#launch">
              Open the waitlist block
            </a>
            <a className="button button-secondary" href="#guide">
              Read the setup path
            </a>
          </div>

          <div className="mini-stats">
            <div className="stat-card">
              <span className="stat-value">1 repo</span>
              <span className="stat-label">Push once to GitHub</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">2 keys</span>
              <span className="stat-label">Add Supabase env vars</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">0 stress</span>
              <span className="stat-label">Vercel deploys the rest</span>
            </div>
          </div>
        </div>

        <div className="hero-panel">
          <div className="panel-tag">Ready for your brand</div>
          <h2>What is already wired up</h2>
          <ul className="checklist">
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="panel-note">
            Edit the headline and colors first, then connect Supabase and deploy.
          </p>
        </div>
      </section>

      <section className="feature-grid">
        {featureCards.map((card) => (
          <article className="feature-card" key={card.title}>
            <span className="feature-index">{card.title}</span>
            <p>{card.body}</p>
          </article>
        ))}
      </section>

      <section className="split-section" id="guide">
        <div className="section-copy">
          <div className="eyebrow">Fast setup path</div>
          <h2>Use this exact flow</h2>
          <p>
            You do not need to build a complex backend first. Create the
            Supabase project, paste the SQL file, add the two public variables,
            and deploy.
          </p>
        </div>

        <div className="steps-card">
          {steps.map((step, index) => (
            <div className="step-row" key={step}>
              <span className="step-number">0{index + 1}</span>
              <span className="step-text">{step}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="launch-block" id="launch">
        <div className="launch-copy">
          <div className="eyebrow">Supabase demo form</div>
          <h2>Start collecting emails immediately</h2>
          <p>
            This form inserts leads into a `waitlist` table in Supabase. If the
            environment variables are missing, the form tells you exactly what
            to add.
          </p>
        </div>

        <WaitlistForm />
      </section>

      <footer className="footer">
        <p>Update the copy in app/page.js and the palette in app/globals.css.</p>
      </footer>
    </main>
  );
}
