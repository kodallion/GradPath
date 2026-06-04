"use client";

import { useState } from "react";
import { Brain, Loader2, Star, AlertCircle, ArrowRight, TrendingUp } from "lucide-react";
import { cn, FREE_PLAN_LIMITS } from "@/lib/utils";
import Link from "next/link";

type ReviewResult = {
  clarityScore: number;
  strengthScore: number;
  suggestions: string[];
  highlight: string;
};

export default function AIReviewPage() {
  const [type, setType] = useState<"SOP" | "CV">("SOP");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);

  const handleReview = async () => {
    if (!content.trim() || content.length < 100) {
      setError("Please paste at least 100 characters of your document.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, type }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "AI_LIMIT_REACHED") {
          setLimitReached(true);
          setError(data.message);
        } else {
          setError(data.error || "Review failed. Please try again.");
        }
        return;
      }

      setResult(data.review);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const ScoreBar = ({ label, score }: { label: string; score: number }) => (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-[#0F0F0F]">{label}</span>
        <span className={cn("font-bold", score >= 7 ? "text-green-600" : score >= 5 ? "text-amber-600" : "text-red-600")}>
          {score}/10
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={cn("h-2 rounded-full transition-all duration-1000", score >= 7 ? "bg-green-500" : score >= 5 ? "bg-amber-500" : "bg-red-500")}
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2B5E]">AI Document Review</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Get structured feedback on your SOP or CV before submission.</p>
      </div>

      {limitReached ? (
        <div className="card p-8 text-center">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain className="w-6 h-6 text-amber-500" />
          </div>
          <h2 className="font-bold text-[#0F0F0F] mb-2">Daily limit reached</h2>
          <p className="text-sm text-[#6B7280] mb-6">
            You've used all {FREE_PLAN_LIMITS.aiReviewsPerDay} free AI reviews for today. Upgrade to Pro for unlimited reviews.
          </p>
          <Link href="/settings?tab=billing" className="btn-primary flex items-center gap-2 justify-center">
            Upgrade to Pro <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="card p-6 space-y-5">
          {/* Type selector */}
          <div>
            <label className="label">Document Type</label>
            <div className="flex gap-2">
              {(["SOP", "CV"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                    type === t ? "border-[#1B2B5E] bg-[#1B2B5E] text-white" : "border-gray-200 text-[#6B7280] hover:border-[#1B2B5E]"
                  )}
                >
                  {t === "SOP" ? "Statement of Purpose" : "CV / Resume"}
                </button>
              ))}
            </div>
          </div>

          {/* Content input */}
          <div>
            <label className="label">Paste your {type === "SOP" ? "Statement of Purpose" : "CV"}</label>
            <textarea
              className="input resize-none"
              rows={10}
              placeholder={`Paste your ${type === "SOP" ? "SOP" : "CV"} text here...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <p className="text-xs text-[#6B7280] mt-1">{content.length} characters {content.length < 100 && content.length > 0 ? "(minimum 100)" : ""}</p>
          </div>

          {error && !limitReached && (
            <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button
            onClick={handleReview}
            disabled={loading || content.length < 100}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analysing your document...</>
            ) : (
              <><Brain className="w-4 h-4" /> Get AI Feedback</>
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-[#0F0F0F] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#1B2B5E]" /> Scores
            </h2>
            <ScoreBar label="Clarity" score={result.clarityScore} />
            <ScoreBar label="Strength" score={result.strengthScore} />
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-[#0F0F0F] flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-amber-500" /> Key Highlight
            </h2>
            <p className="text-sm text-[#6B7280] bg-amber-50 border border-amber-100 rounded-xl p-4">{result.highlight}</p>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-[#0F0F0F] mb-4">3 Improvement Suggestions</h2>
            <div className="space-y-3">
              {result.suggestions.map((s, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="w-6 h-6 bg-[#1B2B5E] text-white rounded-full flex items-center justify-center text-xs shrink-0 font-bold">
                    {i + 1}
                  </span>
                  <p className="text-[#6B7280] leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
