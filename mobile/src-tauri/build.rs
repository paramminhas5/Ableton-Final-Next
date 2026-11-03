//! Builds Ableton Link (its C API, abl_link) into the app, then runs Tauri's build step.
//! Link lives in mobile/vendor/link (run `npm run link:fetch`). Without it, or when
//! checking an iOS build on a non-Mac machine, the app builds with Link switched off.

use std::path::{Path, PathBuf};

fn main() {
    println!("cargo:rustc-check-cfg=cfg(ccd_link)");
    build_link();
    tauri_build::build();
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
    if (target_os == "ios" || target_os == "macos") && !host.contains("apple") {
        println!("cargo:warning=Apple target checked on a non-Apple host: building without Link.");
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
        "ios" | "macos" => {
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
