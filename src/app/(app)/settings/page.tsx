import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FREE_PLAN_LIMITS } from "@/lib/utils";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { _count: { select: { applications: true } } },
  });
  if (!user) redirect("/sign-in");

  const now = new Date();
  const isNewDay = !user.aiReviewsResetAt || user.aiReviewsResetAt.toDateString() !== now.toDateString();
  const aiUsedToday = isNewDay ? 0 : user.aiReviewsToday;

  const prefsRaw = user.preferences;
  const initialPrefs: Record<string, boolean> = {};
  if (prefsRaw && typeof prefsRaw === "object" && !Array.isArray(prefsRaw)) {
    for (const [k, v] of Object.entries(prefsRaw as Record<string, unknown>)) {
      if (typeof v === "boolean") initialPrefs[k] = v;
    }
  }

  const memberSince = user.createdAt.toLocaleDateString("en-GB", { month: "short", year: "numeric" });

  return (
    <SettingsClient
      name={user.name || ""}
      email={user.email}
      plan={user.plan}
      memberSince={memberSince}
      appCount={user._count.applications}
      appLimit={FREE_PLAN_LIMITS.applications}
      aiUsedToday={aiUsedToday}
      aiLimit={FREE_PLAN_LIMITS.aiReviewsPerDay}
      initialPrefs={initialPrefs}
    />
  );
}
