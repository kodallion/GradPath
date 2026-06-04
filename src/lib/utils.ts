import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatRelative(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function daysUntilDeadline(deadline: Date | string) {
  return differenceInDays(new Date(deadline), new Date());
}

export function getDeadlineUrgency(deadline: Date | string) {
  const days = daysUntilDeadline(deadline);
  if (days < 0) return "overdue";
  if (days <= 7) return "critical";
  if (days <= 30) return "warning";
  return "normal";
}

export function formatCurrency(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export const AUTO_GENERATED_TASKS = [
  "Write Statement of Purpose (SOP)",
  "Request Letter of Recommendation",
  "Obtain Official Transcripts",
  "Submit Application Form",
  "Pay Application Fee",
  "Confirm Submission",
];

export const FREE_PLAN_LIMITS = {
  applications: 5,
  aiReviewsPerDay: 3,
};

export const PRO_PLAN_PRICE = 5000; // NGN

export function isPro(plan: string) {
  return plan === "PRO";
}

export type ApplicationStatusConfig = {
  label: string;
  color: string;
  bg: string;
};

export type ApplicationStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "INTERVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export const APPLICATION_STATUS_CONFIG: Record<ApplicationStatus, ApplicationStatusConfig> = {
  NOT_STARTED: { label: "Not Started", color: "text-gray-600", bg: "bg-gray-100" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-600", bg: "bg-blue-100" },
  SUBMITTED: { label: "Submitted", color: "text-purple-600", bg: "bg-purple-100" },
  INTERVIEW: { label: "Interview", color: "text-amber-600", bg: "bg-amber-100" },
  ACCEPTED: { label: "Accepted", color: "text-green-600", bg: "bg-green-100" },
  REJECTED: { label: "Rejected", color: "text-red-600", bg: "bg-red-100" },
  WITHDRAWN: { label: "Withdrawn", color: "text-gray-500", bg: "bg-gray-50" },
};
