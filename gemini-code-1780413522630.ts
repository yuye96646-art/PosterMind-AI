// 文件名称: DashboardLayout.tsx
// 文件类型: TypeScript React Component (Next.js + Tailwind CSS)

import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* 侧边栏 - 类似操作系统主控制台导航 */}
      <aside className="w-64 bg-slate-905 border-r border-slate-800 flex flex-col justify-between h-full">
        <div>
          {/* 系统Logo区 */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2">
            <div className="w-6 h-6 rounded bg-indigo-500 animate-pulse"></div>
            <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              PosterMind OS
            </span>
          </div>
          
          {/* 功能模块导航区 */}
          <nav className="p-4 space-y-1.5">
            <div className="text-xs font-semibold text-slate-500 px-3 mb-2 uppercase tracking-wider">
              核心创作
            </div>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-600/20 text-indigo-400 font-medium text-sm transition-all border border-indigo-500/30">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              AI 海报画布工作区
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 font-medium text-sm transition-all">
              <span className="w-2 h-2 rounded-full bg-transparent border border-slate-500"></span>
              历史生成记录
            </button>
            
            <div className="text-xs font-semibold text-slate-500 px-3 mt-6 mb-2 uppercase tracking-wider">
              系统控制与监控
            </div>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 font-medium text-sm transition-all">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              任务生成流监控 (串口)
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 font-medium text-sm transition-all">
              <span className="w-2 h-2 rounded-full bg-transparent border border-slate-500"></span>
              风格与模板管理后台
            </button>
          </nav>
        </div>

        {/* 底部用户状态 & 会员级别显示区 */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-bold text-xs text-white">
                PM
              </div>
              <div>
                <div className="text-xs font-medium text-slate-200">Premium_User</div>
                <div className="text-[10px] text-amber-400">高级会员 (永不过期)</div>
              </div>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-1.5 rounded-full w-3/4"></div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>算力剩余 75%</span>
            <span>750 / 1000 次</span>
          </div>
        </div>
      </aside>

      {/* 主工作窗口 */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        {/* 全局顶栏 */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/20 backdrop-blur-md">
          <div className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <span>工作台</span> / <span className="text-slate-200">智能海报实时渲染中心</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ● API 引擎在线
            </span>
          </div>
        </header>

        {/* 动态页面内容嵌入区 */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}