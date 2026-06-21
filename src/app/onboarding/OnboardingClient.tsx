"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Loader2,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import "./onboarding.css";

const FIELD_SUGGESTIONS = [
  "Environmental Science",
  "Computer Science",
  "Public Health",
  "Economics",
  "Engineering",
  "Data Science",
  "Law",
  "Architecture",
];

const DEGREES = [
  { val: "MASTERS", label: "Master's", desc: "MSc / MA — taught or research" },
  { val: "PHD", label: "Doctorate", desc: "PhD — research degree" },
  { val: "MBA", label: "MBA", desc: "Business administration" },
  { val: "OTHER", label: "Other", desc: "Diploma, certificate, etc." },
] as const;

const REGIONS = [
  { id: "uk", flag: "🇬🇧", label: "UK" },
  { id: "usa", flag: "🇺🇸", label: "USA" },
  { id: "canada", flag: "🇨🇦", label: "Canada" },
  { id: "germany", flag: "🇩🇪", label: "Germany" },
  { id: "netherlands", flag: "🇳🇱", label: "Netherlands" },
  { id: "france", flag: "🇫🇷", label: "France" },
  { id: "australia", flag: "🇦🇺", label: "Australia" },
];

const PROCESS_STAGES = [
  { val: "JUST_STARTING", label: "Just starting", desc: "Haven't researched schools yet" },
  { val: "RESEARCHING", label: "Researching", desc: "Have a shortlist, no applications started" },
  { val: "IN_PROGRESS", label: "In progress", desc: "Already working on applications" },
  { val: "ALMOST_DONE", label: "Almost done", desc: "Most applications submitted" },
] as const;

const TOTAL_STEPS = 6;
const PHASES = [
  { label: "Your goal", desc: "Fields & degree levels", steps: [1, 2] },
  { label: "Your timeline", desc: "Where & how far along", steps: [3, 4] },
  { label: "Your shortlist", desc: "First school you're tracking", steps: [5, 6] },
];

function phaseForStep(step: number) {
  return PHASES.findIndex((p) => p.steps.includes(step));
}

