"use client";

import { useState } from "react";
import { FileText, Upload, Loader2, Brain } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DocumentsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2B5E]">Documents</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Upload and manage your application documents.</p>
      </div>
      <div className="card p-12 text-center">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-6 h-6 text-[#1B2B5E]" />
        </div>
        <p className="font-semibold text-[#0F0F0F] mb-1">Document storage coming soon</p>
        <p className="text-sm text-[#6B7280] mb-4">Upload your SOP, CV, and transcripts here. In the meantime, use AI Review to get feedback on your documents.</p>
        <Link href="/ai-review" className="btn-primary flex items-center gap-2 justify-center">
          <Brain className="w-4 h-4" /> Go to AI Review
        </Link>
      </div>
    </div>
  );
}
