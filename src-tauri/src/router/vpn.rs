use rspc::{Error, ErrorCode};
use tracing::{error, info, warn};

use super::RouterBuilder;

pub(crate) fn mount() -> RouterBuilder {
    <RouterBuilder>::new()
        .mutation("start", |t| {
            t(|ctx, id: String| async move {
                let vpn_config = ctx.config.lock().await;
                let vpn_config = vpn_config.vpn.iter().find(|c| c.id == id).cloned();
                if let Some(vpn_config) = vpn_config {
                    info!("Starting VPN: {}", vpn_config.id);
                    match ctx.vpn_manager.start(&vpn_config).await {
                        Ok(_) => {
                            info!("VPN started");
                            Ok(())
                        }
                        Err(e) => {
                            error!("Failed to start VPN: {}", e);
                            Err(rspc::Error::new(
                                ErrorCode::InternalServerError,
                                e.to_string(),
                            ))
                        }
                    }
                } else {
                    warn!(r#"VPN "{}" not found"#, id);
                    Err(Error::new(
                        ErrorCode::BadRequest,
                        "VPN not found".to_string(),
                    ))
                }
            })
        })
        .mutation("stop", |t| {
            t(|ctx, _: ()| async move {
                let res = ctx.vpn_manager.stop().await;
                match res {
                    Ok(_) => {
                        info!("VPN stopped");
                        Ok(())
                    }
                    Err(e) => {
                        error!("Failed to stop VPN: {}", e);
                        Err(rspc::Error::new(
                            ErrorCode::InternalServerError,
                            e.to_string(),
                        ))
                    }
                }
            })
        })
}
