use rspc::Type;
use serde::{Deserialize, Serialize};

#[derive(Type, Serialize, Deserialize, Clone)]
#[serde(rename_all = "PascalCase")]
pub(crate) struct VpnConfig {
    pub id: String,
    pub interface: VpnInterface,
    pub peer: VpnPeer,
}
#[derive(Type, Serialize, Deserialize, Clone)]
#[serde(rename_all = "PascalCase")]
pub(crate) struct VpnInterface {
    pub private_key: String,
    pub address: String,
    #[serde(rename = "DNS")]
    pub dns: Option<String>,
    #[serde(rename = "MTU")]
    pub mtu: Option<String>,
}
#[derive(Type, Serialize, Deserialize, Clone)]
#[serde(rename_all = "PascalCase")]
pub(crate) struct VpnPeer {
    pub public_key: String,
    #[serde(rename = "AllowedIPs")]
    pub allowed_ips: Option<String>,
    pub endpoint: String,
    pub preshared_key: Option<String>,
    // wiresock specific
    pub allowed_apps: Option<String>,
    pub disallowed_apps: Option<String>,
    #[serde(rename = "DisallowedIPs")]
    pub disallowed_ips: Option<String>,
}
