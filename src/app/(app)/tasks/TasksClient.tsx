"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import "./tasks.css";
import type { Application, Task } from "@/types";

type AppWithTasks = Omit<Application, "tasks" | "documents"> & {
  tasks: Task[];
};

const FLAGS: Record<string, string> = {
  "United Kingdom": "🇬🇧", "United States": "🇺🇸", Canada: "🇨🇦", Germany: "🇩🇪",
  Netherlands: "🇳🇱", France: "🇫🇷", Australia: "🇦🇺", Nigeria: "🇳🇬",
};
function flagFor(country: string) {
  return FLAGS[country] || "🌍";
}

function fmtDate(deadline: Date | string) {
  return new Date(deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function pctColor(pct: number) {
  if (pct >= 70) return "#22A565";
  if (pct >= 40) return "#E8A33D";
  return "#D45B5B";
}

type FilterMode = "pending" | "done" | "all";

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
);
const DoneIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
);

export default function TasksClient({ applications: initial }: { applications: AppWithTasks[] }) {
  const router = useRouter();
  const [apps, setApps] = useState<AppWithTasks[]>(initial);
  const [filter, setFilter] = useState<FilterMode>("pending");

  const allTasks = apps.flatMap((a) => a.tasks);
  const pendingCount = allTasks.filter((t) => !t.completed).length;
  const doneCount = allTasks.filter((t) => t.completed).length;
  const totalCount = allTasks.length;
  const appsWithPending = apps.filter((a) => a.tasks.some((t) => !t.completed)).length;

  async function toggleTask(appId: string, taskId: string, completed: boolean) {
    setApps((prev) =>
      prev.map((a) =>
        a.id === appId
          ? { ...a, tasks: a.tasks.map((t) => (t.id === taskId ? { ...t, completed } : t)) }
          : a
      )
    );
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
  }

  // Groups to render: each application that has at least one task matching the filter
  const groups = useMemo(() => {
    return apps
      .map((a) => {
        const tasks = a.tasks.filter((t) =>
          filter === "pending" ? !t.completed : filter === "done" ? t.completed : true
        );
        return { app: a, tasks };
      })
      .filter((g) => g.tasks.length > 0);
  }, [apps, filter]);

  return (
    <div className="gp-tasks-page">
      <div className="gp-pagehead">
        <div>
          <h1 className="gp-pagetitle">Tasks</h1>
          <p className="gp-pagesub">
            {pendingCount} pending across {appsWithPending}{" "}
            {appsWithPending === 1 ? "application" : "applications"}
          </p>
        </div>
      </div>

      <div className="gp-toolbar">
        <div className="gp-chips">
          <button
            className={`gp-chip${filter === "pending" ? " on" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending<span className="gp-chip-count">{pendingCount}</span>
          </button>
          <button
            className={`gp-chip${filter === "done" ? " on" : ""}`}
            onClick={() => setFilter("done")}
          >
            Completed<span className="gp-chip-count">{doneCount}</span>
          </button>
          <button
            className={`gp-chip${filter === "all" ? " on" : ""}`}
            onClick={() => setFilter("all")}
          >
            All<span className="gp-chip-count">{totalCount}</span>
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="gp-alldone">
          <div className="gp-empty-ico" style={{ color: "var(--green)" }}>
            <DoneIcon />
          </div>
          <h2>
            {totalCount === 0
              ? "No tasks yet"
              : filter === "pending"
              ? "All caught up"
              : filter === "done"
              ? "Nothing completed yet"
              : "No tasks to show"}
          </h2>
          <p>
            {totalCount === 0
              ? "Add an application to generate your task checklist."
              : filter === "pending"
              ? "No pending tasks to show."
              : filter === "done"
              ? "Complete a task to see it here."
              : "No tasks match this filter."}
          </p>
        </div>
      ) : (
        <div className="gp-taskgroups">
          {groups.map(({ app, tasks }) => {
            const total = app.tasks.length;
            const done = app.tasks.filter((t) => t.completed).length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <section className="gp-panel gp-taskgroup" key={app.id}>
                <div
                  className="gp-taskgroup-head"
                  onClick={() => router.push("/applications")}
                >
                  <span className="gp-tflag">{flagFor(app.country)}</span>
                  <div className="gp-taskgroup-meta">
                    <div className="gp-taskgroup-uni">{app.universityName}</div>
                    <div className="gp-taskgroup-sub">{app.program}</div>
                  </div>
                  <div className="gp-taskgroup-right">
                    <span className="gp-taskgroup-pct" style={{ color: pctColor(pct) }}>
                      {pct}%
                    </span>
                    <span className="gp-taskgroup-deadline">{fmtDate(app.deadline)}</span>
                  </div>
                </div>
                <ul className="gp-tasklist">
                  {tasks.map((t) => (
                    <li
                      key={t.id}
                      className={`gp-task${t.completed ? " done" : ""}`}
                      onClick={() => toggleTask(app.id, t.id, !t.completed)}
                    >
                      <span
                        className="gp-checkbox"
                        style={
                          t.completed
                            ? { background: "var(--blue)", borderColor: "var(--blue)" }
                            : undefined
                        }
                      >
                        {t.completed && <CheckIcon />}
                      </span>
                      <span className="gp-task-title">{t.title}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

