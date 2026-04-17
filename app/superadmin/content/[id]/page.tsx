"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { ContentModuleDetail } from "@/components/superadmin/ContentModuleDetail";
import { BackLink, PageHeader } from "@/components/superadmin/PageHeader";
import { useTrainingModules } from "@/lib/superadmin/hooks";

export default function ContentModuleDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const { modules, loaded, update } = useTrainingModules();
  const mod = useMemo(() => modules.find((m) => m.id === id), [modules, id]);

  if (!loaded) return <p className="text-sm text-[var(--text-2)]">Loading…</p>;
  if (!mod) return <p className="text-sm text-[var(--accent-error)]">Module not found.</p>;

  return (
    <>
      <BackLink href="/superadmin/content">Content</BackLink>
      <PageHeader
        title={mod.title}
        description={`${mod.category} · ${mod.status === "published" ? "Published" : "Draft"}`}
        actions={
          <Link
            href={`/superadmin/content/${id}/edit`}
            className="rounded-[var(--r-button)] border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--bg-subtle)]"
          >
            Edit meta
          </Link>
        }
      />

      <ContentModuleDetail
        module={mod}
        onChange={(patch) => {
          update(id, patch);
        }}
      />
    </>
  );
}
