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

    // Animate the AI review metrics when the block scrolls into view
    const review = document.getElementById("review");
    let reviewObs: IntersectionObserver | undefined;
    if (review) {
      reviewObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              reviewObs?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      reviewObs.observe(review);
    }

    // Hero headline typewriter (Variant A)
    const typed = document.getElementById("gp-typed");
    let twTimer: ReturnType<typeof setTimeout> | undefined;
    if (typed) {
      const phrases = [
        "One calm place.",
        "Zero missed deadlines.",
        "Every task, handled.",
        "One clear plan.",
      ];
      let pi = 0, ci = 0, deleting = false;
      const typeSpeed = 82, deleteSpeed = 42, holdFull = 1600, holdEmpty = 300;
      const tick = () => {
        const p = phrases[pi];
        if (!deleting) {
          ci++;
          typed.textContent = p.slice(0, ci);
          if (ci === p.length) { deleting = true; twTimer = setTimeout(tick, holdFull); return; }
          twTimer = setTimeout(tick, typeSpeed);
        } else {
          ci--;
          typed.textContent = p.slice(0, ci);
          if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; twTimer = setTimeout(tick, holdEmpty); return; }
          twTimer = setTimeout(tick, deleteSpeed);
        }
      };
      tick();
    }

    // Hero task check-off loop
    const tasks = Array.from(document.querySelectorAll<HTMLElement>("#mockTasks .mock-task"));
    let taskTimer: ReturnType<typeof setTimeout> | undefined;
    let taskIdx = 0;
    const cycleTasks = () => {
      if (taskIdx < tasks.length) {
        tasks[taskIdx].classList.add("done");
        taskIdx++;
        taskTimer = setTimeout(cycleTasks, 900);
      } else {
        taskTimer = setTimeout(() => {
          tasks.forEach((t) => t.classList.remove("done"));
          taskIdx = 0;
          taskTimer = setTimeout(cycleTasks, 700);
        }, 2600);
      }
    };
    if (tasks.length) taskTimer = setTimeout(cycleTasks, 1400);

    return () => {
      window.removeEventListener("scroll", onScroll);
      toggle?.removeEventListener("click", onToggle);
      io.disconnect();
      reviewObs?.disconnect();
      if (twTimer) clearTimeout(twTimer);
      if (taskTimer) clearTimeout(taskTimer);
    };
  }, []);

  return <div className="gp-land" dangerouslySetInnerHTML={{ __html: LANDING_HTML }} />;
}
