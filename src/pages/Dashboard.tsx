// ═══════════════════════════════════════
// XPMT — Dashboard Page (Real Data)
// ═══════════════════════════════════════

import { useEffect, useState } from "react";
import { call } from "../hooks/useInvoke";

interface Stats {
  total_projects:  number;
  total_tasks:     number;
  completed_tasks: number;
  overdue_tasks:   number;
  total_members:   number;
}

interface RecentProject {
  id:         string;
  name:       string;
  status:     string;
  priority:   string;
  task_count: number;
  due_date?:  string;
}

interface RecentTask {
  id:           string;
  title:        string;
  status:       string;
  priority:     string;
  due_date?:    string;
  project_name: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active:      { bg: "rgba(79,142,247,0.2)",  text: "#4F8EF7" },
  in_progress: { bg: "rgba(108,61,181,0.2)",  text: "#9B6FD4" },
  review:      { bg: "rgba(245,158,11,0.2)",  text: "#F59E0B" },
  done:        { bg: "rgba(34,197,94,0.2)",   text: "#22C55E" },
};

const PRIORITY_COLORS: Record<string, string> = {
  low:    "#22C55E",
  medium: "#F59E0B",
  high:   "#EF4444",
  urgent: "#9B1FEA",
};

interface Props {
  spaceId: string;
  userId:  string;
}

export default function Dashboard({ spaceId, userId }: Props) {
  const [stats, setStats]       = useState<Stats | null>(null);
  const [projects, setProjects] = useState<RecentProject[]>([]);
  const [tasks, setTasks]       = useState<RecentTask[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { loadData(); }, [spaceId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, p, t] = await Promise.all([
        call<Stats>("get_dashboard_stats", { spaceId }),
        call<RecentProject[]>("get_recent_projects", { spaceId }),
        call<RecentTask[]>("get_recent_tasks", { userId }),
      ]);
      setStats(s);
      setProjects(p);
      setTasks(t);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  const statCards = [
    { icon: "📁", value: stats?.total_projects  ?? 0, label: "Projects",       color: "#6C3DB5" },
    { icon: "✅", value: stats?.completed_tasks ?? 0, label: "Tasks Done",      color: "#4F8EF7" },
    { icon: "👥", value: stats?.total_members   ?? 0, label: "Team Members",    color: "#22C55E" },
    { icon: "⚠️", value: stats?.overdue_tasks   ?? 0, label: "Overdue Tasks",   color: "#F59E0B" },
  ];

  return (
    <div>
      {/* Stat Cards */}
      <div style={styles.statGrid}>
        {statCards.map(s => (
          <div key={s.label} style={styles.statCard}>
            <div style={styles.statIcon}>{s.icon}</div>
            <div style={styles.statValue}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
            <div style={{ ...styles.statBar,
              background: `linear-gradient(90deg, ${s.color}, #4F8EF7)` }}
            />
          </div>
        ))}
      </div>

      <div style={styles.grid}>
        {/* Recent Projects */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>🚀 Recent Projects</div>
          {projects.length === 0 ? (
            <div style={styles.empty}>
              No projects yet — create your first project! 🎯
            </div>
          ) : projects.map((p, i) => (
            <div key={p.id} style={{
              ...styles.projectRow,
              borderBottom: i < projects.length - 1
                ? "1px solid var(--border)" : "none"
            }}>
              <div style={styles.projectLeft}>
                <div style={styles.projAvatar}>{p.name[0]}</div>
                <div>
                  <div style={styles.projName}>{p.name}</div>
                  <div style={styles.projMeta}>
                    {p.task_count} tasks
                    {p.due_date ? ` · Due ${p.due_date.slice(0,10)}` : ""}
                  </div>
                </div>
              </div>
              <span style={{
                ...styles.tag,
                background: STATUS_COLORS[p.status]?.bg ?? "#1F3254",
                color:      STATUS_COLORS[p.status]?.text ?? "#8892A4",
              }}>{p.status}</span>
            </div>
          ))}
        </div>

        {/* Recent Tasks */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>📋 My Recent Tasks</div>
          {tasks.length === 0 ? (
            <div style={styles.empty}>
              No tasks yet — tasks will appear here! ✅
            </div>
          ) : tasks.map((t, i) => (
            <div key={t.id} style={{
              ...styles.taskRow,
              borderBottom: i < tasks.length - 1
                ? "1px solid var(--border)" : "none"
            }}>
              <div style={{
                ...styles.priorityDot,
                background: PRIORITY_COLORS[t.priority] ?? "#8892A4"
              }} />
              <div style={{ flex: 1 }}>
                <div style={styles.taskTitle}>{t.title}</div>
                <div style={styles.taskMeta}>📁 {t.project_name}</div>
              </div>
              <span style={{
                ...styles.tag,
                background: STATUS_COLORS[t.status]?.bg ?? "#1F3254",
                color:      STATUS_COLORS[t.status]?.text ?? "#8892A4",
              }}>{t.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading:     { color: "#8892A4", textAlign: "center", padding: 60 },
  statGrid:    { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 18 },
  statCard:    { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 },
  statIcon:    { fontSize: 20, marginBottom: 8 },
  statValue:   { fontSize: 28, fontWeight: 800, color: "var(--text-primary)" },
  statLabel:   { fontSize: 11, color: "var(--text-secondary)", fontWeight: 500, marginTop: 2 },
  statBar:     { height: 3, borderRadius: 2, marginTop: 10 },
  grid:        { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  card:        { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: 18 },
  cardTitle:   { fontSize: 14, fontWeight: 700, marginBottom: 14 },
  empty:       { color: "var(--text-secondary)", fontSize: 13, padding: "20px 0", textAlign: "center" },
  projectRow:  { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" },
  projectLeft: { display: "flex", alignItems: "center", gap: 10 },
  projAvatar:  { width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#6C3DB5,#4F8EF7)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 },
  projName:    { fontSize: 13, fontWeight: 600 },
  projMeta:    { fontSize: 11, color: "var(--text-secondary)", marginTop: 1 },
  tag:         { fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 12 },
  taskRow:     { display: "flex", alignItems: "center", gap: 10, padding: "10px 0" },
  priorityDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  taskTitle:   { fontSize: 13, fontWeight: 500 },
  taskMeta:    { fontSize: 11, color: "var(--text-secondary)", marginTop: 1 },
};
