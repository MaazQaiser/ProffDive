import Link from "next/link";
import clsx from "clsx";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className={clsx("mb-8 flex flex-col gap-4 pt-6 sm:flex-row sm:items-start sm:justify-between")}>
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--text-1)]">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-[var(--text-2)]">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex text-sm font-medium text-[var(--primary)] hover:underline"
    >
      ← {children}
    </Link>
  );
}
