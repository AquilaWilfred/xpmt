// ═══════════════════════════════
// XPMT — Sidebar Component
// ═══════════════════════════════

import { NavId } from "../types";
import { NAV_ITEMS, CURRENT_USER } from "../types/constants";

interface Props {
  active: NavId;
  onNavigate: (id: NavId) => void;
}

export default function Sidebar({ active, onNavigate }: Props) {
  const mainNav = NAV_ITEMS.slice(0, 5);
  const toolsNav = NAV_ITEMS.slice(5);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-badge">XPMT</span>
        <div>
          <div className="logo-text">XPMT</div>
          <div className="logo-version">v0.1.0 · MVP</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>
        {mainNav.map(n => (
          <button
            key={n.id}
            className={`nav-item ${active === n.id ? "active" : ""}`}
            onClick={() => onNavigate(n.id)}
          >
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </button>
        ))}

        <div className="nav-section-label">Tools</div>
        {toolsNav.map(n => (
          <button
            key={n.id}
            className={`nav-item ${active === n.id ? "active" : ""}`}
            onClick={() => onNavigate(n.id)}
          >
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="nav-item">
          <div className="avatar">{CURRENT_USER.initials}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              {CURRENT_USER.name}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {CURRENT_USER.role}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
