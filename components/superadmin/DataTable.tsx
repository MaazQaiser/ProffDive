"use client";

import clsx from "clsx";

export type Column<T> = {
  key: string;
  header: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
};

function cellText<T extends object>(row: T, key: string): string {
  const v = (row as Record<string, unknown>)[key];
  if (v === undefined || v === null) return "—";
  return String(v);
}

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  empty?: string;
  actions?: (row: T) => React.ReactNode;
};

export function DataTable<T extends object>({
  columns,
  rows,
  getRowKey,
  empty = "No rows",
  actions,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[var(--r-card)] border border-dashed border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-10 text-center text-sm text-[var(--text-2)]">
        {empty}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--r-card)] border border-[var(--border)] bg-[var(--bg-surface)]">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--bg-subtle)]">
            {columns.map((c) => (
              <th key={c.key} className={clsx("px-4 py-3 font-medium text-[var(--text-2)]", c.className)}>
                {c.header}
              </th>
            ))}
            {actions ? (
              <th className="px-4 py-3 text-right font-medium text-[var(--text-2)]">Actions</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-subtle)]/80">
              {columns.map((c) => (
                <td key={c.key} className={clsx("px-4 py-3 text-[var(--text-1)]", c.className)}>
                  {c.render ? c.render(row) : cellText(row, c.key)}
                </td>
              ))}
              {actions ? <td className="px-4 py-3 text-right">{actions(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
