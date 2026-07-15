import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { captureServerEvent } from "@/lib/posthog-server";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { DocumentType } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "documents";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const VALID_TYPES: DocumentType[] = ["SOP", "CV", "TRANSCRIPT", "OTHER"];

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const applicationId = form.get("applicationId") as string | null;
    const type = form.get("type") as string | null;

    if (!file || !applicationId || !type) {
      return NextResponse.json({ error: "Missing file, applicationId, or type" }, { status: 400 });
    }
    if (!VALID_TYPES.includes(type as DocumentType)) {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "FILE_TOO_LARGE", message: "Maximum file size is 10MB." }, { status: 400 });
    }
    if (file.type && !ALLOWED.has(file.type)) {
      return NextResponse.json({ error: "INVALID_TYPE", message: "Only PDF and Word documents are allowed." }, { status: 400 });
    }

    // Verify the application belongs to this user
    const app = await prisma.application.findFirst({
      where: { id: applicationId, userId: user.id },
    });
    if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    // For the singular core types, enforce one-per-type: replace if exists
    const isCore = type !== "OTHER";
    let existing = null;
    if (isCore) {
      existing = await prisma.document.findFirst({
        where: { applicationId, userId: user.id, type: type as DocumentType },
      });
    }

    const safeName = sanitize(file.name);
    const path = `${user.id}/${applicationId}/${Date.now()}-${safeName}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await getSupabaseAdmin().storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (upErr) {
      return NextResponse.json({ error: "UPLOAD_FAILED", message: upErr.message }, { status: 500 });
    }

    let doc;
    if (existing) {
      // Replace: delete the old file from storage, update the row
      if (existing.fileUrl) {
        await getSupabaseAdmin().storage.from(BUCKET).remove([existing.fileUrl]);
      }
      doc = await prisma.document.update({
        where: { id: existing.id },
        data: { fileUrl: path, fileName: file.name, fileSize: file.size },
      });
    } else {
      doc = await prisma.document.create({
        data: {
          applicationId,
          userId: user.id,
          type: type as DocumentType,
          fileUrl: path,
          fileName: file.name,
          fileSize: file.size,
        },
      });
    }

    await captureServerEvent({
      distinctId: user.clerkId,
      event: "document_uploaded",
      properties: {
        document_type: type,
        replaced_existing: Boolean(existing),
        file_size_bucket:
          file.size > 5 * 1024 * 1024 ? "gt_5mb" : file.size > 1024 * 1024 ? "1mb_to_5mb" : "lte_1mb",
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

