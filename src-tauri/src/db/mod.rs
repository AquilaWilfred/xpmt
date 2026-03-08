// ═══════════════════════════════════════
// XPMT — Database Connection Manager
// ═══════════════════════════════════════

use sqlx::{SqlitePool, sqlite::SqlitePoolOptions};
use std::fs;
use anyhow::Result;

pub async fn init_db() -> Result<SqlitePool> {
    let db_path = get_db_path();
    ensure_db_dir(&db_path)?;

    // Create file if it doesn't exist
    if !std::path::Path::new(&db_path).exists() {
        fs::File::create(&db_path)?;
    }

    // sqlite:// needs 3 slashes for absolute path
    let db_url = format!("sqlite://{}", db_path);
    println!("Connecting to: {}", db_url);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await?;

    run_migrations(&pool).await?;
    println!("✅ Database ready!");
    Ok(pool)
}

fn get_db_path() -> String {
    let home = std::env::var("HOME")
        .unwrap_or_else(|_| "/tmp".to_string());
    format!("{}/.xpmt/xpmt.db", home)
}

fn ensure_db_dir(db_path: &str) -> Result<()> {
    let path = std::path::Path::new(db_path);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    Ok(())
}

async fn run_migrations(pool: &SqlitePool) -> Result<()> {
    let schema = include_str!("../../migrations/001_initial.sql");
    sqlx::raw_sql(schema).execute(pool).await?;
    Ok(())
}
