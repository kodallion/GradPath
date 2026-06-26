import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "documents";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const doc = await prisma.document.findFirst({ where: { id, userId: user.id } });
    if (!doc || !doc.fileUrl) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const url = new URL(req.url);
    const inline = url.searchParams.get("inline") === "1";

    const { data, error } = await getSupabaseAdmin().storage
      .from(BUCKET)
      .createSignedUrl(doc.fileUrl, 60, inline ? undefined : { download: doc.fileName });

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: "Could not generate download link" }, { status: 500 });
    }

    return NextResponse.redirect(data.signedUrl);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
