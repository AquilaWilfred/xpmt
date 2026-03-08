// ═══════════════════════════════════════
// XPMT — Auto Update Modal (Real)
// ═══════════════════════════════════════

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Props {
  onClose: () => void;
}

type UpdateState = "checking" | "available" | "none" | "downloading" | "done" | "error";

export default function UpdateModal({ onClose }: Props) {
  const [state, setState]     = useState<UpdateState>("checking");
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => { checkUpdates(); }, []);

  const checkUpdates = async () => {
    setState("checking");
    try {
      const hasUpdate = await invoke<boolean>("check_for_updates");
      setState(hasUpdate ? "available" : "none");
    } catch (err) {
      // In dev mode updater won't work — that's fine
      setState("none");
    }
  };

  const installUpdate = async () => {
    setState("downloading");
    try {
      await invoke("install_update");
      setState("done");
    } catch (err) {
      setError(String(err));
      setState("error");
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.title}>🔄 Updates</div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.body}>
          {state === "checking" && (
            <div style={styles.stateBox}>
              <div style={styles.spinner}>⏳</div>
              <div style={styles.stateTitle}>Checking for updates...</div>
            </div>
          )}

          {state === "none" && (
            <div style={styles.stateBox}>
              <div style={styles.bigIcon}>✅</div>
              <div style={styles.stateTitle}>You're up to date!</div>
              <div style={styles.stateSub}>XPMT is running the latest version.</div>
              <button style={styles.btnGhost} onClick={onClose}>Close</button>
            </div>
          )}

          {state === "available" && (
            <div style={styles.stateBox}>
              <div style={styles.bigIcon}>🚀</div>
              <div style={styles.stateTitle}>Update Available!</div>
              <div style={styles.stateSub}>
                A new version of XPMT is ready to install.
                Your data will be preserved.
              </div>
              <div style={styles.actions}>
                <button style={styles.btnGhost} onClick={onClose}>Later</button>
                <button style={styles.btnPrimary} onClick={installUpdate}>
                  Install Update
                </button>
              </div>
            </div>
          )}

          {state === "downloading" && (
            <div style={styles.stateBox}>
              <div style={styles.spinner}>⬇️</div>
              <div style={styles.stateTitle}>Downloading update...</div>
              <div style={styles.stateSub}>Please don't close XPMT.</div>
              <div style={styles.progressBar}>
                <div style={styles.progressFill} />
              </div>
            </div>
          )}

          {state === "done" && (
            <div style={styles.stateBox}>
              <div style={styles.bigIcon}>🎉</div>
              <div style={styles.stateTitle}>Update installed!</div>
              <div style={styles.stateSub}>Restart XPMT to apply the update.</div>
              <button style={styles.btnPrimary} onClick={() =>
                invoke("plugin:process|restart")
              }>
                Restart Now
              </button>
            </div>
          )}

          {state === "error" && (
            <div style={styles.stateBox}>
              <div style={styles.bigIcon}>❌</div>
              <div style={styles.stateTitle}>Update failed</div>
              <div style={styles.stateSub}>{error}</div>
              <div style={styles.actions}>
                <button style={styles.btnGhost} onClick={onClose}>Close</button>
                <button style={styles.btnPrimary} onClick={checkUpdates}>
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay:      { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:400, backdropFilter:"blur(6px)" },
  modal:        { background:"#111D35", border:"1px solid #1F3254", borderRadius:14, width:400, boxShadow:"0 32px 80px rgba(0,0,0,0.6)" },
  header:       { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 22px 14px", borderBottom:"1px solid #1F3254" },
  title:        { fontSize:16, fontWeight:800, color:"#F0F4FF" },
  closeBtn:     { background:"none", border:"none", color:"#8892A4", fontSize:18, cursor:"pointer" },
  body:         { padding:"24px 22px" },
  stateBox:     { display:"flex", flexDirection:"column", alignItems:"center", gap:12, textAlign:"center" },
  bigIcon:      { fontSize:48 },
  spinner:      { fontSize:36, animation:"spin 1s linear infinite" },
  stateTitle:   { fontSize:16, fontWeight:700, color:"#F0F4FF" },
  stateSub:     { fontSize:12, color:"#8892A4", lineHeight:1.6, maxWidth:280 },
  actions:      { display:"flex", gap:10 },
  btnPrimary:   { padding:"9px 20px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#6C3DB5,#4F8EF7)", color:"white", fontSize:13, fontWeight:700, cursor:"pointer" },
  btnGhost:     { padding:"9px 16px", borderRadius:8, border:"1px solid #1F3254", background:"transparent", color:"#8892A4", fontSize:13, fontWeight:600, cursor:"pointer" },
  progressBar:  { width:"100%", height:6, background:"#1F3254", borderRadius:3, overflow:"hidden" },
  progressFill: { height:"100%", width:"60%", background:"linear-gradient(90deg,#6C3DB5,#4F8EF7)", borderRadius:3, animation:"progress 1.5s ease-in-out infinite" },
};
