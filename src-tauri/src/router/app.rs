use futures_async_stream::stream;
use rspc::Type;
use serde::Serialize;

use super::RouterBuilder;

#[derive(Type, Serialize)]
pub struct AppInfo {
    name: &'static str,
    version: &'static str,
}

pub(crate) fn mount() -> RouterBuilder {
    RouterBuilder::new()
        .query("getAppInfo", |t| {
            t(|_, _: ()| AppInfo {
                version: env!("CARGO_PKG_VERSION"),
                name: env!("CARGO_PKG_NAME"),
            })
        })
        .subscription("connectionStatus", |t| {
            t(|ctx, _: ()| {
                #[stream]
                async move {
                    let mut rx = ctx.vpn_manager.get_status_receiver();
                    while rx.changed().await.is_ok() {
                        let v = (*rx.borrow()).clone();
                        yield v;
                    }
                }
            })
        })
        .subscription("log", |t| {
            t(|mut ctx, _: ()| {
                #[stream]
                async move {
                    while let Ok(v) = ctx.log_receiver.recv().await {
                        yield v;
                    }
                }
            })
        })
}
