// ═══════════════════════════════════════
// XPMT — App Entry
// ═══════════════════════════════════════

import { useState } from "react";
import { NavId } from "./types";
import { NAV_ITEMS } from "./types/constants";
import { useTheme } from "./hooks/useTheme";
import { useAppState } from "./hooks/useAppState";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import UpdateModal from "./components/UpdateModal";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Placeholder from "./pages/Placeholder";
import Onboarding from "./pages/Onboarding";
import "./App.css";

export default function App() {
  const { theme, toggleTheme }      = useTheme();
  const { state, completeSetup }    = useAppState();
  const [active, setActive]         = useState<NavId>("dashboard");
  const [showUpdate, setShowUpdate] = useState(false);

  if (!state.isReady) {
    return (
      <div style={{
        height:"100vh", display:"flex", alignItems:"center",
        justifyContent:"center", background:"#0A1628",
        flexDirection:"column", gap:16,
      }}>
        <div style={{
          background:"linear-gradient(135deg,#6C3DB5,#4F8EF7)",
          padding:"8px 20px", borderRadius:8,
          fontWeight:800, fontSize:24, letterSpacing:2,
        }}>XPMT</div>
        <div style={{ color:"#8892A4", fontSize:13 }}>Loading...</div>
      </div>
    );
  }

  if (!state.isSetupDone) {
    return <Onboarding onComplete={completeSetup} />;
  }

  const currentPage = NAV_ITEMS.find(n => n.id === active)!;
  const sharedProps = {
    spaceId:     state.spaceId!,
    userId:      state.userId!,
    workspaceId: state.workspaceId!,
  };

  const renderPage = () => {
    switch (active) {
      case "dashboard": return <Dashboard {...sharedProps} />;
      case "projects":  return <Projects  {...sharedProps} />;
      default:          return <Placeholder page={currentPage} />;
    }
  };

  return (
    <div className="xpmt-layout">
      <Sidebar active={active} onNavigate={setActive} />
      <div className="main-area">
        <Header
          active={active}
          theme={theme}
          onToggleTheme={toggleTheme}
          onShowUpdate={() => setShowUpdate(true)}
        />
        <main className="content">{renderPage()}</main>
      </div>
      {showUpdate && (
        <UpdateModal
          onClose={() => setShowUpdate(false)}
          onUpdate={() => setShowUpdate(false)}
        />
      )}
    </div>
  );
}
