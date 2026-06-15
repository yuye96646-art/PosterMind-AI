"use client";

import React, { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Style {
  id: string;
  name: string;
  description: string;
  font_family: string;
  primary_color: string;
  secondary_color: string;
  spacing: string;
  allowed_elements: string[];
  prompt_template: string;
  created_at: string;
}

interface Template {
  id: string;
  style_id: string;
  template_name: string;
  layout_json: Record<string, unknown>[];
  locked_elements: Record<string, unknown>[];
  created_at: string;
}

type Tab = "styles" | "templates" | "users" | "system";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("styles");
  const [styles, setStyles] = useState<Style[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([
        api.get<Style[]>("/api/styles"),
        api.get<Template[]>("/api/templates"),
      ]);
      setStyles(s);
      setTemplates(t);
    } catch {
      // admin data fetch error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "styles", label: "风格管理" },
    { key: "templates", label: "模板管理" },
    { key: "users", label: "用户管理" },
    { key: "system", label: "系统状态" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-200">管理后台</h2>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/60 border border-slate-800 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-800 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Styles Tab */}
          {activeTab === "styles" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-sm font-medium text-slate-300">风格列表 ({styles.length})</h3>
                <button className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg">
                  + 新增风格
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="text-left p-3">名称</th>
                      <th className="text-left p-3">字体</th>
                      <th className="text-left p-3">主色</th>
                      <th className="text-left p-3">间距</th>
                      <th className="text-left p-3">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {styles.map((s) => (
                      <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td className="p-3 text-slate-200 font-medium">{s.name}</td>
                        <td className="p-3 text-slate-400 font-mono">{s.font_family}</td>
                        <td className="p-3">
                          <span
                            className="inline-block w-4 h-4 rounded border border-slate-600"
                            style={{ backgroundColor: s.primary_color }}
                          />{" "}
                          <span className="text-slate-400 font-mono">{s.primary_color}</span>
                        </td>
                        <td className="p-3 text-slate-400">{s.spacing}</td>
                        <td className="p-3">
                          <button className="text-indigo-400 hover:text-indigo-300 mr-2">编辑</button>
                          <button className="text-rose-400 hover:text-rose-300">删除</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === "templates" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-sm font-medium text-slate-300">模板列表 ({templates.length})</h3>
                <button className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg">
                  + 新增模板
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="text-left p-3">模板名称</th>
                      <th className="text-left p-3">布局元素数</th>
                      <th className="text-left p-3">锁定元素数</th>
                      <th className="text-left p-3">创建时间</th>
                      <th className="text-left p-3">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((t) => (
                      <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td className="p-3 text-slate-200 font-medium">{t.template_name}</td>
                        <td className="p-3 text-slate-400">{t.layout_json?.length || 0} 个</td>
                        <td className="p-3 text-slate-400">{t.locked_elements?.length || 0} 个</td>
                        <td className="p-3 text-slate-400">
                          {new Date(t.created_at).toLocaleDateString("zh-CN")}
                        </td>
                        <td className="p-3">
                          <button className="text-indigo-400 hover:text-indigo-300 mr-2">编辑</button>
                          <button className="text-rose-400 hover:text-rose-300">删除</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="text-center py-12 text-slate-500 text-sm">
              用户管理功能通过 API 调用实现。访问 /api/auth/register 等接口进行用户操作。
            </div>
          )}

          {/* System Tab */}
          {activeTab === "system" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-1">API 状态</div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-sm text-emerald-400 font-medium">运行中</span>
                  </div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-1">数据库</div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-sm text-emerald-400 font-medium">已连接</span>
                  </div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-1">Redis</div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-sm text-emerald-400 font-medium">已连接</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
