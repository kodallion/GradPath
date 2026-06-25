"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./documents.css";
import type { Application, Document, DocumentType } from "@/types";
import { flagFor } from "@/components/appShared";

type AppWithDocs = Omit<Application, "tasks" | "documents"> & {
  documents: Document[];
};

const DOC_TYPES: { type: DocumentType; full: string; iconBg: string; iconColor: string }[] = [
  { type: "SOP", full: "Statement of Purpose", iconBg: "#EAF1FF", iconColor: "#2B5BE0" },
  { type: "CV", full: "Curriculum Vitae", iconBg: "#EEEBFB", iconColor: "#6A4FD0" },
  { type: "TRANSCRIPT", full: "Academic Transcript", iconBg: "#E2F2E9", iconColor: "#1F7A4D" },
  { type: "OTHER", full: "Other document", iconBg: "#EDF0F6", iconColor: "#5A6B8C" },
];

const FileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6" /><path d="M9 17h6" /></svg>
);
const UploadIcon = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></svg>
);
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></svg>
);
const SparkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" /><path d="M5.6 5.6l2.8 2.8" /><path d="M15.6 15.6l2.8 2.8" /><path d="M18.4 5.6l-2.8 2.8" /><path d="M8.4 15.6l-2.8 2.8" /></svg>
);
const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1.6" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1.6" fill="currentColor" stroke="none" /></svg>
);
const FolderIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z" /></svg>
);

export default function DocumentsClient({ applications }: { applications: AppWithDocs[] }) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // counts
  const totalUploaded = applications.reduce(
    (n, a) => n + DOC_TYPES.filter((dt) => a.documents.some((d) => d.type === dt.type)).length,
    0
  );
  const totalSlots = applications.length * DOC_TYPES.length;
  const totalMissing = totalSlots - totalUploaded;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onClick = () => setOpenMenu(null);
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function comingSoon(action: string) {
    setToast(`${action} will be available once file storage is live.`);
  }

  if (applications.length === 0) {
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
      <div className="gp-pagehead">
        <div>
          <h1 className="gp-pagetitle">Documents</h1>
          <p className="gp-pagesub">
            {totalUploaded} uploaded · {totalMissing} missing across {applications.length}{" "}
            {applications.length === 1 ? "application" : "applications"}
          </p>
        </div>
        <button className="gp-addbtn" onClick={() => comingSoon("Document upload")}>
          <UploadIcon s={16} /> <span>Upload document</span>
        </button>
      </div>

      <div className="gp-docgroups">
        {applications.map((app) => {
          const ready = DOC_TYPES.filter((dt) => app.documents.some((d) => d.type === dt.type)).length;
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
                  {ready}/{DOC_TYPES.length} ready
                </span>
              </div>
              <div className="gp-docgrid">
                {DOC_TYPES.map((dt) => {
                  const doc = app.documents.find((d) => d.type === dt.type);
                  const menuKey = `${app.id}-${dt.type}`;
                  const present = !!doc;
                  return (
                    <div className={`gp-doccard${present ? "" : " missing"}`} key={dt.type}>
                      <div className="gp-doc-cardhead">
                        <div
                          className="gp-doc-icon"
                          style={{ background: dt.iconBg, color: dt.iconColor }}
                        >
                          <FileIcon />
                        </div>
                        {present && (
                          <div className="gp-docmenu">
                            <button
                              className="gp-doc-iconbtn"
                              title="More"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenu(openMenu === menuKey ? null : menuKey);
                              }}
                            >
                              <DotsIcon />
                            </button>
                            <div className={`gp-docmenu-dd${openMenu === menuKey ? " open" : ""}`}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  comingSoon("Download");
                                  setOpenMenu(null);
                                }}
                              >
                                <DownloadIcon /> Download
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  comingSoon("Replace file");
                                  setOpenMenu(null);
                                }}
                              >
                                <UploadIcon /> Replace file
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="gp-doc-info">
                        <div className="gp-doc-type">{dt.type}</div>
                        <div className="gp-doc-full">{dt.full}</div>
                      </div>
                      <div className="gp-doc-foot">
                        {present ? (
                          <>
                            <span className="gp-doc-ready">
                              <span className="gp-ok">●</span>{" "}
                              <span>{doc!.fileName}</span>
                            </span>
                            {(dt.type === "SOP" || dt.type === "CV") && (
                              <span className="gp-doc-actions">
                                <button
                                  className="gp-doc-ai"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push("/ai-review");
                                  }}
                                >
                                  <SparkIcon /> Review
                                </button>
                              </span>
                            )}
                          </>
                        ) : (
                          <button
                            className="gp-doc-upload"
                            onClick={(e) => {
                              e.stopPropagation();
                              comingSoon("Document upload");
                            }}
                          >
                            <UploadIcon /> Upload
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--ink)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 500,
            padding: "11px 18px",
            borderRadius: 12,
            boxShadow: "0 12px 32px rgba(16,22,40,.24)",
            zIndex: 200,
            maxWidth: "90vw",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

