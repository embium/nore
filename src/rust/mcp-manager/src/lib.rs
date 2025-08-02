#![deny(clippy::all)]

//! MCP Server Management Library
//!
//! This library provides a high-performance, production-ready solution for managing
//! Model-Context-Protocol (MCP) servers from TypeScript applications.

mod error;
mod manager;
mod models;
mod workspace;
mod workspace_wrapper;

// Re-export the public API
pub use error::error_codes;
pub use models::{McpEvent, ServerConfig, ToolExecutionRequest, ToolInfo};

// Initialize logging when the library is loaded
#[napi::module_init]
fn init() {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .with_writer(std::io::stderr)
        .init();
}

// Export the MCP manager wrapper (now using the workspace-based implementation)
pub use crate::workspace_wrapper::McpManagerWrapper;