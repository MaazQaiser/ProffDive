"use client";

import clsx from "clsx";
import { SUPER_GLASS_CARD, SUPER_GLASS_INSET } from "@/components/superadmin/superadmin-glass";

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
      <div
        className={clsx(
          "relative overflow-hidden border border-dashed border-slate-200/90 bg-white/30 px-4 py-10 text-center text-sm text-[#64748B] shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-[12px] rounded-[24px]"
        )}
      >
        {empty}
      </div>
    );
  }

  return (
    <div className={clsx("relative", SUPER_GLASS_CARD)}>
      <span aria-hidden className={SUPER_GLASS_INSET} />
      <div className="relative z-[1] overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200/80 bg-white/35">
            {columns.map((c) => (
              <th key={c.key} className={clsx("px-4 py-3 font-medium text-[#64748B]", c.className)}>
                {c.header}
              </th>
            ))}
            {actions ? (
              <th className="px-4 py-3 text-right font-medium text-[#64748B]">Actions</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              className="border-b border-slate-200/50 last:border-0 transition-colors hover:bg-white/45"
            >
              {columns.map((c) => (
                <td key={c.key} className={clsx("px-4 py-3 text-[#1E293B]", c.className)}>
                  {c.render ? c.render(row) : cellText(row, c.key)}
                </td>
              ))}
              {actions ? <td className="px-4 py-3 text-right">{actions(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
