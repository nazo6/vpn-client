use std::process::Stdio;

use crate::config::vpn::VpnConfig;
use anyhow::{anyhow, Result};
use futures::prelude::*;
use rspc::Type;
use serde::{Deserialize, Serialize};
use tokio::{
    fs::File,
    io::AsyncWriteExt,
    process::{Child, Command},
    sync::{broadcast, watch},
};
use tokio_util::codec::{FramedRead, LinesCodec};
use tracing::{debug, info, warn};

#[derive(Debug, Serialize, Deserialize, Type, Clone, PartialEq)]
pub(crate) enum Status {
    Disconnected,
    Connected(String),
    Connecting(String),
    Disconnecting(String),
}

pub(crate) struct VpnManager {
    status_channel: (watch::Sender<Status>, watch::Receiver<Status>),
    killer: (broadcast::Sender<bool>, broadcast::Receiver<bool>),
}

impl VpnManager {
    pub fn new() -> Self {
        Self {
            status_channel: watch::channel(Status::Disconnected),
            killer: broadcast::channel(1),
        }
    }
    async fn start_vpn(config: &VpnConfig) -> Result<Child> {
        let tmpdir = std::env::temp_dir();
        let tmp_conf_path = tmpdir.join("wiresock-client.conf");
        let mut tmp_file = File::create(&tmp_conf_path).await?;
        tmp_file
            .write_all(config.to_temp_string().as_bytes())
            .await?;

        debug!(
            "Starting vpn process. Config path: {}",
            tmp_conf_path.to_str().unwrap()
        );

        let child = Command::new("wiresock-client.exe")
            .arg("run")
            .arg("-config")
            .arg(tmp_conf_path.to_str().unwrap())
            .arg("-log-level")
            .arg("debug")
            .stdout(Stdio::piped())
            .kill_on_drop(true)
            .spawn()?;

        Ok(child)
    }
    pub async fn start(&self, config: &VpnConfig) -> Result<()> {
        if *self.status_channel.1.borrow() != Status::Disconnected {
            return Err(anyhow!("Already connected"));
        }

        let _ = self
            .status_channel
            .0
            .send(Status::Connecting(config.id.clone()));

        let child = Self::start_vpn(config).await;

        let Ok(child) = child else {
            let error = child.unwrap_err();
            let _ = self.status_channel.0.send(Status::Disconnected);
            return Err(anyhow!("Cannot create process: {}", error.to_string()));
        };

        let log_task = async {
            if let Some(stdout) = child.stdout {
                let mut stream = FramedRead::new(stdout, LinesCodec::new());

                while let Some(line) = stream.next().await {
                    let Ok(line) = line else {continue};

                    let id = &config.id;
                    info!({ vpn_id = id }, "{}", line);
                }
            } else {
                warn!("No stdout!: {}", &config.id);
            }
        };
        let kill_wait = async {
            let mut rx = self.killer.0.subscribe();

            while let Ok(value) = rx.recv().await {
                if value {
                    info!("Received kill signal. Stopping...");
                    break;
                }
            }
        };

        tokio::select! {
            _ = log_task => {
                debug!("Log task completed")
            }
            _ = kill_wait => {
                debug!("Got kill signal")
            }
        };

        info!("Stopped vpn process.");

        self.killer.0.send(false).unwrap();

        let _ = self.status_channel.0.send(Status::Disconnected);

        Ok(())
    }
    pub async fn stop(&self) -> Result<()> {
        debug!("Sending kill signal...");
        self.killer.0.send(true).unwrap();
        Ok(())
    }

    pub fn get_status_receiver(&self) -> watch::Receiver<Status> {
        self.status_channel.1.clone()
    }
}
