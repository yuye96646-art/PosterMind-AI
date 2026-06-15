// 文件名称: SystemStreamMonitor.tsx
// 文件类型: TypeScript React Component (Next.js + Tailwind CSS)

import React from 'react';

export default function SystemStreamMonitor() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      
      {/* 顶部指标监视器卡片 (实时硬件算力 & 队列追踪) */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-500 font-medium uppercase font-mono">Total Task Tasks / 任务吞吐总计</div>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-1">14,802 <span className="text-xs text-emerald-400 font-normal">↑ 12%</span></div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-500 font-medium uppercase font-mono">Current Active Queue / 活动队列</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">3 <span className="text-xs text-slate-500 font-normal">/ 50 Max</span></div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-500 font-medium uppercase font-mono">Avg Latency / 图像渲染平均延迟</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">4.28s <span className="text-xs text-slate-400 font-normal"> (Flux.1)</span></div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-500 font-medium uppercase font-mono">Redis Cache Hits / 缓存命中率</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">98.4%</div>
        </div>
      </div>

      {/* 中部核心区：左侧是API生成任务队列状态，右侧是极客串口流日志实时回显 */}
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-[450px]">
        
        {/* 任务流列表（对应数据表：user_posters 的分布式流状态监测） */}
        <section className="col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-300 font-mono mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            ACTIVE GENERATION QUEUE (HTTP / REST)
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            
            {/* 状态：进行中 Pending */}
            <div className="p-3 bg-slate-950/80 border-l-2 border-amber-500 rounded-r-lg flex justify-between items-center text-xs font-mono">
              <div className="space-y-1">
                <div className="font-bold text-slate-200">Task_ID: 9b1deb4d...</div>
                <div className="text-[11px] text-slate-500">Style: 小红书潮流爆款 | User: User_092</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                背景生成中 (32%)
              </span>
            </div>

            {/* 状态：成功 Completed */}
            <div className="p-3 bg-slate-950/80 border-l-2 border-emerald-500 rounded-r-lg flex justify-between items-center text-xs font-mono">
              <div className="space-y-1">
                <div className="font-bold text-slate-200">Task_ID: 4f3a8c1e...</div>
                <div className="text-[11px] text-slate-500">Style: 赛博朋克霓虹 | User: VIP_Admin</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                渲染成功 (100%)
              </span>
            </div>

            {/* 状态：失败 Failed */}
            <div className="p-3 bg-slate-950/80 border-l-2 border-rose-500 rounded-r-lg flex justify-between items-center text-xs font-mono">
              <div className="space-y-1">
                <div className="font-bold text-slate-200">Task_ID: 7c8d9e2b...</div>
                <div className="text-[11px] text-slate-500">Style: 极简主义艺术 | User: Free_User_4</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20">
                云存储网络超时
              </span>
            </div>

          </div>
        </section>

        {/* 极客专属：串行总线数据流 / AI生图工作流系统硬核日志窗口 (模拟串口UI) */}
        <section className="col-span-7 bg-black border border-slate-800 rounded-xl p-4 flex flex-col shadow-inner">
          <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              </div>
              <span className="text-xs font-mono text-slate-500 font-bold tracking-tight">
                SERIAL PORT MONITOR /dev/ttyUSB0 -- BaudRate 115200
              </span>
            </div>
            <span className="text-[10px] font-mono text-indigo-400 font-semibold uppercase animate-pulse">
              ● STREAMING LIVE
            </span>
          </div>

          {/* 实时滚动日志终端窗口 */}
          <div className="flex-1 bg-slate-950 p-3 rounded-lg border border-slate-900 font-mono text-xs text-emerald-400 space-y-1.5 overflow-y-auto leading-relaxed shadow-inner">
            <p className="text-slate-500">[2026-06-02 08:16:01] INFO: Initializing FastApi routing engine...</p>
            <p className="text-slate-500">[2026-06-02 08:16:02] INFO: Connected to PostgreSQL Master db cluster.</p>
            <p className="text-slate-400">[2026-06-02 08:16:05] <span className="text-indigo-400">POST /api/posters/generate</span> - User: 9b1deb4d - Style: RedBook_Style</p>
            <p className="text-cyan-400">[SYSTEM]: Pipeline Step [1/6] - Parsing User payload. Raw text length: 142 chars.</p>
            <p className="text-cyan-400">[SYSTEM]: Pipeline Step [2/6] - Prompt Builder triggered with model: GPT-4o.</p>
            <p className="text-amber-400">[AI_PROMPT]: Derived Txt -- "A dynamic high-contrast marketing poster, glassmorphism UI card, smooth corporate gradients, highly structured space layout..."</p>
            <p className="text-indigo-400">[AIGC_ENGINE]: Broad-casting payload to Stable Diffusion / Flux context endpoint...</p>
            <p className="text-emerald-500 animate-pulse">[SERIAL IN]: Sampling K-Diffusion Iteration: [ |||||||||||||||||||||||||||| 56% ] - Steps 28/50 - ETA 1.8s</p>
            <p className="text-slate-500">[2026-06-02 08:16:11] DEBUG: Reading style layout_json schema matrices...</p>
            <p className="text-cyan-400">[SYSTEM]: Pipeline Step [5/6] - Merging Text Layers using system Pillow engine onto canvas asset.</p>
            <p className="text-emerald-400">[SUCCESS]: Cloudflare R2 object storage handshake successful. URL generated: https://r2.postermind.ai/media/out_9b1deb4d.jpg</p>
          </div>
          
          {/* 串口指令手动输入发送交互框 */}
          <div className="mt-3 flex gap-2">
            <span className="bg-slate-900 border border-slate-800 text-slate-500 px-3 py-1.5 text-xs font-mono rounded flex items-center">
              $ sudo systemctl
            </span>
            <input type="text" placeholder="输入串口调试或流调指令 (如: --flush-cache / --restart-pipeline)..." className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500" />
            <button className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs rounded transition-all">
              EXEC
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}