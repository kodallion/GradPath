"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./applications.css";
import type { Application, Task, Document, ApplicationStatus, DocumentType } from "@/types";
import { FREE_PLAN_LIMITS } from "@/lib/utils";

type AppWithRels = Omit<Application, "tasks" | "documents"> & {
  tasks: Task[];
  documents: Pick<Document, "id" | "type">[];
};

const STATUS_META: Record<ApplicationStatus, { label: string; color: string; bg: string; dot: string }> = {
  NOT_STARTED: { label: "Not started", color: "#5A6B8C", bg: "#EDF0F6", dot: "#8595B5" },
  IN_PROGRESS: { label: "In Progress", color: "#B5621E", bg: "#FBEADB", dot: "#E8853B" },
  SUBMITTED: { label: "Submitted", color: "#2B5BE0", bg: "#EAF1FF", dot: "#3F75FF" },
  INTERVIEW: { label: "Interview", color: "#7A5AA8", bg: "#F1EBFB", dot: "#9B79CE" },
  ACCEPTED: { label: "Accepted", color: "#1B8C50", bg: "#E6F6EE", dot: "#22A565" },
  REJECTED: { label: "Rejected", color: "#B23B3B", bg: "#FAE8E8", dot: "#D45B5B" },
  WITHDRAWN: { label: "Withdrawn", color: "#5A6B8C", bg: "#EDF0F6", dot: "#8595B5" },
};

const STATUS_ORDER: ApplicationStatus[] = [
  "NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "INTERVIEW", "ACCEPTED", "REJECTED", "WITHDRAWN",
];

const COUNTRIES = ["United Kingdom", "United States", "Canada", "Germany", "Netherlands", "France", "Australia", "Nigeria", "Other"];

// Required document types for the drawer's document checklist (IELTS is shown as a
// static placeholder row since it is not a real DocumentType in the schema).
const REQUIRED_DOCS: { type: DocumentType | "IELTS"; label: string }[] = [
  { type: "SOP", label: "SOP" },
  { type: "CV", label: "CV" },
  { type: "TRANSCRIPT", label: "Transcript" },
  { type: "IELTS", label: "IELTS" },
];

const FLAGS: Record<string, string> = {
  "United Kingdom": "🇬🇧", "United States": "🇺🇸", Canada: "🇨🇦", Germany: "🇩🇪",
  Netherlands: "🇳🇱", France: "🇫🇷", Australia: "🇦🇺", Nigeria: "🇳🇬",
};
function flagFor(country: string) {
  return FLAGS[country] || "🌍";
}

function daysLeft(deadline: Date | string) {
  const d = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

function fmtDate(deadline: Date | string) {
  return new Date(deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function pctColor(pct: number) {
  if (pct >= 70) return "#22A565";
  if (pct >= 40) return "#E8A33D";
  return "#D45B5B";
}

function completion(tasks: Task[]) {
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);
}

const CalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" /><path d="M16 2v4" /><path d="M3 10h18" /><path d="M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /></svg>
);
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" /><path d="M12 6v6l4 2" /></svg>
);
const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
);
const DocIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6" /><path d="M9 17h6" /></svg>
);
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
);
const SparkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" /><path d="M5.6 5.6l2.8 2.8" /><path d="M15.6 15.6l2.8 2.8" /><path d="M18.4 5.6l-2.8 2.8" /><path d="M8.4 15.6l-2.8 2.8" /></svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="M6 6l12 12" /></svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
);

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
        <DetailDrawer
          app={drawerApp}
          onClose={() => setDrawerId(null)}
          onToggleTask={(taskId, completed) => toggleTask(drawerApp.id, taskId, completed)}
          onChangeStatus={(status) => changeStatus(drawerApp.id, status)}
          onAddTask={(title) => addTask(drawerApp.id, title)}
          onDeleteTask={(taskId) => deleteTask(drawerApp.id, taskId)}
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

