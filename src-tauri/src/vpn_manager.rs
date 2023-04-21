use std::sync::Mutex;

use crate::{config::VpnConfig, PROJECT_DIRS};
use anyhow::Result;
use rspc::Type;
use serde::{Deserialize, Serialize};
use tokio::sync::watch;
use tokio::{fs::File, io::AsyncWriteExt};

#[derive(Debug, Serialize, Deserialize, Type, Clone)]
pub(crate) enum Status {
    Disconnected,
    Connected,
    Connecting,
    Disconnecting,
}

pub(crate) struct VpnManager {
    status_channel: (watch::Sender<Status>, watch::Receiver<Status>),
    id: Mutex<Option<String>>,
    process: Mutex<Option<std::process::Child>>,
}

impl VpnManager {
    pub fn new() -> Self {
        Self {
            id: Mutex::new(None),
            process: Mutex::new(None),
            status_channel: watch::channel(Status::Disconnected),
        }
    }
    async fn start_vpn(config: &VpnConfig) -> Result<std::process::Child> {
        let tmpdir = PROJECT_DIRS.cache_dir();
        let tmp_conf_path = tmpdir.join("wiresock-client.conf");
        let mut tmp_file = File::create(&tmp_conf_path).await?;
        tmp_file
            .write_all(ron::to_string(config)?.as_bytes())
            .await?;

        let child = std::process::Command::new("wiresock-client.exe")
            .arg("run")
            .arg("--config")
            .arg(tmp_conf_path)
            .arg("-log-level")
            .arg("none")
            .spawn()?;
        Ok(child)
    }
    pub async fn start(&self, config: &VpnConfig) -> Result<()> {
        let _ = self.status_channel.0.send(Status::Connecting);
        *self.id.lock().unwrap() = None;

        let res = Self::start_vpn(config).await;

        if let Ok(child) = res {
            *self.process.lock().unwrap() = Some(child);
            let _ = self.status_channel.0.send(Status::Connected);
        } else {
            let _ = self.status_channel.0.send(Status::Disconnected);
        }

        Ok(())
    }

    pub fn get_status_receiver(&self) -> watch::Receiver<Status> {
        self.status_channel.1.clone()
    }
}
