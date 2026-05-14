/**
 * Glass + layout tokens aligned with app report/dashboard surfaces
 * (linear glass gradient, blur, white border, soft shadow).
 */
export const SUPER_GLASS_PANEL =
  "relative overflow-hidden border-[0.5px] border-white/90 bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)] shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px]";

export const SUPER_GLASS_INSET =
  "pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_-5px_-5px_250px_0px_rgba(255,255,255,0.02)]";

export const superGlassCardRadius = (radiusClass: string) => `${SUPER_GLASS_PANEL} ${radiusClass}`;

/** Default card: matches report `glassCard` (24px) */
export const SUPER_GLASS_CARD = superGlassCardRadius("rounded-[24px]");

/** Medium: tables, smaller panels (16px) */
export const SUPER_GLASS_CARD_MD = superGlassCardRadius("rounded-[16px]");

/** Teal for primary text/links — same family as report session pages */
export const SUPER_TEAL = "#0A89A9";
