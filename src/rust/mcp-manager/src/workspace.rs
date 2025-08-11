use crate::manager::McpManager;
use std::sync::{Arc, OnceLock};
use tracing::info;

// Global singleton manager storage
static MANAGER: OnceLock<Arc<McpManager>> = OnceLock::new();

/// Initialize the global manager with the provided event callback.
/// If it's already initialized, the existing instance is returned.
pub fn init_manager() -> Arc<McpManager> {
    MANAGER
        .get_or_init(|| {
            info!("Initializing global MCP manager");
            Arc::new(McpManager::new())
        })
        .clone()
}

/// Get the global manager instance. Panics if not initialized.
pub fn get_manager() -> Arc<McpManager> {
    MANAGER
        .get()
        .expect("MCP manager not initialized. Call init_manager first.")
        .clone()
}
