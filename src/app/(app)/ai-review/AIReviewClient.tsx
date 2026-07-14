"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import "./ai-review.css";
import type { Application, Document } from "@/types";
import type { ReviewResult, ReviewAnnotation } from "@/lib/aiReview";
import { flagFor, EmptyState } from "@/components/appShared";
import { extractText } from "./extractText";

type DocLite = Pick<Document, "id" | "type" | "fileName">;
type AppLite = Omit<Application, "tasks" | "documents"> & { documents: DocLite[] };

interface ReviewRecord {
  id: string;
  documentId: string | null;
  type: "SOP" | "CV";
  overallScore: number | null;
  verdict: string | null;
  wordCount: number | null;
  version: number;
  result: unknown;
  createdAt: string;
}

const FREE_DAILY = 3;
// Flip to true once ANTHROPIC_API_KEY is funded in prod (see CLAUDE.md pending #2).
const AI_REVIEW_LIVE = false;

function scoreColor(s: number) {
  if (s >= 8) return "#22A565";
  if (s >= 6) return "#E8A33D";
  return "#D45B5B";
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/* icons */
const Spark = ({ s = 14 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" /><path d="M5.6 5.6l2.8 2.8" /><path d="M15.6 15.6l2.8 2.8" /><path d="M18.4 5.6l-2.8 2.8" /><path d="M8.4 15.6l-2.8 2.8" /></svg>);
const Bolt = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" /></svg>);
const Check = ({ s = 13 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>);
const XIco = ({ s = 13 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="M6 6l12 12" /></svg>);
const Back = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M11 18l-6-6 6-6" /></svg>);
const Lock = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
const CopyIco = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>);
const UploadIco = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></svg>);
const Plus = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>);

function buildSegments(text: string, annotations: ReviewAnnotation[]) {
  type Seg = { text: string; ann?: ReviewAnnotation };
  const hits: { start: number; end: number; ann: ReviewAnnotation }[] = [];
  for (const ann of annotations) {
    if (!ann.span) continue;
    const idx = text.indexOf(ann.span);
    if (idx >= 0) hits.push({ start: idx, end: idx + ann.span.length, ann });
  }
  hits.sort((a, b) => a.start - b.start);
  const clean: typeof hits = [];
  let cursor = 0;
  for (const h of hits) {
    if (h.start >= cursor) { clean.push(h); cursor = h.end; }
  }
  const segs: Seg[] = [];
  let pos = 0;
  for (const h of clean) {
    if (h.start > pos) segs.push({ text: text.slice(pos, h.start) });
    segs.push({ text: text.slice(h.start, h.end), ann: h.ann });
    pos = h.end;
  }
  if (pos < text.length) segs.push({ text: text.slice(pos) });
  return segs;
}

export default function AIReviewClient({
  applications, reviews, plan, usedToday,
}: {
  applications: AppLite[];
  reviews: ReviewRecord[];
  plan: "FREE" | "PRO";
  usedToday: number;
}) {
  const isPro = plan === "PRO";
  const [view, setView] = useState<"overview" | "runner" | "running" | "review">("overview");
  const [appId, setAppId] = useState<string>(applications[0]?.id || "");
  const [docType, setDocType] = useState<"SOP" | "CV">("SOP");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [error, setError] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [used, setUsed] = useState(usedToday);

  const [active, setActive] = useState<{ result: ReviewResult; version: number; type: "SOP" | "CV"; appId: string; docText: string } | null>(null);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [noteFilter, setNoteFilter] = useState<"all" | "good" | "improve">("all");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const noteRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const fileRef = useRef<HTMLInputElement | null>(null);

  const remaining = isPro ? Infinity : Math.max(0, FREE_DAILY - used);
  const limitReached = !isPro && remaining <= 0;

  const overviewByApp = useMemo(() => {
    const map: Record<string, { SOP?: ReviewRecord; CV?: ReviewRecord; SOPcount: number; CVcount: number }> = {};
    const docToApp: Record<string, string> = {};
    for (const a of applications) for (const d of a.documents) docToApp[d.id] = a.id;
    for (const r of reviews) {
      const aId = r.documentId ? docToApp[r.documentId] : undefined;
      if (!aId) continue;
      if (!map[aId]) map[aId] = { SOPcount: 0, CVcount: 0 };
      const slot = map[aId];
      if (r.type === "SOP") { slot.SOPcount++; if (!slot.SOP) slot.SOP = r; }
      else { slot.CVcount++; if (!slot.CV) slot.CV = r; }
    }
    return map;
  }, [applications, reviews]);

  function openRunner() {
    if (!AI_REVIEW_LIVE) { setShowComingSoon(true); return; }
    setError(""); setText(""); setFileName(""); setShowPaste(false);
    setView("runner");
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setExtracting(true);
    setFileName(file.name);
    try {
      const extracted = await extractText(file);
      if (!extracted || extracted.length < 100) {
        setError("Could not read enough text from that file. Try another file or paste the text.");
        setText("");
      } else {
        setText(extracted);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that file. Paste the text instead.");
      setShowPaste(true);
    } finally {
      setExtracting(false);
    }
  }

  async function runReview() {
    setError("");
    if (text.trim().length < 100) {
      setError("Add at least 100 characters — upload a file or paste your text.");
      return;
    }
    if (limitReached) { setShowUpgrade(true); return; }
    setView("running");
    try {
      const res = await fetch("/api/ai/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, type: docType, applicationId: appId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "AI_LIMIT_REACHED") { setError(data.message || "Daily limit reached."); setShowUpgrade(true); }
        else setError(data.error || "Review failed. Please try again.");
        setView("runner");
        return;
      }
      if (!isPro) setUsed((u) => u + 1);
      setActive({ result: data.result, version: data.version, type: docType, appId, docText: text });
      setActiveNote(null); setNoteFilter("all");
      setView("review");
    } catch {
      setError("Something went wrong. Please try again.");
      setView("runner");
    }
  }

  function openNote(id: string) {
    setActiveNote(id);
    const el = noteRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const appName = (id: string) => applications.find((a) => a.id === id)?.universityName || "Document";
  const appCountry = (id: string) => applications.find((a) => a.id === id)?.country || "";

  /* ============ RUNNING ============ */
  if (view === "running") {
    return (
      <div className="gp-aireview-page">
        <div className="gp-ai-stage">
          <div className="gp-ai-progress active">
            <div className="gp-ai-spin" />
            <h3>Analysing your {docType}…</h3>
            <p>Claude is reading closely, scoring against a rubric, and finding specific fixes. This takes a few seconds.</p>
          </div>
        </div>
      </div>
    );
  }

  /* ============ REVIEW ============ */
  if (view === "review" && active) {
    const r = active.result;
    const segs = buildSegments(active.docText, r.annotations);
    const filtered = r.annotations.filter((a) => noteFilter === "all" || a.tag === noteFilter);
    const goodCount = r.annotations.filter((a) => a.tag === "good").length;
    const improveCount = r.annotations.filter((a) => a.tag === "improve").length;
    const sevColor = (s: string) => (s === "critical" ? "#D45B5B" : s === "moderate" ? "#E8A33D" : "#8595B5");

    return (
      <div className="gp-aireview-page">
        <div className="gp-ai-backbar">
          <button className="gp-ai-backbtn" onClick={() => setView("overview")}><Back /> Back to overview</button>
        </div>

        <div className="gp-review-sticky">
          <div className="gp-review-topmeta">
            <span className="gp-review-score" style={{ borderColor: scoreColor(r.overallScore), color: scoreColor(r.overallScore) }}>{r.overallScore.toFixed(1)}</span>
            <div>
              <div className="gp-review-title">{active.type === "SOP" ? "Statement of Purpose" : "Academic CV"} — v{active.version}</div>
              <div className="gp-review-sub">
                <span className="gp-docpill">{active.type}</span>
                <span>{flagFor(appCountry(active.appId))} {appName(active.appId)}</span>
                <span className={`gp-wordcount${r.wordCount > (active.type === "SOP" ? 800 : 500) ? " over" : ""}`}>{r.wordCount} words</span>
              </div>
            </div>
          </div>
          <div className={`gp-verdict gp-verdict-${r.verdict}`}>{r.verdict === "ready" ? <Check s={14} /> : <Bolt />}{r.verdict === "ready" ? "Ready to submit" : "Not yet ready"}</div>
        </div>

        {r.flags && r.flags.length > 0 && (
          <div className="gp-flagbanner">
            <div className="gp-flagbanner-head"><Bolt /> Address these before submitting</div>
            <ul>{r.flags.map((f, i) => <li key={i}>{f}</li>)}</ul>
          </div>
        )}

        {r.lead && <div className="gp-review-lead">{r.lead}</div>}

        {r.rubric.length > 0 && (
          <div className="gp-rubric-card">
            <div className="gp-rubric-head"><h3>Rubric breakdown</h3><span className="gp-rubric-version">{active.type.toLowerCase()}-v{active.version}</span></div>
            <div className="gp-dim-grid">
              {r.rubric.map((d, i) => (
                <div className="gp-dim-row" key={i}>
                  <div className="gp-dim-top"><span>{d.label}</span><span style={{ color: scoreColor(d.score) }}>{d.score}/10</span></div>
                  <div className="gp-dim-track"><div className="gp-dim-fill" style={{ width: `${d.score * 10}%`, background: scoreColor(d.score) }} /></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {r.topFixes.length > 0 && (
          <div className="gp-topfixes-card">
            <h3><Bolt /> Top fixes before submitting</h3>
            {r.topFixes.map((title, i) => {
              const match = r.annotations.find((a) => a.title === title && a.tag === "improve");
              return (
                <div className="gp-topfix" key={i} onClick={() => match && openNote(match.id)}>
                  <span className="gp-num-improve" style={{ width: 22, height: 22, borderRadius: 7, display: "grid", placeItems: "center", fontSize: 10.5, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                  <span>{title}</span>
                  {match && <span className="gp-sev" style={{ marginLeft: "auto", color: sevColor(match.severity), background: `${sevColor(match.severity)}1A` }}>{match.severity}</span>}
                </div>
              );
            })}
          </div>
        )}

        {r.cliches.length > 0 && (
          <div className="gp-clicherow">
            <span className="gp-clicherow-label"><Bolt /> Clichés detected</span>
            {r.cliches.map((c, i) => <span className="gp-cliche-chip" key={i}>{c}</span>)}
          </div>
        )}

        {r.readiness.length > 0 && (
          <div className="gp-readiness-row">
            <span className="gp-readiness-label">Submission readiness</span>
            <div className="gp-check-list">
              {r.readiness.map((item, i) => (
                <div className={`gp-check-item ${item.pass ? "pass" : "fail"}`} key={i}>{item.pass ? <Check /> : <XIco />} {item.label}</div>
              ))}
            </div>
          </div>
        )}

        <div className="gp-issue-filters">
          <div className="gp-chipgroup">
            <button className={`gp-chip${noteFilter === "all" ? " on" : ""}`} onClick={() => setNoteFilter("all")}>All <span className="gp-chip-count">{r.annotations.length}</span></button>
            <button className={`gp-chip${noteFilter === "good" ? " on" : ""}`} onClick={() => setNoteFilter("good")}><Check s={11} /> Strengths <span className="gp-chip-count">{goodCount}</span></button>
            <button className={`gp-chip${noteFilter === "improve" ? " on" : ""}`} onClick={() => setNoteFilter("improve")}><Bolt /> Improve <span className="gp-chip-count">{improveCount}</span></button>
          </div>
        </div>

        <div className="gp-review-split">
          <div className="gp-doc-pane">
            <p>
              {segs.map((seg, i) =>
                seg.ann ? (
                  <span key={i} className={`gp-doc-span ${seg.ann.tag}${activeNote === seg.ann.id ? " active" : ""}`} onClick={() => openNote(seg.ann!.id)}>
                    {seg.text}<sup className="gp-span-num">{r.annotations.findIndex((a) => a.id === seg.ann!.id) + 1}</sup>
                  </span>
                ) : (<span key={i}>{seg.text}</span>)
              )}
            </p>
          </div>

          <aside className="gp-notes-rail">
            {filtered.map((a) => {
              const num = r.annotations.findIndex((x) => x.id === a.id) + 1;
              return (
                <div key={a.id} ref={(el) => { noteRefs.current[a.id] = el; }} className={`gp-note ${a.tag} sev-${a.severity}${activeNote === a.id ? " active" : ""}`} onClick={() => setActiveNote(a.id)}>
                  <div className="gp-note-head">
                    <span className={`gp-note-num ${a.tag === "good" ? "gp-num-good" : "gp-num-improve"}`}>{num}</span>
                    <div className="gp-note-headtext">
                      <span className="gp-note-title">{a.title}</span>
                      <span className="gp-note-tags">
                        {a.tag === "improve" && a.severity !== "none" && (<span className="gp-sev" style={{ color: sevColor(a.severity), background: `${sevColor(a.severity)}1A` }}>{a.severity}</span>)}
                        <span className="gp-cat">{a.category}</span>
                      </span>
                    </div>
                  </div>
                  <div className="gp-note-body">{a.note}</div>
                  {a.tag === "improve" && a.rewrite && (
                    a.rewrite === "__LOCKED__" ? (
                      <button className="gp-rewrite-locked" onClick={() => setShowUpgrade(true)}><Lock /> See suggested rewrite — Pro</button>
                    ) : (
                      <div className="gp-rewrite">
                        <div className="gp-rewrite-label"><Spark s={12} /> Suggested rewrite</div>
                        <p>{a.rewrite}</p>
                        <div className="gp-rewrite-actions"><button onClick={() => navigator.clipboard?.writeText(a.rewrite!)}><CopyIco /> Copy</button></div>
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </aside>
        </div>

        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      </div>
    );
  }

  /* ============ RUNNER ============ */
  if (view === "runner") {
    return (
      <div className="gp-aireview-page">
        <div className="gp-ai-backbar">
          <button className="gp-ai-backbtn" onClick={() => setView("overview")}><Back /> Back to overview</button>
        </div>
        <div className="gp-ai-stage">
          <div className="gp-ai-runner">
            <div className="gp-ai-runhead">
              <span className="gp-statico"><Spark s={20} /></span>
              <div><h2>Run a new review</h2><p>Pick a document and we'll analyse structure, clarity and program fit.</p></div>
            </div>

            <div className="gp-ai-controls">
              <label className="gp-field"><span>Document type</span>
                <select value={docType} onChange={(e) => setDocType(e.target.value as "SOP" | "CV")}>
                  <option value="SOP">Statement of Purpose</option>
                  <option value="CV">Curriculum Vitae</option>
                </select>
              </label>
              <label className="gp-field"><span>Application</span>
                <select value={appId} onChange={(e) => setAppId(e.target.value)}>
                  {applications.length === 0 && <option value="">No applications yet</option>}
                  {applications.map((a) => <option key={a.id} value={a.id}>{a.universityName}</option>)}
                </select>
              </label>
            </div>

            <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={onFile} />
            <div className="gp-ai-drop" onClick={() => fileRef.current?.click()}>
              <UploadIco />
              <span>
                {extracting ? "Reading your file…" : fileName ? (<><b>{fileName}</b>{text ? " · ready" : ""}</>) : (<><b>Drop a file</b> or click to browse · PDF, DOCX up to 10MB</>)}
              </span>
            </div>

            <button type="button" onClick={() => setShowPaste((v) => !v)} style={{ fontSize: 12.5, fontWeight: 600, color: "var(--blue)", alignSelf: "flex-start" }}>
              {showPaste ? "Hide paste box" : "Or paste text instead"}
            </button>
            {showPaste && (
              <textarea
                rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder={`Paste your ${docType} text here…`}
                style={{ fontFamily: "inherit", fontSize: 14, color: "var(--ink)", background: "var(--paper)", border: "1px solid var(--line-2)", borderRadius: 12, padding: "12px 14px", outline: "none", resize: "vertical", lineHeight: 1.6 }}
              />
            )}

            {error && <div style={{ fontSize: 13, color: "#B23B3B", background: "#FAE8E8", padding: "10px 14px", borderRadius: 11 }}>{error}</div>}

            <div className="gp-ai-quotarow">
              <div className="gp-quota-mini">
                {isPro ? <span><b>Pro</b> · unlimited reviews</span> : <span><b>{remaining}</b> of {FREE_DAILY} reviews left today</span>}
              </div>
              <button className="gp-ai-btn" onClick={runReview} disabled={extracting || text.trim().length < 100}>
                <Spark s={16} /> Run AI review
              </button>
            </div>
          </div>
        </div>
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      </div>
    );
  }

  /* ============ OVERVIEW ============ */
  return (
    <div className="gp-aireview-page">
      <div className="gp-pagehead">
        <div>
          <h1 className="gp-pagetitle">AI Review</h1>
          <p className="gp-pagesub">Structured feedback on your SOP and CV — scored, annotated, and ready to act on.</p>
        </div>
        <button className="gp-addbtn" onClick={openRunner}><Plus /> <span>New review</span></button>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          tone="blue"
          icon={<Spark s={26} />}
          heading="No applications to review"
          text="Add an application first, then run AI reviews on its SOP and CV."
          action={
            <Link href="/applications?add=1" className="gp-addbtn">
              <Plus /> <span>Add application</span>
            </Link>
          }
        />
      ) : (
        <div className="gp-ai-grid">
          {applications.map((a) => {
            const ov = overviewByApp[a.id];
            const hasAny = ov && (ov.SOP || ov.CV);
            return (
              <div className="gp-ai-card" key={a.id}>
                <div className="gp-ai-card-top">
                  <span className="gp-ai-card-flag">{flagFor(a.country)}</span>
                  <span className="gp-ai-card-uni">{a.universityName}</span>
                </div>
                {!hasAny && (
                  <div className="gp-ai-doctype-row empty">
                    <div className="gp-ai-doctype-left"><span className="gp-ai-doctype-empty-text">No reviews yet</span></div>
                    <button className="gp-ai-doctype-pill" style={{ cursor: "pointer", border: "none" }} onClick={() => { setAppId(a.id); openRunner(); }}>Run one</button>
                  </div>
                )}
                {(["SOP", "CV"] as const).map((t) => {
                  const rec = ov?.[t];
                  if (!rec || rec.overallScore == null) return null;
                  const count = ov ? ov[`${t}count` as "SOPcount" | "CVcount"] : 0;
                  return (
                    <div className="gp-ai-doctype-row" key={t} onClick={() => {
                      if (rec.result) {
                        setActive({ result: rec.result as ReviewResult, version: rec.version, type: t, appId: a.id, docText: reconstructText(rec.result as ReviewResult) });
                        setActiveNote(null); setNoteFilter("all"); setView("review");
                      }
                    }}>
                      <div className="gp-ai-doctype-left">
                        <span className="gp-ai-doctype-pill">{t}</span>
                        <span className="gp-ai-doctype-date">{fmtDate(rec.createdAt)}</span>
                      </div>
                      <div className="gp-ai-doctype-right">
                        {count > 1 && <span className="gp-ai-versions">+{count - 1} earlier</span>}
                        <span className="gp-ai-mini-score" style={{ color: scoreColor(rec.overallScore) }}>{rec.overallScore}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      {showComingSoon && <ComingSoonModal onClose={() => setShowComingSoon(false)} />}
    </div>
  );
}

function reconstructText(result: ReviewResult): string {
  return result.annotations.map((a) => a.span).filter(Boolean).join("\n\n");
}

function ComingSoonModal({ onClose }: { onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(14,19,32,.5)", display: "grid", placeItems: "center", zIndex: 300, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--paper)", borderRadius: 20, padding: 28, maxWidth: 380, width: "100%", textAlign: "center", boxShadow: "0 24px 60px rgba(16,22,40,.3)" }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "#EAF1FF", color: "var(--blue-deep)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Spark s={22} /></div>
        <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 8, color: "var(--ink)" }}>AI Review is coming soon</h2>
        <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6, marginBottom: 20 }}>We&rsquo;re putting the finishing touches on AI-powered feedback for your SOP and CV. Check back shortly.</p>
        <button onClick={onClose} style={{ display: "block", width: "100%", fontSize: 14, fontWeight: 700, color: "#fff", background: "linear-gradient(180deg,var(--blue-hi),var(--blue))", padding: "12px 16px", borderRadius: 999 }}>Got it</button>
      </div>
    </div>
  );
}

function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(14,19,32,.5)", display: "grid", placeItems: "center", zIndex: 300, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--paper)", borderRadius: 20, padding: 28, maxWidth: 380, width: "100%", textAlign: "center", boxShadow: "0 24px 60px rgba(16,22,40,.3)" }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "#EAF1FF", color: "var(--blue-deep)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Spark s={22} /></div>
        <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 8, color: "var(--ink)" }}>Upgrade to Pro</h2>
        <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6, marginBottom: 20 }}>Unlock unlimited daily reviews, inline AI rewrites for every fix, and version comparison across drafts.</p>
        <a href="/settings" style={{ display: "block", width: "100%", fontSize: 14, fontWeight: 700, color: "#fff", background: "linear-gradient(180deg,var(--blue-hi),var(--blue))", padding: "12px 16px", borderRadius: 999, textDecoration: "none", marginBottom: 10 }}>Upgrade to Pro</a>
        <button onClick={onClose} style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>Maybe later</button>
      </div>
    </div>
  );
}
