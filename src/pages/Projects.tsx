// ═══════════════════════════════════════
// XPMT — Projects Page
// ═══════════════════════════════════════

import { useEffect, useState } from "react";
import { call } from "../hooks/useInvoke";
import { Project } from "../types";
import ProjectWizard from "../components/ProjectWizard";
import ShareLinkModal from "../components/ShareLinkModal";
import JoinViaLink from "../components/JoinViaLink";

interface Props {
  spaceId:     string;
  userId:      string;
  workspaceId: string;
}

interface JoinResult {
  project_id:   string;
  project_name: string;
  workspace_id: string;
  space_id:     string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active:      { bg:"rgba(79,142,247,0.2)",  text:"#4F8EF7"  },
  in_progress: { bg:"rgba(108,61,181,0.2)",  text:"#9B6FD4"  },
  review:      { bg:"rgba(245,158,11,0.2)",  text:"#F59E0B"  },
  done:        { bg:"rgba(34,197,94,0.2)",   text:"#22C55E"  },
};

const PRIORITY_COLORS: Record<string, string> = {
  low:"#22C55E", medium:"#F59E0B", high:"#EF4444", urgent:"#9B1FEA",
};

export default function Projects({ spaceId, userId, workspaceId }: Props) {
  const [projects, setProjects]     = useState<Project[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [shareProject, setShareProject] = useState<Project | null>(null);
  const [showJoin, setShowJoin]     = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  useEffect(() => { loadProjects(); }, [spaceId]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await call<Project[]>("get_projects", { spaceId });
      setProjects(data);
    } catch (err) { setError(String(err)); }
    finally { setLoading(false); }
  };

  const onProjectCreated = (project: Project) => {
    setProjects(prev => [project, ...prev]);
    setShowWizard(false);
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      await call("delete_project", { id });
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) { setError(String(err)); }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const updated = await call<Project>("update_project", { id, input: { status } });
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
    } catch (err) { console.error(err); }
  };

  const onJoined = (result: JoinResult) => {
    setShowJoin(false);
    setJoinSuccess(`✅ You joined "${result.project_name}" successfully!`);
    setTimeout(() => setJoinSuccess(null), 4000);
    loadProjects();
  };

  if (loading) return <div style={styles.loading}>Loading projects...</div>;

  return (
    <div>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <div style={styles.pageTitle}>📁 Projects</div>
          <div style={styles.pageSub}>
            {projects.length} project{projects.length !== 1 ? "s" : ""} in this space
          </div>
        </div>
        <div style={{display:"flex", gap:8}}>
          <button style={styles.btnGhost} onClick={() => setShowJoin(true)}>
            🔗 Join via Link
          </button>
          <button style={styles.btnPrimary} onClick={() => setShowWizard(true)}>
            + New Project
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error      && <div style={styles.error}>{error}</div>}
      {joinSuccess && <div style={styles.success}>{joinSuccess}</div>}

      {/* Empty state */}
      {projects.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📁</div>
          <div style={styles.emptyTitle}>No projects yet</div>
          <div style={styles.emptySub}>Create your first project to get started!</div>
          <div style={{display:"flex", gap:10}}>
            <button style={styles.btnGhost} onClick={() => setShowJoin(true)}>
              🔗 Join via Link
            </button>
            <button style={styles.btnPrimary} onClick={() => setShowWizard(true)}>
              + Create First Project
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.grid}>
          {projects.map(p => (
            <div key={p.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardAvatar}>{p.name[0]}</div>
                <div style={{flex:1}}>
                  <div style={styles.cardName}>{p.name}</div>
                  <div style={styles.cardMeta}>
                    Created {p.created_at.slice(0,10)}
                  </div>
                </div>
                <div style={{display:"flex", gap:4}}>
                  <button style={styles.iconBtn}
                    title="Share project"
                    onClick={() => setShareProject(p)}>🔗</button>
                  <button style={styles.iconBtn}
                    onClick={() => deleteProject(p.id)}>🗑️</button>
                </div>
              </div>

              {p.description && (
                <div style={styles.cardDesc}>{p.description}</div>
              )}

              <div style={styles.metaRow}>
                <span style={{
                  ...styles.tag,
                  background: STATUS_COLORS[p.status]?.bg ?? "#1F3254",
                  color: STATUS_COLORS[p.status]?.text ?? "#8892A4",
                }}>{p.status}</span>
                <span style={{
                  ...styles.tag, background:"rgba(0,0,0,0.2)",
                  color: PRIORITY_COLORS[p.priority] ?? "#8892A4",
                }}>⚡ {p.priority}</span>
                {p.due_date && (
                  <span style={{...styles.tag, background:"#1F3254", color:"#8892A4"}}>
                    📅 {p.due_date.slice(0,10)}
                  </span>
                )}
              </div>

              <div style={styles.statusRow}>
                {["active","in_progress","review","done"].map(s => (
                  <button key={s} onClick={() => updateStatus(p.id, s)}
                    style={{
                      ...styles.statusBtn,
                      background: p.status===s ? STATUS_COLORS[s]?.bg : "transparent",
                      color: p.status===s ? STATUS_COLORS[s]?.text : "#4A5568",
                      border: `1px solid ${p.status===s ? STATUS_COLORS[s]?.text : "#1F3254"}`,
                    }}>{s.replace("_"," ")}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showWizard && (
        <ProjectWizard
          spaceId={spaceId} userId={userId} workspaceId={workspaceId}
          onComplete={onProjectCreated} onClose={() => setShowWizard(false)}
        />
      )}

      {shareProject && (
        <ShareLinkModal
          projectId={shareProject.id}
          projectName={shareProject.name}
          userId={userId}
          onClose={() => setShareProject(null)}
        />
      )}

      {showJoin && (
        <JoinViaLink
          userId={userId}
          onJoined={onJoined}
          onClose={() => setShowJoin(false)}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading:     { color:"#8892A4", textAlign:"center", padding:60 },
  pageHeader:  { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 },
  pageTitle:   { fontSize:20, fontWeight:800, color:"#F0F4FF" },
  pageSub:     { fontSize:12, color:"#8892A4", marginTop:3 },
  grid:        { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px,1fr))", gap:14 },
  card:        { background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:10, padding:16 },
  cardHeader:  { display:"flex", alignItems:"flex-start", gap:10, marginBottom:10 },
  cardAvatar:  { width:36, height:36, borderRadius:8, background:"linear-gradient(135deg,#6C3DB5,#4F8EF7)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:15, flexShrink:0 },
  cardName:    { fontSize:14, fontWeight:700, color:"#F0F4FF" },
  cardMeta:    { fontSize:11, color:"#8892A4", marginTop:2 },
  cardDesc:    { fontSize:12, color:"#8892A4", marginBottom:10, lineHeight:1.5 },
  metaRow:     { display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 },
  tag:         { fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:12 },
  statusRow:   { display:"flex", gap:4, flexWrap:"wrap" },
  statusBtn:   { fontSize:10, fontWeight:600, padding:"3px 8px", borderRadius:6, cursor:"pointer", transition:"all 0.15s" },
  iconBtn:     { background:"none", border:"none", cursor:"pointer", fontSize:14, padding:4 },
  emptyState:  { textAlign:"center", padding:"60px 0", display:"flex", flexDirection:"column", alignItems:"center", gap:12 },
  emptyIcon:   { fontSize:48 },
  emptyTitle:  { fontSize:18, fontWeight:700, color:"#F0F4FF" },
  emptySub:    { fontSize:13, color:"#8892A4" },
  btnPrimary:  { padding:"9px 20px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#6C3DB5,#4F8EF7)", color:"white", fontSize:13, fontWeight:700, cursor:"pointer" },
  btnGhost:    { padding:"9px 16px", borderRadius:8, border:"1px solid #1F3254", background:"transparent", color:"#8892A4", fontSize:13, fontWeight:600, cursor:"pointer" },
  error:       { background:"rgba(239,68,68,0.1)", border:"1px solid #EF4444", borderRadius:6, padding:"8px 12px", color:"#EF4444", fontSize:12, marginBottom:14 },
  success:     { background:"rgba(34,197,94,0.1)", border:"1px solid #22C55E", borderRadius:6, padding:"8px 12px", color:"#22C55E", fontSize:12, marginBottom:14 },
};
