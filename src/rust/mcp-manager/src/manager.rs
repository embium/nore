use crate::error::{Error, Result};
use crate::models::{McpEvent, ServerConfig, ToolExecutionRequest, ToolInfo};
use dashmap::DashMap;
use napi::threadsafe_function::ThreadsafeFunction;
use rmcp::transport::TokioChildProcess;
use std::sync::atomic::{AtomicBool, Ordering};
use std::path::Path;

use tokio::process::{Child, Command};
use std::process::Stdio;
use std::sync::Arc;
use sysinfo::{Pid, System};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::sync::Mutex;
use tracing::{debug, warn};
use rmcp::transport::ConfigureCommandExt;

struct Server {
    /// The child process running the server
    process: Arc<Mutex<Child>>,
    /// The MCP client connected to the server
    client: Arc<Mutex<Option<rmcp::service::RunningService<rmcp::service::RoleClient, ()>>>>,
    /// The PID of the server process
    pid: u32,
    /// Tools provided by this server
    tools: Vec<ToolInfo>,
}

/// Manager for MCP servers
pub struct McpManager {
    /// Unique identifier for this manager instance
    manager_id: String,
    /// Map of server ID to server instance
    servers: DashMap<String, Server>,
    /// Callback function for events
    event_callback: ThreadsafeFunction<McpEvent>,
    /// System information for process management
    system: Arc<Mutex<sysinfo::System>>,
    /// Flag indicating if this manager has been shut down
    is_shutdown: AtomicBool,
}

impl McpManager {
    /// Create a new MCP manager
    pub fn new(manager_id: String, event_callback: ThreadsafeFunction<McpEvent>) -> Self {
        let mut system = System::new();
        system.refresh_all();

        Self {
            manager_id,
            servers: DashMap::new(),
            event_callback,
            system: Arc::new(Mutex::new(system)),
            is_shutdown: AtomicBool::new(false),
        }
    }

    /// Start a new MCP server
    pub async fn start(&self, config: ServerConfig) -> Result<()> {
        // Check if server with this ID already exists
        if self.servers.contains_key(&config.id) {
            return Err(Error::Other(format!(
                "Server with ID '{}' already exists",
                config.id
            )));
        }

        // Check if manager is shut down
        if self.is_shutdown.load(Ordering::SeqCst) {
            return Err(Error::ManagerShutdown(format!(
                "Manager '{}' has been shut down",
                self.manager_id
            )));
        }

        // Emit info event
        self.emit_event(McpEvent::info(
            &format!("Starting server '{}' in manager '{}'...", config.id, self.manager_id),
            Some(&config.id),
        ));

        // Create command using OS-specific command handling
        let mut command = Command::new(&config.command);
        command.args(&config.args);

        if let Some(env_vars) = &config.env {
            command.envs(env_vars);
        }

        command
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        // On Windows, hide the console window
        #[cfg(target_os = "windows")]
        {
            use std::os::windows::process::CommandExt;
            const CREATE_NO_WINDOW: u32 = 0x08000000;
            command.creation_flags(CREATE_NO_WINDOW);
        }

        // Start the process
        let mut child = command.spawn().map_err(|e| {
            Error::ProcessStartError(format!("Failed to start server process: {}", e))
        })?;

        // Set up stderr logging
        if let Some(stderr) = child.stderr.take() {
            let server_id = config.id.clone();
            let event_callback = self.event_callback.clone();
            
            tokio::spawn(async move {
                let reader = BufReader::new(stderr);
                let mut lines = reader.lines();
                
                while let Some(line) = lines.next_line().await.unwrap_or(None) {
                    let event = McpEvent::log("info", &line, Some(&server_id));
                    event_callback.call(Ok(event), napi::threadsafe_function::ThreadsafeFunctionCallMode::NonBlocking);
                }
            });
        }

        // Create MCP client
        let transport = TokioChildProcess::new(command.configure(|cmd| {
            cmd.args(&config.args);
            
            // Add environment variables if present
            if let Some(env_vars) = &config.env {
                for (key, value) in env_vars {
                    cmd.env(key, value);
                }
            }
            
            // On Windows, hide the console window for the transport process too
            #[cfg(target_os = "windows")]
            {
                use std::os::windows::process::CommandExt;
                const CREATE_NO_WINDOW: u32 = 0x08000000;
                cmd.creation_flags(CREATE_NO_WINDOW);
            }
        }))
        .map_err(|e| {
            Error::ProcessStartError(format!("Failed to create MCP transport: {}", e))
        })?;

        // Initialize MCP service
        let service = rmcp::service::serve_client((), transport).await.map_err(|e| {
            Error::CommunicationError(format!("Failed to initialize MCP service: {}", e))
        })?;

        // Get server info
        let server_info = service.peer_info();
        debug!("Connected to server: {:?}", server_info);

        // Get available tools
        let tools_result = service.list_tools(Default::default()).await.map_err(|e| {
            Error::CommunicationError(format!("Failed to list tools: {}", e))
        })?;

        // Convert tools to our format
        let tools = tools_result
            .tools
            .into_iter()
            .map(|tool| ToolInfo {
                server_id: config.id.clone(),
                tool_name: tool.name.to_string(),
                description: tool.description.unwrap_or_default().to_string(),
                parameters: serde_json::to_string(&tool.input_schema).unwrap_or_default(),
            })
            .collect::<Vec<_>>();

        // Store server
        let pid = child.id().ok_or_else(|| {
            Error::ProcessStartError("Failed to get process ID".to_string())
        })?;
        
        let server = Server {
            process: Arc::new(Mutex::new(child)),
            client: Arc::new(Mutex::new(Some(service))),
            pid,
            tools: tools.clone(),
        };

        self.servers.insert(config.id.clone(), server);

        // Emit events
        self.emit_event(McpEvent::server_started(&config.id));
        self.emit_event(McpEvent::tools_updated(tools));
        self.emit_event(McpEvent::info(
            &format!("Server '{}' started successfully in manager '{}'", config.id, self.manager_id),
            Some(&config.id),
        ));

        Ok(())
    }

