use std::{
    process::Stdio,
    sync::{Arc, Mutex},
};

use crate::config::vpn::VpnConfig;
use anyhow::{anyhow, Context, Result};
use command_group::AsyncCommandGroup;
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
use tracing::{debug, info};

#[derive(Debug, Serialize, Deserialize, Type, Clone, PartialEq)]
pub(crate) enum Status {
    Disconnected,
    Connected(String),
    Connecting(String),
    Disconnecting(String),
}

pub(crate) struct VpnManager {
    status_sender: Arc<Mutex<watch::Sender<Status>>>,
    status_receiver: watch::Receiver<Status>,
    killer: (broadcast::Sender<bool>, broadcast::Receiver<bool>),
}

impl VpnManager {
    pub fn new() -> Self {
        let (status_sender, status_receiver) = watch::channel(Status::Disconnected);
        Self {
            status_sender: Arc::new(Mutex::new(status_sender)),
            status_receiver,
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
            .group()
            .creation_flags(0x08000000)
            .spawn()?
            .into_inner();

        Ok(child)
    }
    pub async fn start(&self, config: &VpnConfig) -> Result<()> {
        if *self.status_receiver.borrow() != Status::Disconnected {
            return Err(anyhow!("Already connected"));
        }

        let _ = self
            .status_sender
            .lock()
            .unwrap()
            .send(Status::Connecting(config.id.clone()));

        let child = Self::start_vpn(config).await;

        let Ok(mut child) = child else {
                    let error = child.unwrap_err();
                    let _ = self.status_sender.lock().unwrap().send(Status::Disconnected);
                    return Err(anyhow!("Cannot create process: {}", error.to_string()));
                };

        let stdout = child
            .stdout
            .take()
            .context("child did not have a handle to stdout")?;

        {
            let config = config.clone();
            let sender = self.status_sender.clone();
            let mut kill_receiver = self.killer.0.subscribe();
            tokio::spawn(async move {
                let mut stream = FramedRead::new(stdout, LinesCodec::new());

                let log_task = async {
                    while let Some(line) = stream.next().await {
                        if let Ok(line) = line {
                            if line.contains("WireSock Service has started.") {
                                let _ = sender
                                    .lock()
                                    .unwrap()
                                    .send(Status::Connected(config.id.clone()));
                            }

                            let id = &config.id;
                            info!({ vpn_id = id }, "{}", line);
                        };
                    }
                };
                let recv_kill = async {
                    kill_receiver.recv().await;
                };

                tokio::select! {
                    _ = log_task => {}
                    _ = recv_kill => {
                        debug!("Received kill signal. Killing process...");
                        let _ = child.kill().await;
                    }

                }

                let _ = sender.lock().unwrap().send(Status::Disconnected);
            })
        };

        Ok(())
    }
    pub async fn stop(&self) -> Result<()> {
        debug!("Sending kill signal...");
        self.killer.0.send(true).unwrap();
        Ok(())
    }

    pub fn get_status_receiver(&self) -> watch::Receiver<Status> {
        self.status_receiver.clone()
    }
}
