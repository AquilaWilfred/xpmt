// ═══════════════════════════════════════
// XPMT — Setup & Onboarding Commands
// ═══════════════════════════════════════

use sqlx::SqlitePool;
use tauri::State;
use chrono::Utc;
use uuid::Uuid;
use crate::models::user::{User, CreateUser};

#[derive(serde::Deserialize)]
pub struct OnboardingInput {
    pub name:             String,
    pub email:            String,
    pub role:             String,
    pub workspace_name:   String,
    pub workspace_desc:   Option<String>,
    pub space_name:       String,
    pub space_color:      Option<String>,
}

#[derive(serde::Serialize)]
pub struct OnboardingResult {
    pub user_id:      String,
    pub workspace_id: String,
    pub space_id:     String,
}

#[tauri::command]
pub async fn is_setup_done(
    pool: State<'_, SqlitePool>
) -> Result<bool, String> {
    let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users")
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(count.0 > 0)
}

#[tauri::command]
pub async fn complete_onboarding(
    input: OnboardingInput,
    pool: State<'_, SqlitePool>
) -> Result<OnboardingResult, String> {
    let now          = Utc::now().to_rfc3339();
    let user_id      = Uuid::new_v4().to_string();
    let workspace_id = Uuid::new_v4().to_string();
    let space_id     = Uuid::new_v4().to_string();

    // Create user
    sqlx::query(
        "INSERT INTO users (id, name, email, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(&user_id)
    .bind(&input.name)
    .bind(&input.email)
    .bind(&input.role)
    .bind(&now)
    .bind(&now)
    .execute(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    // Create workspace
    sqlx::query(
        "INSERT INTO workspaces (id, name, description, owner_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(&workspace_id)
    .bind(&input.workspace_name)
    .bind(&input.workspace_desc)
    .bind(&user_id)
    .bind(&now)
    .bind(&now)
    .execute(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    // Create first space
    sqlx::query(
        "INSERT INTO spaces (id, workspace_id, name, color, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(&space_id)
    .bind(&workspace_id)
    .bind(&input.space_name)
    .bind(&input.space_color.unwrap_or_else(|| "#6C3DB5".to_string()))
    .bind(&now)
    .bind(&now)
    .execute(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    Ok(OnboardingResult { user_id, workspace_id, space_id })
}
