"use client";

import { useEffect, useState } from "react";
import "./auth.css";

const Logo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 9 12 5 2 9l10 4 10-4z" />
    <path d="M6 11.2V16c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5v-4.8" />
    <path d="M22 9v5.5" />
  </svg>
);

const TESTIMONIALS = [
  {
    q: "GradPath turned five overwhelming applications into one calm checklist.",
    av: "C", who: "Chiamaka N.", role: "MSc Public Health, 2026",
  },
  {
    q: "I finally stopped missing deadlines. Everything lives in one place now.",
    av: "D", who: "Daniel A.", role: "MEng, admitted to TU Delft",
  },
  {
    q: "The AI review caught things my professors missed. My SOP is finally ready.",
    av: "F", who: "Funmi O.", role: "PhD applicant, Ecology",
  },
];

const ROTATE_MS = 5000;

function BrandPanel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % TESTIMONIALS.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const t = TESTIMONIALS[active];

  return (
    <div className="au-brandpanel">
      <a className="au-brand" href="/">
        <span className="au-logo"><Logo /></span>
        <span className="au-wordmark">GradPath</span>
      </a>
      <div className="au-brandbody">
        <h2 className="au-bigline">Every application,<br />one calm workspace.</h2>
        <p className="au-brandlead">
          Track deadlines, manage tasks and get AI feedback on your SOP, CV and recommendation letters.
        </p>
        <figure className="au-quote">
          <p>&ldquo;{t.q}&rdquo;</p>
          <figcaption>
            <span className="au-quote-av">{t.av}</span>
            <span><b>{t.who}</b><br />{t.role}</span>
          </figcaption>
        </figure>
      </div>
      <div className="au-brandfoot">
        <span>Trusted by 12,000+ applicants</span>
        <span className="au-brandfoot-dots">
          {TESTIMONIALS.map((_, i) => (
            <i
              key={i}
              className={i === active ? "on" : ""}
              onClick={() => setActive(i)}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

export default function AuthShell({
  children,
}: {
  phase: "signin" | "signup";
  children: React.ReactNode;
}) {
  // Defensive fallback: Clerk's hashed classes for its branding/dev-mode
  // bar can change between builds. The CSS rule targets known classes;
  // this catches them by stable text content in case the hash ever shifts.
  useEffect(() => {
    const hideBranding = () => {
      const root = document.querySelector(".gp-auth");
      if (!root) return;
      root.querySelectorAll("p").forEach((p) => {
        const text = p.textContent?.trim();
        if (text === "Secured by" || text === "Development mode") {
          const wrapper = (p.closest("div") as HTMLElement) || (p as unknown as HTMLElement);
          wrapper.style.display = "none";
        }
      });
    };
    hideBranding();
    const id = setInterval(hideBranding, 500);
    const timeout = setTimeout(() => clearInterval(id), 5000);
    return () => {
      clearInterval(id);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="gp-auth">
      <div className="au-shell">
        <BrandPanel />
        <div className="au-formpane">
          <div className="au-formwrap">
            <div className="au-mobilebrand"><span className="au-logo"><Logo /></span> GradPath</div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

