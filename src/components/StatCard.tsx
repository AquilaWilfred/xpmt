// ═══════════════════════════════
// XPMT — Stat Card Component
// ═══════════════════════════════

import { StatCard as StatCardType } from "../types";

interface Props {
  stat: StatCardType;
}

export default function StatCard({ stat }: Props) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon">{stat.icon}</div>
      <div className="stat-card-value">{stat.value}</div>
      <div className="stat-card-label">{stat.label}</div>
      <div
        className="stat-card-accent"
        style={{
          background: `linear-gradient(90deg, ${stat.color}, #4F8EF7)`
        }}
      />
    </div>
  );
}
