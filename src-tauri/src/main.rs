use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_path::init())
        .setup(|app| {
            // Set the application as the default handler for XML files
            #[cfg(target_os = "windows")]
            {
                use tauri::api::shell::Command;
                use std::process::Command as StdCommand;
                
                // This is a placeholder for Windows file association
                // In a real scenario, this would be handled during installation
                // via the NSIS or WIX installer configuration
                
                // Log that we're running on Windows
                log::info!("InvoiceInspector Desktop - Windows 11");
            }
            
            // Log application startup
            log::info!("InvoiceInspector Desktop v{} starting...", app.package_info().version);
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
