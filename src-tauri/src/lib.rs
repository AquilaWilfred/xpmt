// ═══════════════════════════════════════
// XPMT — Main Library Entry Point
// ═══════════════════════════════════════

mod db;
mod models;
mod commands;

use tauri::Manager;
use commands::user_commands::*;
use commands::project_commands::*;
use commands::task_commands::*;
use commands::setup_commands::*;
use commands::dashboard_commands::*;
use commands::member_commands::*;
use commands::share_commands::*;

#[tauri::command]
async fn check_for_updates(app: tauri::AppHandle) -> Result<bool, String> {
    use tauri_plugin_updater::UpdaterExt;
    match app.updater().map_err(|e| e.to_string())?.check().await {
        Ok(Some(_)) => Ok(true),
        Ok(None)    => Ok(false),
        Err(e)      => Err(e.to_string()),
    }
}

#[tauri::command]
async fn install_update(app: tauri::AppHandle) -> Result<(), String> {
    use tauri_plugin_updater::UpdaterExt;
    if let Some(update) = app.updater()
        .map_err(|e| e.to_string())?
        .check().await
        .map_err(|e| e.to_string())?
    {
        update.download_and_install(|_, _| {}, || {})
            .await
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::block_on(async move {
                let pool = db::init_db()
                    .await
                    .expect("Failed to initialize database");
                handle.manage(pool);
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            check_for_updates,
            install_update,
            is_setup_done,
            complete_onboarding,
            get_dashboard_stats,
            get_recent_projects,
            get_recent_tasks,
            get_users,
            get_user,
            create_user,
            delete_user,
            get_projects,
            get_project,
            create_project,
            update_project,
            delete_project,
            get_tasks,
            get_subtasks,
            create_task,
            update_task,
            delete_task,
            get_comments,
            create_comment,
            get_workspace_members,
            invite_member,
            add_project_member,
            get_project_members,
            remove_project_member,
            create_share_link,
            get_project_links,
            validate_share_link,
            join_via_link,
            revoke_share_link,
        ])
        .run(tauri::generate_context!())
        .expect("error while running XPMT");
}
