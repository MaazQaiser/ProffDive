"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function StoryboardNewRedirectClient() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const role = (params.get("role") ?? "").trim();
    router.replace(role ? `/storyboard/agent?role=${encodeURIComponent(role)}` : "/storyboard/agent");
  }, [router, params]);

  return (
    <div className="min-h-[calc(100vh-64px)] pb-24">
      <div className="mx-auto max-w-[1100px] px-6 py-12 text-center text-[14px] text-slate-500">Opening…</div>
    </div>
  );
}

