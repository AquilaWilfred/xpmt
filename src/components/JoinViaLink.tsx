// ═══════════════════════════════════════
// XPMT — Join via Link Component
// ═══════════════════════════════════════

import { useState } from "react";
import { call } from "../hooks/useInvoke";

interface JoinResult {
  project_id:   string;
  project_name: string;
  workspace_id: string;
  space_id:     string;
}

interface Props {
  userId:    string;
  onJoined:  (result: JoinResult) => void;
  onClose:   () => void;
}

export default function JoinViaLink({ userId, onJoined, onClose }: Props) {
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [preview, setPreview] = useState<JoinResult | null>(null);

  const extractToken = (raw: string): string => {
    const trimmed = raw.trim();
    if (trimmed.startsWith("xpmt://join/")) {
      return trimmed.replace("xpmt://join/", "");
    }
    return trimmed;
  };

  const previewLink = async () => {
    const token = extractToken(input);
    if (!token || token.length < 10) {
      setError("Please paste a valid XPMT link!"); return;
    }
    setLoading(true); setError(null);
    try {
      const result = await call<JoinResult>(
        "validate_share_link", { token }
      );
      setPreview(result);
    } catch (err) { setError(String(err)); }
    finally { setLoading(false); }
  };

  const joinProject = async () => {
    const token = extractToken(input);
    setLoading(true); setError(null);
    try {
      const result = await call<JoinResult>(
        "join_via_link", { token, userId }
      );
      onJoined(result);
    } catch (err) { setError(String(err)); }
    finally { setLoading(false); }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>

        <div style={styles.header}>
          <div style={styles.title}>🔗 Join via Link</div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.body}>
          <div style={styles.label}>Paste your invite link</div>
          <div style={styles.inputRow}>
            <input style={styles.input}
              placeholder="xpmt://join/abc123... or paste token"
              value={input}
              onChange={e => { setInput(e.target.value); setPreview(null); setError(null); }}
              onKeyDown={e => e.key === "Enter" && previewLink()}
            />
            <button style={styles.previewBtn}
              onClick={previewLink} disabled={loading || !input.trim()}>
              {loading && !preview ? "..." : "Preview"}
            </button>
          </div>

          {/* Preview card */}
          {preview && (
            <div style={styles.previewCard}>
              <div style={styles.previewIcon}>📁</div>
              <div style={{flex:1}}>
                <div style={styles.previewTitle}>{preview.project_name}</div>
                <div style={styles.previewSub}>
                  You'll be added as a member of this project
                </div>
              </div>
              <div style={styles.validBadge}>✓ Valid</div>
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.actions}>
            <button style={styles.btnGhost} onClick={onClose}>Cancel</button>
            <button
              style={{
                ...styles.btnPrimary,
                opacity: !preview ? 0.5 : 1,
                cursor: !preview ? "not-allowed" : "pointer",
              }}
              onClick={joinProject}
              disabled={!preview || loading}>
              {loading && preview ? "Joining..." : "🚀 Join Project"}
            </button>
          </div>

          <div style={styles.hint}>
            💡 Ask your project owner to share an invite link with you.
            The link looks like: <strong>xpmt://join/abc123...</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay:      { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, backdropFilter:"blur(6px)" },
  modal:        { background:"#111D35", border:"1px solid #1F3254", borderRadius:14, width:480, boxShadow:"0 32px 80px rgba(0,0,0,0.6)" },
  header:       { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px 16px", borderBottom:"1px solid #1F3254" },
  title:        { fontSize:18, fontWeight:800, color:"#F0F4FF" },
  closeBtn:     { background:"none", border:"none", color:"#8892A4", fontSize:18, cursor:"pointer" },
  body:         { padding:"20px 24px", display:"flex", flexDirection:"column", gap:12 },
  label:        { fontSize:12, fontWeight:600, color:"#8892A4" },
  inputRow:     { display:"flex", gap:8 },
  input:        { flex:1, background:"#0A1628", border:"1px solid #1F3254", borderRadius:8, padding:"10px 12px", color:"#F0F4FF", fontSize:13, outline:"none" },
  previewBtn:   { padding:"10px 16px", borderRadius:8, border:"1px solid #4F8EF7", background:"rgba(79,142,247,0.15)", color:"#4F8EF7", fontSize:12, fontWeight:700, cursor:"pointer" },
  previewCard:  { display:"flex", alignItems:"center", gap:12, background:"rgba(34,197,94,0.1)", border:"1px solid #22C55E", borderRadius:8, padding:"12px 14px" },
  previewIcon:  { fontSize:24, flexShrink:0 },
  previewTitle: { fontSize:14, fontWeight:700, color:"#F0F4FF" },
  previewSub:   { fontSize:11, color:"#8892A4", marginTop:2 },
  validBadge:   { fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:8, background:"rgba(34,197,94,0.2)", color:"#22C55E" },
  error:        { background:"rgba(239,68,68,0.1)", border:"1px solid #EF4444", borderRadius:6, padding:"8px 12px", color:"#EF4444", fontSize:12 },
  actions:      { display:"flex", gap:10, justifyContent:"flex-end" },
  btnPrimary:   { padding:"9px 20px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#6C3DB5,#4F8EF7)", color:"white", fontSize:13, fontWeight:700 },
  btnGhost:     { padding:"9px 16px", borderRadius:8, border:"1px solid #1F3254", background:"transparent", color:"#8892A4", fontSize:13, fontWeight:600, cursor:"pointer" },
  hint:         { fontSize:11, color:"#8892A4", background:"#0A1628", padding:"10px 12px", borderRadius:6, lineHeight:1.6 },
};
