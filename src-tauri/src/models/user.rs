// ═══════════════════════════════════════
// XPMT — User Model
// ═══════════════════════════════════════

use serde::{Deserialize, Serialize};
use chrono::Utc;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct User {
    pub id:         String,
    pub name:       String,
    pub email:      String,
    pub role:       String,
    pub avatar:     Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateUser {
    pub name:   String,
    pub email:  String,
    pub role:   Option<String>,
    pub avatar: Option<String>,
}

impl User {
    pub fn new(input: CreateUser) -> Self {
        let now = Utc::now().to_rfc3339();
        Self {
            id:         Uuid::new_v4().to_string(),
            name:       input.name,
            email:      input.email,
            role:       input.role.unwrap_or_else(|| "member".to_string()),
            avatar:     input.avatar,
            created_at: now.clone(),
            updated_at: now,
        }
    }
}
