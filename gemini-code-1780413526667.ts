// 文件名称: CreativeWorkspace.tsx
// 文件类型: TypeScript React Component (Next.js + Tailwind CSS)

import React from 'react';

export default function CreativeWorkspace() {
  return (
    <div className="grid grid-cols-12 gap-6 h-full items-start">
      
      {/* 左侧控制面板：输入海报文案与风格约束（对应数据表：styles / user_posters） */}
      <section className="col-span-4 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-5 shadow-xl backdrop-blur">
        <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
          <span>01</span> 核心参数设定
        </h2>

        {/* 风格选择区 - 下拉和网格图标结合 */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400 font-medium block">视觉风格模板 (Style Preset)</label>
          <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
            <option value="xiaohongshu">小红书爆款风格 (1242x1660)</option>
            <option value="cyberpunk">赛博朋克潮流 (1080x1350)</option>
            <option value="minimalist">极简现代主义 (A4打印)</option>
            <option value="twitter_post">X/Twitter 社区信息图 (1600x900)</option>
          </select>
        </div>

        {/* 尺寸规范快速切换 */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400 font-medium block">海报排版画布尺寸</label>
          <div className="grid grid-cols-3 gap-2">
            <button className="px-2 py-2 text-xs border border-indigo-500/50 bg-indigo-500/10 rounded-md text-slate-200 text-center">小红书比例</button>
            <button className="px-2 py-2 text-xs border border-slate-800 bg-slate-950 rounded-md text-slate-400 text-center hover:border-slate-700">Ins Post</button>
            <button className="px-2 py-2 text-xs border border-slate-800 bg-slate-950 rounded-md text-slate-400 text-center hover:border-slate-700">A4 纸张</button>
          </div>
        </div>

        {/* 文本内容注入区（对应 user_posters 里的 title/subtitle/content） */}
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium block">海报主标题 (Title)</label>
            <input type="text" placeholder="例：解锁 AI 生产力新密码" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium block">副标题 (Subtitle)</label>
            <input type="text" placeholder="例：PosterMind 2026 年度科技峰会" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium block">正文段落 (Content / Body)</label>
            <textarea rows={4} placeholder="在这里输入海报详情核心亮点，AI 会根据设定的 Style 间距自动排版..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"></textarea>
          </div>
        </div>

        {/* 触发AI生图指令按钮 */}
        <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]">
          开始构建 AI 智能海报
        </button>
      </section>

      {/* 中间核心画布区：渲染4个AI生成的方案（对应工作流第3-5步：AI背景图生成 + 模板规则排版） */}
      <section className="col-span-5 space-y-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">画布实时效果渲染预览</h3>
            <span className="text-[11px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">方案 1 / 4</span>
          </div>

          {/* 模拟生成出来的海报成品 */}
          <div className="w-full aspect-[3/4] bg-gradient-to-b from-indigo-950 via-slate-900 to-black rounded-lg border border-slate-800 relative p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
            {/* 模拟AI生成的精美渐变抽象背景图形 */}
            <div className="absolute top-[-20%] left-[-20%] w-80 h-80 rounded-full bg-indigo-500/10 blur-[80px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 rounded-full bg-cyan-500/10 blur-[80px]"></div>

            {/* 渲染层：标题（应用 style 样式表的 font_family 等） */}
            <div className="space-y-2 relative z-10">
              <span className="text-[10px] tracking-widest text-indigo-400 font-mono font-bold uppercase">✦ POSTERMIND GENERATIVE</span>
              <h1 className="text-2xl font-black text-white tracking-tight leading-snug drop-shadow-md">
                解锁 AI 生产力新密码
              </h1>
              <p className="text-xs text-slate-400 tracking-wide font-medium">
                PosterMind 2026 年度科技峰会
              </p>
            </div>

            {/* 渲染层：中部核心锁定的视觉元素（对应表：layout_json / locked_elements） */}
            <div className="my-auto flex justify-center items-center relative z-10 py-4">
              <div className="w-40 h-40 border-2 border-dashed border-indigo-500/30 rounded-full flex items-center justify-center p-2 animate-[spin_40s_linear_infinite]">
                <div className="w-full h-full border border-cyan-400/40 rounded-full bg-gradient-to-br from-indigo-500/20 to-transparent flex items-center justify-center">
                  <div className="w-8 h-8 rounded bg-white/90 shadow-xl shadow-cyan-500/50"></div>
                </div>
              </div>
            </div>

            {/* 渲染层：底部正文数据 */}
            <div className="border-t border-slate-800/80 pt-4 space-y-2 relative z-10 bg-slate-900/40 p-3 rounded-md backdrop-blur-sm">
              <p className="text-[11px] text-slate-300 leading-relaxed">
                在这里输入海报详情核心亮点，AI 会根据设定的 Style 间距自动排版...
              </p>
              <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                <span>DESIGNED BY AI ENGINE</span>
                <span>SIZE: 1242 × 1660</span>
              </div>
            </div>
          </div>
          
          {/* 四个替代生图结果的小缩略图轮播（AI生成4个方案切换） */}
          <div className="grid grid-cols-4 gap-2.5 w-full mt-4">
            <div className="aspect-[3/4] rounded border-2 border-indigo-500 bg-slate-950 p-1 cursor-pointer">
              <div className="w-full h-full bg-slate-900 rounded-sm text-[9px] flex items-center justify-center text-indigo-400 font-bold">方案 1</div>
            </div>
            <div className="aspect-[3/4] rounded border border-slate-800 bg-slate-950 p-1 cursor-pointer opacity-60 hover:opacity-100 transition-all">
              <div className="w-full h-full bg-slate-900 rounded-sm text-[9px] flex items-center justify-center text-slate-500">方案 2</div>
            </div>
            <div className="aspect-[3/4] rounded border border-slate-800 bg-slate-950 p-1 cursor-pointer opacity-60 hover:opacity-100 transition-all">
              <div className="w-full h-full bg-slate-900 rounded-sm text-[9px] flex items-center justify-center text-slate-500">方案 3</div>
            </div>
            <div className="aspect-[3/4] rounded border border-slate-800 bg-slate-950 p-1 cursor-pointer opacity-60 hover:opacity-100 transition-all">
              <div className="w-full h-full bg-slate-900 rounded-sm text-[9px] flex items-center justify-center text-slate-500">方案 4</div>
            </div>
          </div>
        </div>
      </section>

      {/* 右侧微调面板：元素级微调与导出（对应 MVP 里的 元素微调 与 下载功能） */}
      <section className="col-span-4 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-5 shadow-xl backdrop-blur">
        <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
          <span>02</span> 画布微调 & 导出
        </h2>

        {/* 动态排版微调（对应 elements 与 layout_json 的无损修改） */}
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-400 block">间距调控等级 (Spacing Style)</span>
            <div className="grid grid-cols-3 gap-2">
              <button className="py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-400">紧凑</button>
              <button className="py-1.5 text-xs bg-indigo-600/20 border border-indigo-500/40 rounded text-indigo-300 font-medium">中等 (标准)</button>
              <button className="py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-400">宽松</button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-400 block">主色调无损微调 (Primary Color)</span>
            <div className="flex items-center gap-3 bg-slate-950 p-2 border border-slate-800 rounded-lg">
              <input type="color" defaultValue="#6366f1" className="bg-transparent border-none cursor-pointer w-7 h-7" />
              <span className="text-xs font-mono text-slate-300">#6366F1 (科技靛蓝)</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-400 block">附加装饰组件数量 (Allowed Elements)</span>
            <input type="range" min="0" max="10" defaultValue="4" className="w-full accent-indigo-500 bg-slate-800 h-1 rounded-lg cursor-pointer" />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>纯净底图</span>
              <span>丰富装饰</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 my-2 pt-4 space-y-2">
          <label className="text-xs text-slate-400 font-medium block">高级背景 Prompt 补充调整</label>
          <input type="text" placeholder="3D smooth geometry, glassmorphism, cyberpunk neon accents..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500" />
        </div>

        {/* 导出成品按钮 */}
        <div className="pt-2 grid grid-cols-2 gap-3">
          <button className="py-2.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs transition-all text-center">
            导出超清 PNG
          </button>
          <button className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition-all text-center shadow-md shadow-emerald-600/20">
            存储并下载 JPG
          </button>
        </div>
      </section>

    </div>
  );
}