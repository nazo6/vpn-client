use rspc::Type;
use serde::{Deserialize, Serialize};

#[derive(Type, Serialize, Deserialize, Clone)]
pub(crate) struct VpnConfig {
    pub id: String,
    pub interface: VpnInterface,
    pub peer: VpnPeer,
}

#[derive(Type, Serialize, Deserialize, Clone)]
pub(crate) struct VpnInterface {
    pub private_key: String,
    pub address: String,
    pub dns: Option<String>,
    pub mtu: Option<String>,
}

#[derive(Type, Serialize, Deserialize, Clone)]
pub(crate) struct VpnPeer {
    pub public_key: String,
    pub allowed_ips: String,
    pub endpoint: String,
    pub preshared_key: Option<String>,
    // wiresock specific
    pub allowed_apps: Option<String>,
    pub disallowed_apps: Option<String>,
    pub disallowed_ips: Option<String>,
}

impl VpnConfig {
    pub fn to_temp_string(&self) -> String {
        let mut str = "".to_string();
        str += "[Interface]\n";
        str += &str_to_wg_str(&self.interface.private_key, "PrivateKey");
        str += &str_to_wg_str(&self.interface.address, "Address");
        str += &option_to_wg_str(&self.interface.dns, "DNS");
        str += &option_to_wg_str(&self.interface.mtu, "MTU");
        str += "\n";
        str += "[Peer]\n";
        str += &str_to_wg_str(&self.peer.public_key, "PublicKey");
        str += &str_to_wg_str(&self.peer.allowed_ips, "AllowedIPs");
        str += &str_to_wg_str(&self.peer.endpoint, "Endpoint");
        str += &option_to_wg_str(&self.peer.preshared_key, "PresharedKey");
        str += &option_to_wg_str(&self.peer.allowed_apps, "AllowedApps");
        str += &option_to_wg_str(&self.peer.disallowed_apps, "DisallowedApps");
        str += &option_to_wg_str(&self.peer.disallowed_ips, "DisallowedIPs");
        str
    }
}

fn option_to_wg_str(value: &Option<String>, key: &str) -> String {
    if let Some(value) = value {
        if !value.is_empty() {
            return format!("{} = {}\n", key, value);
        }
    }
    "".to_string()
}
fn str_to_wg_str(value: &str, key: &str) -> String {
    if !value.is_empty() {
        return format!("{} = {}\n", key, value);
    }
    "".to_string()
}
