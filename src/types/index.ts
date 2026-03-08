// ═══════════════════════════════════════
// XPMT — Global Types (matches Rust models)
// ═══════════════════════════════════════

export type Theme = "dark" | "light";

export type NavId =
  | "dashboard" | "projects" | "tasks"
  | "team"      | "calendar" | "docs"
  | "notifications" | "settings";

export interface NavItem {
  icon:  string;
  label: string;
  id:    NavId;
}

export interface User {
  id:         string;
  name:       string;
  email:      string;
  role:       string;
  avatar?:    string;
  created_at: string;
  updated_at: string;
}

export interface CreateUser {
  name:    string;
  email:   string;
  role?:   string;
  avatar?: string;
}

export interface Workspace {
  id:          string;
  name:        string;
  description?: string;
  owner_id:    string;
  created_at:  string;
  updated_at:  string;
}

export interface Space {
  id:           string;
  workspace_id: string;
  name:         string;
  description?: string;
  color?:       string;
  created_at:   string;
  updated_at:   string;
}

export interface Project {
  id:           string;
  space_id:     string;
  name:         string;
  description?: string;
  status:       string;
  priority:     string;
  start_date?:  string;
  due_date?:    string;
  created_by:   string;
  created_at:   string;
  updated_at:   string;
}

export interface CreateProject {
  space_id:     string;
  name:         string;
  description?: string;
  priority?:    string;
  start_date?:  string;
  due_date?:    string;
  created_by:   string;
}

export interface UpdateProject {
  name?:        string;
  description?: string;
  status?:      string;
  priority?:    string;
  due_date?:    string;
}

export interface Task {
  id:           string;
  project_id:   string;
  parent_id?:   string;
  title:        string;
  description?: string;
  status:       string;
  priority:     string;
  due_date?:    string;
  position:     number;
  time_tracked: number;
  created_by:   string;
  created_at:   string;
  updated_at:   string;
}

export interface CreateTask {
  project_id:   string;
  parent_id?:   string;
  title:        string;
  description?: string;
  priority?:    string;
  due_date?:    string;
  created_by:   string;
}

export interface UpdateTask {
  title?:       string;
  description?: string;
  status?:      string;
  priority?:    string;
  due_date?:    string;
  position?:    number;
}

export interface Comment {
  id:         string;
  task_id:    string;
  user_id:    string;
  content:    string;
  created_at: string;
  updated_at: string;
}

export interface CreateComment {
  task_id: string;
  user_id: string;
  content: string;
}

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type Priority   = "low" | "medium" | "high" | "urgent";
