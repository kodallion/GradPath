import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FREE_PLAN_LIMITS } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.plan === "FREE") {
      const now = new Date();
      const resetAt = user.aiReviewsResetAt;
      const isNewDay = !resetAt || resetAt.toDateString() !== now.toDateString();
      const reviewsToday = isNewDay ? 0 : user.aiReviewsToday;
      if (reviewsToday >= FREE_PLAN_LIMITS.aiReviewsPerDay) {
        return NextResponse.json({ error: "AI_LIMIT_REACHED", message: `You've used all ${FREE_PLAN_LIMITS.aiReviewsPerDay} free AI reviews for today.` }, { status: 403 });
      }
    }

    const { documentId, content, type } = await req.json();
    if (!content || !type) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `You are an expert graduate school admissions consultant. Review the following ${type === "SOP" ? "Statement of Purpose" : "CV/Resume"} and provide structured feedback.

DOCUMENT:
${content}

Respond ONLY with valid JSON in this exact format:
{
  "clarityScore": <number 1-10>,
  "strengthScore": <number 1-10>,
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "highlight": "<one key strength>"
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = message.content[0].type === "text" ? message.content[0].text : "";
    const feedback = JSON.parse(rawText.replace(/```json|```/g, "").trim());

    await prisma.documentReview.create({
      data: {
        userId: user.id,
        documentId: documentId || "manual",
        type: type as "SOP" | "CV",
        clarityScore: feedback.clarityScore,
        strengthScore: feedback.strengthScore,
        suggestions: feedback.suggestions,
        highlight: feedback.highlight,
        rawFeedback: rawText,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { aiReviewsToday: { increment: 1 }, aiReviewsResetAt: new Date() },
    });

    return NextResponse.json({ review: feedback });
  } catch (error) {
    console.error("AI review error:", error);
    return NextResponse.json({ error: "AI review failed. Please try again." }, { status: 500 });
  }
}
