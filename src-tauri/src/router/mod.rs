use std::sync::Arc;

use rspc::Router;

use crate::AppContext;

mod app;
mod config;
mod vpn;

type RouterBuilder = rspc::RouterBuilder<AppContext>;

pub(crate) fn mount() -> Arc<Router<AppContext>> {
    let config = rspc::Config::new().set_ts_bindings_header("/* eslint-disable */");

    let config = config.export_ts_bindings(
        std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("../frontend/src/rspc/bindings.ts"),
    );

    Router::<AppContext>::new()
        .config(config)
        .merge("app.", app::mount())
        .merge("config.", config::mount())
        .merge("vpn.", vpn::mount())
        .build()
        .arced()
}
