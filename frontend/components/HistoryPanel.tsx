"use client";

import React, { useCallback, useEffect, useState } from "react";
import { api, API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface HistoryItem {
  id: string;
  title: string | null;
  image_url: string | null;
  style_name: string;
  status: string;
  created_at: string;
}

export default function HistoryPanel() {
  const { user } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.get<HistoryItem[]>(`/api/posters/history?user_id=${user.id}`);
      setItems(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filtered = statusFilter === "all" ? items : items.filter((i) => i.status === statusFilter);

  const handleDownload = async (item: HistoryItem) => {
    if (!item.image_url) return;
    const url = item.image_url.startsWith("http") ? item.image_url : `${API_BASE_URL}${item.image_url}`;
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `poster_${item.id.slice(0, 8)}.png`;
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[3/4] bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-rose-400 mb-4">{error}</p>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
          onClick={fetchHistory}
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">历史生成记录</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">筛选:</span>
          <select
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">全部</option>
            <option value="completed">已完成</option>
            <option value="pending">生成中</option>
            <option value="failed">失败</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 mb-2">暂无海报生成记录</p>
          <p className="text-xs text-slate-600">去首页创建你的第一张 AI 海报吧</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all"
            >
              <div className="aspect-[3/4] bg-slate-800 relative">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title || "Poster"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                    {item.status === "pending" ? "生成中..." : item.status === "failed" ? "生成失败" : "无预览"}
                  </div>
                )}
              </div>
              <div className="p-3 space-y-1.5">
                <h3 className="text-sm font-medium text-slate-200 truncate">
                  {item.title || "未命名海报"}
                </h3>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">{item.style_name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded ${
                      item.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : item.status === "failed"
                        ? "bg-rose-500/10 text-rose-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {item.status === "completed" ? "完成" : item.status === "failed" ? "失败" : "生成中"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-600">
                  <span>{new Date(item.created_at).toLocaleDateString("zh-CN")}</span>
                  {item.image_url && (
                    <button
                      className="text-indigo-400 hover:text-indigo-300 transition-colors"
                      onClick={() => handleDownload(item)}
                    >
                      下载
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
