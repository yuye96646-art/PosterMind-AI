"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { api, API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface Style {
  id: string;
  name: string;
  primary_color: string;
  font_family: string;
}

const CANVAS_SIZES = [
  { label: "小红书比例", width: 1242, height: 1660 },
  { label: "Ins Post", width: 1080, height: 1350 },
  { label: "A4 纸张", width: 2480, height: 3508 },
  { label: "Ins Story", width: 1080, height: 1920 },
  { label: "X/Twitter", width: 1600, height: 900 },
];

export default function CreativeWorkspace() {
  const { user } = useAuth();

  const [styles, setStyles] = useState<Style[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState("");
  const [canvasSize, setCanvasSize] = useState(CANVAS_SIZES[0]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [variants, setVariants] = useState<(string | null)[]>([null, null, null, null]);
  const [activeVariant, setActiveVariant] = useState(0);
  const [spacingLevel, setSpacingLevel] = useState("medium");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [elementCount, setElementCount] = useState(4);
  const [advancedPrompt, setAdvancedPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState(true);
  const [aiDescription, setAiDescription] = useState("");

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api.get<Style[]>("/api/styles").then(setStyles).catch(console.error);
  }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!user || !selectedStyleId) {
      setError("请先登录并选择一个风格");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setProgress(5);

    try {
      const res = await api.post<{ task_id: string; status: string }>("/api/posters/generate", {
        user_id: user.id,
        style_id: selectedStyleId,
        title,
        subtitle,
        content,
        width: canvasSize.width,
        height: canvasSize.height,
        advanced_prompt: advancedPrompt,
        primary_color_override: primaryColor,
      });

      setTaskId(res.task_id);
      startPolling(res.task_id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "生成失败");
      setIsGenerating(false);
    }
  }, [user, selectedStyleId, title, subtitle, content, canvasSize, advancedPrompt, primaryColor]);

  const handleAiGenerate = useCallback(async () => {
    if (!user || !aiDescription.trim()) {
      setError("请描述你想要的海报");
      return;
    }
    setError(null);
    setIsGenerating(true);
    setProgress(5);

    try {
      const res = await api.post<{ task_id: string; status: string }>("/api/posters/ai-generate", {
        user_id: user.id,
        description: aiDescription,
      });
      setTaskId(res.task_id);
      startPolling(res.task_id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "生成失败");
      setIsGenerating(false);
    }
  }, [user, aiDescription]);

  const startPolling = (tid: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const status = await api.get<{
          status: string;
          image_url: string | null;
          progress: number;
        }>(`/api/posters/status/${tid}`);

        setProgress(status.progress);

        if (status.status === "completed" && status.image_url) {
          clearInterval(pollRef.current!);
          setIsGenerating(false);
          setVariants((prev) => {
            const next = [...prev];
            next[activeVariant] = status.image_url;
            return next;
          });
        } else if (status.status === "failed") {
          clearInterval(pollRef.current!);
          setIsGenerating(false);
          setError("海报生成失败，请重试");
        }
      } catch {
        // polling error, keep trying
      }
    }, 2000);
  };

  const handleDownload = async (format: "png" | "jpg") => {
    const url = variants[activeVariant];
    if (!url) return;
    try {
      const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
      const res = await fetch(fullUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `poster_${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      setError("下载失败");
    }
  };

  const selectedStyle = styles.find((s) => s.id === selectedStyleId);

  return (
    <div className="grid grid-cols-12 gap-6 h-full items-start">
      {/* Left Panel: AI Mode / Manual Mode */}
      <section className="col-span-4 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-5 shadow-xl backdrop-blur">
        {/* Mode Toggle */}
        <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1 gap-1">
          <button
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
              aiMode
                ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setAiMode(true)}
          >
            ✨ AI 模式
          </button>
          <button
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
              !aiMode
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setAiMode(false)}
          >
            手动模式
          </button>
        </div>

        {aiMode ? (
          /* ===== AI MODE ===== */
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium block">
                一句话描述你想要的
              </label>
              <textarea
                rows={5}
                placeholder='例："做一个赛博朋克风格的科技峰会海报，标题叫 AI 觉醒，深色背景霓虹灯效果"'
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAiGenerate();
                  }
                }}
              />
            </div>

            {/* Quick suggestions */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase">快速灵感</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "赛博朋克科技峰会海报",
                  "小红书风格美妆促销海报",
                  "极简风格创业沙龙活动海报",
                  "日系动漫风格漫展海报",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    className="px-2 py-1 text-[10px] rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-300 transition-all"
                    onClick={() => setAiDescription(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas size quick select */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 block">画布尺寸</label>
              <div className="grid grid-cols-3 gap-1.5">
                {CANVAS_SIZES.slice(0, 3).map((size) => (
                  <button
                    key={size.label}
                    className={`px-2 py-1.5 text-[10px] border rounded-md text-center transition-all ${
                      canvasSize.label === size.label
                        ? "border-indigo-500/50 bg-indigo-500/10 text-slate-200"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                    onClick={() => setCanvasSize(size)}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2">
                {error}
              </div>
            )}

            <button
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAiGenerate}
              disabled={isGenerating || !aiDescription.trim()}
            >
              {isGenerating ? `AI 生成中... ${progress}%` : "✨ AI 生成海报"}
            </button>
          </div>
        ) : (
          /* ===== MANUAL MODE ===== */
          <>
            <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
              <span>01</span> 核心参数设定
            </h2>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium block">视觉风格模板</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                value={selectedStyleId}
                onChange={(e) => setSelectedStyleId(e.target.value)}
              >
                <option value="">-- 选择风格 --</option>
                {styles.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium block">画布尺寸</label>
              <div className="grid grid-cols-3 gap-2">
                {CANVAS_SIZES.slice(0, 3).map((size) => (
                  <button
                    key={size.label}
                    className={`px-2 py-2 text-xs border rounded-md text-center transition-all ${
                      canvasSize.label === size.label
                        ? "border-indigo-500/50 bg-indigo-500/10 text-slate-200"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                    onClick={() => setCanvasSize(size)}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium block">海报主标题</label>
                <input
                  type="text"
                  placeholder="例：解锁 AI 生产力新密码"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium block">副标题</label>
                <input
                  type="text"
                  placeholder="例：PosterMind 2026 年度科技峰会"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium block">正文</label>
                <textarea
                  rows={4}
                  placeholder="在这里输入海报详情核心亮点..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                ></textarea>
              </div>
            </div>

            {error && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2">
                {error}
              </div>
            )}

            <button
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleGenerate}
              disabled={isGenerating || !selectedStyleId}
            >
              {isGenerating ? `生成中... ${progress}%` : "开始构建 AI 智能海报"}
            </button>
          </>
        )}
      </section>

      {/* Center: Canvas preview */}
      <section className="col-span-5 space-y-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              画布实时效果渲染预览
            </h3>
            <span className="text-[11px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">
              方案 {activeVariant + 1} / 4
            </span>
          </div>

          {/* Poster preview */}
          <div
            className="w-full bg-gradient-to-b from-indigo-950 via-slate-900 to-black rounded-lg border border-slate-800 relative p-6 flex flex-col justify-between overflow-hidden shadow-2xl"
            style={{ aspectRatio: `${canvasSize.width} / ${canvasSize.height}`, maxHeight: "500px" }}
          >
            {variants[activeVariant] ? (
              <img
                src={variants[activeVariant]!}
                alt="Generated poster"
                className="absolute inset-0 w-full h-full object-contain rounded-lg"
              />
            ) : (
              <>
                {/* Decorative blobs */}
                <div className="absolute top-[-20%] left-[-20%] w-80 h-80 rounded-full bg-indigo-500/10 blur-[80px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 rounded-full bg-cyan-500/10 blur-[80px]"></div>

                <div className="space-y-2 relative z-10">
                  <span className="text-[10px] tracking-widest text-indigo-400 font-mono font-bold uppercase">
                    ✦ POSTERMIND GENERATIVE
                  </span>
                  <h1 className="text-2xl font-black text-white tracking-tight leading-snug drop-shadow-md">
                    {title || "解锁 AI 生产力新密码"}
                  </h1>
                  <p className="text-xs text-slate-400 tracking-wide font-medium">
                    {subtitle || "PosterMind 2026 年度科技峰会"}
                  </p>
                </div>

                <div className="my-auto flex justify-center items-center relative z-10 py-4">
                  <div className="w-40 h-40 border-2 border-dashed border-indigo-500/30 rounded-full flex items-center justify-center p-2 animate-[spin_40s_linear_infinite]">
                    <div className="w-full h-full border border-cyan-400/40 rounded-full bg-gradient-to-br from-indigo-500/20 to-transparent flex items-center justify-center">
                      <div className="w-8 h-8 rounded bg-white/90 shadow-xl shadow-cyan-500/50"></div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-4 space-y-2 relative z-10 bg-slate-900/40 p-3 rounded-md backdrop-blur-sm">
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {content || "在这里输入海报详情核心亮点，AI 会根据设定的 Style 间距自动排版..."}
                  </p>
                  <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                    <span>DESIGNED BY AI ENGINE</span>
                    <span>
                      SIZE: {canvasSize.width} x {canvasSize.height}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Variant thumbnails */}
          <div className="grid grid-cols-4 gap-2.5 w-full mt-4">
            {variants.map((v, i) => (
              <div
                key={i}
                className={`aspect-[3/4] rounded border-2 bg-slate-950 p-1 cursor-pointer transition-all ${
                  activeVariant === i
                    ? "border-indigo-500"
                    : "border-slate-800 opacity-60 hover:opacity-100"
                }`}
                onClick={() => setActiveVariant(i)}
              >
                {v ? (
                  <img src={v} alt={`Variant ${i + 1}`} className="w-full h-full object-cover rounded-sm" />
                ) : (
                  <div className="w-full h-full bg-slate-900 rounded-sm text-[9px] flex items-center justify-center text-slate-500">
                    {activeVariant === i ? "生成中..." : `方案 ${i + 1}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Right Panel: Fine-tuning & Export */}
      <section className="col-span-3 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-5 shadow-xl backdrop-blur">
        <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
          <span>02</span> 画布微调 & 导出
        </h2>

        {/* Spacing level */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-slate-400 block">间距调控等级 (Spacing Style)</span>
          <div className="grid grid-cols-3 gap-2">
            {["small", "medium", "large"].map((level) => (
              <button
                key={level}
                className={`py-1.5 text-xs rounded transition-all ${
                  spacingLevel === level
                    ? "bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-medium"
                    : "bg-slate-950 border border-slate-800 text-slate-400"
                }`}
                onClick={() => setSpacingLevel(level)}
              >
                {level === "small" ? "紧凑" : level === "medium" ? "中等" : "宽松"}
              </button>
            ))}
          </div>
        </div>

        {/* Primary color */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-slate-400 block">主色调无损微调 (Primary Color)</span>
          <div className="flex items-center gap-3 bg-slate-950 p-2 border border-slate-800 rounded-lg">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="bg-transparent border-none cursor-pointer w-7 h-7"
            />
            <span className="text-xs font-mono text-slate-300">{primaryColor.toUpperCase()}</span>
          </div>
        </div>

        {/* Element count */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-slate-400 block">附加装饰组件数量 (Allowed Elements)</span>
          <input
            type="range"
            min="0"
            max="10"
            value={elementCount}
            onChange={(e) => setElementCount(Number(e.target.value))}
            className="w-full accent-indigo-500 bg-slate-800 h-1 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>纯净底图</span>
            <span>丰富装饰</span>
          </div>
        </div>

        {/* Advanced prompt */}
        <div className="border-t border-slate-800 my-2 pt-4 space-y-2">
          <label className="text-xs text-slate-400 font-medium block">高级背景 Prompt 补充调整</label>
          <input
            type="text"
            placeholder="3D smooth geometry, glassmorphism, cyberpunk neon accents..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
            value={advancedPrompt}
            onChange={(e) => setAdvancedPrompt(e.target.value)}
          />
        </div>

        {/* Export buttons */}
        <div className="pt-2 grid grid-cols-2 gap-3">
          <button
            className="py-2.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition-all text-center disabled:opacity-50"
            onClick={() => handleDownload("png")}
            disabled={!variants[activeVariant]}
          >
            导出超清 PNG
          </button>
          <button
            className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition-all text-center shadow-md shadow-emerald-600/20 disabled:opacity-50"
            onClick={() => handleDownload("jpg")}
            disabled={!variants[activeVariant]}
          >
            存储并下载 JPG
          </button>
        </div>
      </section>
    </div>
  );
}
