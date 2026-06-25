// Shared types + prompt for the structured AI document review.
// Used by the API route (to type Claude's JSON) and the client (to render it).

export type ReviewTag = "good" | "improve";
export type ReviewSeverity = "critical" | "moderate" | "minor" | "none";

export interface RubricDimension {
  label: string;        // e.g. "Structure & ordering"
  score: number;        // 0-10
}

export interface ReviewAnnotation {
  id: string;           // "n1", "n2", ... (assigned client-side if missing)
  span: string;         // EXACT substring copied verbatim from the document
  tag: ReviewTag;       // good | improve
  severity: ReviewSeverity;
  category: string;     // "specificity" | "fit" | "evidence" | "mechanics" | "structure" | ...
  title: string;        // short label, e.g. "Generic opening"
  note: string;         // the explanation
  rewrite?: string;     // optional suggested rewrite (Pro-gated in UI)
}

export interface ReadinessItem {
  label: string;        // "Score 8+", "Under word limit", ...
  pass: boolean;
}

export interface ReviewResult {
  overallScore: number;             // 0-10 (one decimal ok)
  verdict: "ready" | "not_yet";
  lead: string;                     // one-line summary
  wordCount: number;
  rubric: RubricDimension[];        // 4-6 dimensions
  annotations: ReviewAnnotation[];  // good + improve spans
  topFixes: string[];               // titles of the most important improve items, in priority order
  cliches: string[];                // overused phrases detected (may be empty)
  readiness: ReadinessItem[];       // checklist
  flags?: string[];                 // optional critical warnings (word limit, missing program, etc.)
}

const SOP_DIMENSIONS = `For an SOP, rubric dimensions should be: "Hook & opening", "Specificity & evidence", "Program & faculty fit", "Narrative & flow", "Mechanics & concision".`;
const CV_DIMENSIONS = `For a CV, rubric dimensions should be: "Structure & ordering", "Relevance to program", "Quantified impact", "Clarity & formatting", "Mechanics & consistency".`;

export function buildReviewPrompt(opts: {
  type: "SOP" | "CV";
  content: string;
  programContext?: { universityName?: string; program?: string } | null;
}): string {
  const { type, content, programContext } = opts;
  const docLabel = type === "SOP" ? "Statement of Purpose" : "CV / Resume";
  const dims = type === "SOP" ? SOP_DIMENSIONS : CV_DIMENSIONS;
  const ctx = programContext?.universityName
    ? `\nThis document is for an application to ${programContext.program || "a program"} at ${programContext.universityName}. Judge program fit against this where relevant.`
    : "";

  return `You are an expert graduate-school admissions consultant reviewing a ${docLabel}.${ctx}

Analyze the document below and return a single, detailed, structured review.

CRITICAL RULES FOR ANNOTATIONS:
- Each annotation's "span" MUST be an EXACT, VERBATIM substring copied from the document — same characters, spacing, and punctuation — so it can be located by string match. Do not paraphrase spans.
- Spans must be reasonably sized (a phrase or sentence), not whole paragraphs.
- Produce 4-8 annotations total, mixing "good" (genuine strengths) and "improve" (actionable fixes).
- For every "improve" annotation, also provide a concrete "rewrite": an improved version of that exact span, specific to this applicant's content.
- "good" annotations should have severity "none" and no rewrite.

${dims}

Score each rubric dimension 0-10. overallScore is the holistic 0-10 (one decimal allowed). verdict is "ready" if overallScore >= 8 and there are no critical issues, otherwise "not_yet".

readiness checklist must include exactly these four items with pass/fail booleans:
- "Score 8+" (pass if overallScore >= 8)
- "Under word limit" (SOP limit ~800 words, CV ~500; pass if under)
- "Program named" (pass if the document names a specific program/university/faculty)
- "No critical issues" (pass if no annotation has severity "critical")

cliches: list any overused admissions phrases you find verbatim in the text (e.g. "since a young age", "passion for", "make a difference"). Empty array if none.

topFixes: the titles of the most important "improve" annotations, highest priority first (max 5).

flags: optional short warnings for serious problems (over word limit, no program named, generic throughout). Omit or empty if none.

Respond with ONLY valid JSON, no markdown fences, in exactly this shape:
{
  "overallScore": <number>,
  "verdict": "ready" | "not_yet",
  "lead": "<one-line summary>",
  "wordCount": <integer word count of the document>,
  "rubric": [{ "label": "<dimension>", "score": <0-10> }],
  "annotations": [
    { "span": "<verbatim substring>", "tag": "good"|"improve", "severity": "critical"|"moderate"|"minor"|"none", "category": "<category>", "title": "<short label>", "note": "<explanation>", "rewrite": "<improved version, only for improve>" }
  ],
  "topFixes": ["<title>", ...],
  "cliches": ["<phrase>", ...],
  "readiness": [{ "label": "Score 8+", "pass": <bool> }, { "label": "Under word limit", "pass": <bool> }, { "label": "Program named", "pass": <bool> }, { "label": "No critical issues", "pass": <bool> }],
  "flags": ["<warning>", ...]
}

DOCUMENT:
${content}`;
}
