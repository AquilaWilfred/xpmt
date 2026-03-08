// ═══════════════════════════════
// XPMT — App Constants
// ═══════════════════════════════

import { NavItem, StatCard, Project, User } from "./index";

export const NAV_ITEMS: NavItem[] = [
  { icon: "📊", label: "Dashboard", id: "dashboard" },
  { icon: "📁", label: "Projects", id: "projects" },
  { icon: "✅", label: "My Tasks", id: "tasks" },
  { icon: "👥", label: "Team", id: "team" },
  { icon: "📅", label: "Calendar", id: "calendar" },
  { icon: "📄", label: "Docs Generator", id: "docs" },
  { icon: "🔔", label: "Notifications", id: "notifications" },
  { icon: "⚙️", label: "Settings", id: "settings" },
];

export const STATS: StatCard[] = [
  { icon: "📁", value: "12", label: "Active Projects", color: "#6C3DB5" },
  { icon: "✅", value: "48", label: "Tasks Done", color: "#4F8EF7" },
  { icon: "👥", value: "9", label: "Team Members", color: "#22C55E" },
  { icon: "⚠️", value: "5", label: "Overdue Tasks", color: "#F59E0B" },
];

export const RECENT_PROJECTS: Project[] = [
  { id: "1", name: "XPMT Core Engine", taskCount: 8, memberCount: 3, status: "In Progress" },
  { id: "2", name: "Client Portal v2", taskCount: 12, memberCount: 5, status: "Review" },
  { id: "3", name: "Mobile App Design", taskCount: 5, memberCount: 2, status: "Active" },
];

export const CURRENT_USER: User = {
  initials: "XC",
  name: "X-Cognivis",
  role: "Admin",
};

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "In Progress": { bg: "rgba(108,61,181,0.2)", text: "#9B6FD4" },
  "Review":      { bg: "rgba(79,142,247,0.2)", text: "#4F8EF7" },
  "Active":      { bg: "rgba(34,197,94,0.2)",  text: "#22C55E" },
  "Done":        { bg: "rgba(34,197,94,0.2)",  text: "#22C55E" },
};
