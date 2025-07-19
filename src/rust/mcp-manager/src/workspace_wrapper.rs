use crate::models::{McpEvent, ServerConfig, ToolExecutionRequest, ToolInfo};
use crate::workspace::get_workspace;
use napi::threadsafe_function::ThreadsafeFunction;
use napi_derive::napi;

/// NAPI wrapper for the MCP manager
#[napi(js_name = "McpManager")]
pub struct McpManagerWrapper {
    /// The manager ID
    manager_id: String,
    /// The event callback
    event_callback: ThreadsafeFunction<McpEvent>,
}

#[napi]
impl McpManagerWrapper {
    /// Create a new MCP manager wrapper
    #[napi(constructor)]
    pub fn new(manager_id: String, event_callback: ThreadsafeFunction<McpEvent>) -> Self {
        // Get or create the manager in the workspace
        get_workspace().get_or_create_manager(&manager_id, event_callback.clone());
        
        Self {
            manager_id,
            event_callback,
        }
    }

    /// Start a new MCP server
    #[napi]
    pub async fn start(&self, config: ServerConfig) -> napi::Result<()> {
        // Get the manager from the workspace
        let manager = get_workspace().get_manager(&self.manager_id).ok_or_else(|| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("Manager with ID '{}' not found", self.manager_id),
            )
        })?;

        // Start the server
        manager.start(config).await.map_err(|e| {
            napi::Error::new(napi::Status::GenericFailure, e.to_string())
        })
    }

    /// Stop an MCP server
    #[napi]
    pub async fn stop(&self, server_id: String) -> napi::Result<()> {
        // Get the manager from the workspace
        let manager = get_workspace().get_manager(&self.manager_id).ok_or_else(|| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("Manager with ID '{}' not found", self.manager_id),
            )
        })?;

        // Stop the server
        manager.stop(&server_id).await.map_err(|e| {
            napi::Error::new(napi::Status::GenericFailure, e.to_string())
        })
    }

    /// Get all available tools across all servers
    #[napi]
    pub fn get_tools(&self) -> napi::Result<Vec<ToolInfo>> {
        // Get the manager from the workspace
        let manager = get_workspace().get_manager(&self.manager_id).ok_or_else(|| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("Manager with ID '{}' not found", self.manager_id),
            )
        })?;

        // Get the tools
        Ok(manager.get_tools())
    }

    /// Execute a tool on an MCP server
    #[napi]
    pub async fn execute_tool(&self, request: ToolExecutionRequest) -> napi::Result<String> {
        // Get the manager from the workspace
        let manager = get_workspace().get_manager(&self.manager_id).ok_or_else(|| {
            napi::Error::new(
                napi::Status::GenericFailure,
                format!("Manager with ID '{}' not found", self.manager_id),
            )
        })?;

        // Execute the tool
        manager.execute_tool(request).await.map_err(|e| {
            napi::Error::new(napi::Status::GenericFailure, e.to_string())
        })
    }

    /// Get the manager ID
    #[napi]
    pub fn get_manager_id(&self) -> String {
        self.manager_id.clone()
    }
    
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
