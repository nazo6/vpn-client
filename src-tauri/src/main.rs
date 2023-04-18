// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod router;

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .plugin(rspc::integrations::tauri::plugin(router::mount(), || ()))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
