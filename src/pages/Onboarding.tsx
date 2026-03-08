// ═══════════════════════════════════════
// XPMT — Onboarding Page
// ═══════════════════════════════════════

import { useState } from "react";
import { call } from "../hooks/useInvoke";

interface Props {
  onComplete: (userId: string, workspaceId: string, spaceId: string) => void;
}

interface FormData {
  name:           string;
  email:          string;
  role:           string;
  workspace_name: string;
  workspace_desc: string;
  space_name:     string;
  space_color:    string;
}

const COLORS = ["#6C3DB5","#4F8EF7","#22C55E","#F59E0B","#EF4444","#EC4899"];
const ROLES  = ["Admin","Manager","Developer","Designer","Analyst"];
const STEPS  = ["👤 Profile","🏢 Workspace","📁 First Space"];

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [form, setForm]       = useState<FormData>({
    name: "", email: "", role: "Admin",
    workspace_name: "", workspace_desc: "",
    space_name: "Engineering", space_color: "#6C3DB5",
  });

  const update = (key: keyof FormData, value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const next = () => {
    if (step === 0 && (!form.name || !form.email)) {
      setError("Name and email are required!"); return;
    }
    if (step === 1 && !form.workspace_name) {
      setError("Workspace name is required!"); return;
    }
    setError(null);
    setStep(s => s + 1);
  };

  const submit = async () => {
    if (!form.space_name) { setError("Space name is required!"); return; }
    setLoading(true);
    setError(null);
    try {
      const result = await call<{
        user_id: string; workspace_id: string; space_id: string;
      }>("complete_onboarding", { input: {
        name:           form.name,
        email:          form.email,
        role:           form.role,
        workspace_name: form.workspace_name,
        workspace_desc: form.workspace_desc || null,
        space_name:     form.space_name,
        space_color:    form.space_color,
      }});
      onComplete(result.user_id, result.workspace_id, result.space_id);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.badge}>XPMT</span>
          <div style={styles.logoText}>Welcome to XPMT</div>
          <div style={styles.logoSub}>Let's get you set up in 3 steps</div>
        </div>

        {/* Step indicators */}
        <div style={styles.steps}>
          {STEPS.map((s, i) => (
            <div key={s} style={styles.stepItem}>
              <div style={{
                ...styles.stepDot,
                background: i <= step
                  ? "linear-gradient(135deg,#6C3DB5,#4F8EF7)"
                  : "#1F3254",
                color: i <= step ? "white" : "#8892A4",
              }}>
                {i < step ? "✓" : i + 1}
              </div>
              <div style={{
                ...styles.stepLabel,
                color: i === step ? "#F0F4FF" : "#8892A4",
              }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Step 1 — Profile */}
        {step === 0 && (
          <div style={styles.form}>
            <div style={styles.formTitle}>👤 Your Profile</div>
            <input style={styles.input} placeholder="Your full name"
              value={form.name} onChange={e => update("name", e.target.value)} />
            <input style={styles.input} placeholder="Your email address"
              value={form.email} onChange={e => update("email", e.target.value)} />
            <div style={styles.label}>Your Role</div>
            <div style={styles.roleGrid}>
              {ROLES.map(r => (
                <button key={r}
                  style={{ ...styles.roleBtn,
                    background: form.role === r ? "#6C3DB5" : "#1B2A45",
                    color: form.role === r ? "white" : "#8892A4",
                    border: form.role === r ? "1px solid #6C3DB5" : "1px solid #1F3254",
                  }}
                  onClick={() => update("role", r)}>{r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Workspace */}
        {step === 1 && (
          <div style={styles.form}>
            <div style={styles.formTitle}>🏢 Your Workspace</div>
            <input style={styles.input} placeholder="Company or team name"
              value={form.workspace_name}
              onChange={e => update("workspace_name", e.target.value)} />
            <textarea style={{ ...styles.input, height: 80, resize: "none" }}
              placeholder="Description (optional)"
              value={form.workspace_desc}
              onChange={e => update("workspace_desc", e.target.value)} />
            <div style={styles.hint}>
              💡 This is your main workspace. You can create more spaces inside it.
            </div>
          </div>
        )}

        {/* Step 3 — Space */}
        {step === 2 && (
          <div style={styles.form}>
            <div style={styles.formTitle}>📁 Your First Space</div>
            <div style={styles.hint}>
              Spaces are like departments — e.g. Engineering, Design, Marketing
            </div>
            <input style={styles.input} placeholder="Space name e.g. Engineering"
              value={form.space_name}
              onChange={e => update("space_name", e.target.value)} />
            <div style={styles.label}>Pick a color</div>
            <div style={styles.colorRow}>
              {COLORS.map(c => (
                <div key={c} onClick={() => update("space_color", c)}
                  style={{ ...styles.colorDot, background: c,
                    border: form.space_color === c
                      ? "3px solid white" : "3px solid transparent",
                  }} />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Actions */}
        <div style={styles.actions}>
          {step > 0 && (
            <button style={styles.backBtn} onClick={() => setStep(s => s - 1)}>
              ← Back
            </button>
          )}
          {step < 2 ? (
            <button style={styles.nextBtn} onClick={next}>
              Continue →
            </button>
          ) : (
            <button style={styles.nextBtn} onClick={submit} disabled={loading}>
              {loading ? "Setting up..." : "🚀 Launch XPMT"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: "100vh", display: "flex",
    alignItems: "center", justifyContent: "center",
    background: "linear-gradient(135deg, #0A1628 0%, #1B1040 100%)",
  },
  card: {
    background: "#111D35", border: "1px solid #1F3254",
    borderRadius: 16, padding: 36, width: 480,
    boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
  },
  logo: { textAlign: "center", marginBottom: 28 },
  badge: {
    background: "linear-gradient(135deg,#6C3DB5,#4F8EF7)",
    padding: "6px 16px", borderRadius: 8,
    fontWeight: 800, fontSize: 18, letterSpacing: 2,
  },
  logoText: { fontSize: 22, fontWeight: 800, marginTop: 14, color: "#F0F4FF" },
  logoSub:  { fontSize: 13, color: "#8892A4", marginTop: 4 },
  steps: {
    display: "flex", justifyContent: "center",
    gap: 24, marginBottom: 28,
  },
  stepItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  stepDot: {
    width: 32, height: 32, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 700,
  },
  stepLabel: { fontSize: 11, fontWeight: 600 },
  form:      { display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 },
  formTitle: { fontSize: 16, fontWeight: 700, color: "#F0F4FF", marginBottom: 4 },
  input: {
    background: "#1B2A45", border: "1px solid #1F3254",
    borderRadius: 8, padding: "10px 14px",
    color: "#F0F4FF", fontSize: 13, outline: "none", width: "100%",
  },
  label:   { fontSize: 12, color: "#8892A4", fontWeight: 600 },
  hint:    { fontSize: 12, color: "#8892A4", background: "#1B2A45", padding: "8px 12px", borderRadius: 6 },
  roleGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 },
  roleBtn: {
    padding: "8px 0", borderRadius: 6,
    fontSize: 12, fontWeight: 600, cursor: "pointer",
  },
  colorRow: { display: "flex", gap: 10 },
  colorDot: {
    width: 32, height: 32, borderRadius: "50%",
    cursor: "pointer", transition: "transform 0.15s",
  },
  error: {
    background: "rgba(239,68,68,0.15)", border: "1px solid #EF4444",
    borderRadius: 6, padding: "8px 12px",
    color: "#EF4444", fontSize: 12, marginBottom: 12,
  },
  actions: { display: "flex", gap: 10, justifyContent: "flex-end" },
  backBtn: {
    padding: "10px 20px", borderRadius: 8, border: "1px solid #1F3254",
    background: "transparent", color: "#8892A4", fontSize: 13,
    fontWeight: 600, cursor: "pointer",
  },
  nextBtn: {
    padding: "10px 24px", borderRadius: 8, border: "none",
    background: "linear-gradient(135deg,#6C3DB5,#4F8EF7)",
    color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer",
  },
};
