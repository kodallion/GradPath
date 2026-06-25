import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FREE_PLAN_LIMITS } from "@/lib/utils";
import { buildReviewPrompt, type ReviewResult, type ReviewAnnotation } from "@/lib/aiReview";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeParse(raw: string): ReviewResult | null {
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned) as ReviewResult;
  } catch {
    // try to extract the first {...} block
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]) as ReviewResult;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function normalize(result: ReviewResult): ReviewResult {
  // assign stable ids, clamp scores, ensure arrays exist
  const annotations: ReviewAnnotation[] = (result.annotations || []).map((a, i) => ({
    id: a.id || `n${i + 1}`,
    span: a.span || "",
    tag: a.tag === "good" ? "good" : "improve",
    severity: ["critical", "moderate", "minor", "none"].includes(a.severity) ? a.severity : (a.tag === "good" ? "none" : "moderate"),
    category: a.category || "general",
    title: a.title || "Note",
    note: a.note || "",
    rewrite: a.tag === "improve" ? a.rewrite : undefined,
  }));
  const clamp = (n: number) => Math.max(0, Math.min(10, Number(n) || 0));
  return {
    overallScore: clamp(result.overallScore),
    verdict: result.verdict === "ready" ? "ready" : "not_yet",
    lead: result.lead || "",
    wordCount: Number(result.wordCount) || 0,
    rubric: (result.rubric || []).map((d) => ({ label: d.label || "", score: clamp(d.score) })),
    annotations,
    topFixes: result.topFixes || [],
    cliches: result.cliches || [],
    readiness: result.readiness || [],
    flags: result.flags || [],
  };
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isPro = user.plan === "PRO";

    if (!isPro) {
      const now = new Date();
      const resetAt = user.aiReviewsResetAt;
      const isNewDay = !resetAt || resetAt.toDateString() !== now.toDateString();
      const reviewsToday = isNewDay ? 0 : user.aiReviewsToday;
      if (reviewsToday >= FREE_PLAN_LIMITS.aiReviewsPerDay) {
        return NextResponse.json(
          { error: "AI_LIMIT_REACHED", message: `You've used all ${FREE_PLAN_LIMITS.aiReviewsPerDay} free AI reviews for today.` },
          { status: 403 }
        );
      }
    }

    const { documentId, applicationId, content, type } = await req.json();
    if (!content || !type) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    if (type !== "SOP" && type !== "CV") {
      return NextResponse.json({ error: "Invalid review type" }, { status: 400 });
    }

    // Optional program context for grounding
    let programContext: { universityName?: string; program?: string } | null = null;
    if (applicationId) {
      const app = await prisma.application.findFirst({
        where: { id: applicationId, userId: user.id },
        select: { universityName: true, program: true },
      });
      if (app) programContext = app;
    }

    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = buildReviewPrompt({ type, content, programContext });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = message.content[0]?.type === "text" ? message.content[0].text : "";
    const parsed = safeParse(rawText);
    if (!parsed) {
      return NextResponse.json({ error: "Could not parse AI response. Please try again." }, { status: 502 });
    }
    const result = normalize(parsed);

    // Version number: count prior reviews for this document+type (only when documentId is real)
    let version = 1;
    const realDocId = documentId && documentId !== "manual" ? documentId : null;
    if (realDocId) {
      const prior = await prisma.documentReview.count({
        where: { userId: user.id, documentId: realDocId, type },
      });
      version = prior + 1;
    }

    const review = await prisma.documentReview.create({
      data: {
        userId: user.id,
        documentId: realDocId,
        type,
        overallScore: Math.round(result.overallScore),
        verdict: result.verdict,
        wordCount: result.wordCount,
        version,
        result: result as object,
        // legacy fields kept populated for back-compat
        clarityScore: result.rubric[0] ? Math.round(result.rubric[0].score) : Math.round(result.overallScore),
        strengthScore: Math.round(result.overallScore),
        suggestions: result.topFixes,
        highlight: result.lead,
        rawFeedback: rawText,
      },
    });

    if (!isPro) {
      await prisma.user.update({
        where: { id: user.id },
        data: { aiReviewsToday: { increment: 1 }, aiReviewsResetAt: new Date() },
      });
    }

    // Gate rewrites for Free users: strip rewrite text but keep a flag
    const gated: ReviewResult = isPro
      ? result
      : {
          ...result,
          annotations: result.annotations.map((a) => ({ ...a, rewrite: a.rewrite ? "__LOCKED__" : undefined })),
        };

    return NextResponse.json({ id: review.id, version, isPro, result: gated });
  } catch (error) {
    console.error("AI review error:", error);
    return NextResponse.json({ error: "AI review failed. Please try again." }, { status: 500 });
  }
}
