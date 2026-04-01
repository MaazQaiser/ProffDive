import { redirect } from "next/navigation";

/** Session detail now lives on the unified Performance Report. */
export default async function SessionDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/report/${id}`);
}
