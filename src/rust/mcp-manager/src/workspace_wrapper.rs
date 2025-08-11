use crate::models::{ServerConfig, ToolExecutionRequest, ToolInfo};
use crate::workspace::{get_manager, init_manager};
use napi_derive::napi;

/// NAPI wrapper for the MCP manager
#[napi(js_name = "McpManager")]
pub struct McpManagerWrapper {}

#[napi]
impl McpManagerWrapper {
    /// Create a new MCP manager wrapper (initializes singleton if needed)
    #[napi(constructor)]
    pub fn new() -> Self {
        // Initialize the global singleton manager
        let _ = init_manager();
        Self {}
    }

    /// Start a new MCP server
    #[napi]
    pub async fn start(&self, config: ServerConfig) -> napi::Result<()> {
        let manager = get_manager();
        manager
            .start(config)
            .await
            .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e.to_string()))
    }

    /// Stop an MCP server
    #[napi]
    pub async fn stop(&self, server_id: String) -> napi::Result<()> {
        let manager = get_manager();
        manager
            .stop(&server_id)
            .await
            .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e.to_string()))
    }

    /// Get all available tools across all servers
    #[napi]
    pub fn get_tools(&self) -> napi::Result<Vec<ToolInfo>> {
        let manager = get_manager();
        Ok(manager.get_tools())
    }

    /// Execute a tool on an MCP server
    #[napi]
    pub async fn execute_tool(&self, request: ToolExecutionRequest) -> napi::Result<String> {
        let manager = get_manager();
        manager
            .execute_tool(request)
            .await
            .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e.to_string()))
    }

    /// Get the manager ID
    // get_manager_id removed in singleton design
    
    /// Get the current working directory of the Rust library
    #[napi]
    pub fn get_current_dir(&self) -> napi::Result<String> {
        std::env::current_dir()
            .map(|path| path.to_string_lossy().to_string())
            .map_err(|e| {
                napi::Error::new(
                    napi::Status::GenericFailure,
                    format!("Failed to get current directory: {}", e),
                )
            })
    }
}
