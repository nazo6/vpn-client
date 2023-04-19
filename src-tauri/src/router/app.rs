use rspc::Type;
use serde::Serialize;

use super::RouterBuilder;

#[derive(Type, Serialize)]
pub struct AppInfo {
    name: &'static str,
    version: &'static str,
}

pub(crate) fn mount() -> RouterBuilder {
    RouterBuilder::new().query("getAppInfo", |t| {
        t(|_, _: ()| AppInfo {
            version: env!("cargo_pkg_version"),
            name: env!("CARGO_PKG_NAME"),
        })
    })
}
