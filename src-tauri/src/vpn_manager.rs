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
    sync::watch,
};
use tokio_util::codec::{FramedRead, LinesCodec};
use tracing::{debug, info};

#[derive(Debug, Serialize, Deserialize, Type, Clone, PartialEq)]
pub(crate) enum Status {
    Disconnected,
    Connected,
    Connecting,
    Disconnecting,
}

pub(crate) struct VpnManager {
    status_channel: (watch::Sender<Status>, watch::Receiver<Status>),
    log_channel: (watch::Sender<String>, watch::Receiver<String>),
    killer: (watch::Sender<bool>, watch::Receiver<bool>),
}

impl VpnManager {
    pub fn new() -> Self {
        Self {
            status_channel: watch::channel(Status::Disconnected),
            log_channel: watch::channel("".to_string()),
            killer: watch::channel(false),
        }
    }
    async fn start_vpn(config: &VpnConfig) -> Result<Child> {
        let tmpdir = std::env::temp_dir();
        let tmp_conf_path = tmpdir.join("wiresock-client.conf");
        let mut tmp_file = File::create(&tmp_conf_path).await?;
        tmp_file
            .write_all(serde_ini::to_string(config)?.as_bytes())
            .await?;

        let child = Command::new("wiresock-client.exe")
            .arg("run")
            .arg("--config")
            .arg(tmp_conf_path)
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

        let _ = self.status_channel.0.send(Status::Connecting);

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

                    info!("log: {}", &line);
                    self.log_channel.0.send(line).unwrap();
                }
            }
        };
        let kill_wait = async {
            let mut rx = self.killer.1.clone();

            while rx.changed().await.is_ok() {
                let v = *rx.borrow();
                if v {
                    info!("Recieved kill signal. Stopping...");
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

        let _ = self.status_channel.0.send(Status::Disconnected);

        self.killer.0.send(false).unwrap();

        Ok(())
    }
    pub async fn stop(&self) -> Result<()> {
        self.killer.0.send(true).unwrap();
        Ok(())
    }

    pub fn get_status_receiver(&self) -> watch::Receiver<Status> {
        self.status_channel.1.clone()
    }
    pub fn get_log_receiver(&self) -> watch::Receiver<String> {
        self.log_channel.1.clone()
    }
}
