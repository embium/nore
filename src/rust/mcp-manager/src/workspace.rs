use crate::error::{Error, Result};
use crate::manager::McpManager;
use dashmap::DashMap;
use std::sync::Arc;
use tracing::{debug, info};

/// A workspace that manages multiple MCP manager instances
pub struct McpWorkspace {
    /// Map of manager ID to manager instance
    managers: DashMap<String, Arc<McpManager>>,
}

impl McpWorkspace {
    /// Create a new MCP workspace
    pub fn new() -> Self {
        info!("Creating new MCP workspace");
        Self {
            managers: DashMap::new(),
        }
    }

    /// Get or create a manager with the given ID
    pub fn get_or_create_manager(
        &self,
        manager_id: &str,
        event_callback: napi::threadsafe_function::ThreadsafeFunction<crate::models::McpEvent>,
    ) -> Arc<McpManager> {
        // Check if manager already exists
        if let Some(manager) = self.managers.get(manager_id) {
            debug!("Reusing existing manager with ID '{}'", manager_id);
            // Return the existing manager
            return manager.clone();
        }

        // Create a new manager
        info!("Creating new manager with ID '{}'", manager_id);
        let manager = Arc::new(McpManager::new(manager_id.to_string(), event_callback));
        
        // Store the manager
        self.managers.insert(manager_id.to_string(), manager.clone());
        
        manager
    }

    /// Get a manager by ID
    pub fn get_manager(&self, manager_id: &str) -> Option<Arc<McpManager>> {
        self.managers.get(manager_id).map(|manager| manager.clone())
    }

    /// Remove a manager by ID
    pub async fn remove_manager(&self, manager_id: &str) -> Result<()> {
        // Check if manager exists
        let manager = match self.managers.remove(manager_id) {
            Some((_, manager)) => manager,
            None => return Err(Error::ManagerNotFound(format!(
                "Manager with ID '{}' not found",
                manager_id
            ))),
        };

        // Stop all servers managed by this manager
        manager.stop_all_servers().await?;

        Ok(())
    }

    /// Get all manager IDs
    pub fn get_manager_ids(&self) -> Vec<String> {
        self.managers.iter().map(|entry| entry.key().clone()).collect()
    }
}

// Create a singleton workspace instance
lazy_static::lazy_static! {
    static ref WORKSPACE: McpWorkspace = McpWorkspace::new();
}

/// Get the global workspace instance
pub fn get_workspace() -> &'static McpWorkspace {
    &WORKSPACE
}
