"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface QueueItem {
  task_id: string;
  style_name: string;
  user_name: string;
  status: string;
  progress: number;
  error_msg?: string;
}

const LOG_LINES = [
  { cls: "text-slate-500", text: "[2026-06-02 08:16:01] INFO: Initializing FastApi routing engine..." },
  { cls: "text-slate-500", text: "[2026-06-02 08:16:02] INFO: Connected to PostgreSQL Master db cluster." },
  {
    cls: "text-slate-400",
    text: "[2026-06-02 08:16:05] <span class='text-indigo-400'>POST /api/posters/generate</span> - User: 9b1deb4d - Style: RedBook_Style",
  },
  { cls: "text-cyan-400", text: "[SYSTEM]: Pipeline Step [1/6] - Parsing User payload. Raw text length: 142 chars." },
  { cls: "text-cyan-400", text: "[SYSTEM]: Pipeline Step [2/6] - Prompt Builder triggered with model: GPT-4o." },
  {
    cls: "text-amber-400",
    text: '[AI_PROMPT]: Derived Txt -- "A dynamic high-contrast marketing poster, glassmorphism UI card, smooth corporate gradients, highly structured space layout..."',
  },
  {
    cls: "text-indigo-400",
    text: "[AIGC_ENGINE]: Broad-casting payload to Stable Diffusion / Flux context endpoint...",
  },
  {
    cls: "text-emerald-500 animate-pulse",
    text: "[SERIAL IN]: Sampling K-Diffusion Iteration: [ |||||||||||||||||||||||||||| 56% ] - Steps 28/50 - ETA 1.8s",
  },
  { cls: "text-slate-500", text: "[2026-06-02 08:16:11] DEBUG: Reading style layout_json schema matrices..." },
  {
    cls: "text-cyan-400",
    text: "[SYSTEM]: Pipeline Step [5/6] - Merging Text Layers using system Pillow engine onto canvas asset.",
  },
  {
    cls: "text-emerald-400",
    text: "[SUCCESS]: Cloudflare R2 object storage handshake successful. URL generated: https://r2.postermind.ai/media/out_9b1deb4d.jpg",
  },
];

export default function SystemStreamMonitor() {
  const [displayLogs, setDisplayLogs] = useState<string[]>([]);
  const [lineIndex, setLineIndex] = useState(0);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [command, setCommand] = useState("");

  // Typing animation for logs
  useEffect(() => {
    if (lineIndex < LOG_LINES.length) {
      const timer = setTimeout(() => {
        setDisplayLogs((prev) => [...prev, LOG_LINES[lineIndex].text]);
        setLineIndex((i) => i + 1);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [lineIndex, displayLogs.length]);

  // Fetch queue items periodically
  useEffect(() => {
    const fetchQueue = () => {
      api
        .get<QueueItem[]>("/api/posters/history?user_id=00000000-0000-0000-0000-000000000000")
        .then((data) => {
          setQueueItems(
            data.slice(0, 3).map((item: Record<string, unknown>) => ({
              task_id: String(item.id || "").slice(0, 8) + "...",
              style_name: String(item.style_name || "Unknown"),
              user_name: "User",
              status: String(item.status || "pending"),
              progress: item.status === "completed" ? 100 : 32,
            }))
          );
        })
        .catch(() => {
          // Use static demo data
          setQueueItems([
            {
              task_id: "9b1deb4d...",
              style_name: "小红书潮流爆款",
              user_name: "User_092",
              status: "generating",
              progress: 32,
            },
            {
              task_id: "4f3a8c1e...",
              style_name: "赛博朋克霓虹",
              user_name: "VIP_Admin",
              status: "completed",
              progress: 100,
            },
            {
              task_id: "7c8d9e2b...",
              style_name: "极简主义艺术",
              user_name: "Free_User_4",
              status: "failed",
              progress: 0,
              error_msg: "云存储网络超时",
            },
          ]);
        });
    };

    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const statusConfig: Record<string, { border: string; bg: string; text: string; label: string }> = {
    pending: { border: "border-amber-500", bg: "bg-amber-500/10", text: "text-amber-400", label: "等待中" },
    generating: {
      border: "border-amber-500",
      bg: "bg-amber-500/10",
      text: "text-amber-400 animate-pulse",
      label: "背景生成中",
    },
    completed: { border: "border-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-400", label: "渲染成功 (100%)" },
    failed: { border: "border-rose-500", bg: "bg-rose-500/10", text: "text-rose-400", label: "失败" },
  };

  const handleExec = () => {
    if (!command.trim()) return;
    setDisplayLogs((prev) => [
      ...prev,
      `[CONSOLE]: $ sudo systemctl ${command}`,
      `[CONSOLE]: Command received. Processing...`,
    ]);
    setCommand("");
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-500 font-medium uppercase font-mono">Total Task Tasks / 任务吞吐总计</div>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-1">
            14,802 <span className="text-xs text-emerald-400 font-normal">↑ 12%</span>
          </div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-500 font-medium uppercase font-mono">Current Active Queue / 活动队列</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">
            {queueItems.filter((q) => q.status === "generating" || q.status === "pending").length}{" "}
            <span className="text-xs text-slate-500 font-normal">/ 50 Max</span>
          </div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-500 font-medium uppercase font-mono">Avg Latency / 图像渲染平均延迟</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            4.28s <span className="text-xs text-slate-400 font-normal"> (Flux.1)</span>
          </div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-500 font-medium uppercase font-mono">Redis Cache Hits / 缓存命中率</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">98.4%</div>
        </div>
      </div>

      {/* Middle: Queue + Terminal */}
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-[450px]">
        {/* Queue list */}
        <section className="col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-300 font-mono mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            ACTIVE GENERATION QUEUE (HTTP / REST)
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {queueItems.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-8">No active tasks. Generate a poster to see queue.</p>
            )}
            {queueItems.map((item) => {
              const cfg = statusConfig[item.status] || statusConfig.pending;
              return (
                <div
                  key={item.task_id}
                  className={`p-3 bg-slate-950/80 border-l-2 ${cfg.border} rounded-r-lg flex justify-between items-center text-xs font-mono`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-200">Task_ID: {item.task_id}</div>
                    <div className="text-[11px] text-slate-500">
                      Style: {item.style_name} | User: {item.user_name}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${cfg.bg} ${cfg.text} border ${cfg.border}/20`}>
                    {item.status === "failed" && item.error_msg ? item.error_msg : cfg.label}
                    {item.status === "generating" && ` (${item.progress}%)`}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Serial port log terminal */}
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

          {/* Live log window */}
          <div className="flex-1 bg-slate-950 p-3 rounded-lg border border-slate-900 font-mono text-xs text-emerald-400 space-y-1.5 overflow-y-auto leading-relaxed shadow-inner">
            {displayLogs.length === 0 && (
              <p className="text-slate-600">Awaiting serial data stream...</p>
            )}
            {displayLogs.map((line, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: line }} />
            ))}
            {lineIndex >= LOG_LINES.length && (
              <p className="text-emerald-500 animate-pulse">
                [SERIAL IN]: Awaiting next task batch... Port idle.
              </p>
            )}
          </div>

          {/* Command input */}
          <div className="mt-3 flex gap-2">
            <span className="bg-slate-900 border border-slate-800 text-slate-500 px-3 py-1.5 text-xs font-mono rounded flex items-center">
              $ sudo systemctl
            </span>
            <input
              type="text"
              placeholder="输入串口调试或流调指令 (如: --flush-cache / --restart-pipeline)..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleExec()}
            />
            <button
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs rounded transition-all"
              onClick={handleExec}
            >
              EXEC
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
