import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AIReviewClient from "./AIReviewClient";

export default async function AIReviewPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    include: {
      documents: { select: { id: true, type: true, fileName: true } },
    },
    orderBy: { deadline: "asc" },
  });

  // Latest reviews per (application/document, type) for the overview, with version counts.
  const reviews = await prisma.documentReview.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      documentId: true,
      type: true,
      overallScore: true,
      verdict: true,
      wordCount: true,
      version: true,
      result: true,
      createdAt: true,
    },
  });

  // Daily quota for Free users
  const now = new Date();
  const isNewDay = !user.aiReviewsResetAt || user.aiReviewsResetAt.toDateString() !== now.toDateString();
  const usedToday = isNewDay ? 0 : user.aiReviewsToday;

  return (
    <AIReviewClient
      applications={applications}
      reviews={reviews.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      }))}
      plan={user.plan}
      usedToday={usedToday}
    />
  );
}
