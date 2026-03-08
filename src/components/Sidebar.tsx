// ═══════════════════════════════════════
// XPMT — Sidebar Component
// ═══════════════════════════════════════

import { NAV_ITEMS } from "../types/constants";
import { NavId } from "../types";

interface Props {
  active:     NavId;
  onNavigate: (id: NavId) => void;
}

export default function Sidebar({ active, onNavigate }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-badge">XPMT</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item ${active === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="avatar">W</div>
        <div className="sidebar-user">
          <div className="sidebar-user-name">Wilfred</div>
          <div className="sidebar-user-role">Admin</div>
        </div>
      </div>
    </aside>
  );
}
