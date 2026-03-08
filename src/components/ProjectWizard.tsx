// ═══════════════════════════════════════
// XPMT — Project Creation Wizard
// ═══════════════════════════════════════

import { useState, useEffect } from "react";
import { call } from "../hooks/useInvoke";
import { Project, CreateProject, CreateTask } from "../types";

interface Member {
  id:    string;
  name:  string;
  email: string;
  role:  string;
}

interface Props {
  spaceId:  string;
  userId:   string;
  workspaceId: string;
  onComplete: (project: Project) => void;
  onClose:    () => void;
}

interface TaskDraft {
  title:    string;
  priority: string;
  due_date: string;
}

const STEPS = ["📝 Project Details", "👥 Assign Team", "📋 Plan Tasks"];
const PRIORITIES = ["low","medium","high","urgent"];
const ROLES      = ["Admin","Manager","Developer","Designer","Viewer"];

export default function ProjectWizard({
  spaceId, userId, workspaceId, onComplete, onClose
}: Props) {
  const [step, setStep]       = useState(0);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [tasks, setTasks]     = useState<TaskDraft[]>([
    { title: "", priority: "medium", due_date: "" }
  ]);
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite]   = useState({ name:"", email:"", role:"Developer" });

  // Step 1 form
  const [form, setForm] = useState({
    name: "", description: "", priority: "medium",
    start_date: "", due_date: "",
  });

  useEffect(() => {
    if (step === 1) loadMembers();
  }, [step]);

  const loadMembers = async () => {
    try {
      const data = await call<Member[]>("get_workspace_members", { workspaceId });
      setMembers(data);
      // Auto-select current user
      if (!selected.includes(userId)) {
        setSelected([userId]);
      }
    } catch (err) { setError(String(err)); }
  };

  // ── Step 1 — Create Project ──────────────
  const createProject = async () => {
    if (!form.name.trim()) { setError("Project name is required!"); return; }
    setSaving(true); setError(null);
    try {
      const input: CreateProject = {
        space_id:    spaceId,
        name:        form.name,
        description: form.description || undefined,
        priority:    form.priority,
        start_date:  form.start_date || undefined,
        due_date:    form.due_date   || undefined,
        created_by:  userId,
      };
      const p = await call<Project>("create_project", { input });
      setProject(p);
      setStep(1);
    } catch (err) { setError(String(err)); }
    finally { setSaving(false); }
  };

  // ── Step 2 — Assign Team ─────────────────
  const assignTeam = async () => {
    if (!project) return;
    setSaving(true); setError(null);
    try {
      await Promise.all(selected.map(uid =>
        call("add_project_member", {
          projectId: project.id,
          userId: uid,
          role: "member",
        })
      ));
      setStep(2);
    } catch (err) { setError(String(err)); }
    finally { setSaving(false); }
  };

  const inviteMember = async () => {
    if (!invite.name || !invite.email) {
      setError("Name and email required!"); return;
    }
    setSaving(true); setError(null);
    try {
      const m = await call<Member>("invite_member", {
        input: { ...invite, workspace_id: workspaceId }
      });
      setMembers(prev => [...prev, m]);
      setSelected(prev => [...prev, m.id]);
      setInvite({ name:"", email:"", role:"Developer" });
      setShowInvite(false);
    } catch (err) { setError(String(err)); }
    finally { setSaving(false); }
  };

  const toggleMember = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // ── Step 3 — Plan Tasks ──────────────────
  const addTaskRow = () =>
    setTasks(prev => [...prev, { title:"", priority:"medium", due_date:"" }]);

  const updateTask = (i: number, key: keyof TaskDraft, val: string) =>
    setTasks(prev => prev.map((t,idx) => idx===i ? {...t,[key]:val} : t));

  const removeTask = (i: number) =>
    setTasks(prev => prev.filter((_,idx) => idx !== i));

  const finishWizard = async () => {
    if (!project) return;
    setSaving(true); setError(null);
    try {
      const validTasks = tasks.filter(t => t.title.trim());
      await Promise.all(validTasks.map(t => {
        const input: CreateTask = {
          project_id:  project.id,
          title:       t.title,
          priority:    t.priority,
          due_date:    t.due_date || undefined,
          created_by:  userId,
        };
        return call("create_task", { input });
      }));
      onComplete(project);
    } catch (err) { setError(String(err)); }
    finally { setSaving(false); }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitle}>🚀 New Project</div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Step indicators */}
        <div style={styles.steps}>
          {STEPS.map((s, i) => (
            <div key={s} style={styles.stepItem}>
              <div style={{
                ...styles.stepDot,
                background: i < step
                  ? "#22C55E"
                  : i === step
                  ? "linear-gradient(135deg,#6C3DB5,#4F8EF7)"
                  : "#1F3254",
              }}>
                {i < step ? "✓" : i + 1}
              </div>
              <div style={{
                ...styles.stepLabel,
                color: i === step ? "#F0F4FF" : "#4A5568",
              }}>{s}</div>
              {i < STEPS.length - 1 && (
                <div style={{
                  ...styles.stepLine,
                  background: i < step ? "#22C55E" : "#1F3254",
                }} />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1 — Project Details ── */}
        {step === 0 && (
          <div style={styles.body}>
            <input style={styles.input} placeholder="Project name *"
              value={form.name}
              onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            <textarea style={{...styles.input, height:80, resize:"none"}}
              placeholder="Description (optional)"
              value={form.description}
              onChange={e => setForm(f => ({...f, description: e.target.value}))} />
            <div style={styles.row}>
              <div style={{flex:1}}>
                <div style={styles.label}>Priority</div>
                <select style={styles.input} value={form.priority}
                  onChange={e => setForm(f => ({...f, priority: e.target.value}))}>
                  {PRIORITIES.map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div style={{flex:1}}>
                <div style={styles.label}>Start Date</div>
                <input style={styles.input} type="date" value={form.start_date}
                  onChange={e => setForm(f => ({...f, start_date: e.target.value}))} />
              </div>
              <div style={{flex:1}}>
                <div style={styles.label}>Due Date</div>
                <input style={styles.input} type="date" value={form.due_date}
                  onChange={e => setForm(f => ({...f, due_date: e.target.value}))} />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2 — Assign Team ── */}
        {step === 1 && (
          <div style={styles.body}>
            <div style={styles.sectionTitle}>
              Select team members for this project
              <button style={styles.inviteBtn}
                onClick={() => setShowInvite(!showInvite)}>
                + Invite New
              </button>
            </div>

            {/* Invite form */}
            {showInvite && (
              <div style={styles.inviteForm}>
                <input style={styles.input} placeholder="Full name *"
                  value={invite.name}
                  onChange={e => setInvite(i => ({...i, name: e.target.value}))} />
                <input style={styles.input} placeholder="Email address *"
                  value={invite.email}
                  onChange={e => setInvite(i => ({...i, email: e.target.value}))} />
                <div style={styles.row}>
                  <select style={{...styles.input, flex:1}} value={invite.role}
                    onChange={e => setInvite(i => ({...i, role: e.target.value}))}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button style={styles.btnPrimary} onClick={inviteMember}
                    disabled={saving}>
                    {saving ? "..." : "Invite"}
                  </button>
                </div>
              </div>
            )}

            {/* Member list */}
            <div style={styles.memberList}>
              {members.map(m => (
                <div key={m.id}
                  style={{
                    ...styles.memberRow,
                    background: selected.includes(m.id)
                      ? "rgba(108,61,181,0.15)" : "var(--bg-card)",
                    border: selected.includes(m.id)
                      ? "1px solid #6C3DB5" : "1px solid var(--border)",
                  }}
                  onClick={() => m.id !== userId && toggleMember(m.id)}
                >
                  <div style={styles.memberAvatar}>{m.name[0]}</div>
                  <div style={{flex:1}}>
                    <div style={styles.memberName}>{m.name}
                      {m.id === userId &&
                        <span style={styles.youBadge}>you</span>}
                    </div>
                    <div style={styles.memberEmail}>{m.email}</div>
                  </div>
                  <div style={styles.memberRole}>{m.role}</div>
                  <div style={{
                    ...styles.checkbox,
                    background: selected.includes(m.id) ? "#6C3DB5" : "transparent",
                    border: selected.includes(m.id)
                      ? "2px solid #6C3DB5" : "2px solid #1F3254",
                  }}>
                    {selected.includes(m.id) && "✓"}
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.selectedCount}>
              {selected.length} member{selected.length !== 1 ? "s" : ""} selected
            </div>
          </div>
        )}

        {/* ── STEP 3 — Plan Tasks ── */}
        {step === 2 && (
          <div style={styles.body}>
            <div style={styles.sectionTitle}>
              Add initial tasks to get started
              <span style={styles.optionalBadge}>optional</span>
            </div>
            <div style={styles.taskList}>
              {tasks.map((t, i) => (
                <div key={i} style={styles.taskRow}>
                  <input style={{...styles.input, flex:1}}
                    placeholder={`Task ${i+1} title...`}
                    value={t.title}
                    onChange={e => updateTask(i, "title", e.target.value)} />
                  <select style={{...styles.input, width:100}}
                    value={t.priority}
                    onChange={e => updateTask(i, "priority", e.target.value)}>
                    {PRIORITIES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <input style={{...styles.input, width:130}}
                    type="date" value={t.due_date}
                    onChange={e => updateTask(i, "due_date", e.target.value)} />
                  {tasks.length > 1 && (
                    <button style={styles.removeBtn} onClick={() => removeTask(i)}>
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button style={styles.addTaskBtn} onClick={addTaskRow}>
              + Add Another Task
            </button>
          </div>
        )}

        {/* Error */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Footer actions */}
        <div style={styles.footer}>
          {step > 0 && (
            <button style={styles.btnGhost}
              onClick={() => { setStep(s => s-1); setError(null); }}>
              ← Back
            </button>
          )}
          <button style={styles.btnGhost} onClick={onClose}>Cancel</button>
          <div style={{flex:1}} />
          {step === 0 && (
            <button style={styles.btnPrimary}
              onClick={createProject} disabled={saving}>
              {saving ? "Creating..." : "Next — Assign Team →"}
            </button>
          )}
          {step === 1 && (
            <button style={styles.btnPrimary}
              onClick={assignTeam} disabled={saving}>
              {saving ? "Saving..." : "Next — Plan Tasks →"}
            </button>
          )}
          {step === 2 && (
            <button style={styles.btnPrimary}
              onClick={finishWizard} disabled={saving}>
              {saving ? "Creating tasks..." : "🚀 Launch Project!"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay:       { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, backdropFilter:"blur(6px)" },
  modal:         { background:"#111D35", border:"1px solid #1F3254", borderRadius:14, width:620, maxHeight:"88vh", display:"flex", flexDirection:"column", boxShadow:"0 32px 80px rgba(0,0,0,0.6)" },
  header:        { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 24px 16px", borderBottom:"1px solid #1F3254" },
  headerTitle:   { fontSize:18, fontWeight:800, color:"#F0F4FF" },
  closeBtn:      { background:"none", border:"none", color:"#8892A4", fontSize:18, cursor:"pointer", padding:4 },
  steps:         { display:"flex", alignItems:"center", padding:"16px 24px", borderBottom:"1px solid #1F3254" },
  stepItem:      { display:"flex", alignItems:"center", gap:8, flex:1 },
  stepDot:       { width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"white", flexShrink:0 },
  stepLabel:     { fontSize:12, fontWeight:600, whiteSpace:"nowrap" },
  stepLine:      { flex:1, height:2, borderRadius:1 },
  body:          { padding:"20px 24px", overflowY:"auto", flex:1, display:"flex", flexDirection:"column", gap:12 },
  input:         { background:"#0A1628", border:"1px solid #1F3254", borderRadius:8, padding:"9px 12px", color:"#F0F4FF", fontSize:13, outline:"none", width:"100%" },
  label:         { fontSize:11, color:"#8892A4", fontWeight:600, marginBottom:5 },
  row:           { display:"flex", gap:10 },
  sectionTitle:  { fontSize:13, fontWeight:700, color:"#F0F4FF", display:"flex", alignItems:"center", justifyContent:"space-between" },
  inviteBtn:     { fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:6, border:"1px solid #6C3DB5", background:"transparent", color:"#9B6FD4", cursor:"pointer" },
  inviteForm:    { background:"rgba(108,61,181,0.1)", border:"1px solid #6C3DB5", borderRadius:8, padding:12, display:"flex", flexDirection:"column", gap:8 },
  memberList:    { display:"flex", flexDirection:"column", gap:6, maxHeight:280, overflowY:"auto" },
  memberRow:     { display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:8, cursor:"pointer", transition:"all 0.15s" },
  memberAvatar:  { width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#6C3DB5,#4F8EF7)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, flexShrink:0 },
  memberName:    { fontSize:13, fontWeight:600, color:"#F0F4FF", display:"flex", alignItems:"center", gap:6 },
  memberEmail:   { fontSize:11, color:"#8892A4" },
  memberRole:    { fontSize:11, color:"#8892A4", marginRight:8 },
  youBadge:      { fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:8, background:"rgba(79,142,247,0.2)", color:"#4F8EF7" },
  checkbox:      { width:18, height:18, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"white", flexShrink:0 },
  selectedCount: { fontSize:12, color:"#8892A4", textAlign:"center" },
  taskList:      { display:"flex", flexDirection:"column", gap:8 },
  taskRow:       { display:"flex", gap:8, alignItems:"center" },
  removeBtn:     { background:"none", border:"none", color:"#EF4444", cursor:"pointer", fontSize:14, padding:4, flexShrink:0 },
  addTaskBtn:    { background:"transparent", border:"1px dashed #1F3254", borderRadius:8, padding:"8px 0", color:"#8892A4", fontSize:12, fontWeight:600, cursor:"pointer", width:"100%", transition:"all 0.15s" },
  optionalBadge: { fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:8, background:"#1F3254", color:"#8892A4" },
  footer:        { display:"flex", gap:8, alignItems:"center", padding:"16px 24px", borderTop:"1px solid #1F3254" },
  btnPrimary:    { padding:"9px 20px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#6C3DB5,#4F8EF7)", color:"white", fontSize:13, fontWeight:700, cursor:"pointer" },
  btnGhost:      { padding:"9px 16px", borderRadius:8, border:"1px solid #1F3254", background:"transparent", color:"#8892A4", fontSize:13, fontWeight:600, cursor:"pointer" },
  error:         { margin:"0 24px 12px", background:"rgba(239,68,68,0.1)", border:"1px solid #EF4444", borderRadius:6, padding:"8px 12px", color:"#EF4444", fontSize:12 },
};
