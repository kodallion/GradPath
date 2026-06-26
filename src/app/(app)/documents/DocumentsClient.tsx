"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "./documents.css";
import type { Application, Document, DocumentType } from "@/types";
import { flagFor } from "@/components/appShared";

type AppWithDocs = Omit<Application, "tasks" | "documents"> & {
  documents: Document[];
};

const CORE_TYPES: { type: DocumentType; full: string; iconBg: string; iconColor: string }[] = [
  { type: "SOP", full: "Statement of Purpose", iconBg: "#EAF1FF", iconColor: "#2B5BE0" },
  { type: "CV", full: "Curriculum Vitae", iconBg: "#EEEBFB", iconColor: "#6A4FD0" },
  { type: "TRANSCRIPT", full: "Academic Transcript", iconBg: "#E2F2E9", iconColor: "#1F7A4D" },
];

const ACCEPT = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function fmtSize(bytes?: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FileIcon = ({ s = 20 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6" /><path d="M9 17h6" /></svg>
);
const UploadIcon = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></svg>
);
const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
);
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
);
const SparkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" /><path d="M5.6 5.6l2.8 2.8" /><path d="M15.6 15.6l2.8 2.8" /><path d="M18.4 5.6l-2.8 2.8" /><path d="M8.4 15.6l-2.8 2.8" /></svg>
);
const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1.6" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1.6" fill="currentColor" stroke="none" /></svg>
);
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
);
const FolderIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z" /></svg>
);