/* ---------------- Detail Drawer ---------------- */
function DetailDrawer({
  app,
  onClose,
  onToggleTask,
  onChangeStatus,
  onAddTask,
  onDeleteTask,
}: {
  app: AppWithRels;
  onClose: () => void;
  onToggleTask: (taskId: string, completed: boolean) => void;
  onChangeStatus: (status: ApplicationStatus) => void;
  onAddTask: (title: string) => void;
  onDeleteTask: (taskId: string) => void;
}) {
  const [newTask, setNewTask] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);
  const meta = STATUS_META[app.status];
  const pct = completion(app.tasks);
  const done = app.tasks.filter((t) => t.completed).length;
  const ring = 2 * Math.PI * 24.5; // circumference
  const offset = ring * (1 - pct / 100);

  const haveTypes = new Set(app.documents.map((d) => d.type));

  function submitTask() {
    const t = newTask.trim();
    if (!t) return;
    onAddTask(t);
    setNewTask("");
  }

  return (
    <div className="gp-overlay right open" onClick={onClose}>
      <aside className="gp-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="gp-drawer-head">
          <div>
            <div className="gp-drawer-flag">
              {flagFor(app.country)} {app.country}
            </div>
            <h2 className="gp-drawer-uni">{app.universityName}</h2>
            <p className="gp-drawer-prog">{app.program}</p>
          </div>
          <button className="gp-iconbtn ghost" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="gp-drawer-statusrow">
          <button
            className="gp-badge"
            style={{ color: meta.color, background: meta.bg, cursor: "pointer" }}
            onClick={() => setStatusOpen((v) => !v)}
          >
            <span className="dot" style={{ background: meta.dot }} />
            {meta.label}
          </button>
          <span className="gp-drawer-deadline">
            <CalIcon /> {fmtDate(app.deadline)}
          </span>
        </div>

        {statusOpen && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "12px 26px 0" }}>
            {STATUS_ORDER.map((s) => {
              const m = STATUS_META[s];
              const on = app.status === s;
              return (
                <button
                  key={s}
                  onClick={() => {
                    onChangeStatus(s);
                    setStatusOpen(false);
                  }}
                  className="gp-badge"
                  style={{
                    color: on ? "#fff" : m.color,
                    background: on ? m.dot : m.bg,
                    cursor: "pointer",
                  }}
                >
                  <span className="dot" style={{ background: on ? "#fff" : m.dot }} />
                  {m.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="gp-drawer-progcard">
          <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
            <circle cx="28" cy="28" r="24.5" fill="none" stroke="#E7E4DE" strokeWidth="5" />
            <circle
              cx="28"
              cy="28"
              r="24.5"
              fill="none"
              stroke={pctColor(pct)}
              strokeWidth="5"
              strokeDasharray={ring.toFixed(1)}
              strokeDashoffset={offset.toFixed(1)}
              strokeLinecap="round"
            />
          </svg>
          <div>
            <div className="gp-drawer-pct" style={{ color: pctColor(pct) }}>
              {pct}% complete
            </div>
            <div className="gp-drawer-pctsub">
              {done} of {app.tasks.length} tasks done
            </div>
          </div>
        </div>

        <div className="gp-drawer-section">
          <h3>Tasks</h3>
          <ul className="gp-tasklist">
            {app.tasks.map((t) => (
              <li
                key={t.id}
                className={`gp-task${t.completed ? " done" : ""}`}
                style={{ alignItems: "center" }}
              >
                <span
                  className="gp-checkbox"
                  style={
                    t.completed
                      ? { background: "var(--blue)", borderColor: "var(--blue)" }
                      : undefined
                  }
                  onClick={() => onToggleTask(t.id, !t.completed)}
                >
                  {t.completed && <CheckIcon />}
                </span>
                <span className="gp-task-title" onClick={() => onToggleTask(t.id, !t.completed)} style={{ flex: 1 }}>
                  {t.title}
                </span>
                {!t.isAutoGenerated && (
                  <button
                    onClick={() => onDeleteTask(t.id)}
                    style={{ color: "var(--muted-2)", display: "flex", padding: 4 }}
                    title="Delete task"
                  >
                    <TrashIcon />
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <input
              className="gp-task-add-input"
              placeholder="Add a task…"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitTask()}
              style={{
                flex: 1,
                fontFamily: "inherit",
                fontSize: 13.5,
                color: "var(--ink)",
                background: "var(--paper)",
                border: "1px solid var(--line-2)",
                borderRadius: 10,
                padding: "8px 12px",
                outline: "none",
              }}
            />
            <button
              className="gp-btn-primary"
              onClick={submitTask}
              disabled={!newTask.trim()}
              style={{ padding: "8px 14px" }}
            >
              Add
            </button>
          </div>
        </div>

        <div className="gp-drawer-section">
          <h3>Documents</h3>
          <div className="gp-doclist">
            {REQUIRED_DOCS.map((d) => {
              const have = d.type !== "IELTS" && haveTypes.has(d.type as DocumentType);
              return (
                <div key={d.label} className={`gp-docitem${have ? "" : " missing"}`}>
                  <DocIcon />
                  <span>{d.label}</span>
                  <span className="gp-docstatus">{have ? "Uploaded" : "Missing"}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="gp-drawer-foot">
          <button className="gp-ai-btn" onClick={() => (window.location.href = "/ai-review")}>
            <SparkIcon /> Run AI review on SOP
          </button>
        </div>
      </aside>
    </div>
  );
}

