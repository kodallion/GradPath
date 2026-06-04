import Link from "next/link";
import { GraduationCap, CheckCircle2, Brain, Bell, ArrowRight, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#F9F8F6]/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1B2B5E] rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-[#1B2B5E] text-lg">GradPath</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="btn-ghost">Sign in</Link>
            <Link href="/sign-up" className="btn-primary">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
          Built for Nigerian & international graduate applicants
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-[#1B2B5E] leading-tight mb-6 max-w-3xl mx-auto">
          Every application.
          <br />
          <span className="text-[#F5A623] italic">One place.</span>
        </h1>
        <p className="text-lg text-[#6B7280] max-w-xl mx-auto mb-8 leading-relaxed">
          Stop juggling spreadsheets, emails, and portals. GradPath keeps your grad school applications organized — with AI that helps you actually get in.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/sign-up" className="btn-primary flex items-center gap-2">
            Start for free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/sign-in" className="btn-secondary">Sign in</Link>
        </div>
        <p className="text-xs text-[#6B7280] mt-4">Free plan available · No credit card required</p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] text-center mb-3">What you get</p>
        <h2 className="text-3xl font-bold text-[#1B2B5E] text-center mb-12">Everything you need to apply with confidence</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <CheckCircle2 className="w-5 h-5" />,
              title: "Application Tracking",
              desc: "Add every school, set deadlines, and track your status from Not Started to Accepted.",
            },
            {
              icon: <Bell className="w-5 h-5" />,
              title: "Deadline Reminders",
              desc: "Never miss a deadline. Urgency indicators turn red when time is running out.",
            },
            {
              icon: <Brain className="w-5 h-5" />,
              title: "AI Document Review",
              desc: "Upload your SOP or CV and get structured feedback — scores, suggestions, and highlights.",
            },
            {
              icon: <GraduationCap className="w-5 h-5" />,
              title: "Task Management",
              desc: "Auto-generated checklists for each application. Write SOP, request LOR, pay fees — all tracked.",
            },
            {
              icon: <CheckCircle2 className="w-5 h-5" />,
              title: "Document Storage",
              desc: "Upload and organise your SOP, CV, transcripts. Link them to specific applications.",
            },
            {
              icon: <Star className="w-5 h-5" />,
              title: "Progress Dashboard",
              desc: "A single view of all your applications, tasks, and upcoming deadlines.",
            },
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <div className="w-10 h-10 bg-[#1B2B5E]/10 rounded-xl flex items-center justify-center text-[#1B2B5E] mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-[#0F0F0F] mb-2">{f.title}</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] text-center mb-3">Pricing</p>
        <h2 className="text-3xl font-bold text-[#1B2B5E] text-center mb-12">Simple, honest pricing</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="card p-8">
            <h3 className="font-bold text-[#1B2B5E] text-lg mb-1">Free</h3>
            <p className="text-3xl font-bold text-[#0F0F0F] mb-1">₦0</p>
            <p className="text-sm text-[#6B7280] mb-6">Forever free</p>
            <ul className="space-y-3 mb-8">
              {["Up to 5 applications", "3 AI reviews per day", "Task & document management", "Deadline tracking"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <Link href="/sign-up" className="btn-secondary w-full text-center block">Get started</Link>
          </div>
          <div className="card p-8 border-2 border-[#F5A623] relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F5A623] text-white text-xs font-semibold px-3 py-1 rounded-full">
              Most Popular
            </div>
            <h3 className="font-bold text-[#1B2B5E] text-lg mb-1">Pro</h3>
            <p className="text-3xl font-bold text-[#0F0F0F] mb-1">₦5,000<span className="text-base font-normal text-[#6B7280]">/mo</span></p>
            <p className="text-sm text-[#6B7280] mb-6">7-day free trial</p>
            <ul className="space-y-3 mb-8">
              {["Unlimited applications", "Unlimited AI reviews", "Everything in Free", "Priority features"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <Link href="/sign-up" className="btn-primary w-full text-center block">Start free trial</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="bg-[#1B2B5E] rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to take control of your applications?</h2>
          <p className="text-blue-200 mb-8 max-w-md mx-auto">Join graduate applicants who use GradPath to stay organized and improve their chances.</p>
          <Link href="/sign-up" className="btn-primary inline-flex items-center gap-2">
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#1B2B5E] rounded-md flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#1B2B5E] text-sm">GradPath</span>
          </div>
          <p className="text-xs text-[#6B7280]">© 2025 GradPath. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
