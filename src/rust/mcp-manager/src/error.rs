use napi::Error as NapiError;
use napi_derive::napi;
use rmcp::Error as McpError;
use thiserror::Error;

/// Custom error types for the MCP server management library
#[derive(Error, Debug)]
pub enum Error {
    /// Error from the MCP protocol library
    #[error("MCP protocol error: {0}")]
    McpError(#[from] McpError),

    /// Error starting a server process
    #[error("Failed to start server process: {0}")]
    ProcessStartError(String),

    /// Error stopping a server process
    #[error("Failed to stop server process: {0}")]
    ProcessStopError(String),

    /// Error communicating with a server
    #[error("Server communication error: {0}")]
    CommunicationError(String),

    /// Error when a server is not found
    #[error("Server not found: {0}")]
    ServerNotFound(String),

    /// Error when a tool is not found
    #[error("Tool not found: {0}")]
    ToolNotFound(String),

    /// Error executing a tool
    #[error("Tool execution error: {0}")]
    ToolExecutionError(String),
    
    /// Error when a manager is not found
    #[error("Manager not found: {0}")]
    ManagerNotFound(String),
    
    /// Error when a manager has been shut down
    #[error("Manager shutdown: {0}")]
    ManagerShutdown(String),

    /// Generic error
    #[error("{0}")]
    Other(String),
}

/// Result type alias for the MCP server management library
pub type Result<T> = std::result::Result<T, Error>;

/// Convert internal errors to NAPI errors for TypeScript
impl From<Error> for NapiError {
    fn from(err: Error) -> Self {
        let error_message = err.to_string();
        let error_code = match err {
            Error::ServerNotFound(_) => "SERVER_NOT_FOUND",
            Error::ToolNotFound(_) => "TOOL_NOT_FOUND",
            Error::ProcessStartError(_) => "PROCESS_START_ERROR",
            Error::ProcessStopError(_) => "PROCESS_STOP_ERROR",
            Error::CommunicationError(_) => "COMMUNICATION_ERROR",
            Error::ToolExecutionError(_) => "TOOL_EXECUTION_ERROR",
            Error::ManagerNotFound(_) => "MANAGER_NOT_FOUND",
            Error::ManagerShutdown(_) => "MANAGER_SHUTDOWN",
            Error::McpError(_) => "MCP_ERROR",
            Error::Other(_) => "UNKNOWN_ERROR",
        };

        NapiError::new(napi::Status::GenericFailure, error_message)
    }
}

/// JavaScript-exposed error codes
#[napi]
pub mod error_codes {
    #[napi(js_name = "SERVER_NOT_FOUND")]
    pub const SERVER_NOT_FOUND: &str = "SERVER_NOT_FOUND";

    #[napi(js_name = "TOOL_NOT_FOUND")]
    pub const TOOL_NOT_FOUND: &str = "TOOL_NOT_FOUND";

    #[napi(js_name = "PROCESS_START_ERROR")]
    pub const PROCESS_START_ERROR: &str = "PROCESS_START_ERROR";

    #[napi(js_name = "PROCESS_STOP_ERROR")]
    pub const PROCESS_STOP_ERROR: &str = "PROCESS_STOP_ERROR";

    #[napi(js_name = "COMMUNICATION_ERROR")]
    pub const COMMUNICATION_ERROR: &str = "COMMUNICATION_ERROR";

    #[napi(js_name = "TOOL_EXECUTION_ERROR")]
    pub const TOOL_EXECUTION_ERROR: &str = "TOOL_EXECUTION_ERROR";
    
    #[napi(js_name = "MANAGER_NOT_FOUND")]
    pub const MANAGER_NOT_FOUND: &str = "MANAGER_NOT_FOUND";
    
    #[napi(js_name = "MANAGER_SHUTDOWN")]
    pub const MANAGER_SHUTDOWN: &str = "MANAGER_SHUTDOWN";

    #[napi(js_name = "MCP_ERROR")]
    pub const MCP_ERROR: &str = "MCP_ERROR";

    #[napi(js_name = "UNKNOWN_ERROR")]
    pub const UNKNOWN_ERROR: &str = "UNKNOWN_ERROR";
}
