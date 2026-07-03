"use client";

import { useState } from "react";
import type { Application, Task, Document, ApplicationStatus, DocumentType } from "@/types";

/* ---------------- Shared types ---------------- */
export type AppWithRels = Omit<Application, "tasks" | "documents"> & {
  tasks: Task[];
  documents: Pick<Document, "id" | "type">[];
};

/* ---------------- Status + colour maps ---------------- */
export const STATUS_META: Record<ApplicationStatus, { label: string; color: string; bg: string; dot: string }> = {
  NOT_STARTED: { label: "Not started", color: "#5A6B8C", bg: "#EDF0F6", dot: "#8595B5" },
  IN_PROGRESS: { label: "In Progress", color: "#B5621E", bg: "#FBEADB", dot: "#E8853B" },
  SUBMITTED: { label: "Submitted", color: "#2B5BE0", bg: "#EAF1FF", dot: "#3F75FF" },
  INTERVIEW: { label: "Interview", color: "#7A5AA8", bg: "#F1EBFB", dot: "#9B79CE" },
  ACCEPTED: { label: "Accepted", color: "#1B8C50", bg: "#E6F6EE", dot: "#22A565" },
  REJECTED: { label: "Rejected", color: "#B23B3B", bg: "#FAE8E8", dot: "#D45B5B" },
  WITHDRAWN: { label: "Withdrawn", color: "#5A6B8C", bg: "#EDF0F6", dot: "#8595B5" },
};

export const STATUS_ORDER: ApplicationStatus[] = [
  "NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "INTERVIEW", "ACCEPTED", "REJECTED", "WITHDRAWN",
];

export const COUNTRIES = ["United Kingdom", "United States", "Canada", "Germany", "Netherlands", "France", "Australia", "Nigeria", "Other"];

const FLAGS: Record<string, string> = {
  "United Kingdom": "🇬🇧", "United States": "🇺🇸", Canada: "🇨🇦", Germany: "🇩🇪",
  Netherlands: "🇳🇱", France: "🇫🇷", Australia: "🇦🇺", Nigeria: "🇳🇬",
};
export function flagFor(country: string) {
  return FLAGS[country] || "🌍";
}

export function daysLeft(deadline: Date | string) {
  const d = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export function fmtDate(deadline: Date | string) {
  return new Date(deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function pctColor(pct: number) {
  if (pct >= 70) return "#22A565";
  if (pct >= 40) return "#E8A33D";
  return "#D45B5B";
}

export function completion(tasks: Task[]) {
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);
}

export const REQUIRED_DOCS: { type: DocumentType | "IELTS"; label: string }[] = [
  { type: "SOP", label: "SOP" },
  { type: "CV", label: "CV" },
  { type: "TRANSCRIPT", label: "Transcript" },
  { type: "IELTS", label: "IELTS" },
];

/* ---------------- Icons ---------------- */
export const CalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" /><path d="M16 2v4" /><path d="M3 10h18" /><path d="M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /></svg>
);
export const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" /><path d="M12 6v6l4 2" /></svg>
);
export const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
);
export const DocIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6" /><path d="M9 17h6" /></svg>
);
export const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
);
export const SparkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" /><path d="M5.6 5.6l2.8 2.8" /><path d="M15.6 15.6l2.8 2.8" /><path d="M18.4 5.6l-2.8 2.8" /><path d="M8.4 15.6l-2.8 2.8" /></svg>
);
export const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="M6 6l12 12" /></svg>
);
export const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
);
export const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
);

/* ---------------- Shared Detail Drawer ---------------- */
export function AppDrawer({
  app,
  onClose,
  onToggleTask,
  onChangeStatus,
  onAddTask,
  onDeleteTask,
  onDeleteApp,
}: {
  app: AppWithRels;
  onClose: () => void;
  onToggleTask: (taskId: string, completed: boolean) => void;
  onChangeStatus: (status: ApplicationStatus) => void;
  onAddTask: (title: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteApp?: () => void;
}) {
  const [newTask, setNewTask] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const meta = STATUS_META[app.status];
  const pct = completion(app.tasks);
  const done = app.tasks.filter((t) => t.completed).length;
  const ring = 2 * Math.PI * 24.5;
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

        {onDeleteApp && (
          <div style={{ padding: "8px 26px 26px" }}>
            {confirmDel ? (
              <div style={{ border: "1px solid #F3D3D0", background: "#FDF4F3", borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#B3261E", marginBottom: 6 }}>
                  Delete this application?
                </div>
                <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 14px", lineHeight: 1.5 }}>
                  {app.universityName} and all of its tasks and documents will be permanently removed. This cannot be undone.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    style={{ background: "#fff", color: "#1B2230", border: "1px solid #E1E4E9", borderRadius: 999, padding: "9px 18px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}
                    onClick={() => setConfirmDel(false)}
                  >
                    Cancel
                  </button>
                  <button
                    style={{ background: "#B3261E", color: "#fff", border: "none", borderRadius: 999, padding: "9px 18px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}
                    onClick={onDeleteApp}
                  >
                    Yes, delete
                  </button>
                </div>
              </div>
            ) : (
              <button
                style={{ width: "100%", background: "none", border: "1px solid #EFD8D6", color: "#B3261E", borderRadius: 12, padding: "11px 0", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                onClick={() => setConfirmDel(true)}
              >
                Delete application
              </button>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

