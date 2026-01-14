// Tauri entry point for RecallDesk backend
// This file initializes the Tauri application, sets up logging,
// and registers command handlers for the frontend.

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod api;
mod application;
mod config;
mod domain;
mod infrastructure;



#[tokio::main]
async fn main() {
    // Initialize logging
    init_logging();

    tracing::info!("Starting RecallDesk application");

    // Load configuration
    let config = match config::AppConfig::from_env() {
        Ok(cfg) => cfg,
        Err(e) => {
            tracing::error!("Failed to load configuration: {}", e);
            std::process::exit(1);
        }
    };

    // Initialize infrastructure (database, etc.)
    let app_container = match initialize_app(&config).await {
        Ok(container) => container,
        Err(e) => {
            tracing::error!("Failed to initialize application: {}", e);
            std::process::exit(1);
        }
    };

    // Build and run Tauri app
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .manage(app_container)
        .invoke_handler(tauri::generate_handler![
            // Health check
            api::health_check,
            // Search commands
            api::search_command,
            // Gmail commands
            api::connect_gmail_command,
            api::disconnect_gmail_command,
            api::sync_gmail_command,
            // File commands
            api::index_files_command,
            // Status commands
            api::get_status_command,
            api::delete_index_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Initialize application container with all dependencies
async fn initialize_app(
    config: &config::AppConfig,
) -> Result<application::services::AppContainer, Box<dyn std::error::Error>> {
    tracing::info!("Initializing application container");

    // Create app container (wires up all dependencies)
    let container = application::services::AppContainer::new(config.clone()).await?;

    tracing::info!("Application container initialized successfully");
    Ok(container)
}

/// Initialize structured logging with tracing
fn init_logging() {
    use tracing_subscriber::EnvFilter;

    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("info"));

    tracing_subscriber::fmt()
        .with_env_filter(env_filter)
        .with_target(true)
        .with_thread_ids(true)
        .with_file(true)
        .with_line_number(true)
        .init();

    tracing::info!("Logging initialized");
}
