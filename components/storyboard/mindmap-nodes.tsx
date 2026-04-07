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

function StoryboardMindMapNode({ data }: { data: StoryboardMindMapNodeData }) {
  const isLeaf = data.kind === "leaf";
  const isCenter = data.kind === "center";
  const expanded = Boolean(data.expanded);
  const score = typeof data.score === "number" ? data.score : undefined;
  const lowScore = typeof score === "number" && score < 2.5;

  const isExpandable = isLeaf || isCenter;
  const canToggle = isExpandable && typeof data.onToggleNode === "function" && data.section;

  return (
    <div
      className={[
        "rounded-2xl border shadow-sm",
        "backdrop-blur-[18px]",
        lowScore ? "border-rose-200/70 bg-rose-50/50" : "border-white/70 bg-white/55",
        isCenter ? "shadow-md" : "",
      ].join(" ")}
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
          "w-full text-left",
          isCenter ? "px-5 py-4" : "px-4 py-3",
          canToggle ? "cursor-pointer" : "cursor-default",
        ].join(" ")}
        aria-expanded={isExpandable ? expanded : undefined}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex items-start gap-3">
            {isCenter && (
              <div className="mt-0.5 w-11 h-11 rounded-2xl bg-[#0087A8]/15 border border-[#0087A8]/20 flex items-center justify-center shrink-0">
                <span className="text-[13px] font-extrabold tracking-tight text-[#0087A8]">
                  {data.avatarInitials || "You"}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <div
                className={`${
                  isCenter ? "text-[24px]" : "text-[16px]"
                } font-extrabold tracking-tight text-slate-900 leading-snug`}
              >
                {data.label}
              </div>
              {data.subtitle && (
                <div className="text-[14px] font-semibold text-slate-500 mt-1 truncate">
                  {data.subtitle}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {typeof score === "number" && (
              <div
                className={[
                  "rounded-xl border px-2 py-1",
                  lowScore ? "border-rose-200/70 bg-rose-100/60" : "border-slate-200/70 bg-white/60",
                ].join(" ")}
              >
                <div className="text-[14px] font-extrabold tabular-nums text-slate-900 leading-none">{score.toFixed(1)}</div>
              </div>
            )}
            {isExpandable && <span className="text-slate-400">{expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>}
          </div>
        </div>
      </button>

      {isExpandable && expanded && data.section && (
        <div className="px-4 pb-4">
          <div className="rounded-xl border border-white/70 bg-white/50 px-3 py-3">
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
      <div className="text-[12px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
      <div className="text-[12px] leading-relaxed text-slate-700 mt-1 whitespace-pre-wrap">{(text ?? "").trim()}</div>
    </div>
  );
}

const PILLAR_BUCKETS: { key: "thinking" | "action" | "people" | "mastery"; label: string }[] = [
  { key: "thinking", label: "Thinking" },
  { key: "action", label: "Action" },
  { key: "people", label: "People" },
  { key: "mastery", label: "Mastery" },
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
      type: "bezier",
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
        type: "bezier",
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

