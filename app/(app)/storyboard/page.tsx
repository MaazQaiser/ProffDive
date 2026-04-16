import { Suspense } from "react";
import StoryBoardPageClient from "./StoryBoardPageClient";

export default function StoryBoardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading…</div>}>
      <StoryBoardPageClient />
    </Suspense>
  );
}

