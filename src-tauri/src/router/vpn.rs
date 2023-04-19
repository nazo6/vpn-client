use rspc::Type;
use serde::Serialize;

use super::{config::VpnConfig, RouterBuilder};

pub(crate) fn mount() -> RouterBuilder {
    <RouterBuilder>::new()
        .mutation("start", |t| {
            t(|ctx, config: VpnConfig| async move {
                *ctx.config.vpn_global.lock().unwrap() = config;
            })
        })
        .mutation("setProxyConfig", |t| {
            t(|ctx, config: ProxyConfig| async move {
                *ctx.config.proxy.lock().unwrap() = config;
            })
        })
}
