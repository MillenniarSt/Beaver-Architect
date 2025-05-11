use std::process::{Command, Stdio};
use std::io::{BufReader, BufRead, Write};
use std::path::PathBuf;
use std::env;
use std::sync::mpsc;
use std::thread;
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![log, info, warn, error, get_free_port, run_exe])
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

#[tauri::command]
fn run_exe(path: String, args: Vec<String>, ready_signal: String) -> Result<(), String> {
    let appdata_path = env::var("APPDATA").map_err(|e| e.to_string())?;
    let allowed_dir = PathBuf::from(appdata_path).join("io.github.MillenniarSt.Beaver-Architect");
    let exe_path = PathBuf::from(&path);

    if !exe_path.starts_with(&allowed_dir) {
        return Err(format!("Executable not in allowed path: {}", allowed_dir.display()));
    }

    let mut cmd = Command::new(&exe_path);

    #[cfg(target_os = "windows")]
    {
        cmd.creation_flags(CREATE_NO_WINDOW);
    }

    // Avvia processo con tutte le pipe
    let mut child = cmd
        .args(args)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn process: {}", e))?;

    // Piped stdin (opzionale: scrivi se serve)
    if let Some(mut stdin) = child.stdin.take() {
        writeln!(stdin, "").ok();
    }

    // Setup canali per comunicazione thread
    let (tx, rx) = mpsc::channel::<String>();

    // THREAD: stdout
    if let Some(stdout) = child.stdout.take() {
        let tx = tx.clone();
        thread::spawn(move || {
            let reader = BufReader::new(stdout);
            for line in reader.lines() {
                if let Ok(line) = line {
                    println!("{}", line);
                    let _ = tx.send(line);
                }
            }
        });
    }

    // THREAD: stderr
    if let Some(stderr) = child.stderr.take() {
        thread::spawn(move || {
            let reader = BufReader::new(stderr);
            for line in reader.lines() {
                if let Ok(line) = line {
                    println!("{}", line);
                }
            }
        });
    }

    // Aspetta messaggio "READY"
    for received in rx {
        if received.contains(&ready_signal) {
            return Ok(());
        }
    }

    Err("Process ended without emitting READY signal".to_string())
}