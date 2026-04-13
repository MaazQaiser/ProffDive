import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

const CHIP_LAYOUT =
  "inline-flex min-h-7 max-w-full items-center justify-center rounded-full px-2.5 py-1 text-center text-[12px] font-medium leading-tight tracking-[-0.01em] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] backdrop-blur-[43px]";

const CHIP_IDLE =
  "border-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.6)_49%,rgba(224,249,255,0.4)_100%)] text-[#475569]";

const CHIP_IDLE_INTERACTIVE =
  "border-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.6)_49%,rgba(224,249,255,0.4)_100%)] text-[#475569] transition-[background-color,background,color,box-shadow] hover:bg-white hover:text-[#0F172A]";

const CHIP_SELECTED =
  "border border-[#0087A8] bg-[#E6F6FA] font-semibold text-[#0087A8] shadow-[0_1px_2px_rgba(0,135,168,0.12)]";

const CHIP_FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#0087A8]/25 focus-visible:ring-offset-1";

export type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

/**
 * Compact selectable tag (Figma: Inshphere SaaS V2 · node `859-4592`).
 * Idle chips use a glass pill surface; selected state uses brand border and fill.
 */
export function Chip({ selected = false, className = "", style, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      style={style}
      className={[
        CHIP_LAYOUT,
        selected ? CHIP_SELECTED : CHIP_IDLE_INTERACTIVE,
        CHIP_FOCUS,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-selected={selected ? "true" : undefined}
      {...props}
    >
      {children}
    </button>
  );
}

export type ChipStaticProps = HTMLAttributes<HTMLSpanElement>;

/** Same surface as an idle `Chip`, for non-interactive labels (e.g. report tags). */
export function ChipStatic({ className = "", style, children, ...props }: ChipStaticProps) {
  return (
    <span
      style={style}
      className={[CHIP_LAYOUT, CHIP_IDLE, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
