use rspc::Type;
use serde::Serialize;
use tokio::sync::broadcast;
use tracing::field::{Field, Visit};
use tracing_subscriber::Layer;

#[derive(Debug, Type, Clone, Serialize)]
pub(crate) enum LogEntry {
    VpnLog(VpnLog),
    AppLog(AppLog),
}
#[derive(Debug, Type, Clone, Serialize)]
pub(crate) struct VpnLog {
    pub level: Level,
    pub vpn_id: String,
    pub message: String,
}
#[derive(Debug, Type, Clone, Serialize)]
pub(crate) struct AppLog {
    pub level: Level,
    pub message: String,
}

#[derive(Debug, Type, Clone, Serialize)]
pub(crate) enum Level {
    Trace = 0,
    Debug = 1,
    Info = 2,
    Warn = 3,
    Error = 4,
}
impl From<tracing::Level> for Level {
    fn from(level: tracing::Level) -> Self {
        match level {
            tracing::Level::TRACE => Self::Trace,
            tracing::Level::DEBUG => Self::Debug,
            tracing::Level::INFO => Self::Info,
            tracing::Level::WARN => Self::Warn,
            tracing::Level::ERROR => Self::Error,
        }
    }
}

pub(crate) struct RspcLayer {
    pub sender: broadcast::Sender<LogEntry>,
}

impl RspcLayer {
    pub fn new() -> (Self, broadcast::Sender<LogEntry>) {
        let (sender, _) = broadcast::channel(16);
        (
            Self {
                sender: sender.clone(),
            },
            sender,
        )
    }
}

impl<S> Layer<S> for RspcLayer
where
    S: tracing::Subscriber,
{
    fn on_event(
        &self,
        event: &tracing::Event<'_>,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        let vpn_id = event.fields().find(|f| f.name() == "vpn_id");

        let mut log = if vpn_id.is_some() {
            LogEntry::VpnLog(VpnLog {
                level: (*event.metadata().level()).into(),
                vpn_id: "".to_string(),
                message: "".to_string(),
            })
        } else {
            LogEntry::AppLog(AppLog {
                level: (*event.metadata().level()).into(),
                message: "".to_string(),
            })
        };

        event.record(&mut log);

        let _ = self.sender.send(log);
    }
}

impl Visit for LogEntry {
    fn record_debug(&mut self, field: &Field, value: &dyn std::fmt::Debug) {
        match self {
            Self::VpnLog(log) => {
                if field.name() == "message" {
                    log.message = format!("{:?}", value);
                }
            }
            Self::AppLog(log) => {
                if field.name() == "message" {
                    log.message = format!("{:?}", value);
                }
            }
        }
    }
    fn record_str(&mut self, field: &Field, value: &str) {
        if let Self::VpnLog(log) = self {
            if field.name() == "vpn_id" {
                log.vpn_id = value.to_string();
            }
        }
    }
}
