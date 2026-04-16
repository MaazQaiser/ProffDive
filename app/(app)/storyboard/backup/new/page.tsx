import { Suspense } from "react";
import BackupNewStoryBoardFlowClient from "./NewStoryBoardFlowClient";

export default function BackupNewStoryBoardFlow() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-64px)] pb-24">
          <div className="max-w-[1100px] mx-auto px-6 py-12 text-center text-[14px] text-slate-500">
            Loading storyboard…
          </div>
        </div>
      }
    >
      <BackupNewStoryBoardFlowClient />
    </Suspense>
  );
}

