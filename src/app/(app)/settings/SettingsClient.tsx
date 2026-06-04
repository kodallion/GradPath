"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { CheckCircle2, ArrowRight, Loader2, Crown } from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { User } from "@/types";

export default function SettingsClient({ user }: { user: User }) {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";
  const [tab, setTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "PRO" }),
      });
      const data = await res.json();
      if (data.paymentLink) window.location.href = data.paymentLink;
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2B5E]">Settings</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {["profile", "billing"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
              tab === t ? "bg-white text-[#0F0F0F] shadow-sm" : "text-[#6B7280] hover:text-[#0F0F0F]"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-[#0F0F0F]">Profile</h2>
          <div className="flex items-center gap-4">
            <UserButton />
            <div>
              <p className="font-medium text-[#0F0F0F]">{user.name}</p>
              <p className="text-sm text-[#6B7280]">{user.email}</p>
            </div>
          </div>
          <p className="text-xs text-[#6B7280]">Manage your profile photo and name via the account button above.</p>
        </div>
      )}

      {tab === "billing" && (
        <div className="space-y-4">
          {user.plan === "PRO" ? (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-amber-500" />
                <h2 className="font-semibold text-[#0F0F0F]">GradPath Pro</h2>
                <span className="badge bg-amber-50 text-amber-700">Active</span>
              </div>
              <div className="space-y-2 text-sm text-[#6B7280]">
                {user.planExpiresAt && <p>Renews on {formatDate(user.planExpiresAt)}</p>}
                {user.trialEndsAt && new Date(user.trialEndsAt) > new Date() && (
                  <p className="text-amber-600 font-medium">🎉 Trial active until {formatDate(user.trialEndsAt)}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-6">
              <h2 className="font-semibold text-[#0F0F0F] mb-1">Upgrade to Pro</h2>
              <p className="text-sm text-[#6B7280] mb-6">Unlock everything GradPath has to offer.</p>

              <div className="space-y-2 mb-6">
                {[
                  "Unlimited applications (currently limited to 5)",
                  "Unlimited AI document reviews (currently 3/day)",
                  "7-day free trial — cancel anytime",
                  "Priority features as we build them",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-[#6B7280]">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-[#0F0F0F]">₦5,000</span>
                <span className="text-[#6B7280] text-sm">/month</span>
              </div>

              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Start 7-day free trial <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-[#6B7280] text-center mt-3">Card required · Auto-charges ₦5,000 after trial</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
