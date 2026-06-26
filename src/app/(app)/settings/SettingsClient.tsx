"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import "./settings.css";

interface Props {
  name: string;
  email: string;
  plan: "FREE" | "PRO";
  memberSince: string;
  appCount: number;
  appLimit: number;
  aiUsedToday: number;
  aiLimit: number;
  initialPrefs: Record<string, boolean>;
}

const NOTIF_ROWS: { key: string; label: string; desc: string; default: boolean }[] = [
  { key: "deadlines", label: "Deadline reminders", desc: "Email me 14, 7 and 1 day before a deadline", default: true },
  { key: "weekly", label: "Weekly digest", desc: "A Monday summary of pending tasks and progress", default: true },
  { key: "aiReady", label: "AI review ready", desc: "Notify me when a document analysis finishes", default: false },
  { key: "tips", label: "Application tips", desc: "Occasional guidance for stronger applications", default: true },
];

const ExportIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></svg>);
const SignOutIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>);
const TrashIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>);
const Bolt = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" /></svg>);

function initials(name: string, email: string) {
  const src = name?.trim() || email;
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

export default function SettingsClient(props: Props) {
  const router = useRouter();
  const { signOut } = useClerk();

  const [name, setName] = useState(props.name || "");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    const base: Record<string, boolean> = {};
    for (const r of NOTIF_ROWS) base[r.key] = props.initialPrefs[r.key] ?? r.default;
    return base;
  });

  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const isPro = props.plan === "PRO";

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  async function saveName() {
    if (!name.trim()) return;
    setSavingName(true);
    setNameSaved(false);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        setNameSaved(true);
        flash("Profile saved.");
        router.refresh();
        setTimeout(() => setNameSaved(false), 2000);
      } else {
        const d = await res.json();
        flash(d.error || "Could not save.");
      }
    } catch {
      flash("Could not save. Try again.");
    } finally {
      setSavingName(false);
    }
  }

  async function toggle(key: string) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    try {
      await fetch("/api/users/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: { [key]: next[key] } }),
      });
    } catch {
      setPrefs(prefs); // revert
      flash("Could not update. Try again.");
    }
  }

  async function exportData() {
    setExporting(true);
    try {
      const res = await fetch("/api/users/export");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gradpath-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      flash("Export downloaded.");
    } catch {
      flash("Export failed. Try again.");
    } finally {
      setExporting(false);
    }
  }

  async function doDelete() {
    if (deleteText !== "DELETE") return;
    setDeleting(true);
    try {
      const res = await fetch("/api/users/account", { method: "DELETE" });
      if (res.ok) {
        await signOut(() => router.push("/"));
      } else {
        flash("Could not delete account. Try again.");
        setDeleting(false);
      }
    } catch {
      flash("Could not delete account. Try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="gp-settings-page">
      <div className="gp-pagehead">
        <div>
          <h1 className="gp-pagetitle">Settings</h1>
          <p className="gp-pagesub">Manage your profile, plan and notifications</p>
        </div>
      </div>

      <div className="gp-setstack">
        {/* Profile */}
        <section className="gp-panel">
          <div className="gp-panelhead"><h2>Profile</h2></div>
          <div className="gp-profile">
            <div className="gp-avatar-wrap">
              <div className="gp-profile-avatar">{initials(name, props.email)}</div>
            </div>
            <div className="gp-profile-fields">
              <label className="au-field">
                <span className="au-flabel">Full name</span>
                <div className="au-inputwrap"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></div>
              </label>
              <label className="au-field">
                <span className="au-flabel">Email</span>
                <div className="au-inputwrap"><input value={props.email} type="email" disabled /></div>
                <span className="au-hint">Managed by your sign-in provider</span>
              </label>
            </div>
          </div>
          <div className="gp-set-foot">
            <span className="gp-set-fine">Member since {props.memberSince}</span>
            <button className="gp-btn-primary" onClick={saveName} disabled={savingName || !name.trim()}>
              {savingName ? "Saving…" : nameSaved ? "Saved ✓" : "Save changes"}
            </button>
          </div>
        </section>

        {/* Plan */}
        <section className="gp-panel gp-planbanner">
          <div className="gp-planbanner-info">
            <span className={`gp-freepill${isPro ? " gp-plan-pro" : ""}`}>{isPro ? "Pro plan" : "Free plan"}</span>
            <h2>{isPro ? "You're on Pro" : "You're on the Free plan"}</h2>
            <p>
              {isPro
                ? "Unlimited applications and AI reviews."
                : `${props.appCount} of ${props.appLimit} applications · ${props.aiUsedToday}/${props.aiLimit} AI reviews today. Upgrade for unlimited everything.`}
            </p>
          </div>
          {isPro ? (
            <button className="gp-btn-ghost" onClick={() => flash("Subscription management is coming soon.")}>Manage subscription</button>
          ) : (
            <button className="gp-upgradebtn-inline" onClick={() => flash("Upgrade checkout is coming soon.")}>
              <Bolt /> Upgrade to Pro — ₦5,000/mo
            </button>
          )}
        </section>

        {/* Notifications */}
        <section className="gp-panel">
          <div className="gp-panelhead"><h2>Notifications</h2></div>
          <div className="gp-setlist">
            {NOTIF_ROWS.map((row) => (
              <div className="gp-setrow" key={row.key}>
                <div>
                  <div className="gp-setrow-label">{row.label}</div>
                  <div className="gp-setrow-desc">{row.desc}</div>
                </div>
                <button
                  className={`gp-switch${prefs[row.key] ? " on" : ""}`}
                  onClick={() => toggle(row.key)}
                  aria-pressed={prefs[row.key]}
                  aria-label={row.label}
                >
                  <span className="gp-switch-knob" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Account */}
        <section className="gp-panel gp-danger">
          <div className="gp-panelhead"><h2>Account</h2></div>
          <div className="gp-setlist">
            <div className="gp-setrow">
              <div>
                <div className="gp-setrow-label">Export my data</div>
                <div className="gp-setrow-desc">Download all applications, tasks and documents</div>
              </div>
              <button className="gp-btn-ghost" onClick={exportData} disabled={exporting}>
                <ExportIcon /> {exporting ? "Preparing…" : "Export"}
              </button>
            </div>
            <div className="gp-setrow">
              <div>
                <div className="gp-setrow-label">Sign out</div>
                <div className="gp-setrow-desc">End your session on this device</div>
              </div>
              <button className="gp-btn-ghost" onClick={() => signOut(() => router.push("/"))}>
                <SignOutIcon /> Sign out
              </button>
            </div>
            <div className="gp-setrow">
              <div>
                <div className="gp-setrow-label gp-danger-label">Delete account</div>
                <div className="gp-setrow-desc">Permanently remove your account and data</div>
              </div>
              <button className="gp-btn-ghost gp-danger-btn" onClick={() => { setShowDelete(true); setDeleteText(""); }}>
                <TrashIcon /> Delete
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Delete confirm modal */}
      {showDelete && (
        <div
          onClick={() => !deleting && setShowDelete(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(14,19,32,.5)", display: "grid", placeItems: "center", zIndex: 300, padding: 20 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--paper)", borderRadius: 20, padding: 26, maxWidth: 420, width: "100%", boxShadow: "0 24px 60px rgba(16,22,40,.3)" }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: "#FAE8E8", color: "#B23B3B", display: "grid", placeItems: "center", marginBottom: 16 }}><TrashIcon /></div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>Delete your account?</h2>
            <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>
              This permanently removes your profile, all applications, tasks, documents, and reviews. This cannot be undone. Type <b style={{ color: "var(--ink)" }}>DELETE</b> to confirm.
            </p>
            <input
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder="DELETE"
              style={{ width: "100%", fontFamily: "inherit", fontSize: 14, color: "var(--ink)", background: "var(--paper)", border: "1px solid var(--line-2)", borderRadius: 11, padding: "11px 13px", outline: "none", marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowDelete(false)} disabled={deleting} style={{ fontSize: 13.5, fontWeight: 600, color: "var(--muted)", padding: "10px 16px", borderRadius: 999 }}>Cancel</button>
              <button
                onClick={doDelete}
                disabled={deleteText !== "DELETE" || deleting}
                style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", background: deleteText === "DELETE" ? "#D45B5B" : "var(--line-2)", padding: "10px 18px", borderRadius: 999, cursor: deleteText === "DELETE" ? "pointer" : "not-allowed" }}
              >
                {deleting ? "Deleting…" : "Delete forever"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "var(--ink)", color: "#fff", fontSize: 13, fontWeight: 500, padding: "11px 18px", borderRadius: 12, boxShadow: "0 12px 32px rgba(16,22,40,.24)", zIndex: 320 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
