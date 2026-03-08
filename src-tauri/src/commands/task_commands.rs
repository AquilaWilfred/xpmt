// ═══════════════════════════════════════
// XPMT — Task Commands
// ═══════════════════════════════════════

use sqlx::SqlitePool;
use tauri::State;
use chrono::Utc;
use crate::models::task::{Task, CreateTask, UpdateTask, Comment, CreateComment};

#[tauri::command]
pub async fn get_tasks(
    project_id: String,
    pool: State<'_, SqlitePool>
) -> Result<Vec<Task>, String> {
    sqlx::query_as::<_, Task>(
        "SELECT * FROM tasks
         WHERE project_id = ? AND parent_id IS NULL
         ORDER BY position ASC, created_at ASC"
    )
    .bind(&project_id)
    .fetch_all(pool.inner())
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_subtasks(
    parent_id: String,
    pool: State<'_, SqlitePool>
) -> Result<Vec<Task>, String> {
    sqlx::query_as::<_, Task>(
        "SELECT * FROM tasks WHERE parent_id = ? ORDER BY position ASC"
    )
    .bind(&parent_id)
    .fetch_all(pool.inner())
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_task(
    input: CreateTask,
    pool: State<'_, SqlitePool>
) -> Result<Task, String> {
    let task = Task::new(input);
    sqlx::query(
        "INSERT INTO tasks
         (id, project_id, parent_id, title, description,
          status, priority, due_date, position,
          time_tracked, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&task.id)
    .bind(&task.project_id)
    .bind(&task.parent_id)
    .bind(&task.title)
    .bind(&task.description)
    .bind(&task.status)
    .bind(&task.priority)
    .bind(&task.due_date)
    .bind(&task.position)
    .bind(&task.time_tracked)
    .bind(&task.created_by)
    .bind(&task.created_at)
    .bind(&task.updated_at)
    .execute(pool.inner())
    .await
    .map_err(|e| e.to_string())?;
    Ok(task)
}

#[tauri::command]
pub async fn update_task(
    id: String,
    input: UpdateTask,
    pool: State<'_, SqlitePool>
) -> Result<Task, String> {
    let now = Utc::now().to_rfc3339();
    sqlx::query(
        "UPDATE tasks SET
            title       = COALESCE(?, title),
            description = COALESCE(?, description),
            status      = COALESCE(?, status),
            priority    = COALESCE(?, priority),
            due_date    = COALESCE(?, due_date),
            position    = COALESCE(?, position),
            updated_at  = ?
         WHERE id = ?"
    )
    .bind(&input.title)
    .bind(&input.description)
    .bind(&input.status)
    .bind(&input.priority)
    .bind(&input.due_date)
    .bind(&input.position)
    .bind(&now)
    .bind(&id)
    .execute(pool.inner())
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query_as::<_, Task>("SELECT * FROM tasks WHERE id = ?")
        .bind(&id)
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_task(
    id: String,
    pool: State<'_, SqlitePool>
) -> Result<(), String> {
    sqlx::query("DELETE FROM tasks WHERE id = ?")
        .bind(&id)
        .execute(pool.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_comments(
    task_id: String,
    pool: State<'_, SqlitePool>
) -> Result<Vec<Comment>, String> {
    sqlx::query_as::<_, Comment>(
        "SELECT * FROM comments WHERE task_id = ? ORDER BY created_at ASC"
    )
    .bind(&task_id)
    .fetch_all(pool.inner())
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_comment(
    input: CreateComment,
    pool: State<'_, SqlitePool>
) -> Result<Comment, String> {
    let comment = Comment::new(input);
    sqlx::query(
        "INSERT INTO comments (id, task_id, user_id, content, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(&comment.id)
    .bind(&comment.task_id)
    .bind(&comment.user_id)
    .bind(&comment.content)
    .bind(&comment.created_at)
    .bind(&comment.updated_at)
    .execute(pool.inner())
    .await
    .map_err(|e| e.to_string())?;
    Ok(comment)
}