export default function DocumentsClient({ applications: initial }: { applications: AppWithDocs[] }) {
  const router = useRouter();
  const [apps, setApps] = useState<AppWithDocs[]>(initial);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null); // key currently uploading

  // hidden file input: we set its target (appId+type) just before clicking
  const fileRef = useRef<HTMLInputElement | null>(null);
  const targetRef = useRef<{ appId: string; type: DocumentType } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onClick = () => setOpenMenu(null);
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const coreReady = (app: AppWithDocs) =>
    CORE_TYPES.filter((c) => app.documents.some((d) => d.type === c.type)).length;
  const totalCoreReady = apps.reduce((n, a) => n + coreReady(a), 0);
  const totalCoreMissing = apps.length * CORE_TYPES.length - totalCoreReady;
  const totalOther = apps.reduce((n, a) => n + a.documents.filter((d) => d.type === "OTHER").length, 0);

  function pickFile(appId: string, type: DocumentType) {
    targetRef.current = { appId, type };
    fileRef.current?.click();
  }

  async function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const target = targetRef.current;
    e.target.value = ""; // allow re-picking same file
    if (!file || !target) return;

    const key = `${target.appId}-${target.type}`;
    setBusy(key);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("applicationId", target.appId);
      fd.append("type", target.type);
      const res = await fetch("/api/documents", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.message || "Upload failed. Please try again.");
        return;
      }
      // Insert or replace in state
      setApps((prev) =>
        prev.map((a) => {
          if (a.id !== target.appId) return a;
          const isCore = target.type !== "OTHER";
          let docs = a.documents;
          if (isCore) docs = docs.filter((d) => d.type !== target.type);
          return { ...a, documents: [...docs, data as Document] };
        })
      );
      setToast("Document uploaded.");
    } catch {
      setToast("Upload failed. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  function download(docId: string) {
    window.open(`/api/documents/${docId}/download`, "_blank");
  }

  function view(docId: string) {
    window.open(`/api/documents/${docId}/download?inline=1`, "_blank");
  }

  async function remove(appId: string, docId: string) {
    setApps((prev) =>
      prev.map((a) =>
        a.id === appId ? { ...a, documents: a.documents.filter((d) => d.id !== docId) } : a
      )
    );
    setOpenMenu(null);
    try {
      await fetch(`/api/documents/${docId}`, { method: "DELETE" });
    } catch {
      setToast("Could not delete. Please refresh.");
    }
  }

  if (apps.length === 0) {
    return (
      <div className="gp-documents-page">
        <div className="gp-pagehead">
          <div>
            <h1 className="gp-pagetitle">Documents</h1>
            <p className="gp-pagesub">No applications yet</p>
          </div>
        </div>
        <div className="gp-alldone">
          <div className="gp-empty-ico" style={{ color: "var(--muted)" }}>
            <FolderIcon />
          </div>
          <h2>No documents to manage</h2>
          <p>Add an application first, then track its documents here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gp-documents-page">
      <input ref={fileRef} type="file" accept={ACCEPT} onChange={onFileChosen} style={{ display: "none" }} />

      <div className="gp-pagehead">
        <div>
          <h1 className="gp-pagetitle">Documents</h1>
          <p className="gp-pagesub">
            {totalCoreReady} core ready · {totalCoreMissing} missing
            {totalOther > 0 ? ` · ${totalOther} other` : ""} across {apps.length}{" "}
            {apps.length === 1 ? "application" : "applications"}
          </p>
        </div>
      </div>

      <div className="gp-docgroups">
        {apps.map((app) => {
          const others = app.documents.filter((d) => d.type === "OTHER");
          return (
            <section className="gp-panel" key={app.id}>
              <div className="gp-panelhead">
                <h2>
                  <span className="gp-tflag" style={{ marginRight: 8 }}>
                    {flagFor(app.country)}
                  </span>
                  {app.universityName}
                </h2>
                <span className="gp-count">
                  {coreReady(app)}/{CORE_TYPES.length} core ready
                </span>
              </div>

              <div className="gp-docgrid">
                {CORE_TYPES.map((c) => {
                  const doc = app.documents.find((d) => d.type === c.type);
                  const present = !!doc;
                  const key = `${app.id}-${c.type}`;
                  const uploading = busy === key;
                  return (
                    <div className={`gp-doccard${present ? "" : " missing"}`} key={c.type}>
                      <div className="gp-doc-cardhead">
                        <div className="gp-doc-icon" style={{ background: c.iconBg, color: c.iconColor }}>
                          <FileIcon />
                        </div>
                        {present && (
                          <div className="gp-docmenu">
                            <button
                              className="gp-doc-iconbtn"
                              title="More"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenu(openMenu === key ? null : key);
                              }}
                            >
                              <DotsIcon />
                            </button>
                            <div className={`gp-docmenu-dd${openMenu === key ? " open" : ""}`}>
                              <button onClick={(e) => { e.stopPropagation(); view(doc!.id); setOpenMenu(null); }}>
                                <EyeIcon /> View
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); download(doc!.id); setOpenMenu(null); }}>
                                <DownloadIcon /> Download
                              </button>
                              <button className="danger" onClick={(e) => { e.stopPropagation(); remove(app.id, doc!.id); }}>
                                <TrashIcon /> Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="gp-doc-info">
                        <div className="gp-doc-type">{c.type === "TRANSCRIPT" ? "Transcript" : c.type}</div>
                        <div className="gp-doc-full">{c.full}</div>
                      </div>
                      <div className="gp-doc-foot">
                        {uploading ? (
                          <span className="gp-uploading">Uploading…</span>
                        ) : present ? (
                          <>
                            <span className="gp-doc-ready">
                              <span className="gp-ok">●</span> <span>{doc!.fileName}</span>
                            </span>
                            {(c.type === "SOP" || c.type === "CV") && (
                              <span className="gp-doc-actions">
                                <button className="gp-doc-ai" onClick={() => router.push("/ai-review")}>
                                  <SparkIcon /> Review
                                </button>
                              </span>
                            )}
                          </>
                        ) : (
                          <button className="gp-doc-upload" onClick={() => pickFile(app.id, c.type)}>
                            <UploadIcon /> Upload
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="gp-otherlane">
                <div className="gp-otherlane-head">
                  <div className="gp-otherlane-title">
                    <span className="gp-doc-icon" style={{ background: "#EDF0F6", color: "#5A6B8C" }}>
                      <FileIcon s={16} />
                    </span>
                    Other documents <span className="gp-otherlane-count">{others.length}</span>
                  </div>
                  <button
                    className="gp-other-add"
                    disabled={busy === `${app.id}-OTHER`}
                    onClick={() => pickFile(app.id, "OTHER")}
                  >
                    {busy === `${app.id}-OTHER` ? "Uploading…" : (<><PlusIcon /> Add</>)}
                  </button>
                </div>
                {others.length === 0 ? (
                  <div className="gp-other-empty">
                    No other documents yet. Add language certificates, funding letters, portfolios, and more.
                  </div>
                ) : (
                  <div className="gp-otherfiles">
                    {others.map((d) => (
                      <div className="gp-otherfile" key={d.id}>
                        <span className="gp-otherfile-ico"><FileIcon s={16} /></span>
                        <span className="gp-otherfile-name">{d.fileName}</span>
                        <span className="gp-otherfile-size">{fmtSize(d.fileSize)}</span>
                        <button className="gp-otherfile-act" title="Download" onClick={() => download(d.id)}>
                          <DownloadIcon />
                        </button>
                        <button className="gp-otherfile-act" title="Delete" onClick={() => remove(app.id, d.id)}>
                          <TrashIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {toast && <div className="gp-toast">{toast}</div>}
    </div>
  );
}
