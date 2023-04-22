#![feature(generators, proc_macro_hygiene, stmt_expr_attributes)]
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use rspc_layer::RspcLayer;
use std::sync::Arc;
use tokio::sync::Mutex;

use directories::ProjectDirs;
use once_cell::sync::Lazy;
use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};
use tracing_subscriber::{filter::EnvFilter, prelude::*};

use config::Config;
use vpn_manager::VpnManager;

mod config;
mod router;
mod rspc_layer;
mod vpn_manager;

pub(crate) struct AppContext {
    config: Arc<Mutex<Config>>,
    vpn_manager: Arc<VpnManager>,
    log_receiver: tokio::sync::broadcast::Receiver<rspc_layer::LogEntry>,
}

pub(crate) static PROJECT_DIRS: Lazy<ProjectDirs> =
    Lazy::new(|| ProjectDirs::from("dev", "nazo6", "vpn-client").unwrap());

#[tokio::main]
async fn main() {
    let (rspc_layer, log_sender) = RspcLayer::new();
    let filter_layer = EnvFilter::try_from_default_env()
        .or_else(|_| EnvFilter::try_new("debug"))
        .unwrap();

    tracing_subscriber::registry()
        .with(filter_layer)
        .with(rspc_layer)
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config_str = tokio::fs::read_to_string(PROJECT_DIRS.config_dir().join("config.ron")).await;

    let initial_config = match &config_str {
        Ok(config_str) => match ron::from_str(config_str) {
            Ok(config) => config,
            Err(err) => {
                tracing::error!("Failed to parse config file: {}", err);
                Config::default()
            }
        },
        Err(err) => {
            tracing::error!("Failed to read config file: {}", err);
            Config::default()
        }
    };
    let vpn_manager = VpnManager::new();

    let initial_config_1 = Arc::new(Mutex::new(initial_config));
    let initial_config_2 = initial_config_1.clone();
    let vpn_manager_1 = Arc::new(vpn_manager);
    let vpn_manager_2 = vpn_manager_1.clone();
    let vpn_manager_3 = vpn_manager_1.clone();

    let tray_menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("toggle_win".to_string(), "Show/Hide"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("quit".to_string(), "Quit"));

    tauri::Builder::default()
        .plugin(rspc::integrations::tauri::plugin(
            router::mount(),
            move || AppContext {
                config: initial_config_1.clone(),
                vpn_manager: vpn_manager_1.clone(),
                log_receiver: log_sender.subscribe(),
            },
        ))
        .system_tray(SystemTray::new().with_menu(tray_menu))
        .on_system_tray_event(move |app, event| {
            if let SystemTrayEvent::MenuItemClick { id, .. } = event {
                match id.as_str() {
                    "quit" => {
                        let _ = tokio::runtime::Runtime::new()
                            .unwrap()
                            .block_on(async { vpn_manager_3.stop().await });
                        std::process::exit(0);
                    }
                    "toggle_win" => {
                        let window = app.get_window("main").unwrap();
                        if window.is_visible().unwrap() {
                            window.hide().unwrap();
                        } else {
                            window.show().unwrap()
                        }
                    }
                    _ => {}
                }
            }
        })
        .setup(|_| {
            tauri::async_runtime::spawn(async move {
                let config = initial_config_2.lock().await;
                let vpn_manager = vpn_manager_2.clone();
                if let Some(id) = &config.app.auto_start.vpn {
                    let config = config.vpn.iter().find(|v| v.id == *id).unwrap();
                    let _ = vpn_manager.start(config).await;
                }
            });

            Ok(())
        })
        .on_window_event(|event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event.event() {
                event.window().hide().unwrap();
                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
