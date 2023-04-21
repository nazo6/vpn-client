use rspc::Type;
use serde::{Deserialize, Serialize};

#[derive(Type, Serialize, Deserialize, Clone)]
pub(crate) struct AppConfig {
    pub proxy: ProxyConfig,
    pub vpn_global: GlobalVpnConfig,
    pub auto_start: AutoStartConfig,
}
impl Default for AppConfig {
    fn default() -> Self {
        Self {
            proxy: ProxyConfig {
                enabled: false,
                proxy_port: 1008,
            },
            vpn_global: GlobalVpnConfig {
                dns: None,
                allowed_ips: None,
                disallowed_ips: None,
                allowed_apps: None,
                disallowed_apps: None,
            },
            auto_start: AutoStartConfig {
                app: false,
                vpn: None,
                hide_window: true,
            },
        }
    }
}

#[derive(Type, Serialize, Deserialize, Clone)]
pub(crate) struct GlobalVpnConfig {
    pub dns: Option<String>,
    pub allowed_ips: Option<String>,
    pub disallowed_ips: Option<String>,
    pub allowed_apps: Option<String>,
    pub disallowed_apps: Option<String>,
}

#[derive(Type, Serialize, Deserialize, Clone)]
pub(crate) struct ProxyConfig {
    pub enabled: bool,
    pub proxy_port: u16,
}

#[derive(Type, Serialize, Deserialize, Clone)]
pub(crate) struct AutoStartConfig {
    pub app: bool,
    pub vpn: Option<String>,
    pub hide_window: bool,
}
