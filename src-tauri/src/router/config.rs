use rspc::Type;
use serde::Serialize;

use crate::{GlobalVpnConfig, ProxyConfig};

use super::RouterBuilder;

#[derive(Type, Serialize)]
pub struct VpnConfig {
    name: String,
    private_key: String,
    dns: Option<String>,
    preshare_key: Option<String>,
    allowed_ips: Option<String>,
    disallowed_ips: Option<String>,
    endpoint: String,
    public_key: String,
    allowed_apps: Option<String>,
    disallowed_apps: Option<String>,
}

pub(crate) fn mount() -> RouterBuilder {
    <RouterBuilder>::new()
        .query("getAppConfig", |t| t(|ctx, _: ()| ctx.config))
        .mutation("setGlobalVpnConfig", |t| {
            t(|ctx, config: GlobalVpnConfig| async move {
                *ctx.config.vpn_global.lock().unwrap() = config;
            })
        })
        .mutation("setProxyConfig", |t| {
            t(|ctx, config: ProxyConfig| async move {
                *ctx.config.proxy.lock().unwrap() = config;
            })
        })
}
