"use client";

import { useEffect } from "react";
import "./landing.css";
import { LANDING_HTML } from "./markup";

export default function LandingClient() {
  useEffect(() => {
    const nav = document.getElementById("gp-nav");
    const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    onScroll();

    const toggle = document.getElementById("gp-navToggle");
    const onToggle = () => nav?.classList.toggle("menu-open");
    toggle?.addEventListener("click", onToggle);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".gp-land .reveal").forEach((el) => io.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      toggle?.removeEventListener("click", onToggle);
      io.disconnect();
    };
  }, []);

  return <div className="gp-land" dangerouslySetInnerHTML={{ __html: LANDING_HTML }} />;
}

