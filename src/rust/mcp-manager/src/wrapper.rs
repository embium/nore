
use crate::manager::McpManager;
use crate::models::{McpEvent, ServerConfig, ToolExecutionRequest, ToolInfo};
use napi::threadsafe_function::ThreadsafeFunction;
use napi_derive::napi;
use std::sync::Arc;

/// NAPI wrapper for the MCP manager
#[napi(js_name = "McpManager")]
pub struct McpManagerWrapper {
    /// The underlying MCP manager
    manager: Arc<McpManager>,
}

#[napi]
impl McpManagerWrapper {
    /// Create a new MCP manager wrapper
    #[napi(constructor)]
    pub fn new(event_callback: ThreadsafeFunction<McpEvent>) -> Self {
        let manager = McpManager::new(event_callback);
        Self {
            manager: Arc::new(manager),
        }
    }

    /// Start a new MCP server
    #[napi]
    pub async fn start(&self, config: ServerConfig) -> napi::Result<()> {
        self.manager.start(config).await.map_err(|e| {
            napi::Error::new(napi::Status::GenericFailure, e.to_string())
        })
    }

    /// Stop an MCP server
    #[napi]
    pub async fn stop(&self, server_id: String) -> napi::Result<()> {
        self.manager.stop(&server_id).await.map_err(|e| {
            napi::Error::new(napi::Status::GenericFailure, e.to_string())
        })
    }

    /// Get all available tools across all servers
    #[napi]
    pub fn get_tools(&self) -> Vec<ToolInfo> {
        self.manager.get_tools()
    }

    /// Execute a tool on an MCP server
    #[napi]
    pub async fn execute_tool(&self, request: ToolExecutionRequest) -> napi::Result<String> {
        self.manager.execute_tool(request).await.map_err(|e| {
            napi::Error::new(napi::Status::GenericFailure, e.to_string())
        })
    }
}
