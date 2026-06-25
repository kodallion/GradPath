"use client";

import Link from "next/link";
import {
  Plus, Layers, CheckSquare, Clock, Sparkles, Calendar, ArrowRight,
} from "lucide-react";
import {
  daysUntilDeadline,
  getDeadlineUrgency,
  APPLICATION_STATUS_CONFIG,
  FREE_PLAN_LIMITS,
  isPro,
} from "@/lib/utils";
import type { User, Application, Task, Document, DocumentType } from "@/types";
import "./dashboard.css";

interface Props {
  user: User;
  applications: (Omit<Application, "tasks" | "documents"> & {
    tasks: Task[];
    documents: Pick<Document, "type">[];
  })[];
}

const STATUS_BADGE: Record<string, { fg: string; bg: string; dot: string }> = {
  NOT_STARTED: { fg: "#5A6B8C", bg: "#EDF0F6", dot: "#8595B5" },
  IN_PROGRESS: { fg: "#B5621E", bg: "#FBEADB", dot: "#E8853B" },
  SUBMITTED: { fg: "#2B5BE0", bg: "#EAF1FF", dot: "#3F75FF" },
  INTERVIEW: { fg: "#6A4FD0", bg: "#EEEBFB", dot: "#7A5AE0" },
  ACCEPTED: { fg: "#1B8C50", bg: "#E6F6EE", dot: "#22A565" },
  REJECTED: { fg: "#B23B3B", bg: "#FAE8E8", dot: "#D45B5B" },
  WITHDRAWN: { fg: "#6B7280", bg: "#F1F2F4", dot: "#9AA1AD" },
};

// The set of document types every application is expected to have.
// OTHER is excluded since it's not a standard required document.
const REQUIRED_DOC_TYPES: DocumentType[] = ["SOP", "CV", "TRANSCRIPT"];

function completionColor(pct: number) {
  if (pct < 40) return "#D45B5B";
  if (pct < 70) return "#E8A33D";
  return "#22A565";
}

function urgencyDisplay(app: Pick<Application, "status" | "deadline">) {
  if (["SUBMITTED", "ACCEPTED", "REJECTED", "WITHDRAWN"].includes(app.status)) {
    return { color: "#5A6B8C", label: APPLICATION_STATUS_CONFIG[app.status].label };
  }
  const urgency = getDeadlineUrgency(app.deadline);
  const days = daysUntilDeadline(app.deadline);
  if (urgency === "overdue") return { color: "#B23B3B", label: "Overdue" };
  if (urgency === "critical") return { color: "#B5621E", label: `${days} day${days === 1 ? "" : "s"} left` };
  if (urgency === "warning") return { color: "#A86E12", label: `${days} days left` };
  return { color: "#1F7A4D", label: `${days} days left` };
}

function missingDocsCount(documents: Pick<Document, "type">[]): number {
  const present = new Set(documents.map((d) => d.type));
  return REQUIRED_DOC_TYPES.filter((t) => !present.has(t)).length;
}

