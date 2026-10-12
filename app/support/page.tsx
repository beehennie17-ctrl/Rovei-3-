"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Search, Sparkles, HeartHandshake } from "lucide-react";

const questions = [
  { title: "How do I set up my Studio?", answer: "Choose your services, colour theme and client-experience modules during onboarding. You can return to your Studio settings after your subscription is active." },
  { title: "What are Beauty Packs?", answer: "Beauty Packs are reusable client-experience templates. Choose the consultation, preferences, inspiration, consent, preparation and photo steps that are relevant to a service." },
  { title: "How do I send a client a link?", answer: "From a client's appointment or experience, create a secure client link and share it directly. Clients can open their link without creating a Rovei account." },
  { title: "Can clients upload photos?", answer: "Client-experience links support photo submissions where that step is enabled. Ask clients to upload only photos relevant to their appointment." },
  { title: "How do I check appointment readiness?", answer: "Use your schedule and client-experience status to see which clients are waiting, ready or complete." },
  { title: "What happens after confirming my email?", answer: "After confirmation Rovei signs you in and restores your Studio. If payment has not been completed, you should see the activation page. You can sign in later to resume." },
  { title: "I cannot pay or access my dashboard", answer: "Check that you are signed in with the account used for onboarding. If your subscription is not showing correctly, contact support. Never send card numbers, passwords or verification links in a ticket." },
  { title: "How do I report a bug or suggest an improvement?", answer: "Use Send feedback for suggestions and minor bugs. Choose Contact support if you need help with your account or an urgent issue." },
];

export default function HelpCentre() {
  const [search, setSearch] = useState("");
  const matches = questions.filter(item =>
    `${item.title} ${item.answer}`.toLowerCase()
      .includes(search.toLowerCase().trim())
  );

  return (
    <div className="rovei-care">
      <section className="care-hero">
        <div className="care-hero-inner">
          <p className="care-kicker">
            <span className="care-kicker-line" />
            THE ROVEI CARE STUDIO · 01
          </p>

          <h1>
            Here to make it
            <span className="care-serif"> beautifully </span>
            simple.
          </h1>

          <p className="care-intro">
            A thoughtful little corner for answers, guidance,
            and everything you need to feel right at home
            with Rovei.
          </p>

          <label className="care-search">
            <Search size={23} strokeWidth={1.8} aria-hidden="true" />
            <input
              type="search"
              aria-label="Search help articles"
              placeholder="What can we help you find?"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </label>

          <p className="care-search-hint">
            A little clarity goes a long way.
          </p>
        </div>
      </section>

      <section className="care-essentials">
        <div className="care-section-heading">
          <p className="care-kicker">
            <span className="care-kicker-line" />
            THE ESSENTIALS · 02
          </p>
          <h2>
            Consider it <em>answered.</em>
          </h2>
          <p>
            The little things, the important things, and
            everything in between.
          </p>
        </div>

        <div className="care-faq-list">
          {matches.map((item, index) => (
            <details className="care-faq" key={item.title}>
              <summary>
                <span className="care-faq-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="care-faq-title">
                  {item.title}
                </span>
                <span className="care-faq-plus" aria-hidden="true">
                  +
                </span>
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
          {!matches.length && (
            <div className="care-no-results" role="status">
              Nothing quite like that yet. Send us a message
              and we&apos;ll help you find your way.
            </div>
          )}
        </div>
      </section>

      <section className="care-concierge">
        <div>
          <p className="care-kicker">A LITTLE EXTRA CARE · 03</p>
          <HeartHandshake size={34} strokeWidth={1.3} aria-hidden="true" />
          <h2>
            Still need a <em>little help?</em>
          </h2>
          <p>
            Some things deserve a personal touch.
            We&apos;re here to listen, help, and make your
            Rovei experience feel effortless.
          </p>
          <div className="care-concierge-actions">
            <Link href="/support/new?kind=ticket">
              Contact support <ArrowUpRight size={17} />
            </Link>
            <Link href="/support/new?kind=feedback">
              Share feedback <ArrowRight size={17} />
            </Link>
          </div>
        </div>
        <div className="care-concierge-decoration" aria-hidden="true">
          <Sparkles size={56} strokeWidth={0.8} />
          <span>Thoughtfully, always.</span>
        </div>
      </section>
    </div>
  );
}
