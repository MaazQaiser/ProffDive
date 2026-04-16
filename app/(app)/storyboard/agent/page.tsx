import { Suspense } from "react";
import { StoryboardAgentChat } from "@/components/storyboard/StoryboardAgentChat";

export default function StoryboardAgentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-64px)] pb-24">
          <div className="mx-auto max-w-[1100px] px-6 py-12 text-center text-[14px] text-slate-500">
            Loading…
          </div>
        </div>
      }
    >
      <StoryboardAgentChat />
    </Suspense>
  );
}

