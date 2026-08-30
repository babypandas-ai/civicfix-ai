"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  ShieldCheck, 
  Camera, 
  LayoutDashboard, 
  Radio, 
  Layers, 
  Menu, 
  X, 
  Sparkles,
  ArrowUpRight
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Overview", href: "/", icon: Layers },
    { name: "Report Issue", href: "/report", icon: Camera },
    { name: "Live Map & Data", href: "/dashboard", icon: LayoutDashboard },
    { name: "City Ops Center", href: "/resolve", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#08090E]/85 backdrop-blur-2xl transition-all duration-300">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:border-emerald-400/60 transition-all duration-300">
              <Radio className="h-5 w-5 text-emerald-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-4 ring-[#08090E] animate-ping" />
              <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#08090E]" />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-300 transition">
                  CivicFix<span className="text-emerald-400 font-mono text-sm ml-0.5">.AI</span>
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  AUTONOMOUS
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:block tracking-wide">
                Next-Gen Civic Triage Network
              </span>
            </div>
          </Link>

          {/* Real-time Status Badge */}
          <div className="hidden lg:flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs border border-white/10 text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400">Network:</span>
            <span className="font-mono text-emerald-400 font-medium">99.4% AI Precision</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 font-medium">1,420 Solved</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 rounded-full bg-white/[0.04] p-1.5 border border-white/10 shadow-inner">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Action */}
        <div className="flex items-center gap-3">
          <Link
            href="/report"
            className="relative group hidden sm:inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "8s" }} />
            <span>Report Hazard</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0A0D16]/95 px-4 py-6 backdrop-blur-2xl animate-in slide-in-from-top-5 duration-200">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 text-emerald-400" />
                  {link.name}
                </Link>
              );
            })}
            <div className="mt-4 pt-4 border-t border-white/10">
              <Link
                href="/report"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              >
                <Camera className="h-4 w-4" />
                Report Hazard Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
