// ═══════════════════════════════════════
// XPMT — User Commands
// ═══════════════════════════════════════

use sqlx::SqlitePool;
use tauri::State;
use crate::models::user::{User, CreateUser};

#[tauri::command]
pub async fn get_users(
    pool: State<'_, SqlitePool>
) -> Result<Vec<User>, String> {
    sqlx::query_as::<_, User>("SELECT * FROM users ORDER BY created_at ASC")
        .fetch_all(pool.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_user(
    id: String,
    pool: State<'_, SqlitePool>
) -> Result<User, String> {
    sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
        .bind(&id)
        .fetch_one(pool.inner())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_user(
    input: CreateUser,
    pool: State<'_, SqlitePool>
) -> Result<User, String> {
    let user = User::new(input);
    sqlx::query(
        "INSERT INTO users (id, name, email, role, avatar, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&user.id)
    .bind(&user.name)
    .bind(&user.email)
    .bind(&user.role)
    .bind(&user.avatar)
    .bind(&user.created_at)
    .bind(&user.updated_at)
    .execute(pool.inner())
    .await
    .map_err(|e| e.to_string())?;
    Ok(user)
}

#[tauri::command]
pub async fn delete_user(
    id: String,
    pool: State<'_, SqlitePool>
) -> Result<(), String> {
    sqlx::query("DELETE FROM users WHERE id = ?")
        .bind(&id)
        .execute(pool.inner())
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
