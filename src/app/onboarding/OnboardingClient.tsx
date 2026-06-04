"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { GraduationCap, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const REGIONS = [
  { id: "uk", label: "🇬🇧 UK" },
  { id: "usa", label: "🇺🇸 USA" },
  { id: "canada", label: "🇨🇦 Canada" },
  { id: "germany", label: "🇩🇪 Germany" },
  { id: "netherlands", label: "🇳🇱 Netherlands" },
  { id: "france", label: "🇫🇷 France" },
  { id: "australia", label: "🇦🇺 Australia" },
  { id: "other", label: "🌍 Other" },
];

const TOTAL_STEPS = 5;

export default function OnboardingClient() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.firstName || "",
    schoolCountRange: "",
    intakeCycle: "",
    degreeType: "",
    regions: [] as string[],
    processStage: "",
    // First application
    universityName: "",
    program: "",
    deadline: "",
  });

  const updateField = (key: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleRegion = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      regions: prev.regions.includes(id)
        ? prev.regions.filter((r) => r !== id)
        : [...prev.regions, id],
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
          schoolCountRange: formData.schoolCountRange,
          intakeCycle: formData.intakeCycle,
          degreeType: formData.degreeType,
          regions: formData.regions,
          processStage: formData.processStage,
          firstApplication: skipApp ? null : {
            universityName: formData.universityName,
            program: formData.program,
            deadline: formData.deadline,
          },
        }),
      });
      if (res.ok) router.push("/dashboard");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.name.trim().length > 0;
    if (step === 2) return formData.schoolCountRange && formData.intakeCycle && formData.degreeType;
    if (step === 3) return formData.regions.length > 0;
    if (step === 4) return formData.processStage;
    if (step === 5) return true;
    return true;
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-[#1B2B5E] rounded-lg flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-[#1B2B5E] text-lg">GradPath</span>
      </div>

      {/* Progress bar */}
      <div className="px-6">
        <div className="max-w-lg mx-auto">
          <div className="flex gap-1.5 mb-8">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-300",
                  i + 1 <= step ? "bg-[#F5A623]" : "bg-gray-200"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-start justify-center px-6 pb-12">
        <div className="w-full max-w-lg">

          {/* Step 1 — Name */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-2">Step 1 of 5</p>
                <h2 className="text-3xl font-bold text-[#1B2B5E] mb-2">Welcome to GradPath</h2>
                <p className="text-[#6B7280]">Let's get you set up in under 2 minutes.</p>
              </div>
              <div>
                <label className="label">What should we call you?</label>
                <input
                  className="input"
                  placeholder="Your first name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2 — Application context */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-2">Step 2 of 5</p>
                <h2 className="text-3xl font-bold text-[#1B2B5E] mb-2">Tell us about your applications</h2>
                <p className="text-[#6B7280]">This helps us personalize your dashboard.</p>
              </div>

              <div>
                <label className="label">How many schools are you applying to?</label>
                <div className="grid grid-cols-2 gap-2">
                  {["1–3", "4–7", "8–15", "15+"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updateField("schoolCountRange", opt)}
                      className={cn(
                        "p-3 rounded-xl border-2 text-sm font-medium transition-all",
                        formData.schoolCountRange === opt
                          ? "border-[#1B2B5E] bg-[#1B2B5E] text-white"
                          : "border-gray-200 bg-white text-[#6B7280] hover:border-[#1B2B5E]"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Target intake</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Sep 2025", "Jan 2026", "Sep 2026", "Not sure"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updateField("intakeCycle", opt)}
                      className={cn(
                        "p-3 rounded-xl border-2 text-sm font-medium transition-all",
                        formData.intakeCycle === opt
                          ? "border-[#1B2B5E] bg-[#1B2B5E] text-white"
                          : "border-gray-200 bg-white text-[#6B7280] hover:border-[#1B2B5E]"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Degree type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[["MASTERS", "Master's"], ["PHD", "PhD"], ["BOTH", "Both"]].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => updateField("degreeType", val)}
                      className={cn(
                        "p-3 rounded-xl border-2 text-sm font-medium transition-all",
                        formData.degreeType === val
                          ? "border-[#1B2B5E] bg-[#1B2B5E] text-white"
                          : "border-gray-200 bg-white text-[#6B7280] hover:border-[#1B2B5E]"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Regions */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-2">Step 3 of 5</p>
                <h2 className="text-3xl font-bold text-[#1B2B5E] mb-2">Where are you applying?</h2>
                <p className="text-[#6B7280]">Select all that apply.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {REGIONS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => toggleRegion(r.id)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-2",
                      formData.regions.includes(r.id)
                        ? "border-[#1B2B5E] bg-[#1B2B5E] text-white"
                        : "border-gray-200 bg-white text-[#6B7280] hover:border-[#1B2B5E]"
                    )}
                  >
                    {formData.regions.includes(r.id) && <Check className="w-3.5 h-3.5 shrink-0" />}
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — Process stage */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-2">Step 4 of 5</p>
                <h2 className="text-3xl font-bold text-[#1B2B5E] mb-2">Where are you in the process?</h2>
                <p className="text-[#6B7280]">We'll set up your dashboard to match.</p>
              </div>
              <div className="space-y-2">
                {[
                  { val: "JUST_STARTING", label: "Just starting", desc: "Haven't researched schools yet" },
                  { val: "RESEARCHING", label: "Researching", desc: "Have a shortlist, no applications started" },
                  { val: "IN_PROGRESS", label: "In progress", desc: "Already working on applications" },
                  { val: "ALMOST_DONE", label: "Almost done", desc: "Most applications submitted" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => updateField("processStage", opt.val)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all",
                      formData.processStage === opt.val
                        ? "border-[#1B2B5E] bg-[#1B2B5E] text-white"
                        : "border-gray-200 bg-white hover:border-[#1B2B5E]"
                    )}
                  >
                    <p className={cn("font-semibold text-sm", formData.processStage === opt.val ? "text-white" : "text-[#0F0F0F]")}>{opt.label}</p>
                    <p className={cn("text-xs mt-0.5", formData.processStage === opt.val ? "text-blue-200" : "text-[#6B7280]")}>{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5 — First application */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-2">Step 5 of 5</p>
                <h2 className="text-3xl font-bold text-[#1B2B5E] mb-2">Add your first school</h2>
                <p className="text-[#6B7280]">Get your dashboard started — you can add more anytime.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label">University name</label>
                  <input
                    className="input"
                    placeholder="e.g. University of Edinburgh"
                    value={formData.universityName}
                    onChange={(e) => updateField("universityName", e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Program / Course</label>
                  <input
                    className="input"
                    placeholder="e.g. MSc Computer Science"
                    value={formData.program}
                    onChange={(e) => updateField("program", e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Application deadline</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.deadline}
                    onChange={(e) => updateField("deadline", e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={() => handleComplete(false)}
                disabled={loading || !formData.universityName || !formData.program || !formData.deadline}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Go to my dashboard
              </button>
              <button
                onClick={() => handleComplete(true)}
                className="text-xs text-[#6B7280] w-full text-center hover:text-[#0F0F0F] transition-colors"
              >
                I'll add schools later
              </button>
            </div>
          )}

          {/* Navigation */}
          {step < 5 && (
            <div className="flex items-center justify-between mt-8">
              {step > 1 ? (
                <button onClick={() => setStep(step - 1)} className="btn-ghost flex items-center gap-1.5">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : <div />}
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step > 1 && step < 5 && (
            <button
              onClick={() => setStep(step + 1)}
              className="text-xs text-[#6B7280] w-full text-center mt-4 hover:text-[#0F0F0F] transition-colors"
            >
              Skip this step
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
