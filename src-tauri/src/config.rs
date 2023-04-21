use rspc::Type;
use serde::{Deserialize, Serialize};

pub(crate) mod app;
pub(crate) mod vpn;

#[derive(Type, Serialize, Deserialize, Clone, Default)]
pub(crate) struct Config {
    pub app: app::AppConfig,
    pub vpn: Vec<vpn::VpnConfig>,
}
