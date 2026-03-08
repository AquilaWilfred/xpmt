// ═══════════════════════════════════════
// XPMT — Project Model
// ═══════════════════════════════════════

use serde::{Deserialize, Serialize};
use chrono::Utc;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Project {
    pub id:          String,
    pub space_id:    String,
    pub name:        String,
    pub description: Option<String>,
    pub status:      String,
    pub priority:    String,
    pub start_date:  Option<String>,
    pub due_date:    Option<String>,
    pub created_by:  String,
    pub created_at:  String,
    pub updated_at:  String,
}

#[derive(Debug, Deserialize)]
pub struct CreateProject {
    pub space_id:    String,
    pub name:        String,
    pub description: Option<String>,
    pub priority:    Option<String>,
    pub start_date:  Option<String>,
    pub due_date:    Option<String>,
    pub created_by:  String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProject {
    pub name:        Option<String>,
    pub description: Option<String>,
    pub status:      Option<String>,
    pub priority:    Option<String>,
    pub due_date:    Option<String>,
}

impl Project {
    pub fn new(input: CreateProject) -> Self {
        let now = Utc::now().to_rfc3339();
        Self {
            id:          Uuid::new_v4().to_string(),
            space_id:    input.space_id,
            name:        input.name,
            description: input.description,
            status:      "active".to_string(),
            priority:    input.priority.unwrap_or_else(|| "medium".to_string()),
            start_date:  input.start_date,
            due_date:    input.due_date,
            created_by:  input.created_by,
            created_at:  now.clone(),
            updated_at:  now,
        }
    }
}
