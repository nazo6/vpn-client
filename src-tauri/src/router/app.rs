use rspc::Type;
use serde::Serialize;

use super::RouterBuilder;

#[derive(Type, Serialize)]
pub struct AppInfo {
    version: &'static str,
}

pub(crate) fn mount() -> RouterBuilder {
    <RouterBuilder>::new().query("getAppInfo", |t| {
        t(|_, _: ()| AppInfo {
            version: env!("CARGO_PKG_VERSION"),
        })
    })
}
