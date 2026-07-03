"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./applications.css";
import type { ApplicationStatus, Task } from "@/types";
import { FREE_PLAN_LIMITS } from "@/lib/utils";
import {
  AppDrawer,
  STATUS_META,
  STATUS_ORDER,
  COUNTRIES,
  flagFor,
  daysLeft,
  fmtDate,
  pctColor,
  completion,
  CalIcon,
  ClockIcon,
  ArrowIcon,
  PlusIcon,
  CloseIcon,
  type AppWithRels,
} from "@/components/appShared";

export default function ApplicationsClient({
  applications: initial,
  plan,
}: {
  applications: AppWithRels[];
  plan: string;
}) {
  const router = useRouter();
  const [apps, setApps] = useState<AppWithRels[]>(initial);
  const [filter, setFilter] = useState<string>("all");
  const [sort, setSort] = useState<string>("deadline");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const isFree = plan === "FREE";
  const atLimit = isFree && apps.length >= FREE_PLAN_LIMITS.applications;

  // Counts per status for the chips
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: apps.length };
    for (const s of STATUS_ORDER) c[s] = 0;
    for (const a of apps) c[a.status] = (c[a.status] || 0) + 1;
    return c;
  }, [apps]);

  // Which chips to show: All + only statuses that have at least one app
  const chipStatuses = STATUS_ORDER.filter((s) => counts[s] > 0);

  const submittedCount = apps.filter((a) => a.status === "SUBMITTED").length;

  const visible = useMemo(() => {
    let list = apps.filter((a) => filter === "all" || a.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) => a.universityName.toLowerCase().includes(q) || a.program.toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === "deadline") return daysLeft(a.deadline) - daysLeft(b.deadline);
      if (sort === "completion") return completion(b.tasks) - completion(a.tasks);
      if (sort === "name") return a.universityName.localeCompare(b.universityName);
      return 0;
    });
    return sorted;
  }, [apps, filter, search, sort]);

  const drawerApp = apps.find((a) => a.id === drawerId) || null;

  // Lock body scroll when a modal/drawer is open
  useEffect(() => {
    const open = addOpen || drawerId !== null;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [addOpen, drawerId]);

  // Open the add drawer automatically when arriving with ?add=1 (e.g. from Dashboard)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("add") === "1") {
      if (atLimit) {
        router.push("/settings?tab=billing");
      } else {
        setAddOpen(true);
      }
      // clean the query param so refresh/back doesn't re-trigger
      const url = new URL(window.location.href);
      url.searchParams.delete("add");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escape closes overlays
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAddOpen(false);
        setDrawerId(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // ---- Task / status mutations (optimistic) ----
  const patchApp = (id: string, partial: Partial<AppWithRels>) =>
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...partial } : a)));

  async function toggleTask(appId: string, taskId: string, completed: boolean) {
    patchApp(appId, {
      tasks: (apps.find((a) => a.id === appId)?.tasks || []).map((t) =>
        t.id === taskId ? { ...t, completed } : t
      ),
    });
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
  }

  async function changeStatus(appId: string, status: ApplicationStatus) {
    patchApp(appId, { status });
    await fetch(`/api/applications/${appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function addTask(appId: string, title: string) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: appId, title }),
    });
    if (res.ok) {
      const task = (await res.json()) as Task;
      const cur = apps.find((a) => a.id === appId)?.tasks || [];
      patchApp(appId, { tasks: [...cur, task] });
    }
  }

  async function deleteApp(appId: string) {
    const snapshot = apps;
    setApps((prev) => prev.filter((a) => a.id !== appId));
    setDrawerId(null);
    const res = await fetch(`/api/applications/${appId}`, { method: "DELETE" });
    if (!res.ok) {
      setApps(snapshot);
      alert("Could not delete the application. Please try again.");
    }
  }

  async function deleteTask(appId: string, taskId: string) {
    const cur = apps.find((a) => a.id === appId)?.tasks || [];
    patchApp(appId, { tasks: cur.filter((t) => t.id !== taskId) });
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
  }

  function onCreated(newApp: AppWithRels) {
    setApps((prev) => [...prev, newApp]);
    setAddOpen(false);
  }

  return (
    <div className="gp-applications-page">
      <div className="gp-pagehead">
        <div>
          <h1 className="gp-pagetitle">Applications</h1>
          <p className="gp-pagesub">
            {apps.length} {apps.length === 1 ? "university" : "universities"}
            {submittedCount > 0 ? ` · ${submittedCount} submitted` : ""}
          </p>
        </div>
        <button
          className="gp-addbtn"
          onClick={() => (atLimit ? router.push("/settings?tab=billing") : setAddOpen(true))}
        >
          <PlusIcon /> <span>Add application</span>
        </button>
      </div>

      <div className="gp-toolbar">
        <div className="gp-chips">
          <button
            className={`gp-chip${filter === "all" ? " on" : ""}`}
            onClick={() => setFilter("all")}
          >
            All<span className="gp-chip-count">{counts.all}</span>
          </button>
          {chipStatuses.map((s) => (
            <button
              key={s}
              className={`gp-chip${filter === s ? " on" : ""}`}
              onClick={() => setFilter(s)}
            >
              {STATUS_META[s].label}
              <span className="gp-chip-count">{counts[s]}</span>
            </button>
          ))}
        </div>
        <label className="gp-sort">
          <span>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="deadline">Deadline</option>
            <option value="completion">Completion</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="gp-tempty">
          {apps.length === 0
            ? "No applications yet. Add your first university to get started."
            : "No applications match this filter."}
        </div>
      ) : (
        <div className="gp-grid">
          {visible.map((app) => {
            const pct = completion(app.tasks);
            const dleft = daysLeft(app.deadline);
            const meta = STATUS_META[app.status];
            const terminal = ["SUBMITTED", "ACCEPTED", "REJECTED", "WITHDRAWN"].includes(app.status);
            return (
              <article key={app.id} className="gp-card" onClick={() => setDrawerId(app.id)}>
                <div className="gp-card-top">
                  <div className="gp-card-flag">{flagFor(app.country)}</div>
                  <span className="gp-badge" style={{ color: meta.color, background: meta.bg }}>
                    <span className="dot" style={{ background: meta.dot }} />
                    {meta.label}
                  </span>
                </div>
                <h3 className="gp-card-uni">{app.universityName}</h3>
                <p className="gp-card-prog">{app.program}</p>
                <div className="gp-card-meta">
                  <span className="gp-card-metaitem">
                    <CalIcon /> {fmtDate(app.deadline)}
                  </span>
                  <span
                    className="gp-card-metaitem"
                    style={{
                      color: terminal
                        ? "#5A6B8C"
                        : dleft < 0
                        ? "#B23B3B"
                        : dleft <= 7
                        ? "#A86E12"
                        : dleft <= 30
                        ? "#A86E12"
                        : "#1F7A4D",
                    }}
                  >
                    <ClockIcon />{" "}
                    {terminal
                      ? meta.label
                      : dleft < 0
                      ? "Overdue"
                      : dleft === 0
                      ? "Due today"
                      : `${dleft} days left`}
                  </span>
                </div>
                <div className="gp-card-progwrap">
                  <div className="gp-card-progtop">
                    <span>Completion</span>
                    <span className="gp-card-pct" style={{ color: pctColor(pct) }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="gp-prog-track">
                    <div
                      className="gp-prog-fill"
                      style={{ width: `${pct}%`, background: pctColor(pct) }}
                    />
                  </div>
                </div>
                <div className="gp-card-foot">
                  <span className="gp-card-open">
                    Open <ArrowIcon />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {addOpen && (
        <AddModal
          plan={plan}
          onClose={() => setAddOpen(false)}
          onCreated={onCreated}
        />
      )}

      {drawerApp && (
        <AppDrawer
          app={drawerApp}
          onClose={() => setDrawerId(null)}
          onToggleTask={(taskId, completed) => toggleTask(drawerApp.id, taskId, completed)}
          onChangeStatus={(status) => changeStatus(drawerApp.id, status)}
          onAddTask={(title) => addTask(drawerApp.id, title)}
          onDeleteTask={(taskId) => deleteTask(drawerApp.id, taskId)}
          onDeleteApp={() => deleteApp(drawerApp.id)}
        />
      )}
    </div>
  );
}

/* ---------------- Add Application Modal ---------------- */
function AddModal({
  plan,
  onClose,
  onCreated,
}: {
  plan: string;
  onClose: () => void;
  onCreated: (app: AppWithRels) => void;
}) {
  const [form, setForm] = useState({
    universityName: "",
    program: "",
    country: "",
    deadline: "",
    status: "NOT_STARTED" as ApplicationStatus,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const valid = form.universityName && form.program && form.country && form.deadline;

  async function submit() {
    if (!valid) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universityName: form.universityName,
          program: form.program,
          country: form.country,
          deadline: form.deadline,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "FREE_LIMIT_REACHED") setError("You've reached the free plan limit of 5 applications. Upgrade to Pro for unlimited.");
        else if (data.error === "DUPLICATE") setError("You already have this application.");
        else setError(data.message || "Something went wrong.");
        return;
      }
      // API returns the app with tasks; normalise documents to []
      const created: AppWithRels = {
        ...data,
        tasks: data.tasks || [],
        documents: [],
      };
      // If a non-default status was chosen, patch it
      if (form.status !== "NOT_STARTED") {
        await fetch(`/api/applications/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: form.status }),
        });
        created.status = form.status;
      }
      onCreated(created);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="gp-overlay open" onClick={onClose}>
      <div className="gp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gp-modal-head">
          <h2>Add application</h2>
          <button className="gp-iconbtn ghost" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="gp-form">
          <label className="gp-field">
            <span>University</span>
            <input
              placeholder="e.g. University of Oxford"
              value={form.universityName}
              onChange={(e) => set("universityName", e.target.value)}
              autoFocus
            />
          </label>
          <label className="gp-field">
            <span>Program</span>
            <input
              placeholder="e.g. MSc Environmental Policy"
              value={form.program}
              onChange={(e) => set("program", e.target.value)}
            />
          </label>
          <div className="gp-form-row">
            <label className="gp-field">
              <span>Country</span>
              <select value={form.country} onChange={(e) => set("country", e.target.value)}>
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="gp-field">
              <span>Deadline</span>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
              />
            </label>
          </div>
          <label className="gp-field">
            <span>Status</span>
            <select value={form.status} onChange={(e) => set("status", e.target.value as ApplicationStatus)}>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          </label>
          {error && (
            <p style={{ fontSize: 12.5, color: "#B23B3B", background: "#FAE8E8", padding: "9px 12px", borderRadius: 11 }}>
              {error}
            </p>
          )}
        </div>
        <div className="gp-modal-foot">
          <button className="gp-btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="gp-btn-primary" onClick={submit} disabled={loading || !valid}>
            {loading ? "Adding…" : "Add application"}
          </button>
        </div>
      </div>
    </div>
  );
}


