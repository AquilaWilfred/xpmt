// ═══════════════════════════════
// XPMT — Header Component
// ═══════════════════════════════

import { Theme, NavId } from "../types";
import { NAV_ITEMS } from "../types/constants";

interface Props {
  active: NavId;
  theme: Theme;
  onToggleTheme: () => void;
  onShowUpdate: () => void;
}

export default function Header({
  active,
  theme,
  onToggleTheme,
  onShowUpdate,
}: Props) {
  const current = NAV_ITEMS.find(n => n.id === active);

  return (
    <header className="header">
      <div className="header-title">
        {current?.icon} {current?.label}
      </div>
      <div className="header-actions">
        <button className="theme-toggle" onClick={onToggleTheme}>
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
        <button className="btn btn-ghost" onClick={onShowUpdate}>
          🔔
        </button>
        <button className="btn btn-primary">+ New Project</button>
      </div>
    </header>
  );
}
