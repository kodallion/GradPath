"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import "./tasks.css";
import type { ApplicationStatus } from "@/types";
import {
  AppDrawer,
  flagFor,
  fmtDate,
  pctColor,
  CapIcon,
  PlusIcon,
  TrashIcon,
  EmptyState,
  type AppWithRels,
} from "@/components/appShared";

type FilterMode = "pending" | "done" | "all";

const DoneIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
);
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
);

export default function TasksClient({ applications: initial }: { applications: AppWithRels[] }) {
  const [apps, setApps] = useState<AppWithRels[]>(initial);
  const [filter, setFilter] = useState<FilterMode>("pending");
  const [drawerId, setDrawerId] = useState<string | null>(null);
  // Tasks toggled in the current filter view stay put (like the drawer) instead
  // of vanishing the instant they no longer match the active filter. Cleared
  // whenever the filter tab itself changes, so switching tabs re-queries fresh.
  const [stickyIds, setStickyIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setStickyIds(new Set());
  }, [filter]);

  const allTasks = apps.flatMap((a) => a.tasks);
  const pendingCount = allTasks.filter((t) => !t.completed).length;
  const doneCount = allTasks.filter((t) => t.completed).length;
  const totalCount = allTasks.length;
  const appsWithPending = apps.filter((a) => a.tasks.some((t) => !t.completed)).length;

  const drawerApp = apps.find((a) => a.id === drawerId) || null;

  useEffect(() => {
    document.body.style.overflow = drawerId ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const patchApp = (id: string, partial: Partial<AppWithRels>) =>
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...partial } : a)));

  async function toggleTask(appId: string, taskId: string, completed: boolean) {
    setStickyIds((prev) => new Set(prev).add(taskId));
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
      const task = await res.json();
      const cur = apps.find((a) => a.id === appId)?.tasks || [];
      patchApp(appId, { tasks: [...cur, task] });
    }
  }

  async function deleteTask(appId: string, taskId: string) {
    const cur = apps.find((a) => a.id === appId)?.tasks || [];
    patchApp(appId, { tasks: cur.filter((t) => t.id !== taskId) });
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
  }

  const groups = useMemo(() => {
    return apps
      .map((a) => {
        const tasks = a.tasks.filter((t) => {
          if (stickyIds.has(t.id)) return true;
          return filter === "pending" ? !t.completed : filter === "done" ? t.completed : true;
        });
        return { app: a, tasks };
      })
      .filter((g) => g.tasks.length > 0);
  }, [apps, filter, stickyIds]);

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
        totalCount === 0 ? (
          <EmptyState
            tone="blue"
            icon={<CapIcon />}
            heading="No tasks yet"
            text="Add an application to generate your task checklist automatically."
            action={
              <Link href="/applications?add=1" className="gp-addbtn">
                <PlusIcon /> <span>Add application</span>
              </Link>
            }
          />
        ) : (
          <EmptyState
            tone="green"
            icon={<DoneIcon />}
            heading={
              filter === "pending"
                ? "All caught up"
                : filter === "done"
                ? "Nothing completed yet"
                : "No tasks to show"
            }
            text={
              filter === "pending"
                ? "No pending tasks to show."
                : filter === "done"
                ? "Complete a task to see it here."
                : "No tasks match this filter."
            }
          />
        )
      ) : (
        <div className="gp-taskgroups">
          {groups.map(({ app, tasks }) => {
            const total = app.tasks.length;
            const done = app.tasks.filter((t) => t.completed).length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <TaskGroupCard
                key={app.id}
                app={app}
                tasks={tasks}
                pct={pct}
                onOpenDrawer={() => setDrawerId(app.id)}
                onToggleTask={(taskId, completed) => toggleTask(app.id, taskId, completed)}
                onAddTask={(title) => addTask(app.id, title)}
                onDeleteTask={(taskId) => deleteTask(app.id, taskId)}
              />
            );
          })}
        </div>
      )}

      {drawerApp && (
        <AppDrawer
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

function TaskGroupCard({
  app,
  tasks,
  pct,
  onOpenDrawer,
  onToggleTask,
  onAddTask,
  onDeleteTask,
}: {
  app: AppWithRels;
  tasks: AppWithRels["tasks"];
  pct: number;
  onOpenDrawer: () => void;
  onToggleTask: (taskId: string, completed: boolean) => void;
  onAddTask: (title: string) => void;
  onDeleteTask: (taskId: string) => void;
}) {
  const [newTask, setNewTask] = useState("");

  function submitTask() {
    const t = newTask.trim();
    if (!t) return;
    onAddTask(t);
    setNewTask("");
  }

  return (
    <section className="gp-panel gp-taskgroup">
      <div className="gp-taskgroup-head" onClick={onOpenDrawer}>
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
            <span
              className="gp-task-title"
              onClick={() => onToggleTask(t.id, !t.completed)}
              style={{ flex: 1 }}
            >
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
      <div style={{ display: "flex", gap: 8, marginTop: 10 }} onClick={(e) => e.stopPropagation()}>
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
    </section>
  );
}

