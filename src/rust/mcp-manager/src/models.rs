use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Configuration for starting an MCP server
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerConfig {
    /// Unique identifier for the server
    pub id: String,
    /// Command to execute (path to the server executable)
    pub command: String,
    /// Arguments to pass to the command
    pub args: Vec<String>,
    /// Environment variables to pass to the command
    pub env: Option<HashMap<String, String>>,
}

/// Information about a tool provided by an MCP server
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolInfo {
    /// ID of the server that provides this tool
    pub server_id: String,
    /// Name of the tool
    pub tool_name: String,
    /// Description of the tool
    pub description: String,
    /// Parameters accepted by the tool (as a JSON string)
    pub parameters: String,
}

/// Request to execute a tool on an MCP server
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolExecutionRequest {
    /// ID of the server to execute the tool on
    pub server_id: String,
    /// Name of the tool to execute
    pub tool_name: String,
    /// Input parameters for the tool (as a JSON string)
    pub inputs: String,
}

/// Event emitted by the MCP manager
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpEvent {
    /// Type of event
    pub event_type: String,
    /// Event payload (as a JSON string)
    pub payload: String,
}

/// Log event emitted by the MCP manager
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEvent {
    /// Log level
    pub level: String,
    /// Log message
    pub message: String,
    /// Server ID (if applicable)
    pub server_id: Option<String>,
}

/// Tools updated event emitted by the MCP manager
#[napi(object)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolsUpdatedEvent {
    /// List of available tools
    pub tools: Vec<ToolInfo>,
}

/// Helper functions to create events
impl McpEvent {
    /// Create a log event
    pub fn log(level: &str, message: &str, server_id: Option<&str>) -> Self {
        let payload = LogEvent {
            level: level.to_string(),
            message: message.to_string(),
            server_id: server_id.map(|s| s.to_string()),
        };
        
        Self {
            event_type: "log".to_string(),
            payload: serde_json::to_string(&payload).unwrap_or_default(),
        }
    }

    /// Create an info log event
    pub fn info(message: &str, server_id: Option<&str>) -> Self {
        Self::log("info", message, server_id)
    }

    /// Create an error log event
    pub fn error(message: &str, server_id: Option<&str>) -> Self {
        Self::log("error", message, server_id)
    }

    /// Create a tools updated event
    pub fn tools_updated(tools: Vec<ToolInfo>) -> Self {
        let payload = ToolsUpdatedEvent { tools };
        Self {
            event_type: "toolsUpdated".to_string(),
            payload: serde_json::to_string(&payload).unwrap_or_default(),
        }
    }

    /// Create a server started event
    pub fn server_started(server_id: &str) -> Self {
        Self {
            event_type: "serverStarted".to_string(),
            payload: serde_json::to_string(&serde_json::json!({ "serverId": server_id })).unwrap_or_default(),
        }
    }

    /// Create a server stopped event
    pub fn server_stopped(server_id: &str) -> Self {
        Self {
            event_type: "serverStopped".to_string(),
            payload: serde_json::to_string(&serde_json::json!({ "serverId": server_id })).unwrap_or_default(),
        }
    }
}
