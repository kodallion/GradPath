"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard, FolderOpen, CheckSquare, FileText, Sparkles, Settings,
  Menu, Bell, GraduationCap, Zap, ArrowRight, X, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User, Notification } from "@/types";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/applications", icon: FolderOpen, label: "Applications" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/documents", icon: FileText, label: "Documents" },
  { href: "/ai-review", icon: Sparkles, label: "AI Review" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

const NOTIF_STYLE: Record<string, { icon: string; fg: string; bg: string }> = {
  DEADLINE_REMINDER: { icon: "📅", fg: "#B5621E", bg: "#FBEADB" },
  TASK_OVERDUE: { icon: "⏰", fg: "#B23B3B", bg: "#FAE8E8" },
  AI_LIMIT_REACHED: { icon: "✨", fg: "#6A4FD0", bg: "#EEEBFB" },
  SUBSCRIPTION_EVENT: { icon: "⚡", fg: "#2B5BE0", bg: "#EAF1FF" },
  GENERAL: { icon: "🔔", fg: "#5A6B8C", bg: "#EDF0F6" },
};

const PRO_FEATURES = [
  "Unlimited applications & AI document reviews",
  "Inline suggested rewrites on every flagged issue",
  "Version comparison & score history",
  "All document types, including LOR",
  "Export & share reviews with a mentor",
];

export default function AppShell({
  children,
  user,
  notifications,
}: {
  children: React.ReactNode;
  user: User;
  notifications: Notification[];
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(notifications);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const isPro = user.plan === "PRO";
  const initials = (user.name || user.email)
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setUpgradeOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function markAllRead() {
    setUnread([]);
    // TODO: call PATCH /api/notifications/read-all once that route exists.
  }

  return (
    <div className="gp-dash">
      {mobileOpen && <div className="gp-sidebar-overlay open" onClick={() => setMobileOpen(false)} />}

      <aside className={cn("gp-sidebar", mobileOpen && "open")}>
        <div className="gp-brand">
          <span className="gp-logo">
            <GraduationCap size={18} strokeWidth={1.9} />
          </span>
          <span className="gp-wordmark">GradPath</span>
        </div>

        <nav className="gp-nav">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn("gp-navitem", active && "on")}
              >
                <span className="gp-navico">
                  <item.icon size={18} />
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="gp-planbox">
          <div className={cn("gp-plantag", isPro && "gp-plan-pro")}>{isPro ? "PRO PLAN" : "FREE PLAN"}</div>
          {isPro ? (
            <p className="gp-planhint">Thanks for being a Pro member.</p>
          ) : (
            <>
              <p className="gp-planhint">Unlock unlimited applications &amp; AI reviews.</p>
              <button className="gp-upgradebtn" onClick={() => setUpgradeOpen(true)}>
                <Zap size={14} /> Upgrade to Pro
              </button>
            </>
          )}
        </div>
      </aside>

      <div className="gp-main">
        <header className="gp-topbar">
          <button className="gp-navtoggle" onClick={() => setMobileOpen(true)}>
            <Menu size={19} />
          </button>
          <div className="gp-topactions" style={{ marginLeft: "auto" }}>
            <div className="gp-bellwrap">
              <button className="gp-iconbtn" onClick={() => setNotifOpen((v) => !v)}>
                <Bell size={18} />
                {unread.length > 0 && (
                  <span
                    style={{
                      position: "absolute", top: 5, right: 5, background: "var(--blue)", color: "#fff",
                      borderRadius: 999, fontSize: 10, fontWeight: 700, minWidth: 16, height: 16,
                      display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
                    }}
                  >
                    {unread.length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="gp-notifdd open">
                  <div className="gp-notifdd-head">
                    <h3>Notifications</h3>
                    <button className="gp-notifdd-markall" onClick={markAllRead}>
                      Mark all read
                    </button>
                  </div>
                  <div className="gp-notifdd-list">
                    {unread.length === 0 ? (
                      <div className="gp-notifdd-empty">No notifications yet</div>
                    ) : (
                      unread.map((n) => {
                        const style = NOTIF_STYLE[n.type] || NOTIF_STYLE.GENERAL;
                        return (
                          <div
                            key={n.id}
                            className="gp-notif unread"
                            onClick={() => setUnread((u) => u.filter((x) => x.id !== n.id))}
                          >
                            <div className="gp-notif-ico" style={{ background: style.bg, color: style.fg }}>
                              {style.icon}
                            </div>
                            <div className="gp-notif-body">
                              <div className="gp-notif-title">{n.title}</div>
                              <div className="gp-notif-msg">{n.message}</div>
                            </div>
                            <span className="gp-notif-unreaddot" />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
            <UserButton
              appearance={{
                elements: { avatarBox: "w-9 h-9" },
              }}
            />
          </div>
        </header>

        <main className="gp-content">{children}</main>
      </div>

      {upgradeOpen && (
        <div className="gp-upgrade-overlay open" onClick={() => setUpgradeOpen(false)}>
          <div className="gp-upgrade-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gp-upgrade-head">
              <span className="gp-upgrade-badge">
                <Zap size={20} />
              </span>
              <button className="gp-upgrade-close" onClick={() => setUpgradeOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="gp-upgrade-body">
              <h2>Upgrade to Pro</h2>
              <p className="lead">
                Unlimited applications and AI reviews, plus the features that get your documents
                submission-ready.
              </p>
              <div className="gp-upgrade-price">
                <span className="amt">₦5,000</span>
                <span className="per">/ month</span>
              </div>
              <div className="gp-upgrade-trialnote">
                <Check size={13} /> 7-day free trial — cancel anytime before it ends
              </div>
              <div className="gp-upgrade-features">
                {PRO_FEATURES.map((f) => (
                  <div className="gp-upgrade-feature" key={f}>
                    <span className="ic">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="gp-upgrade-foot">
              <button className="gp-upgrade-cta" disabled>
                <Zap size={16} /> Coming soon
              </button>
              <p className="gp-upgrade-fine">
                Online payment is launching shortly. We&rsquo;ll email you the moment Pro is ready to
                activate.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

