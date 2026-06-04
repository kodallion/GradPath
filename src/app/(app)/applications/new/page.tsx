"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

const COUNTRIES = ["United Kingdom", "United States", "Canada", "Germany", "Netherlands", "France", "Australia", "Nigeria", "Other"];

export default function NewApplicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    universityName: "",
    program: "",
    country: "",
    deadline: "",
  });

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.universityName || !form.program || !form.country || !form.deadline) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "FREE_LIMIT_REACHED") {
          setError("You've reached the free plan limit. Please upgrade to Pro.");
        } else if (data.error === "DUPLICATE") {
          setError("You already have an application for this university and program.");
        } else {
          setError(data.message || "Something went wrong.");
        }
        return;
      }

      router.push(`/applications/${data.id}`);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link href="/applications" className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#0F0F0F] transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold text-[#1B2B5E]">Add Application</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Tasks will be auto-generated after you save.</p>
      </div>

      <div className="card p-6 space-y-5">
        <div>
          <label className="label">University Name</label>
          <input className="input" placeholder="e.g. University of Amsterdam" value={form.universityName} onChange={(e) => update("universityName", e.target.value)} />
        </div>
        <div>
          <label className="label">Program / Course</label>
          <input className="input" placeholder="e.g. MSc Data Science" value={form.program} onChange={(e) => update("program", e.target.value)} />
        </div>
        <div>
          <label className="label">Country</label>
          <select className="input" value={form.country} onChange={(e) => update("country", e.target.value)}>
            <option value="">Select country</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Application Deadline</label>
          <input type="date" className="input" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Application
        </button>
      </div>
    </div>
  );
}
