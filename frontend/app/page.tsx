"use client";

import CreativeWorkspace from "@/components/CreativeWorkspace";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500 text-sm">加载中...</p>
      </div>
    );
  }

  return <CreativeWorkspace key={user?.id} />;
}