    /// Stop an MCP server
    pub async fn stop(&self, server_id: &str) -> Result<()> {
        // Check if manager is shut down
        if self.is_shutdown.load(Ordering::SeqCst) {
            return Err(Error::ManagerShutdown(format!(
                "Manager '{}' has been shut down",
                self.manager_id
            )));
        }

        // Check if server exists
        let server = match self.servers.remove(server_id) {
            Some(server_entry) => server_entry.1,
            None => return Err(Error::ServerNotFound(format!("Server with ID '{}' not found in manager '{}'", server_id, self.manager_id)))
        };

        self.emit_event(McpEvent::info(
            &format!("Stopping server '{}' in manager '{}'...", server_id, self.manager_id),
            Some(server_id),
        ));

        // Cancel MCP service
        {
            let mut client_guard = server.client.lock().await;
            // Take ownership of the service
            if let Some(service) = client_guard.take() {
                if let Err(e) = service.cancel().await {
                    warn!("Error cancelling MCP service: {}", e);
                }
            }
        }

        // Kill process and all descendants
        self.kill_process_tree(server.pid as i32).await?;

        // Emit events
        self.emit_event(McpEvent::server_stopped(server_id));
        self.emit_event(McpEvent::info(
            &format!("Server '{}' stopped successfully in manager '{}'", server_id, self.manager_id),
            Some(server_id),
        ));

        Ok(())
    }

    /// Kill a process and all its descendants
    async fn kill_process_tree(&self, pid: i32) -> Result<()> {
        let mut system = self.system.lock().await;
        system.refresh_all();

        // Build process tree
        let mut children = Vec::new();
        Self::find_child_processes(&system, pid, &mut children);

        // Kill children first (in reverse order to avoid orphaning)
        for &child_pid in children.iter().rev() {
            let pid_value = child_pid as u32;
            if let Some(process) = system.process(Pid::from_u32(pid_value)) {
                debug!("Killing child process: {}", child_pid);
                if !process.kill() {
                    warn!("Failed to kill child process: {}", child_pid);
                }
            }
        }

        // Kill the main process
        let pid_value = pid as u32;
        if let Some(process) = system.process(Pid::from_u32(pid_value)) {
            debug!("Killing main process: {}", pid);
            if !process.kill() {
                return Err(Error::ProcessStopError(format!(
                    "Failed to kill process: {}",
                    pid
                )));
            }
        }
        
        Ok(())
    }

    /// Find all child processes of a given process
    fn find_child_processes(
        system: &System,
        parent_pid: i32,
        children: &mut Vec<i32>,
    ) {
        for process in system.processes().values() {
            if let Some(ppid) = process.parent() {
                let ppid_value = ppid.as_u32() as i32;
                if ppid_value == parent_pid {
                    let child_pid = process.pid().as_u32() as i32;
                    children.push(child_pid);
                    // Recursively find children of this child
                    Self::find_child_processes(system, child_pid, children);
                }
            }
        }
    }

