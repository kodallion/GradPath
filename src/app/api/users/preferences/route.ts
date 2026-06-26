import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_KEYS = ["deadlines", "weekly", "aiReady", "tips"];

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const incoming = body?.preferences ?? body;
    if (typeof incoming !== "object" || incoming === null) {
      return NextResponse.json({ error: "Invalid preferences" }, { status: 400 });
    }

    // sanitize: only allowed boolean keys
    const clean: Record<string, boolean> = {};
    for (const k of ALLOWED_KEYS) {
      if (typeof incoming[k] === "boolean") clean[k] = incoming[k];
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { preferences: true } });
    const existingRaw = user?.preferences;
    const existing: Record<string, boolean> = {};
    if (existingRaw && typeof existingRaw === "object" && !Array.isArray(existingRaw)) {
      for (const [k, v] of Object.entries(existingRaw as Record<string, unknown>)) {
        if (typeof v === "boolean") existing[k] = v;
      }
    }
    const merged: Record<string, boolean> = { ...existing, ...clean };

    await prisma.user.update({
      where: { clerkId: userId },
      data: { preferences: merged as Prisma.InputJsonValue },
    });
    return NextResponse.json({ preferences: merged });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
