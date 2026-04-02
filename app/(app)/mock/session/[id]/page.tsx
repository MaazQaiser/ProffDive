import { redirect } from "next/navigation";

/** Session detail now lives on the unified Analytics & AI Coaching. */
export default async function SessionDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/report/${id}`);
}
