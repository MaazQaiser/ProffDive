"use client";

import "@xyflow/react/dist/style.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "@xyflow/react";
import { buildStoryboardMindMapGraph, type StoryboardMindMapNodeData, nodeTypes } from "./mindmap-nodes";
import type { CraftSection } from "@/lib/storyboard-crafting";

export function StoryboardMindMap({
  userName,
  userRole,
  sections,
}: {
  userName: string;
  userRole: string;
  sections: CraftSection[];
}) {
  return (
    <ReactFlowProvider>
      <StoryboardMindMapInner userName={userName} userRole={userRole} sections={sections} />
    </ReactFlowProvider>
  );
}

function StoryboardMindMapInner({
  userName,
  userRole,
  sections,
}: {
  userName: string;
  userRole: string;
  sections: CraftSection[];
}) {
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(() => new Set());
  const rf = useRef<ReactFlowInstance<Node<StoryboardMindMapNodeData>, Edge> | null>(null);

  const toggleNode = useCallback((id: string) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const { nodes, edges } = useMemo(() => {
    return buildStoryboardMindMapGraph({
      sections,
      userName,
      userRole,
      expandedNodeIds,
      onToggleNode: toggleNode,
    });
  }, [expandedNodeIds, sections, toggleNode, userName, userRole]);

  useEffect(() => {
    const t = setTimeout(() => {
      rf.current?.fitView({ padding: 0.22, duration: 350, includeHiddenNodes: true });
    }, 0);
    return () => clearTimeout(t);
  }, [nodes.length, edges.length]);

  return (
    <div className="h-[70vh] min-h-[560px] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={(instance) => {
          rf.current = instance;
          instance.fitView({ padding: 0.22, duration: 0, includeHiddenNodes: true });
        }}
        minZoom={0.15}
        maxZoom={1.6}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        proOptions={{ hideAttribution: true }}
      >
        <Controls
          showInteractive={false}
          className="!bg-white/80 !backdrop-blur-[12px] !border !border-slate-200 !rounded-xl !shadow-sm"
        />
        <Background gap={18} size={1} color="rgba(148,163,184,0.35)" />
      </ReactFlow>
    </div>
  );
}

