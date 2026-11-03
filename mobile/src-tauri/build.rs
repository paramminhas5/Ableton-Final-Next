//! Brings Ableton Link into the app, then runs Tauri's build step.
//! - iOS: links LinkKit (Ableton's free iOS SDK) from mobile/vendor/LinkKit.
//! - Android and desktop: compiles open-source Link's C API (abl_link) from mobile/vendor/link.
//! Fetch both with `npm run link:fetch`. Without them the app builds with Link off.

use std::path::{Path, PathBuf};

fn main() {
    println!("cargo:rustc-check-cfg=cfg(ccd_link)");
    println!("cargo:rustc-check-cfg=cfg(ccd_linkkit)");
    if std::env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("ios") {
        link_linkkit();
    } else {
        build_link();
    }
    tauri_build::build();
}

fn link_linkkit() {
    let manifest = PathBuf::from(std::env::var("CARGO_MANIFEST_DIR").unwrap());
    let xcf = manifest.join("../vendor/LinkKit/LinkKit.xcframework");
    println!("cargo:rerun-if-changed={}", xcf.display());
    if !xcf.exists() {
        println!("cargo:warning=LinkKit not found in mobile/vendor/LinkKit. Run `npm run link:fetch`. Building without Link.");
        return;
    }
    let target = std::env::var("TARGET").unwrap_or_default();
    let slice = if target.ends_with("-sim") || target.starts_with("x86_64") { "ios-arm64_x86_64-simulator" } else { "ios-arm64" };
    println!("cargo:rustc-link-search=native={}", xcf.join(slice).display());
    println!("cargo:rustc-link-lib=static=LinkKit");
    println!("cargo:rustc-link-lib=c++");
    println!("cargo:rustc-link-lib=framework=UIKit");
    println!("cargo:rustc-link-lib=framework=Foundation");
    println!("cargo:rustc-cfg=ccd_linkkit");
}

fn build_link() {
    let manifest = PathBuf::from(std::env::var("CARGO_MANIFEST_DIR").unwrap());
    let link = manifest.join("../vendor/link");
    println!("cargo:rerun-if-changed={}", link.join("include").display());
    let target_os = std::env::var("CARGO_CFG_TARGET_OS").unwrap_or_default();
    let host = std::env::var("HOST").unwrap_or_default();

    if !link.join("include/ableton/Link.hpp").exists() {
        println!("cargo:warning=Ableton Link not found in mobile/vendor/link. Run `npm run link:fetch`. Building without Link.");
        return;
    }
    if target_os == "macos" && !host.contains("apple") {
        println!("cargo:warning=macOS target checked on a non-Apple host: building without Link.");
        return;
    }

    let asio = link.join("modules/asio-standalone/include");
    let ns = asio_namespace(&asio.join("asio/version.hpp"));
    let mut b = cc::Build::new();
    b.cpp(true)
        .std("c++17")
        .file(link.join("extensions/abl_link/src/abl_link.cpp"))
        .include(link.join("include"))
        .include(link.join("extensions/abl_link/include"))
        .include(&asio)
        .define("ASIO_STANDALONE", "1")
        .define("ASIO_NO_TYPEID", "1")
        .define("ASIO_VERSION_NAMESPACE", ns.as_str())
        .define("LINK_PLATFORM_UNIX", "1")
        .flag_if_supported("-Wno-unused-parameter")
        .flag_if_supported("-Wno-deprecated-declarations")
        .warnings(false);
    match target_os.as_str() {
        "macos" => {
            b.define("LINK_PLATFORM_MACOSX", "1");
        }
        "android" => {
            b.define("LINK_PLATFORM_LINUX", "1");
            // Link the C++ runtime statically so nothing extra has to ship in the APK.
            b.cpp_link_stdlib(Some("c++_static"));
            println!("cargo:rustc-link-lib=c++abi");
        }
        "linux" => {
            b.define("LINK_PLATFORM_LINUX", "1");
            println!("cargo:rustc-link-lib=pthread");
        }
        "windows" => {
            b.define("LINK_PLATFORM_WINDOWS", "1").define("INCL_EXTRA_HTON_FUNCTIONS", "1");
        }
        _ => {}
    }
    b.compile("abl_link");
    if target_os == "android" || target_os == "linux" {
        println!("cargo:rustc-link-lib=atomic");
    }
    println!("cargo:rustc-cfg=ccd_link");
}

/// Link pins its bundled asio into a versioned namespace, like its CMake does.
fn asio_namespace(version_hpp: &Path) -> String {
    let text = std::fs::read_to_string(version_hpp).expect("asio version.hpp (run npm run link:fetch)");
    let v: u32 = text
        .lines()
        .find_map(|l| l.strip_prefix("#define ASIO_VERSION "))
        .and_then(|rest| rest.split_whitespace().next())
        .and_then(|n| n.parse().ok())
        .expect("ASIO_VERSION");
    format!("link_asio_{}_{}_{}", v / 100_000, v / 100 % 1000, v % 100)
}
