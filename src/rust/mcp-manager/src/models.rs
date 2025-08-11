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

// All JS-facing event types removed; tracing logs are used instead
