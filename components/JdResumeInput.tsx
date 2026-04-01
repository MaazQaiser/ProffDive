"use client";

/**
 * JdResumeInput
 * A unified paste-or-upload widget for Job Description and Resume.
 * Props:
 *   label       – section title e.g. "Job Description" | "Resume"
 *   placeholder – textarea placeholder
 *   value       – controlled text value
 *   onChange    – text change handler
 *   onRemove    – called when user removes/collapses
 *   accentColor – optional hex, defaults to #0087A8
 *   compact     – smaller variant (for sidebar use)
 */

import { useRef, useState } from "react";
import { Upload, X, FileText, ClipboardPaste } from "lucide-react";

interface Props {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  onRemove: () => void;
  accentColor?: string;
  compact?: boolean;
}

export function JdResumeInput({
  label,
  placeholder = "Paste or upload content...",
  value,
  onChange,
  onRemove,
  accentColor = "#0087A8",
  compact = false,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab]       = useState<"paste" | "upload">("paste");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function readFile(file: File) {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => onChange((e.target?.result as string) ?? "");
    reader.readAsText(file);
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    readFile(files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  const rows = compact ? 3 : 4;
  const TA_STYLE: React.CSSProperties = {
    width: "100%",
    padding: compact ? "8px 10px" : "10px 12px",
    fontSize: compact ? 12 : 13,
    resize: "none",
    outline: "none",
    borderRadius: 8,
    border: `1px solid rgba(0,0,0,0.09)`,
    background: "rgba(255,255,255,0.60)",
    color: "#0F0F0F",
    lineHeight: 1.6,
    transition: "border-color 0.18s",
    fontFamily: "inherit",
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <p style={{
          fontSize: compact ? 10 : 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: "rgba(15,15,15,0.40)",
        }}>
          {label}
        </p>
        <button
          onClick={onRemove}
          style={{ background: "none", border: "none", color: "rgba(15,15,15,0.30)", cursor: "pointer", padding: "2px 4px", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}
        >
          <X size={11} /> Remove
        </button>
      </div>

      {/* Tab switcher */}
      <div style={{
        display: "flex",
        gap: 2,
        padding: 3,
        background: "rgba(0,0,0,0.05)",
        borderRadius: 8,
        marginBottom: 8,
        width: "fit-content",
      }}>
        {(["paste", "upload"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: compact ? "3px 10px" : "4px 12px",
              fontSize: compact ? 10 : 11,
              fontWeight: 600,
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: tab === t ? "#fff" : "transparent",
              color: tab === t ? "#0F0F0F" : "rgba(15,15,15,0.42)",
              boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
            }}
          >
            {t === "paste" ? <ClipboardPaste size={10} /> : <Upload size={10} />}
            {t === "paste" ? "Paste" : "Upload"}
          </button>
        ))}
      </div>

      {/* Paste tab */}
      {tab === "paste" && (
        <textarea
          value={value}
          onChange={(e) => { onChange(e.target.value); setFileName(null); }}
          autoFocus
          rows={rows}
          placeholder={placeholder}
          style={TA_STYLE}
          onFocus={(e) => (e.target.style.borderColor = accentColor)}
          onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.09)")}
        />
      )}

      {/* Upload tab */}
      {tab === "upload" && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.pdf,.doc,.docx"
            style={{ display: "none" }}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{
              border: `1.5px dashed ${dragging ? accentColor : "rgba(0,0,0,0.14)"}`,
              borderRadius: 10,
              padding: compact ? "16px 12px" : "20px 16px",
              textAlign: "center",
              cursor: "pointer",
              background: dragging ? `${accentColor}08` : "rgba(255,255,255,0.40)",
              transition: "all 0.18s",
            }}
          >
            {fileName ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <FileText size={16} style={{ color: accentColor }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0F0F0F" }}>{fileName}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setFileName(null); onChange(""); }}
                  style={{ background: "none", border: "none", color: "rgba(15,15,15,0.35)", cursor: "pointer" }}
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={compact ? 16 : 18} style={{ color: accentColor, margin: "0 auto 6px" }} />
                <p style={{ fontSize: compact ? 11 : 12, fontWeight: 600, color: "#0F0F0F", marginBottom: 2 }}>
                  Drop file here or <span style={{ color: accentColor }}>browse</span>
                </p>
                <p style={{ fontSize: 10, color: "rgba(15,15,15,0.38)" }}>.txt, .pdf, .doc, .docx</p>
              </>
            )}
          </div>
          {/* Also show extracted text preview if file loaded */}
          {fileName && value && (
            <textarea
              readOnly
              value={value}
              rows={rows - 1}
              style={{ ...TA_STYLE, marginTop: 8, color: "rgba(15,15,15,0.55)", fontSize: 11 }}
            />
          )}
        </div>
      )}
    </div>
  );
}