export default function DashboardClient({ user, applications }: Props) {
  const totalApps = applications.length;
  const allTasks = applications.flatMap((a) => a.tasks);
  const pendingTasks = allTasks.filter((t) => !t.completed).length;
  const inProgress = applications.filter((a) => a.status === "IN_PROGRESS").length;
  const submitted = applications.filter((a) => a.status === "SUBMITTED").length;

  const upcoming = [...applications]
    .filter((a) => !["REJECTED", "WITHDRAWN"].includes(a.status))
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  const nextDeadline = upcoming[0];

  const pro = isPro(user.plan);
  const appLimit = FREE_PLAN_LIMITS.applications;
  const aiLimit = FREE_PLAN_LIMITS.aiReviewsPerDay;
  const aiUsed = user.aiReviewsToday;

  const firstName = user.name?.split(" ")[0] || "there";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="gp-dashboard-page">
      <div className="gp-pagehead">
        <div>
          <h1 className="gp-hello">Good day, {firstName}</h1>
          <p className="gp-subhello">
            {today} · {totalApps} application{totalApps === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/applications/new" className="gp-addbtn">
          <Plus size={16} /> <span>Add application</span>
        </Link>
      </div>

      <div className="gp-stats">
        <StatCard icon={<Layers size={18} />} label="Applications" value={totalApps} sub={`${inProgress} in progress · ${submitted} submitted`} />
        <StatCard icon={<CheckSquare size={18} />} label="Pending Tasks" value={pendingTasks} sub="across all applications" />
        <StatCard
          icon={<Clock size={18} />}
          label="Upcoming Deadlines"
          value={upcoming.length}
          sub={nextDeadline ? `next: ${nextDeadline.universityName}` : "none yet"}
        />
        <StatCard
          icon={<Sparkles size={18} />}
          label="AI Reviews Today"
          value={pro ? "Unlimited" : `${aiUsed} / ${aiLimit}`}
          sub={pro ? "on Pro plan" : `${Math.max(aiLimit - aiUsed, 0)} remaining on Free`}
        />
      </div>

      <div className="gp-columns">
        <div className="gp-col-main">
          <div className="gp-sectionhead">
            <h2>Your applications</h2>
            <span className="gp-count">{totalApps} total</span>
          </div>
          <div className="gp-grid">
            {applications.slice(0, 5).map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        </div>

        <div className="gp-col-side">
          <div className="gp-side-block">
            <div className="gp-sectionhead">
              <h2>Upcoming deadlines</h2>
              <Calendar size={16} />
            </div>
            <section className="gp-panel">
              {upcoming.length === 0 ? (
                <p className="gp-empty-note">No deadlines yet — add an application to get started.</p>
              ) : (
                <ul className="gp-deadlines">
                  {upcoming.slice(0, 5).map((app) => {
                    const { color, label } = urgencyDisplay(app);
                    return (
                      <li className="gp-deadline" key={app.id}>
                        <span className="gp-dl-bar" style={{ background: color }} />
                        <div className="gp-dl-body">
                          <div className="gp-dl-uni">{app.universityName}</div>
                          <div className="gp-dl-prog">{app.program}</div>
                        </div>
                        <div className="gp-dl-right">
                          <div className="gp-dl-date">
                            {new Date(app.deadline).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                          </div>
                          <span className="gp-dl-chip" style={{ background: color + "22", color }}>
                            {label}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <div className="gp-side-block">
            <div className="gp-sectionhead">
              <h2>Your plan</h2>
              <span className="gp-freepill">{pro ? "Pro" : "Free"}</span>
            </div>
            <section className="gp-panel">
              <div className="gp-meter">
                <div className="gp-meter-top">
                  <span>Applications</span>
                  <span>{pro ? "Unlimited" : `${totalApps}/${appLimit}`}</span>
                </div>
                <div className="gp-meter-track">
                  <div
                    className="gp-meter-fill"
                    style={{ width: `${pro ? 100 : Math.min((totalApps / appLimit) * 100, 100)}%`, background: "#0E1320" }}
                  />
                </div>
              </div>
              <div className="gp-meter">
                <div className="gp-meter-top">
                  <span>AI reviews today</span>
                  <span>{pro ? "Unlimited" : `${aiUsed}/${aiLimit}`}</span>
                </div>
                <div className="gp-meter-track">
                  <div
                    className="gp-meter-fill"
                    style={{ width: `${pro ? 100 : Math.min((aiUsed / aiLimit) * 100, 100)}%`, background: "var(--blue)" }}
                  />
                </div>
              </div>
              {!pro && (
                <button className="gp-planupgrade" disabled title="Online payment is launching shortly">
                  <span>
                    Go Pro — <b>₦5,000</b>/mo
                  </span>
                  <ArrowRight size={16} />
                </button>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub: string }) {
  return (
    <div className="gp-stat">
      <div className="gp-statico">{icon}</div>
      <div className="gp-statbody">
        <div className="gp-statlabel">{label}</div>
        <div className="gp-statvalue">{value}</div>
        <div className="gp-statsub">{sub}</div>
      </div>
    </div>
  );
}

function AppCard({
  app,
}: {
  app: Omit<Application, "tasks" | "documents"> & {
    tasks: Task[];
    documents: Pick<Document, "type">[];
  };
}) {
  const badge = STATUS_BADGE[app.status];
  const config = APPLICATION_STATUS_CONFIG[app.status];
  const { color: urgencyColor, label: urgencyLabel } = urgencyDisplay(app);
  const total = app.tasks.length;
  const done = app.tasks.filter((t) => t.completed).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const barColor = completionColor(pct);
  const missing = missingDocsCount(app.documents);

  return (
    <Link href={`/applications/${app.id}`} className="gp-card">
      <div className="gp-card-top">
        <span className="gp-card-flag">{app.country ? countryFlag(app.country) : "🌍"}</span>
        <span className="gp-badge" style={{ color: badge.fg, background: badge.bg }}>
          <span className="dot" style={{ background: badge.dot }} />
          {config.label}
        </span>
      </div>
      <h3 className="gp-card-uni">{app.universityName}</h3>
      <p className="gp-card-prog">{app.program}</p>
      <div className="gp-card-meta">
        <span className="gp-card-metaitem">
          <Calendar size={14} />{" "}
          {new Date(app.deadline).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        <span className="gp-card-metaitem" style={{ color: urgencyColor }}>
          <Clock size={14} /> {urgencyLabel}
        </span>
      </div>
      <div className="gp-card-progwrap">
        <div className="gp-card-progtop">
          <span>Completion</span>
          <span className="gp-card-pct" style={{ color: barColor }}>
            {pct}%
          </span>
        </div>
        <div className="gp-prog-track">
          <div className="gp-prog-fill" style={{ width: `${pct}%`, background: barColor }} />
        </div>
      </div>
      <div className="gp-card-foot">
        <span className="gp-card-docs">
          {missing > 0 ? (
            <>
              <span className="gp-warn">●</span>
              <span>
                {missing} document{missing === 1 ? "" : "s"} missing
              </span>
            </>
          ) : (
            <>
              <span className="gp-ok">●</span>
              <span>All documents in</span>
            </>
          )}
        </span>
        <span className="gp-card-open">
          Open <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}

// Lightweight country -> flag mapping for the handful of common destinations;
// falls back to a globe icon for anything not listed.
function countryFlag(country: string): string {
  const map: Record<string, string> = {
    "united kingdom": "🇬🇧", uk: "🇬🇧",
    "united states": "🇺🇸", usa: "🇺🇸",
    canada: "🇨🇦",
    netherlands: "🇳🇱",
    germany: "🇩🇪",
    australia: "🇦🇺",
    sweden: "🇸🇪",
    ireland: "🇮🇪",
    switzerland: "🇨🇭",
  };
  return map[country.trim().toLowerCase()] || "🌍";
}

