"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import type { Edge, Node, NodeTypes } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { INTRO_SECTION_ID, isIntroSection, mockStoryScore, type CraftSection } from "@/lib/storyboard-crafting";

type MindMapKind = "center" | "pillar" | "leaf";

export type StoryboardMindMapNodeData = {
  kind: MindMapKind;
  label: string;
  subtitle?: string;
  score?: number;
  section?: CraftSection;
  expanded?: boolean;
  onToggleNode?: (id: string) => void;
  avatarInitials?: string;
};

export const nodeTypes: NodeTypes = {
  mindmap: StoryboardMindMapNode,
};

const HANDLE_STYLE = { opacity: 0, pointerEvents: "none" as const };

/** Match dashboard / storyboard score heat */
function scoreBandColor(v: number): string {
  if (v < 2.5) return "#EF4444";
  if (v < 3.5) return "#D97706";
  return "#059669";
}

/** Glass surfaces aligned with `glassCard` on dashboard — score tints readiness bands */
function nodeGlassShell(score: number | undefined): string {
  const base =
    "relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[21px] border-[0.5px] border-white/90";
  if (typeof score !== "number") {
    return `${base} bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)]`;
  }
  if (score < 2.5) {
    return `${base} bg-[linear-gradient(90.31deg,rgba(254,226,226,0.55)_0%,rgba(255,255,255,0.58)_99.92%)]`;
  }
  if (score < 3.5) {
    return `${base} bg-[linear-gradient(90.31deg,rgba(255,233,197,0.5)_0%,rgba(255,255,255,0.58)_99.92%)]`;
  }
  return `${base} bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)]`;
}

