// ═══════════════════════════════
// XPMT — Placeholder Page
// ═══════════════════════════════

import { NavItem } from "../types";

interface Props {
  page: NavItem;
}

export default function Placeholder({ page }: Props) {
  return (
    <div className="card" style={{ textAlign: "center", padding: 60 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{page.icon}</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
        {page.label}
      </div>
      <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>
        Coming in the next phase 🚀
      </div>
    </div>
  );
}
