#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![log, info, warn, error, get_free_port])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application");
}


#[tauri::command]
fn log(message: &str) -> String {
    format!("\x1b[90m[     Client     ] {}\x1b[0m", message)
}

#[tauri::command]
fn info(message: &str) -> String {
    format!("[     Client     ] {}", message)
}

#[tauri::command]
fn warn(message: &str) -> String {
    format!("\x1b[33m[     Client     ] {}\x1b[0m", message)
}

#[tauri::command]
fn error(message: &str) -> String {
    format!("\x1b[31m[     Client     ] {}\x1b[0m", message)
}


#[tauri::command]
fn get_free_port() -> u16 {
    std::net::TcpListener::bind("127.0.0.1:0")
        .expect("Impossibile bindare")
        .local_addr()
        .unwrap()
        .port()
}