export default function OnboardingClient() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fieldInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.firstName || "",
    fieldsOfInterest: [] as string[],
    degreeType: [] as string[],
    regions: [] as string[],
    customRegions: [] as string[],
    processStage: "",
    universityName: "",
    program: "",
    deadline: "",
    applicationCountry: "",
  });
  const [fieldQuery, setFieldQuery] = useState("");
  const [showOtherRegion, setShowOtherRegion] = useState(false);
  const [customRegionInput, setCustomRegionInput] = useState("");

  const updateField = (key: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const addFieldOfInterest = (value: string) => {
    const v = value.trim();
    if (!v) return;
    if (!formData.fieldsOfInterest.some((f) => f.toLowerCase() === v.toLowerCase())) {
      setFormData((prev) => ({ ...prev, fieldsOfInterest: [...prev.fieldsOfInterest, v] }));
    }
    setFieldQuery("");
    fieldInputRef.current?.focus();
  };
  const removeFieldOfInterest = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      fieldsOfInterest: prev.fieldsOfInterest.filter((f) => f !== value),
    }));
  };

  const toggleDegree = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      degreeType: prev.degreeType.includes(val)
        ? prev.degreeType.filter((d) => d !== val)
        : [...prev.degreeType, val],
    }));
  };

  const toggleRegion = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      regions: prev.regions.includes(id)
        ? prev.regions.filter((r) => r !== id)
        : [...prev.regions, id],
    }));
  };
  const addCustomRegion = (value: string) => {
    const v = value.trim();
    if (!v) return;
    if (!formData.customRegions.some((r) => r.toLowerCase() === v.toLowerCase())) {
      setFormData((prev) => ({ ...prev, customRegions: [...prev.customRegions, v] }));
    }
    setCustomRegionInput("");
  };
  const removeCustomRegion = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      customRegions: prev.customRegions.filter((r) => r !== value),
    }));
  };

  const handleComplete = async (skipApp = false) => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          fieldsOfInterest: formData.fieldsOfInterest,
          degreeType: formData.degreeType,
          regions: [...formData.regions, ...formData.customRegions],
          processStage: formData.processStage,
          firstApplication: skipApp
            ? null
            : {
                universityName: formData.universityName,
                program: formData.program,
                deadline: formData.deadline,
                country: formData.applicationCountry,
              },
        }),
      });
      if (res.ok) {
        setShowSuccess(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.name.trim().length > 0;
    if (step === 2) return formData.fieldsOfInterest.length > 0;
    if (step === 3) return formData.degreeType.length > 0;
    if (step === 4) return formData.regions.length > 0 || formData.customRegions.length > 0;
    if (step === 5) return !!formData.processStage;
    if (step === 6) return true;
    return true;
  };

  const totalRegions = formData.regions.length + formData.customRegions.length;
  const degreeLabel = (val: string) => DEGREES.find((d) => d.val === val)?.label ?? val;
  const regionLabel = (id: string) => REGIONS.find((r) => r.id === id)?.label ?? id;
  const selectedCountryOptions = [
    ...formData.regions.map((id) => regionLabel(id)),
    ...formData.customRegions,
  ];

  // Default the application-country dropdown to the first selected region
  // once the user reaches step 6, without overriding a deliberate choice.
  useEffect(() => {
    if (step === 6 && !formData.applicationCountry && selectedCountryOptions.length > 0) {
      setFormData((prev) => ({ ...prev, applicationCountry: selectedCountryOptions[0] }));
    }
  }, [step]);

  const filteredSuggestions = FIELD_SUGGESTIONS.filter(
    (s) =>
      !formData.fieldsOfInterest.includes(s) &&
      s.toLowerCase().includes(fieldQuery.trim().toLowerCase())
  );
  const typedIsNew =
    fieldQuery.trim().length > 0 &&
    !FIELD_SUGGESTIONS.some((s) => s.toLowerCase() === fieldQuery.trim().toLowerCase()) &&
    !formData.fieldsOfInterest.some((f) => f.toLowerCase() === fieldQuery.trim().toLowerCase());

  if (showSuccess) {
    return (
      <div className="gp-onboard">
        <aside className="gp-brand">
          <div className="gp-logo">
            <span className="mark">
              <GraduationCap className="w-[19px] h-[19px]" color="#fff" strokeWidth={2} />
            </span>
            GradPath
          </div>
          <h1>Let&rsquo;s set up your workspace</h1>
          <div className="gp-phases">
            {PHASES.map((p, i) => (
              <div key={p.label} className="gp-phase done">
                <span className="dot">
                  <Check className="w-3 h-3" />
                </span>
                <span className="ptxt">
                  <b>{p.label}</b>
                  <span>{p.desc}</span>
                </span>
              </div>
            ))}
          </div>
          <p className="foot">Takes about a minute. You can change any of this later in Settings.</p>
        </aside>

        <main className="gp-main">
          <div className="inner" style={{ justifyContent: "center" }}>
            <section className="gp-success show">
              <div className="gp-confetti" />
              <div className="gp-success-inner">
                <div className="gp-seal-wrap">
                  <div className="seal">
                    <Check className="w-[30px] h-[30px]" color="#fff" strokeWidth={2.6} />
                  </div>
                </div>
                <h2>You&rsquo;re all set{formData.name ? `, ${formData.name}` : ""}</h2>
                <p className="sub">
                  Your workspace is ready. Here&rsquo;s what we&rsquo;ve got — we&rsquo;ll line up deadlines and tasks to match.
                </p>

                <div className="gp-recap-card">
                  <div className="gp-recap-head">
                    <span>Your setup</span>
                  </div>
                  <div className="gp-recap-rows">
                    <div className="gp-recap-row">
                      <span className="k">Fields</span>
                      <span className="v">
                        {formData.fieldsOfInterest.length === 1
                          ? formData.fieldsOfInterest[0]
                          : `${formData.fieldsOfInterest.length} fields`}
                      </span>
                    </div>
                    <div className="gp-recap-row">
                      <span className="k">Degrees</span>
                      <span className="v">
                        {formData.degreeType.length === 1
                          ? degreeLabel(formData.degreeType[0])
                          : `${formData.degreeType.length} degrees`}
                      </span>
                    </div>
                    <div className="gp-recap-row">
                      <span className="k">Countries</span>
                      <span className="v">
                        {totalRegions === 1
                          ? formData.regions[0]
                            ? regionLabel(formData.regions[0])
                            : formData.customRegions[0]
                          : `${totalRegions} selected`}
                      </span>
                    </div>
                    <div className="gp-recap-row">
                      <span className="k">Stage</span>
                      <span className="v">
                        {PROCESS_STAGES.find((p) => p.val === formData.processStage)?.label ?? "—"}
                      </span>
                    </div>
                    {formData.universityName && (
                      <div className="gp-recap-row">
                        <span className="k">First school</span>
                        <span className="v">{formData.universityName}</span>
                      </div>
                    )}
                    {formData.applicationCountry && (
                      <div className="gp-recap-row">
                        <span className="k">School country</span>
                        <span className="v">{formData.applicationCountry}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="gp-next">
                  <p>
                    <b>Next:</b> we&rsquo;ll surface deadlines for your selected programs and add starter tasks to your dashboard.
                  </p>
                </div>

                <button className="gp-btn gp-btn-primary go" onClick={() => router.push("/dashboard")}>
                  Go to dashboard
                </button>
                <button className="edit-link" onClick={() => setShowSuccess(false)}>
                  Edit your answers
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="gp-onboard">
      {/* LEFT BRAND PANEL */}
      <aside className="gp-brand">
        <div className="gp-logo">
          <span className="mark">
            <GraduationCap className="w-[19px] h-[19px]" color="#fff" strokeWidth={2} />
          </span>
          GradPath
        </div>
        <h1>Let&rsquo;s set up your workspace</h1>
        <div className="gp-phases">
          {PHASES.map((p, i) => {
            const current = phaseForStep(step);
            return (
              <div
                key={p.label}
                className={cn("gp-phase", i === current && "active", i < current && "done")}
              >
                <span className="dot">{i < current ? <Check className="w-3 h-3" /> : i + 1}</span>
                <span className="ptxt">
                  <b>{p.label}</b>
                  <span>{p.desc}</span>
                </span>
              </div>
            );
          })}
        </div>
        <p className="foot">Takes about a minute. You can change any of this later in Settings.</p>
      </aside>

      {/* RIGHT / MAIN */}
      <main className="gp-main">
        <div className="inner">
          <div className="gp-progress">
            <div className="meta">
              <span>Step {step} of {TOTAL_STEPS}</span>
              <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
            </div>
            <div className="track">
              <div className="fill" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
            </div>
          </div>

          {/* STEP 1 — Name */}
          {step === 1 && (
            <section className="gp-step show">
              <p className="gp-eyebrow">Your goal</p>
              <h2>What should we call you?</h2>
              <p className="sub">Let&rsquo;s get you set up in under a minute.</p>
              <input
                className="gp-input"
                placeholder="Your first name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                autoFocus
              />
            </section>
          )}

          {/* STEP 2 — Fields of interest */}
          {step === 2 && (
            <section className="gp-step show">
              <p className="gp-eyebrow">Your goal</p>
              <h2>What fields are you applying in?</h2>
              <p className="sub">Search or pick from the list — add as many as you like.</p>
              <input
                ref={fieldInputRef}
                className="gp-input"
                placeholder="Search a field, or type your own…"
                value={fieldQuery}
                onChange={(e) => setFieldQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFieldOfInterest(fieldQuery);
                  }
                }}
              />
              {formData.fieldsOfInterest.length > 0 && (
                <div className="gp-field-pills">
                  {formData.fieldsOfInterest.map((f) => (
                    <span className="gp-pill" key={f}>
                      {f}
                      <button type="button" aria-label={`Remove ${f}`} onClick={() => removeFieldOfInterest(f)}>
                        <X className="w-[11px] h-[11px]" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="gp-help">Suggestions</p>
              <div className="gp-chips">
                {filteredSuggestions.map((s) => (
                  <button key={s} type="button" className="gp-chip" onClick={() => addFieldOfInterest(s)}>
                    {s}
                  </button>
                ))}
                {typedIsNew && (
                  <button type="button" className="gp-chip add" onClick={() => addFieldOfInterest(fieldQuery)}>
                    <Plus className="w-[14px] h-[14px]" />
                    Add &ldquo;{fieldQuery.trim()}&rdquo;
                  </button>
                )}
              </div>
            </section>
          )}

          {/* STEP 3 — Degree type(s) */}
          {step === 3 && (
            <section className="gp-step show">
              <p className="gp-eyebrow">Your goal</p>
              <h2>Which degrees are you after?</h2>
              <p className="sub">Pick every level you&rsquo;re applying for.</p>
              <div className="gp-cards cols2">
                {DEGREES.map((d) => {
                  const sel = formData.degreeType.includes(d.val);
                  return (
                    <button
                      key={d.val}
                      type="button"
                      className={cn("gp-card", sel && "sel")}
                      onClick={() => toggleDegree(d.val)}
                    >
                      <span className="tick">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>
                        <b>{d.label}</b>
                        <span>{d.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* STEP 4 — Regions */}
          {step === 4 && (
            <section className="gp-step show">
              <p className="gp-eyebrow">Your timeline</p>
              <h2>Where are you applying?</h2>
              <p className="sub">Select all that apply — you can fine-tune per school later.</p>
              <div className="gp-countries">
                {REGIONS.map((r) => {
                  const sel = formData.regions.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      className={cn("gp-country", sel && "sel")}
                      onClick={() => toggleRegion(r.id)}
                    >
                      <span className="flag">{r.flag}</span>
                      <b>{r.label}</b>
                      <span className="cb">
                        <Check className="w-[11px] h-[11px]" />
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  className={cn("gp-country gp-country-other", showOtherRegion && "sel")}
                  onClick={() => {
                    setShowOtherRegion((v) => !v);
                    if (showOtherRegion) {
                      setFormData((prev) => ({ ...prev, customRegions: [] }));
                    }
                  }}
                >
                  <span className="flag">🌍</span>
                  <b>Other — not listed</b>
                  <span className="cb">
                    <Check className="w-[11px] h-[11px]" />
                  </span>
                </button>
              </div>
              {showOtherRegion && (
                <div className="gp-other-wrap">
                  <input
                    className="gp-input"
                    placeholder="Type a country, then press Enter…"
                    value={customRegionInput}
                    onChange={(e) => setCustomRegionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomRegion(customRegionInput);
                      }
                    }}
                    autoFocus
                  />
                  {formData.customRegions.length > 0 && (
                    <div className="gp-field-pills">
                      {formData.customRegions.map((r) => (
                        <span className="gp-pill" key={r}>
                          {r}
                          <button type="button" aria-label={`Remove ${r}`} onClick={() => removeCustomRegion(r)}>
                            <X className="w-[11px] h-[11px]" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* STEP 5 — Process stage */}
          {step === 5 && (
            <section className="gp-step show">
              <p className="gp-eyebrow">Your timeline</p>
              <h2>Where are you in the process?</h2>
              <p className="sub">We&rsquo;ll set up your dashboard to match.</p>
              <div className="gp-cards" style={{ gap: "10px" }}>
                {PROCESS_STAGES.map((opt) => {
                  const sel = formData.processStage === opt.val;
                  return (
                    <button
                      key={opt.val}
                      type="button"
                      className={cn("gp-card", sel && "sel")}
                      style={{ width: "100%" }}
                      onClick={() => updateField("processStage", opt.val)}
                    >
                      <span className="tick">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>
                        <b>{opt.label}</b>
                        <span>{opt.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* STEP 6 — First application */}
          {step === 6 && (
            <section className="gp-step show">
              <p className="gp-eyebrow">Your shortlist</p>
              <h2>Add your first school</h2>
              <p className="sub">Get your dashboard started — you can add more anytime.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <p className="gp-field-label">University name</p>
                  <input
                    className="gp-input"
                    placeholder="e.g. University of Edinburgh"
                    value={formData.universityName}
                    onChange={(e) => updateField("universityName", e.target.value)}
                  />
                </div>
                <div>
                  <p className="gp-field-label">Program / course</p>
                  <input
                    className="gp-input"
                    placeholder="e.g. MSc Computer Science"
                    value={formData.program}
                    onChange={(e) => updateField("program", e.target.value)}
                  />
                </div>
                <div>
                  <p className="gp-field-label">Country</p>
                  <select
                    className="gp-input"
                    value={formData.applicationCountry}
                    onChange={(e) => updateField("applicationCountry", e.target.value)}
                  >
                    {selectedCountryOptions.length === 0 && (
                      <option value="">Select a country…</option>
                    )}
                    {selectedCountryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="gp-field-label">Application deadline</p>
                  <input
                    type="date"
                    className="gp-input"
                    value={formData.deadline}
                    onChange={(e) => updateField("deadline", e.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleComplete(false)}
                disabled={loading || !formData.universityName || !formData.program || !formData.deadline || !formData.applicationCountry}
                className="gp-btn gp-btn-primary"
                style={{ width: "100%", marginTop: "22px", display: "flex", justifyContent: "center", gap: "8px" }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Go to my dashboard
              </button>
              <button
                type="button"
                onClick={() => handleComplete(true)}
                className="edit-link"
                style={{ width: "100%", marginTop: "14px" }}
              >
                I&rsquo;ll add schools later
              </button>
            </section>
          )}
        </div>

        {/* NAV */}
        {step < 6 && (
          <div className="gp-nav">
            <button
              type="button"
              className="gp-btn gp-btn-ghost"
              style={{ visibility: step === 1 ? "hidden" : "visible" }}
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft className="w-4 h-4" style={{ marginRight: 6 }} />
              Back
            </button>
            <span className="spacer" />
            <button type="button" className="gp-btn gp-btn-text" onClick={() => setStep((s) => s + 1)}>
              Skip
            </button>
            <button
              type="button"
              className="gp-btn gp-btn-primary"
              disabled={!canProceed()}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
              <ArrowRight className="w-4 h-4" style={{ marginLeft: 6 }} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
