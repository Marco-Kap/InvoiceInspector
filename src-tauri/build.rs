// build.rs - Custom build script for InvoiceInspector Desktop
// This can be used to embed assets or perform custom build steps

fn main() {
    // For now, we just need to ensure the build completes successfully
    // In a real scenario, we might embed the PDF.js library or other assets
    
    // On Windows, we would configure file associations here
    #[cfg(target_os = "windows")]
    {
        println!("cargo:rustc-cfg=target_os=\"windows\"");
        
        // Configure file associations for XML files
        // This would be handled by the installer (NSIS/WIX)
    }
    
    println!("Building InvoiceInspector Desktop...");
}
