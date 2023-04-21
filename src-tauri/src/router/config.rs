use crate::config::{AppConfig, VpnConfig};

use super::RouterBuilder;

pub(crate) fn mount() -> RouterBuilder {
    <RouterBuilder>::new()
        .query("getConfig", |t| {
            t(|ctx, _: ()| async move { ctx.config.lock().await.clone() })
        })
        .mutation("setAppConfig", |t| {
            t(|ctx, config: AppConfig| async move {
                ctx.config.lock().await.app = config;
            })
        })
        .mutation("setVpnConfig", |t| {
            t(|ctx, config: Vec<VpnConfig>| async move {
                ctx.config.lock().await.vpn = config;
            })
        })
}
