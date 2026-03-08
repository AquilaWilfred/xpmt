// ═══════════════════════════════════════
// XPMT — Task & Comment Models
// ═══════════════════════════════════════

use serde::{Deserialize, Serialize};
use chrono::Utc;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Task {
    pub id:           String,
    pub project_id:   String,
    pub parent_id:    Option<String>,
    pub title:        String,
    pub description:  Option<String>,
    pub status:       String,
    pub priority:     String,
    pub due_date:     Option<String>,
    pub position:     i64,
    pub time_tracked: i64,
    pub created_by:   String,
    pub created_at:   String,
    pub updated_at:   String,
}

#[derive(Debug, Deserialize)]
pub struct CreateTask {
    pub project_id:  String,
    pub parent_id:   Option<String>,
    pub title:       String,
    pub description: Option<String>,
    pub priority:    Option<String>,
    pub due_date:    Option<String>,
    pub created_by:  String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTask {
    pub title:       Option<String>,
    pub description: Option<String>,
    pub status:      Option<String>,
    pub priority:    Option<String>,
    pub due_date:    Option<String>,
    pub position:    Option<i64>,
}

impl Task {
    pub fn new(input: CreateTask) -> Self {
        let now = Utc::now().to_rfc3339();
        Self {
            id:           Uuid::new_v4().to_string(),
            project_id:   input.project_id,
            parent_id:    input.parent_id,
            title:        input.title,
            description:  input.description,
            status:       "todo".to_string(),
            priority:     input.priority.unwrap_or_else(|| "medium".to_string()),
            due_date:     input.due_date,
            position:     0,
            time_tracked: 0,
            created_by:   input.created_by,
            created_at:   now.clone(),
            updated_at:   now,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Comment {
    pub id:         String,
    pub task_id:    String,
    pub user_id:    String,
    pub content:    String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateComment {
    pub task_id: String,
    pub user_id: String,
    pub content: String,
}

impl Comment {
    pub fn new(input: CreateComment) -> Self {
        let now = Utc::now().to_rfc3339();
        Self {
            id:         Uuid::new_v4().to_string(),
            task_id:    input.task_id,
            user_id:    input.user_id,
            content:    input.content,
            created_at: now.clone(),
            updated_at: now,
        }
    }
}
