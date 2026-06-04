"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  GraduationCap, LayoutDashboard, FolderOpen,
  FileText, Brain, Settings, Menu, X, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/applications", icon: FolderOpen, label: "Applications" },
  { href: "/documents", icon: FileText, label: "Documents" },
  { href: "/ai-review", icon: Brain, label: "AI Review" },
];

export default function AppShell({ children, user }: { children: React.ReactNode; user: User }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300",
        "lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1B2B5E] rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-[#1B2B5E] text-lg">GradPath</span>
          </Link>
        </div>

        {/* Plan badge */}
        <div className="px-4 pt-4">
          <div className={cn(
            "px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5",
            user.plan === "PRO"
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-gray-100 text-gray-600"
          )}>
            {user.plan === "PRO" ? "💎 Pro Plan" : "🆓 Free Plan"}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-[#1B2B5E] text-white"
                    : "text-[#6B7280] hover:bg-gray-50 hover:text-[#0F0F0F]"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade CTA for free users */}
        {user.plan === "FREE" && (
          <div className="mx-3 mb-4 p-4 bg-[#1B2B5E] rounded-2xl text-white">
            <p className="text-xs font-semibold mb-1">Unlock Pro</p>
            <p className="text-xs text-blue-200 mb-3">Unlimited apps & AI reviews</p>
            <Link href="/settings?tab=billing" className="btn-primary text-xs px-4 py-2 block text-center">
              Upgrade — ₦5,000/mo
            </Link>
          </div>
        )}

        {/* User */}
        <div className="p-4 border-t border-gray-100 flex items-center gap-3">
          <UserButton />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#0F0F0F] truncate">{user.name || "User"}</p>
            <p className="text-xs text-[#6B7280] truncate">{user.email}</p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#F9F8F6]/90 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1B2B5E] rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#1B2B5E]">GradPath</span>
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-gray-100">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
