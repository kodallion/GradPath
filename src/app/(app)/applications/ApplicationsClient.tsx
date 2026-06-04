"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter } from "lucide-react";
import { cn, formatDate, daysUntilDeadline, getDeadlineUrgency, APPLICATION_STATUS_CONFIG, FREE_PLAN_LIMITS } from "@/lib/utils";
import type { Application, ApplicationStatus } from "@/types";

const STATUSES: ApplicationStatus[] = ["NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "INTERVIEW", "ACCEPTED", "REJECTED", "WITHDRAWN"];

export default function ApplicationsClient({ applications, plan }: { applications: any[]; plan: string }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "ALL">("ALL");

  const atLimit = plan === "FREE" && applications.length >= FREE_PLAN_LIMITS.applications;

  const filtered = applications.filter((app) => {
    const matchSearch = app.universityName.toLowerCase().includes(search.toLowerCase()) ||
      app.program.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || app.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B5E]">Applications</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {applications.length} application{applications.length !== 1 ? "s" : ""}
            {plan === "FREE" && ` · ${FREE_PLAN_LIMITS.applications - applications.length} free slots remaining`}
          </p>
        </div>
        {atLimit ? (
          <Link href="/settings?tab=billing" className="btn-primary flex items-center gap-2">
            Upgrade for more
          </Link>
        ) : (
          <Link href="/applications/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Application
          </Link>
        )}
      </div>

      {atLimit && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
          You've reached the free plan limit of {FREE_PLAN_LIMITS.applications} applications.{" "}
          <Link href="/settings?tab=billing" className="font-semibold underline">Upgrade to Pro</Link> for unlimited applications.
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            className="input pl-10"
            placeholder="Search universities or programs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-auto"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
        >
          <option value="ALL">All Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{APPLICATION_STATUS_CONFIG[s].label}</option>
          ))}
        </select>
      </div>

      {/* Applications grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="font-semibold text-[#0F0F0F] mb-1">No applications found</p>
          <p className="text-sm text-[#6B7280]">
            {applications.length === 0 ? "Add your first application to get started." : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((app) => {
            const config = APPLICATION_STATUS_CONFIG[app.status as ApplicationStatus];
            const days = daysUntilDeadline(app.deadline);
            const urgency = getDeadlineUrgency(app.deadline);
            const tasksDone = app.tasks.filter((t: any) => t.completed).length;
            const tasksPct = app.tasks.length > 0 ? Math.round((tasksDone / app.tasks.length) * 100) : 0;

            return (
              <Link key={app.id} href={`/applications/${app.id}`} className="card p-5 hover:shadow-md transition-shadow block">
                <div className="flex items-start justify-between mb-3">
                  <span className={cn("badge", config.bg, config.color)}>{config.label}</span>
                  <span className={cn(
                    "text-xs font-medium",
                    urgency === "overdue" ? "text-red-600" :
                    urgency === "critical" ? "text-red-500" :
                    urgency === "warning" ? "text-amber-500" : "text-[#6B7280]"
                  )}>
                    {days < 0 ? "Overdue" : days === 0 ? "Due today" : `${days} days`}
                  </span>
                </div>
                <p className="font-semibold text-[#0F0F0F] mb-0.5">{app.universityName}</p>
                <p className="text-sm text-[#6B7280] mb-4">{app.program}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#6B7280]">
                    <span>Tasks</span>
                    <span>{tasksDone}/{app.tasks.length}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-[#1B2B5E] h-1.5 rounded-full transition-all"
                      style={{ width: `${tasksPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#6B7280]">Deadline: {formatDate(app.deadline)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
