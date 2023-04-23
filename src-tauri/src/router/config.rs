use auto_launch::AutoLaunchBuilder;
use ron::ser::to_string_pretty;
use tokio::{
    fs::{create_dir_all, File},
    io::AsyncWriteExt,
};
use tracing::info;

use crate::{
    config::{app::AppConfig, vpn::VpnConfig},
    AppContext, PROJECT_DIRS,
};
use rspc::{Error, ErrorCode};

use super::RouterBuilder;

pub(crate) fn mount() -> RouterBuilder {
    <RouterBuilder>::new()
        .query("getConfig", |t| {
            t(|ctx, _: ()| async move { ctx.config.lock().await.clone() })
        })
        .mutation("setAppConfig", |t| {
            t(|ctx, config: AppConfig| async move {
                let auto = AutoLaunchBuilder::new()
                    .set_app_name("vpn-client")
                    .set_app_path(std::env::current_exe().unwrap().to_str().unwrap())
                    .set_use_launch_agent(true)
                    .build()
                    .unwrap();

                if config.auto_start.app {
                    if !auto.is_enabled().unwrap() {
                        info!("Enabling auto start");
                        auto.enable().unwrap();
                    }
                } else {
                    if auto.is_enabled().unwrap() {
                        info!("Disabling auto start");
                        auto.disable().unwrap();
                    }
                }

                ctx.config.lock().await.app = config;
                write_config(ctx).await
            })
        })
        .mutation("setVpnConfig", |t| {
            t(|ctx, config: Vec<VpnConfig>| async move {
                ctx.config.lock().await.vpn = config;
                write_config(ctx).await
            })
        })
}

async fn write_config(ctx: AppContext) -> Result<(), Error> {
    let str =
        to_string_pretty(&*ctx.config.lock().await, ron::ser::PrettyConfig::default()).unwrap();

    let conf_dir = PROJECT_DIRS.config_dir();
    if !tokio::fs::try_exists(conf_dir).await.unwrap() {
        create_dir_all(conf_dir).await.map_err(|_| {
            Error::new(
                ErrorCode::InternalServerError,
                "Failed to create config directory".to_string(),
            )
        })?;
    }
    let conf_path = PROJECT_DIRS.config_dir().join("config.ron");
    let mut conf_file = File::create(&conf_path).await.map_err(|_| {
        Error::new(
            ErrorCode::InternalServerError,
            "Failed to create config file".to_string(),
        )
    })?;
    conf_file.write_all(str.as_bytes()).await.map_err(|_| {
        Error::new(
            ErrorCode::InternalServerError,
            "Failed to write config file".to_string(),
        )
    })?;

    Ok(())
}
