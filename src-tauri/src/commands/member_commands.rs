// ═══════════════════════════════════════
// XPMT — Member Commands
// ═══════════════════════════════════════

use sqlx::SqlitePool;
use tauri::State;
use chrono::Utc;
use uuid::Uuid;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Member {
    pub id:         String,
    pub name:       String,
    pub email:      String,
    pub role:       String,
    pub avatar:     Option<String>,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct InviteMember {
    pub name:         String,
    pub email:        String,
    pub role:         String,
    pub workspace_id: String,
}

#[tauri::command]
pub async fn get_workspace_members(
    workspace_id: String,
    pool: State<'_, SqlitePool>
) -> Result<Vec<Member>, String> {
    // Get all users for now (workspace members)
    sqlx::query_as::<_, Member>(
        "SELECT id, name, email, role, avatar, created_at
         FROM users ORDER BY created_at ASC"
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn invite_member(
    input: InviteMember,
    pool: State<'_, SqlitePool>
) -> Result<Member, String> {
    let now = Utc::now().to_rfc3339();
    let id  = Uuid::new_v4().to_string();

    // Check if email already exists
    let existing: Option<(String,)> = sqlx::query_as(
        "SELECT id FROM users WHERE email = ?"
    )
    .bind(&input.email)
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    if existing.is_some() {
        return Err("A member with this email already exists!".to_string());
    }

    sqlx::query(
        "INSERT INTO users (id, name, email, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&input.name)
    .bind(&input.email)
    .bind(&input.role)
    .bind(&now)
    .bind(&now)
    .execute(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    Ok(Member {
        id, name: input.name,
        email: input.email,
        role: input.role,
        avatar: None,
        created_at: now,
    })
}

#[tauri::command]
pub async fn add_project_member(
    project_id: String,
    user_id:    String,
    role:       String,
    pool: State<'_, SqlitePool>
) -> Result<(), String> {
    let now = Utc::now().to_rfc3339();
    sqlx::query(
        "INSERT OR IGNORE INTO project_members
         (project_id, user_id, role, joined_at)
         VALUES (?, ?, ?, ?)"
    )
    .bind(&project_id)
    .bind(&user_id)
    .bind(&role)
    .bind(&now)
    .execute(pool.inner())
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_project_members(
    project_id: String,
    pool: State<'_, SqlitePool>
) -> Result<Vec<Member>, String> {
    sqlx::query_as::<_, Member>(
        "SELECT u.id, u.name, u.email, u.role, u.avatar, u.created_at
         FROM users u
         JOIN project_members pm ON pm.user_id = u.id
         WHERE pm.project_id = ?
         ORDER BY pm.joined_at ASC"
    )
    .bind(&project_id)
    .fetch_all(pool.inner())
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn remove_project_member(
    project_id: String,
    user_id:    String,
    pool: State<'_, SqlitePool>
) -> Result<(), String> {
    sqlx::query(
        "DELETE FROM project_members WHERE project_id = ? AND user_id = ?"
    )
    .bind(&project_id)
    .bind(&user_id)
    .execute(pool.inner())
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}
