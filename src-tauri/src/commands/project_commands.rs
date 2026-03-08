// ═══════════════════════════════════════
// XPMT — Project Commands
// ═══════════════════════════════════════

use sqlx::SqlitePool;
use tauri::State;
use chrono::Utc;
use crate::models::project::{Project, CreateProject, UpdateProject};

#[tauri::command]
pub async fn get_projects(
    space_id: String,
    pool: State<'_, SqlitePool>
) -> Result<Vec<Project>, String> {
    sqlx::query_as::<_, Project>(
        "SELECT * FROM projects WHERE space_id = ? ORDER BY created_at DESC"
    )
    .bind(&space_id)
    .fetch_all(pool.inner())
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_project(
    id: String,
    pool: State<'_, SqlitePool>
) -> Result<Project, String> {
    sqlx::query_as::<_, Project>("SELECT * FROM projects WHERE id = ?")
        .bind(&id)
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_project(
    input: CreateProject,
    pool: State<'_, SqlitePool>
) -> Result<Project, String> {
    let project = Project::new(input);
    sqlx::query(
        "INSERT INTO projects
         (id, space_id, name, description, status, priority,
          start_date, due_date, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&project.id)
    .bind(&project.space_id)
    .bind(&project.name)
    .bind(&project.description)
    .bind(&project.status)
    .bind(&project.priority)
    .bind(&project.start_date)
    .bind(&project.due_date)
    .bind(&project.created_by)
    .bind(&project.created_at)
    .bind(&project.updated_at)
    .execute(pool.inner())
    .await
    .map_err(|e| e.to_string())?;
    Ok(project)
}

#[tauri::command]
pub async fn update_project(
    id: String,
    input: UpdateProject,
    pool: State<'_, SqlitePool>
) -> Result<Project, String> {
    let now = Utc::now().to_rfc3339();
    sqlx::query(
        "UPDATE projects SET
            name        = COALESCE(?, name),
            description = COALESCE(?, description),
            status      = COALESCE(?, status),
            priority    = COALESCE(?, priority),
            due_date    = COALESCE(?, due_date),
            updated_at  = ?
         WHERE id = ?"
    )
    .bind(&input.name)
    .bind(&input.description)
    .bind(&input.status)
    .bind(&input.priority)
    .bind(&input.due_date)
    .bind(&now)
    .bind(&id)
    .execute(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query_as::<_, Project>("SELECT * FROM projects WHERE id = ?")
        .bind(&id)
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_project(
    id: String,
    pool: State<'_, SqlitePool>
) -> Result<(), String> {
    sqlx::query("DELETE FROM projects WHERE id = ?")
        .bind(&id)
        .execute(pool.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
