"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Plus, Trash2, Clock, Loader2 } from "lucide-react";
import { cn, formatDate, daysUntilDeadline, getDeadlineUrgency, APPLICATION_STATUS_CONFIG } from "@/lib/utils";
import type { ApplicationStatus } from "@/types";

const STATUSES: ApplicationStatus[] = ["NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "INTERVIEW", "ACCEPTED", "REJECTED", "WITHDRAWN"];

export default function ApplicationDetailClient({ application: initial }: { application: any }) {
  const router = useRouter();
  const [app, setApp] = useState(initial);
  const [newTask, setNewTask] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const urgency = getDeadlineUrgency(app.deadline);
  const days = daysUntilDeadline(app.deadline);
  const config = APPLICATION_STATUS_CONFIG[app.status as ApplicationStatus];

  const toggleTask = async (taskId: string, completed: boolean) => {
    setApp((prev: any) => ({
      ...prev,
      tasks: prev.tasks.map((t: any) => t.id === taskId ? { ...t, completed } : t),
    }));
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    setAddingTask(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: app.id, title: newTask }),
      });
      const task = await res.json();
      setApp((prev: any) => ({ ...prev, tasks: [...prev.tasks, task] }));
      setNewTask("");
    } finally {
      setAddingTask(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    setApp((prev: any) => ({ ...prev, tasks: prev.tasks.filter((t: any) => t.id !== taskId) }));
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
  };

  const updateStatus = async (status: ApplicationStatus) => {
    setUpdatingStatus(true);
    setApp((prev: any) => ({ ...prev, status }));
    await fetch(`/api/applications/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdatingStatus(false);
  };

  const completedTasks = app.tasks.filter((t: any) => t.completed).length;
  const taskPct = app.tasks.length > 0 ? Math.round((completedTasks / app.tasks.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/applications" className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#0F0F0F] transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> All Applications
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2B5E]">{app.universityName}</h1>
            <p className="text-[#6B7280] mt-0.5">{app.program} · {app.country}</p>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full",
            urgency === "overdue" ? "bg-red-100 text-red-700" :
            urgency === "critical" ? "bg-red-50 text-red-600" :
            urgency === "warning" ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-600"
          )}>
            <Clock className="w-3.5 h-3.5" />
            {days < 0 ? "Overdue" : days === 0 ? "Due today" : `${days} days left`}
            <span className="text-xs font-normal opacity-70">· {formatDate(app.deadline)}</span>
          </div>
        </div>
      </div>

      {/* Status selector */}
      <div className="card p-5">
        <p className="text-sm font-medium text-[#0F0F0F] mb-3">Application Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => {
            const c = APPLICATION_STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all border-2",
                  app.status === s ? `${c.bg} ${c.color} border-current` : "bg-white text-[#6B7280] border-gray-200 hover:border-gray-300"
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tasks */}
      <div className="card">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#0F0F0F]">Tasks</h2>
            <span className="text-sm text-[#6B7280]">{completedTasks}/{app.tasks.length} done</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-[#1B2B5E] h-2 rounded-full transition-all duration-500" style={{ width: `${taskPct}%` }} />
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {app.tasks.map((task: any) => (
            <div key={task.id} className="flex items-center gap-3 px-5 py-3 group">
              <button
                onClick={() => toggleTask(task.id, !task.completed)}
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                  task.completed ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-[#1B2B5E]"
                )}
              >
                {task.completed && <Check className="w-3 h-3 text-white" />}
              </button>
              <span className={cn("flex-1 text-sm", task.completed ? "line-through text-[#6B7280]" : "text-[#0F0F0F]")}>
                {task.title}
              </span>
              {!task.isAutoGenerated && (
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-[#6B7280] hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add task */}
        <div className="p-4 border-t border-gray-100 flex gap-2">
          <input
            className="input flex-1"
            placeholder="Add a custom task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
          <button onClick={addTask} disabled={addingTask || !newTask.trim()} className="btn-primary px-4 py-2 flex items-center gap-1.5 disabled:opacity-50">
            {addingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
