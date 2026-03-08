// ═══════════════════════════════════════
// XPMT — Share Link Modal
// ═══════════════════════════════════════

import { useState, useEffect } from "react";
import { call } from "../hooks/useInvoke";

interface ProjectLink {
  id:         string;
  project_id: string;
  token:      string;
  visibility: string;
  expiry:     string | null;
  created_by: string;
  created_at: string;
}

interface Props {
  projectId:   string;
  projectName: string;
  userId:      string;
  onClose:     () => void;
}

const EXPIRY_OPTIONS = [
  { label: "Never expires", value: null },
  { label: "24 hours",      value: 1    },
  { label: "7 days",        value: 7    },
  { label: "30 days",       value: 30   },
];

export default function ShareLinkModal({
  projectId, projectName, userId, onClose
}: Props) {
  const [links, setLinks]         = useState<ProjectLink[]>([]);
  const [loading, setLoading]     = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied]       = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [visibility, setVisibility] = useState("private");
  const [expiryDays, setExpiryDays] = useState<number | null>(null);

  useEffect(() => { loadLinks(); }, []);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const data = await call<ProjectLink[]>(
        "get_project_links", { projectId }
      );
      setLinks(data);
    } catch (err) { setError(String(err)); }
    finally { setLoading(false); }
  };

  const generateLink = async () => {
    setGenerating(true); setError(null);
    try {
      const link = await call<ProjectLink>("create_share_link", {
        input: {
          project_id:  projectId,
          visibility,
          expiry_days: expiryDays,
          created_by:  userId,
        }
      });
      setLinks(prev => [link, ...prev]);
    } catch (err) { setError(String(err)); }
    finally { setGenerating(false); }
  };

  const copyLink = (token: string) => {
    const link = `xpmt://join/${token}`;
    navigator.clipboard.writeText(link);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  const revokeLink = async (id: string) => {
    if (!confirm("Revoke this link? Anyone with it won't be able to join.")) return;
    try {
      await call("revoke_share_link", { id });
      setLinks(prev => prev.filter(l => l.id !== id));
    } catch (err) { setError(String(err)); }
  };

  const isExpired = (expiry: string | null) => {
    if (!expiry) return false;
    return new Date(expiry) < new Date();
  };

  const formatExpiry = (expiry: string | null) => {
    if (!expiry) return "Never expires";
    const date = new Date(expiry);
    if (isExpired(expiry)) return "Expired";
    const diff = Math.ceil((date.getTime() - Date.now()) / 86400000);
    return diff === 1 ? "Expires in 1 day" : `Expires in ${diff} days`;
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.title}>🔗 Share Project</div>
            <div style={styles.subtitle}>{projectName}</div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Generate new link */}
        <div style={styles.generateSection}>
          <div style={styles.sectionTitle}>Generate New Link</div>

          <div style={styles.row}>
            {/* Visibility */}
            <div style={{flex:1}}>
              <div style={styles.label}>Visibility</div>
              <div style={styles.toggleRow}>
                {["private","public"].map(v => (
                  <button key={v}
                    style={{
                      ...styles.toggleBtn,
                      background: visibility === v
                        ? "linear-gradient(135deg,#6C3DB5,#4F8EF7)"
                        : "#0A1628",
                      color: visibility === v ? "white" : "#8892A4",
                      border: `1px solid ${visibility===v ? "#6C3DB5" : "#1F3254"}`,
                    }}
                    onClick={() => setVisibility(v)}>
                    {v === "private" ? "🔒 Private" : "🌍 Public"}
                  </button>
                ))}
              </div>
            </div>

            {/* Expiry */}
            <div style={{flex:1}}>
              <div style={styles.label}>Link Expiry</div>
              <select style={styles.select}
                value={expiryDays ?? ""}
                onChange={e => setExpiryDays(
                  e.target.value === "" ? null : Number(e.target.value)
                )}>
                {EXPIRY_OPTIONS.map(o => (
                  <option key={String(o.value)} value={o.value ?? ""}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Visibility info */}
          <div style={styles.hint}>
            {visibility === "private"
              ? "🔒 Only people with the link can join this project."
              : "🌍 Anyone with the link can view and join this project."}
          </div>

          <button style={styles.generateBtn}
            onClick={generateLink} disabled={generating}>
            {generating ? "Generating..." : "⚡ Generate Link"}
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Existing links */}
        <div style={styles.linksSection}>
          <div style={styles.sectionTitle}>
            Active Links
            <span style={styles.badge}>{links.length}</span>
          </div>

          {loading ? (
            <div style={styles.empty}>Loading links...</div>
          ) : links.length === 0 ? (
            <div style={styles.empty}>
              No links generated yet. Create one above! 🔗
            </div>
          ) : (
            <div style={styles.linkList}>
              {links.map(link => (
                <div key={link.id} style={{
                  ...styles.linkCard,
                  opacity: isExpired(link.expiry) ? 0.5 : 1,
                }}>
                  {/* Token preview */}
                  <div style={styles.tokenWrap}>
                    <div style={styles.tokenIcon}>
                      {link.visibility === "public" ? "🌍" : "🔒"}
                    </div>
                    <div style={{flex:1}}>
                      <div style={styles.tokenText}>
                        xpmt://join/{link.token.slice(0,16)}...
                        {link.token.slice(-8)}
                      </div>
                      <div style={styles.tokenMeta}>
                        <span style={{
                          color: isExpired(link.expiry) ? "#EF4444" : "#22C55E"
                        }}>
                          {formatExpiry(link.expiry)}
                        </span>
                        <span>·</span>
                        <span>Created {link.created_at.slice(0,10)}</span>
                        <span>·</span>
                        <span style={{
                          ...styles.visTag,
                          background: link.visibility === "public"
                            ? "rgba(34,197,94,0.15)" : "rgba(108,61,181,0.15)",
                          color: link.visibility === "public"
                            ? "#22C55E" : "#9B6FD4",
                        }}>{link.visibility}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={styles.linkActions}>
                    {!isExpired(link.expiry) && (
                      <button
                        style={{
                          ...styles.copyBtn,
                          background: copied === link.token
                            ? "rgba(34,197,94,0.2)" : "rgba(79,142,247,0.15)",
                          color: copied === link.token ? "#22C55E" : "#4F8EF7",
                          border: `1px solid ${copied===link.token ? "#22C55E" : "#4F8EF7"}`,
                        }}
                        onClick={() => copyLink(link.token)}>
                        {copied === link.token ? "✓ Copied!" : "📋 Copy"}
                      </button>
                    )}
                    <button style={styles.revokeBtn}
                      onClick={() => revokeLink(link.id)}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How to use */}
        <div style={styles.howTo}>
          <div style={styles.howToTitle}>📖 How to use</div>
          <div style={styles.howToText}>
            Share the link with your team. They open XPMT, click
            <strong> "Join via Link"</strong> and paste the link to
            instantly join this project!
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay:         { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, backdropFilter:"blur(6px)" },
  modal:           { background:"#111D35", border:"1px solid #1F3254", borderRadius:14, width:560, maxHeight:"88vh", overflowY:"auto", boxShadow:"0 32px 80px rgba(0,0,0,0.6)" },
  header:          { display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"20px 24px 16px", borderBottom:"1px solid #1F3254" },
  title:           { fontSize:18, fontWeight:800, color:"#F0F4FF" },
  subtitle:        { fontSize:12, color:"#8892A4", marginTop:3 },
  closeBtn:        { background:"none", border:"none", color:"#8892A4", fontSize:18, cursor:"pointer" },
  generateSection: { padding:"18px 24px", borderBottom:"1px solid #1F3254" },
  sectionTitle:    { fontSize:13, fontWeight:700, color:"#F0F4FF", marginBottom:12, display:"flex", alignItems:"center", gap:8 },
  label:           { fontSize:11, color:"#8892A4", fontWeight:600, marginBottom:6 },
  row:             { display:"flex", gap:12, marginBottom:10 },
  toggleRow:       { display:"flex", gap:6 },
  toggleBtn:       { flex:1, padding:"7px 0", borderRadius:7, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" },
  select:          { background:"#0A1628", border:"1px solid #1F3254", borderRadius:8, padding:"8px 12px", color:"#F0F4FF", fontSize:12, width:"100%", outline:"none" },
  hint:            { fontSize:11, color:"#8892A4", background:"rgba(108,61,181,0.1)", padding:"8px 12px", borderRadius:6, marginBottom:12 },
  generateBtn:     { width:"100%", padding:"10px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#6C3DB5,#4F8EF7)", color:"white", fontSize:13, fontWeight:700, cursor:"pointer" },
  error:           { margin:"0 24px 0", background:"rgba(239,68,68,0.1)", border:"1px solid #EF4444", borderRadius:6, padding:"8px 12px", color:"#EF4444", fontSize:12 },
  linksSection:    { padding:"18px 24px", borderBottom:"1px solid #1F3254" },
  badge:           { background:"#1F3254", color:"#8892A4", fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:8 },
  empty:           { color:"#8892A4", fontSize:12, textAlign:"center", padding:"16px 0" },
  linkList:        { display:"flex", flexDirection:"column", gap:8 },
  linkCard:        { background:"#0A1628", border:"1px solid #1F3254", borderRadius:8, padding:"12px 14px", display:"flex", alignItems:"center", gap:10 },
  tokenWrap:       { display:"flex", alignItems:"flex-start", gap:10, flex:1 },
  tokenIcon:       { fontSize:18, flexShrink:0 },
  tokenText:       { fontSize:12, fontWeight:600, color:"#4F8EF7", fontFamily:"monospace", marginBottom:4 },
  tokenMeta:       { fontSize:11, color:"#8892A4", display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" },
  visTag:          { fontSize:10, fontWeight:700, padding:"1px 7px", borderRadius:8 },
  linkActions:     { display:"flex", gap:6, alignItems:"center", flexShrink:0 },
  copyBtn:         { padding:"5px 12px", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer", transition:"all 0.2s" },
  revokeBtn:       { background:"none", border:"1px solid #1F3254", borderRadius:6, padding:"5px 8px", cursor:"pointer", fontSize:13, color:"#EF4444" },
  howTo:           { padding:"14px 24px" },
  howToTitle:      { fontSize:12, fontWeight:700, color:"#F0F4FF", marginBottom:6 },
  howToText:       { fontSize:11, color:"#8892A4", lineHeight:1.6 },
};
