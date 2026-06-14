import type { Metadata } from "next";
import LandingClient from "@/components/landing/LandingClient";

export const metadata: Metadata = {
  title: "GradPath — Every application. One calm place.",
  description:
    "Track deadlines, manage every task, and get AI feedback on your SOP and CV — all in one calm workspace built for grad school applicants.",
};

export default function Page() {
  return <LandingClient />;
}

