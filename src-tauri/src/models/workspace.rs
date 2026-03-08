// ═══════════════════════════════════════
// XPMT — Workspace & Space Models
// ═══════════════════════════════════════

use serde::{Deserialize, Serialize};
use chrono::Utc;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Workspace {
    pub id:          String,
    pub name:        String,
    pub description: Option<String>,
    pub owner_id:    String,
    pub created_at:  String,
    pub updated_at:  String,
}

#[derive(Debug, Deserialize)]
pub struct CreateWorkspace {
    pub name:        String,
    pub description: Option<String>,
    pub owner_id:    String,
}

impl Workspace {
    pub fn new(input: CreateWorkspace) -> Self {
        let now = Utc::now().to_rfc3339();
        Self {
            id:          Uuid::new_v4().to_string(),
            name:        input.name,
            description: input.description,
            owner_id:    input.owner_id,
            created_at:  now.clone(),
            updated_at:  now,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Space {
    pub id:           String,
    pub workspace_id: String,
    pub name:         String,
    pub description:  Option<String>,
    pub color:        Option<String>,
    pub created_at:   String,
    pub updated_at:   String,
}

#[derive(Debug, Deserialize)]
pub struct CreateSpace {
    pub workspace_id: String,
    pub name:         String,
    pub description:  Option<String>,
    pub color:        Option<String>,
}

impl Space {
    pub fn new(input: CreateSpace) -> Self {
        let now = Utc::now().to_rfc3339();
        Self {
            id:           Uuid::new_v4().to_string(),
            workspace_id: input.workspace_id,
            name:         input.name,
            description:  input.description,
            color:        input.color.or(Some("#6C3DB5".to_string())),
            created_at:   now.clone(),
            updated_at:   now,
        }
    }
}