    /// Get all available tools across all servers
    pub fn get_tools(&self) -> Vec<ToolInfo> {
        let mut tools = Vec::new();
        for server in self.servers.iter() {
            tools.extend(server.tools.clone());
        }
        tools
    }

    /// Execute a tool on an MCP server
    pub async fn execute_tool(&self, request: ToolExecutionRequest) -> Result<String> {
        // Check if manager is shut down
        if self.is_shutdown.load(Ordering::SeqCst) {
            return Err(Error::ManagerShutdown(format!(
                "Manager '{}' has been shut down",
                self.manager_id
            )));
        }

        // Check if server exists
        let server = self.servers.get(&request.server_id).ok_or_else(|| {
            Error::ServerNotFound(format!(
                "Server with ID '{}' not found in manager '{}'",
                request.server_id, self.manager_id
            ))
        })?;

        // Check if tool exists
        server.value()
            .tools
            .iter()
            .find(|t| t.tool_name == request.tool_name)
            .ok_or_else(|| {
                Error::ToolNotFound(format!(
                    "Tool '{}' not found on server '{}' in manager '{}'",
                    request.tool_name, request.server_id, self.manager_id
                ))
            })?;

        self.emit_event(McpEvent::info(
            &format!(
                "Executing tool '{}' on server '{}' in manager '{}'...",
                request.tool_name, request.server_id, self.manager_id
            ),
            Some(&request.server_id),
        ));

        // Parse inputs from JSON string
        let inputs_value: serde_json::Value = serde_json::from_str(&request.inputs).map_err(|e| {
            Error::ToolExecutionError(format!("Failed to parse tool inputs: {}", e))
        })?;

        // Execute tool with flexible error handling
        let result = match server.value()
            .client
            .lock()
            .await
            .as_ref()
            .unwrap()
            .call_tool(rmcp::model::CallToolRequestParam {
                name: request.tool_name.clone().into(),
                arguments: inputs_value.as_object().cloned(),
            })
            .await
        {
            Ok(result) => result,
            Err(e) => {
                // If the tool execution fails due to unexpected response type,
                // try to handle it gracefully by creating a fallback response
                let error_msg = format!("{}", e);
                if error_msg.contains("Unexpected response type") {
                    // Create a fallback CallToolResult with the error information
                    // This allows tools that don't conform to strict MCP protocol to still work
                    return Ok(serde_json::json!({
                        "content": [{
                            "type": "text",
                            "text": format!("Tool execution completed but returned non-standard response: {}", error_msg)
                        }],
                        "is_error": true,
                        "meta": {
                            "error_type": "unexpected_response_type",
                            "original_error": error_msg
                        }
                    }).to_string());
                } else {
                    return Err(Error::ToolExecutionError(format!("Failed to execute tool: {}", e)));
                }
            }
        };

        // Convert result to JSON string
        let result_json = serde_json::to_string(&result).map_err(|e| {
            Error::ToolExecutionError(format!("Failed to serialize tool result: {}", e))
        })?;

        self.emit_event(McpEvent::info(
            &format!(
                "Tool '{}' executed successfully on server '{}' in manager '{}'",
                request.tool_name, request.server_id, self.manager_id
            ),
            Some(&request.server_id),
        ));
        
        return Ok(result_json);
    }

    /// Emit an event to TypeScript
    fn emit_event(&self, event: McpEvent) {
        self.event_callback
            .call(Ok(event), napi::threadsafe_function::ThreadsafeFunctionCallMode::NonBlocking);
    }

    /// Stop all servers managed by this manager
    pub async fn stop_all_servers(&self) -> Result<()> {
        // Mark manager as shut down
        self.is_shutdown.store(true, Ordering::SeqCst);

        // Get all server IDs
        let server_ids: Vec<String> = self.servers.iter().map(|entry| entry.key().clone()).collect();

        // Stop each server
        for server_id in server_ids {
            if let Err(e) = self.stop(&server_id).await {
                // Log error but continue stopping other servers
                self.emit_event(McpEvent::error(
                    &format!("Error stopping server '{}': {}", server_id, e),
                    Some(&server_id),
                ));
            }
        }

        Ok(())
    }

    /// Get the manager ID
    pub fn get_manager_id(&self) -> &str {
        &self.manager_id
    }
}