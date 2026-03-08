// ═══════════════════════════════════════
// XPMT — Project Share Link Commands
// ═══════════════════════════════════════

use sqlx::SqlitePool;
use tauri::State;
use chrono::{Utc, Duration};
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use rand::Rng;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct ProjectLink {
    pub id:         String,
    pub project_id: String,
    pub token:      String,
    pub visibility: String,
    pub expiry:     Option<String>,
    pub created_by: String,
    pub created_at: String,
}

#[derive(Debug, Serialize)]
pub struct JoinResult {
    pub project_id:   String,
    pub project_name: String,
    pub workspace_id: String,
    pub space_id:     String,
}

#[derive(Debug, Deserialize)]
pub struct CreateLinkInput {
    pub project_id: String,
    pub visibility: String,
    pub expiry_days: Option<i64>,
    pub created_by: String,
}

fn generate_token() -> String {
    let mut rng = rand::thread_rng();
    (0..64)
        .map(|_| {
            let idx = rng.gen_range(0..62);
            match idx {
                0..=9   => (b'0' + idx) as char,
                10..=35 => (b'a' + idx - 10) as char,
                _       => (b'A' + idx - 36) as char,
            }
        })
        .collect()
}

#[tauri::command]
pub async fn create_share_link(
    input: CreateLinkInput,
    pool: State<'_, SqlitePool>
) -> Result<ProjectLink, String> {
    let now   = Utc::now();
    let token = generate_token();
    let id    = Uuid::new_v4().to_string();

    let expiry = input.expiry_days.map(|days| {
        (now + Duration::days(days)).to_rfc3339()
    });

    let link = ProjectLink {
        id:         id.clone(),
        project_id: input.project_id.clone(),
        token:      token.clone(),
        visibility: input.visibility.clone(),
        expiry:     expiry.clone(),
        created_by: input.created_by.clone(),
        created_at: now.to_rfc3339(),
    };

    sqlx::query(
        "INSERT INTO project_links
         (id, project_id, token, visibility, expiry, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&input.project_id)
    .bind(&token)
    .bind(&input.visibility)
    .bind(&expiry)
    .bind(&input.created_by)
    .bind(&now.to_rfc3339())
    .execute(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    Ok(link)
}

#[tauri::command]
pub async fn get_project_links(
    project_id: String,
    pool: State<'_, SqlitePool>
) -> Result<Vec<ProjectLink>, String> {
    sqlx::query_as::<_, ProjectLink>(
        "SELECT * FROM project_links
         WHERE project_id = ?
         ORDER BY created_at DESC"
    )
    .bind(&project_id)
    .fetch_all(pool.inner())
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn validate_share_link(
    token: String,
    pool: State<'_, SqlitePool>
) -> Result<JoinResult, String> {
    // Find the link
    let link = sqlx::query_as::<_, ProjectLink>(
        "SELECT * FROM project_links WHERE token = ?"
    )
    .bind(&token)
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| e.to_string())?
    .ok_or("Invalid or expired link!")?;

    // Check expiry
    if let Some(expiry) = &link.expiry {
        let exp = chrono::DateTime::parse_from_rfc3339(expiry)
            .map_err(|_| "Invalid expiry date")?;
        if Utc::now() > exp {
            return Err("This link has expired!".to_string());
        }
    }

    // Get project info
    let project: (String, String, String) = sqlx::query_as(
        "SELECT p.id, p.name, p.space_id FROM projects p WHERE p.id = ?"
    )
    .bind(&link.project_id)
    .fetch_one(pool.inner())
    .await
    .map_err(|_| "Project not found!")?;

    // Get workspace id
    let space: (String,) = sqlx::query_as(
        "SELECT workspace_id FROM spaces WHERE id = ?"
    )
    .bind(&project.2)
    .fetch_one(pool.inner())
    .await
    .map_err(|_| "Space not found!")?;

    Ok(JoinResult {
        project_id:   project.0,
        project_name: project.1,
        workspace_id: space.0,
        space_id:     project.2,
    })
}

#[tauri::command]
pub async fn join_via_link(
    token:   String,
    user_id: String,
    pool: State<'_, SqlitePool>
) -> Result<JoinResult, String> {
    // Validate first
    let result = validate_share_link(token, pool.clone()).await?;

    // Add user to project
    let now = Utc::now().to_rfc3339();
    sqlx::query(
        "INSERT OR IGNORE INTO project_members
         (project_id, user_id, role, joined_at)
         VALUES (?, ?, 'member', ?)"
    )
    .bind(&result.project_id)
    .bind(&user_id)
    .bind(&now)
    .execute(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    Ok(result)
}

#[tauri::command]
pub async fn revoke_share_link(
    id:   String,
    pool: State<'_, SqlitePool>
) -> Result<(), String> {
    sqlx::query("DELETE FROM project_links WHERE id = ?")
        .bind(&id)
        .execute(pool.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
