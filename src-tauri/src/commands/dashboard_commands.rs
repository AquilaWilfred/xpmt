// ═══════════════════════════════════════
// XPMT — Dashboard Commands
// ═══════════════════════════════════════

use sqlx::SqlitePool;
use tauri::State;
use serde::Serialize;

#[derive(Serialize)]
pub struct DashboardStats {
    pub total_projects:  i64,
    pub total_tasks:     i64,
    pub completed_tasks: i64,
    pub overdue_tasks:   i64,
    pub total_members:   i64,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct RecentProject {
    pub id:          String,
    pub name:        String,
    pub status:      String,
    pub priority:    String,
    pub task_count:  i64,
    pub due_date:    Option<String>,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct RecentTask {
    pub id:          String,
    pub title:       String,
    pub status:      String,
    pub priority:    String,
    pub due_date:    Option<String>,
    pub project_name: String,
}

#[tauri::command]
pub async fn get_dashboard_stats(
    space_id: String,
    pool: State<'_, SqlitePool>
) -> Result<DashboardStats, String> {
    let total_projects: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM projects WHERE space_id = ?"
    ).bind(&space_id).fetch_one(pool.inner()).await
    .map_err(|e| e.to_string())?;

    let total_tasks: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM tasks t
         JOIN projects p ON t.project_id = p.id
         WHERE p.space_id = ?"
    ).bind(&space_id).fetch_one(pool.inner()).await
    .map_err(|e| e.to_string())?;

    let completed_tasks: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM tasks t
         JOIN projects p ON t.project_id = p.id
         WHERE p.space_id = ? AND t.status = 'done'"
    ).bind(&space_id).fetch_one(pool.inner()).await
    .map_err(|e| e.to_string())?;

    let overdue_tasks: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM tasks t
         JOIN projects p ON t.project_id = p.id
         WHERE p.space_id = ?
         AND t.due_date < datetime('now')
         AND t.status != 'done'"
    ).bind(&space_id).fetch_one(pool.inner()).await
    .map_err(|e| e.to_string())?;

    let total_members: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM users"
    ).fetch_one(pool.inner()).await
    .map_err(|e| e.to_string())?;

    Ok(DashboardStats {
        total_projects:  total_projects.0,
        total_tasks:     total_tasks.0,
        completed_tasks: completed_tasks.0,
        overdue_tasks:   overdue_tasks.0,
        total_members:   total_members.0,
    })
}

#[tauri::command]
pub async fn get_recent_projects(
    space_id: String,
    pool: State<'_, SqlitePool>
) -> Result<Vec<RecentProject>, String> {
    sqlx::query_as::<_, RecentProject>(
        "SELECT p.id, p.name, p.status, p.priority, p.due_date,
                COUNT(t.id) as task_count
         FROM projects p
         LEFT JOIN tasks t ON t.project_id = p.id
         WHERE p.space_id = ?
         GROUP BY p.id
         ORDER BY p.created_at DESC
         LIMIT 5"
    )
    .bind(&space_id)
    .fetch_all(pool.inner())
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_recent_tasks(
    user_id: String,
    pool: State<'_, SqlitePool>
) -> Result<Vec<RecentTask>, String> {
    sqlx::query_as::<_, RecentTask>(
        "SELECT t.id, t.title, t.status, t.priority, t.due_date,
                p.name as project_name
         FROM tasks t
         JOIN projects p ON t.project_id = p.id
         WHERE t.created_by = ?
         ORDER BY t.created_at DESC
         LIMIT 6"
    )
    .bind(&user_id)
    .fetch_all(pool.inner())
    .await
    .map_err(|e| e.to_string())
}