function StoryboardMindMapNode({ data }: { data: StoryboardMindMapNodeData }) {
  const isLeaf = data.kind === "leaf";
  const isCenter = data.kind === "center";
  const expanded = Boolean(data.expanded);
  const score = typeof data.score === "number" ? data.score : undefined;

  const isExpandable = isLeaf || isCenter;
  const canToggle = isExpandable && typeof data.onToggleNode === "function" && data.section;

  return (
    <div
      className={[nodeGlassShell(score), isCenter ? "rounded-[24px]" : "rounded-[16px]"].join(" ")}
      style={{
        width: data.kind === "center" ? 440 : data.kind === "pillar" ? 240 : 300,
      }}
    >
      {/* 4-side hidden handles so edges can attach cleanly */}
      <Handle id="t" type="target" position={Position.Top} style={HANDLE_STYLE} />
      <Handle id="r" type="target" position={Position.Right} style={HANDLE_STYLE} />
      <Handle id="b" type="target" position={Position.Bottom} style={HANDLE_STYLE} />
      <Handle id="l" type="target" position={Position.Left} style={HANDLE_STYLE} />
      <Handle id="t" type="source" position={Position.Top} style={HANDLE_STYLE} />
      <Handle id="r" type="source" position={Position.Right} style={HANDLE_STYLE} />
      <Handle id="b" type="source" position={Position.Bottom} style={HANDLE_STYLE} />
      <Handle id="l" type="source" position={Position.Left} style={HANDLE_STYLE} />

      <button
        type="button"
        onClick={() => (canToggle ? data.onToggleNode?.(data.section!.id) : undefined)}
        className={[
          "w-full text-left transition-[filter] hover:brightness-[1.02]",
          isCenter ? "px-5 py-4" : "px-4 py-3",
          canToggle ? "cursor-pointer" : "cursor-default",
        ].join(" ")}
        aria-expanded={isExpandable ? expanded : undefined}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex items-start gap-3">
            {isCenter && (
              <div
                className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/90 bg-[linear-gradient(90.31deg,rgba(177,226,255,0.35)_0%,rgba(230,248,255,0.55)_99.92%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
                aria-hidden
              >
                <span className="text-[13px] font-semibold tracking-tight text-[#0A89A9]">
                  {data.avatarInitials || "You"}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <div
                className={[
                  "leading-snug tracking-tight",
                  isCenter && "text-[22px] font-medium text-[#1E293B] md:text-[24px]",
                  data.kind === "pillar" && "text-[16px] font-medium text-[#475569]",
                  isLeaf && "text-[16px] font-semibold text-[#1E293B]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {data.label}
              </div>
              {data.subtitle && (
                <div className="mt-1 truncate text-[12px] font-normal text-[#64748B]">{data.subtitle}</div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {typeof score === "number" &&
              (isLeaf ? (
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[10px] font-medium text-[#64748B]">Evidence strength</span>
                  <span
                    className="text-[18px] font-semibold tabular-nums leading-none"
                    style={{ color: scoreBandColor(score) }}
                  >
                    {score.toFixed(1)}
                  </span>
                </div>
              ) : (
                <p className="flex items-end">
                  <span
                    className="text-[24px] font-semibold leading-none tabular-nums"
                    style={{ color: scoreBandColor(score) }}
                  >
                    {score.toFixed(1)}
                  </span>
                  <span className="text-[16px] font-normal leading-none text-[#64748B]">/05</span>
                </p>
              ))}
            {isExpandable && (
              <span className="text-[#94A3B8]" aria-hidden>
                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
            )}
          </div>
        </div>
      </button>

      {isExpandable && expanded && data.section && (
        <div className="px-4 pb-4">
          <div className="rounded-[16px] border border-[#E2E8F0] bg-white/40 px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-[21px]">
            {isIntroSection(data.section.id) ? (
              <Block label="Introduction" text={data.section.car.context} />
            ) : (
              <>
                <Block label="Context" text={data.section.car.context} />
                <div className="h-2" />
                <Block label="Action" text={data.section.car.action} />
                <div className="h-2" />
                <Block label="Result" text={data.section.car.result} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">{label}</div>
      <div className="mt-1 whitespace-pre-wrap text-[12px] leading-relaxed text-[#475569]">{(text ?? "").trim()}</div>
    </div>
  );
}

const PILLAR_BUCKETS: { key: "thinking" | "action" | "people" | "mastery"; label: string }[] = [
  { key: "thinking", label: "Power of Thinking" },
  { key: "action", label: "Power of Action" },
  { key: "people", label: "Power of People" },
  { key: "mastery", label: "Power of Mastery" },
];

function bucketForPillar(pillar: string): (typeof PILLAR_BUCKETS)[number]["key"] | null {
  if (pillar.includes("Thinking")) return "thinking";
  if (pillar.includes("Action")) return "action";
  if (pillar.includes("People")) return "people";
  if (pillar.includes("Mastery")) return "mastery";
  return null;
}

export function buildStoryboardMindMapGraph({
  sections,
  userName,
  userRole,
  expandedNodeIds,
  onToggleNode,
}: {
  sections: CraftSection[];
  userName: string;
  userRole: string;
  expandedNodeIds: Set<string>;
  onToggleNode: (id: string) => void;
}): { nodes: Node<StoryboardMindMapNodeData>[]; edges: Edge[] } {
  const intro = sections.find((s) => s.id === INTRO_SECTION_ID) ?? sections.find((s) => isIntroSection(s.id));

  const byBucket: Record<string, CraftSection[]> = { thinking: [], action: [], people: [], mastery: [] };
  for (const s of sections) {
    if (isIntroSection(s.id)) continue;
    const b = bucketForPillar(s.pillar);
    if (!b) continue;
    byBucket[b].push(s);
  }

  // Stable ordering based on SECTION_DEFS order (the incoming `sections` already follows it).
  for (const k of Object.keys(byBucket)) {
    byBucket[k] = byBucket[k].slice(0, 3);
  }

  const nodes: Node<StoryboardMindMapNodeData>[] = [];
  const edges: Edge[] = [];

  // Layout constants
  const center = { x: 0, y: 0 };
  // Paper-wireframe layout: 2 pillars on the right, 2 on the left, each with 3 leaves stacked outward.
  const rightX = 520;
  const leftX = -520;
  const topY = -220;
  const bottomY = 220;

  const leafX = 360; // distance from pillar to leaf stack (outward)
  const leafYGapCollapsed = 80;
  const leafYGapExpanded = 120;

  const sideHandle = (dx: number, dy: number): "t" | "r" | "b" | "l" => {
    if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "r" : "l";
    return dy >= 0 ? "b" : "t";
  };

  const initials = deriveInitials(userName);

  nodes.push({
    id: "center",
    type: "mindmap",
    position: center,
    data: {
      kind: "center",
      label: "Core Introduction",
      subtitle: `${userName?.trim() || "Your profile"} • ${userRole?.trim() || "Role"}`,
      score: intro ? mockStoryScore(intro.id) : undefined,
      section: intro,
      expanded: Boolean(intro && expandedNodeIds.has(intro.id)),
      onToggleNode,
      avatarInitials: initials,
    },
  });

  // Map pillars to the paper positions (1/2 on right, 3/4 on left).
  // Order is stable and deterministic.
  const pillarPos: Record<string, { x: number; y: number }> = {
    thinking: { x: rightX, y: topY },  // 1
    action: { x: rightX, y: bottomY }, // 2
    people: { x: leftX, y: topY },     // 3
    mastery: { x: leftX, y: bottomY }, // 4
  };

  for (const p of PILLAR_BUCKETS) {
    const pos = pillarPos[p.key];
    const pillarId = `pillar:${p.key}`;
    const leaves = byBucket[p.key] ?? [];
    const pillarScore = avg(leaves.map((s) => mockStoryScore(s.id)));
    nodes.push({
      id: pillarId,
      type: "mindmap",
      position: pos,
      data: {
        kind: "pillar",
        label: p.label,
        score: typeof pillarScore === "number" ? pillarScore : undefined,
      },
    });

    const centerToPillarSource = sideHandle(pos.x - center.x, pos.y - center.y);
    const centerToPillarTarget = sideHandle(center.x - pos.x, center.y - pos.y);
    edges.push({
      id: `e:center->${pillarId}`,
      source: "center",
      target: pillarId,
      sourceHandle: centerToPillarSource,
      targetHandle: centerToPillarTarget,
      type: "default",
      animated: false,
      style: { stroke: "rgba(71,85,105,0.45)", strokeWidth: 2 },
    });

    // If a leaf is expanded, reserve vertical space so siblings don't overlap its details.
    // This is a deterministic approximation (React Flow doesn't auto-layout expanded nodes).
    const EXPANDED_PUSH_Y = 240;
    const expandedBeforeCountForIndex = (idx: number) => {
      let count = 0;
      for (let j = 0; j < idx; j++) {
        const s = leaves[j];
        if (s && expandedNodeIds.has(s.id)) count++;
      }
      return count;
    };

    for (let i = 0; i < leaves.length; i++) {
      const s = leaves[i];
      const leafId = `leaf:${s.id}`;
      const expanded = expandedNodeIds.has(s.id);

      const branchAnyExpanded = leaves.some((x) => expandedNodeIds.has(x.id));
      const gapY = branchAnyExpanded ? leafYGapExpanded : leafYGapCollapsed;

      // Leaves are stacked vertically, outward from the pillar (paper wireframe).
      const outward = pos.x > 0 ? 1 : -1;
      const baseLeafX = pos.x + outward * leafX;
      const pushY = expandedBeforeCountForIndex(i) * EXPANDED_PUSH_Y;
      const leafY = pos.y + (i - 1) * gapY + pushY;

      nodes.push({
        id: leafId,
        type: "mindmap",
        position: { x: baseLeafX, y: leafY },
        data: {
          kind: "leaf",
          label: s.title,
          score: mockStoryScore(s.id),
          section: s,
          expanded,
          onToggleNode,
        },
      });

      const pillarToLeafSource = sideHandle(baseLeafX - pos.x, leafY - pos.y);
      const pillarToLeafTarget = sideHandle(pos.x - baseLeafX, pos.y - leafY);
      edges.push({
        id: `e:${pillarId}->${leafId}`,
        source: pillarId,
        target: leafId,
        sourceHandle: pillarToLeafSource,
        targetHandle: pillarToLeafTarget,
        type: "default",
        animated: false,
        style: { stroke: "rgba(71,85,105,0.32)", strokeWidth: 2 },
      });
    }
  }

  return { nodes, edges };
}

function deriveInitials(name: string): string {
  const parts = (name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  const raw = parts.map((p) => p[0]?.toUpperCase()).join("");
  return raw || "You";
}

function avg(nums: number[]): number | null {
  if (!nums.length) return null;
  const sum = nums.reduce((a, b) => a + b, 0);
  return sum / nums.length;
}

