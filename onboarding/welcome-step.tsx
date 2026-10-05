"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/branding/wordmark";

export function WelcomeStep() {
  const router = useRouter();

  return (
    <main className="rovei-flow rovei-welcome page-enter">
      <div className="rovei-welcome-inner">
        <header className="rovei-welcome-nav">
          <Wordmark />
          <span className="rovei-caption">Studio setup</span>
        </header>

        <section className="rovei-welcome-hero">
          <div className="rovei-welcome-copy">
            <p className="rovei-eyebrow">Welcome to Rovei</p>

            <h1 className="rovei-display">
              Your clients arrive{" "}
              <span className="rovei-editorial">prepared.</span>
              <br />
              You remember everything that matters.
            </h1>

            <p className="rovei-welcome-lead">
              Create a polished client experience for every appointment —
              designed around your studio, your services and the way you work.
            </p>

            <div className="rovei-welcome-actions">
              <button
                type="button"
                className="rovei-btn"
                onClick={() => router.push("/onboarding/studio")}
              >
                Create your studio
                <ArrowRight size={16} aria-hidden="true" />
              </button>

              <button
                type="button"
                className="rovei-btn rovei-btn-secondary"
                onClick={() => router.push("/")}
              >
                Back to landing
              </button>

              <span className="rovei-caption">No client app required.</span>
            </div>
          </div>

          <div className="rovei-welcome-product-art" aria-hidden="true">
            <article className="rovei-welcome-client-preview">
              <div className="rovei-welcome-client-hero">
                <div className="rovei-welcome-client-kicker">
                  A better appointment starts before arrival
                </div>
                <h3>Your client.</h3>
                <p>Prepared, personal, remembered.</p>
              </div>

              <div className="rovei-welcome-client-body">
                <ReadyRow
                  title="Consultation"
                  copy="Goals and appointment context"
                />
                <ReadyRow
                  title="Preferences"
                  copy="Finish · appointment feel"
                />
                <ReadyRow
                  title="Inspiration"
                  copy="Reference photos ready"
                />

                <div className="rovei-welcome-card-foot">
                  <b>Client experience</b>
                  <span>Everything in one calm place</span>
                </div>
              </div>
            </article>

            <aside className="rovei-welcome-appointment-chip">
              <div className="rovei-wa-time">Today · 2:00 PM</div>
              <strong>Emily Carter</strong>
              <p>Classic lashes · client experience complete</p>
              <span className="rovei-wa-status">READY</span>
            </aside>

            <aside className="rovei-welcome-float-note">
              <span>“Oh wow, this actually feels like my studio.”</span>
              <p>Build the experience, then preview both sides.</p>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function ReadyRow({
  title,
  copy,
}: {
  title: string;
  copy: string;
}) {
  return (
    <div className="rovei-welcome-ready-row">
      <div>
        <strong>{title}</strong>
        <small>{copy}</small>
      </div>
      <span className="rovei-welcome-ready-state">READY</span>
    </div>
  );
}
