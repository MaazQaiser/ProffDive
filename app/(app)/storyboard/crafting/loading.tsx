"use client";

import { useUser } from "@/lib/user-context";
import { StoryGenerationLoadingScreen } from "@/components/StoryGenerationLoadingScreen";

export default function Loading() {
  const { user } = useUser();
  return <StoryGenerationLoadingScreen name={user.name || "Maaz"} />;
}

