"use client";

import Link from "next/link";
import { Plus, ArrowRight, AlertCircle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { cn, formatDate, daysUntilDeadline, getDeadlineUrgency, APPLICATION_STATUS_CONFIG } from "@/lib/utils";
import type { User, Application, Notification } from "@/types";

interface Props {
  user: User;
  applications: (Application & { tasks: { completed: boolean }[] })[];
  notifications: Notification[];
}

export default function DashboardClient({ user, applications, notifications }: Props) {
  const totalApps = applications.length;
  const activeApps = applications.filter((a) => !["ACCEPTED", "REJECTED", "WITHDRAWN"].includes(a.status)).length;
  const totalTasks = applications.flatMap((a) => a.tasks).length;
  const completedTasks = applications.flatMap((a) => a.tasks).filter((t) => t.completed).length;
  const urgentDeadlines = applications.filter((a) => {
    const u = getDeadlineUrgency(a.deadline);
    return u === "critical" || u === "overdue";
  });

  const taskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B5E]">
            Hey {user.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-[#6B7280] text-sm mt-0.5">Here's your application overview</p>
        </div>
        <Link href="/applications/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Application
        </Link>
      </div>

      {/* Urgent deadlines banner */}
      {urgentDeadlines.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Urgent: {urgentDeadlines.length} deadline{urgentDeadlines.length > 1 ? "s" : ""} need attention</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {urgentDeadlines.map((a) => (
                <Link key={a.id} href={`/applications/${a.id}`} className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full hover:bg-red-200 transition-colors">
                  {a.universityName} — {daysUntilDeadline(a.deadline) < 0 ? "Overdue" : `${daysUntilDeadline(a.deadline)}d left`}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Applications", value: totalApps, icon: <TrendingUp className="w-4 h-4" />, color: "text-[#1B2B5E]", bg: "bg-blue-50" },
          { label: "Active", value: activeApps, icon: <Clock className="w-4 h-4" />, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Tasks Done", value: `${completedTasks}/${totalTasks}`, icon: <CheckCircle2 className="w-4 h-4" />, color: "text-green-600", bg: "bg-green-50" },
          { label: "Completion Rate", value: `${taskRate}%`, icon: <TrendingUp className="w-4 h-4" />, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", stat.bg, stat.color)}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-[#0F0F0F]">{stat.value}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Applications list */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-[#0F0F0F]">Your Applications</h2>
          <Link href="/applications" className="text-sm text-[#1B2B5E] font-medium flex items-center gap-1 hover:underline">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-[#1B2B5E]" />
            </div>
            <p className="font-semibold text-[#0F0F0F] mb-1">No applications yet</p>
            <p className="text-sm text-[#6B7280] mb-4">Add your first school to get started</p>
            <Link href="/applications/new" className="btn-primary">Add Application</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {applications.slice(0, 5).map((app) => {
              const urgency = getDeadlineUrgency(app.deadline);
              const days = daysUntilDeadline(app.deadline);
              const config = APPLICATION_STATUS_CONFIG[app.status];
              const tasksDone = app.tasks.filter((t) => t.completed).length;
              const tasksPct = app.tasks.length > 0 ? Math.round((tasksDone / app.tasks.length) * 100) : 0;

              return (
                <Link key={app.id} href={`/applications/${app.id}`} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#0F0F0F] truncate">{app.universityName}</p>
                    <p className="text-xs text-[#6B7280] truncate">{app.program}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-16 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-[#1B2B5E] h-1.5 rounded-full" style={{ width: `${tasksPct}%` }} />
                    </div>
                    <span className="text-xs text-[#6B7280]">{tasksPct}%</span>
                  </div>
                  <span className={cn("badge", config.bg, config.color)}>{config.label}</span>
                  <span className={cn(
                    "text-xs font-medium shrink-0",
                    urgency === "overdue" ? "text-red-600" :
                    urgency === "critical" ? "text-red-500" :
                    urgency === "warning" ? "text-amber-500" : "text-[#6B7280]"
                  )}>
                    {days < 0 ? "Overdue" : days === 0 ? "Today!" : `${days}d`}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
