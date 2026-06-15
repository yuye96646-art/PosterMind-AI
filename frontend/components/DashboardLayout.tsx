"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

interface LayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navLinkClass = (path: string) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
      isActive(path)
        ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
    }`;

  const displayName = user ? user.username : "Guest";
  const membershipLevel = user?.membership_level || "free";
  const computePercent = membershipLevel === "premium" ? 75 : 25;
  const computeUsed = membershipLevel === "premium" ? 750 : 25;
  const computeTotal = membershipLevel === "premium" ? 1000 : 100;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded bg-slate-800 border border-slate-700 text-slate-300"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`w-64 bg-slate-905 border-r border-slate-800 flex flex-col justify-between h-full fixed lg:relative z-40 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2">
            <div className="w-6 h-6 rounded bg-indigo-500 animate-pulse"></div>
            <span className="font-bold text-base bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">
              PosterMind OS
            </span>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1.5">
            <div className="text-xs font-semibold text-slate-500 px-3 mb-2 uppercase tracking-wider">
              核心创作
            </div>
            <Link href="/" className={navLinkClass("/")}>
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              AI 海报画布工作区
            </Link>
            <Link href="/history" className={navLinkClass("/history")}>
              <span className="w-2 h-2 rounded-full bg-transparent border border-slate-500"></span>
              历史生成记录
            </Link>

            <div className="text-xs font-semibold text-slate-500 px-3 mt-6 mb-2 uppercase tracking-wider">
              系统控制与监控
            </div>
            <Link href="/monitor" className={navLinkClass("/monitor")}>
              <span
                className={`w-2 h-2 rounded-full ${
                  isActive("/monitor") ? "bg-emerald-500" : "bg-emerald-500 animate-ping"
                }`}
              ></span>
              任务生成流监控 (串口)
            </Link>
            <Link href="/admin" className={navLinkClass("/admin")}>
              <span className="w-2 h-2 rounded-full bg-transparent border border-slate-500"></span>
              风格与模板管理后台
            </Link>
          </nav>
        </div>

        {/* User status */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                  membershipLevel === "premium"
                    ? "bg-gradient-to-tr from-amber-500 to-orange-500"
                    : "bg-gradient-to-tr from-slate-500 to-slate-600"
                }`}
              >
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-medium text-slate-200">{displayName}</div>
                <div
                  className={`text-[10px] ${
                    membershipLevel === "premium" ? "text-amber-400" : "text-slate-400"
                  }`}
                >
                  {membershipLevel === "premium" ? "高级会员" : "免费用户"}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-1.5 rounded-full transition-all"
              style={{ width: `${computePercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>算力剩余 {computePercent}%</span>
            <span>
              {computeUsed} / {computeTotal} 次
            </span>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/20 backdrop-blur-md">
          <div className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <span>工作台</span> / <span className="text-slate-200">智能海报实时渲染中心</span>
          </div>
          <div className="flex items-center gap-4">
            {!user ? (
              <Link
                href="/"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                登录 / 注册
              </Link>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ● API 引擎在线
              </span>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </main>
    </div>
  );
}
