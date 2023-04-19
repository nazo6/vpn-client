#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};

use rspc::Type;
use serde::{Deserialize, Serialize};

mod router;

#[derive(Type, Serialize, Deserialize)]
pub struct AppConfig {
    proxy: Arc<Mutex<ProxyConfig>>,
    vpn_global: Arc<Mutex<GlobalVpnConfig>>,
}

#[derive(Type, Serialize, Deserialize)]
pub struct GlobalVpnConfig {
    dns: Option<String>,
    allowed_ips: Option<String>,
    disallowed_ips: Option<String>,
    allowed_apps: Option<String>,
    disallowed_apps: Option<String>,
}

#[derive(Type, Serialize, Deserialize)]
pub struct ProxyConfig {
    enabled: bool,
    proxy_port: u16,
}

pub struct AppContext {
    config: AppConfig,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    tauri::Builder::default()
        .plugin(rspc::integrations::tauri::plugin(router::mount(), || {
            AppContext {
                config: AppConfig {
                    proxy: Arc::new(Mutex::new(ProxyConfig {
                        enabled: false,
                        proxy_port: 1008,
                    })),
                    vpn_global: Arc::new(Mutex::new(GlobalVpnConfig {
                        dns: None,
                        allowed_ips: None,
                        disallowed_ips: None,
                        allowed_apps: None,
                        disallowed_apps: None,
                    })),
                },
            }
        }))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
