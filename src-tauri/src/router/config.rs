use tokio::{
    fs::{create_dir_all, File},
    io::AsyncWriteExt,
};

use crate::{
    config::{app::AppConfig, vpn::VpnConfig},
    PROJECT_DIRS,
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
                ctx.config.lock().await.app = config;
                let str = ron::to_string(&*ctx.config.lock().await).unwrap();

                let conf_dir = PROJECT_DIRS.config_dir();
                if !tokio::fs::try_exists(conf_dir).await.unwrap() {
                    create_dir_all(conf_dir).await.map_err(|_| {
                        Error::new(
                            ErrorCode::InternalServerError,
                            "Failed to create config directory".to_string(),
                        )
                    })?;
                }

                let conf_path = conf_dir.join("config.ron");
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
            })
        })
        .mutation("setVpnConfig", |t| {
            t(|ctx, config: Vec<VpnConfig>| async move {
                ctx.config.lock().await.vpn = config;
                let str = ron::to_string(&*ctx.config.lock().await).unwrap();

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
            })
        })
}
