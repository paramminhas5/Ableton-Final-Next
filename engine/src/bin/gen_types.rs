//! Writes the parameter registry and wire codes as TypeScript.
//! Usage: cargo run --bin gen-types -- <out.ts>   (prints to stdout without an argument)

fn main() {
    let o = ccd_engine::typegen::typescript();
    match std::env::args().nth(1) {
        Some(path) => {
            std::fs::write(&path, o).expect("write");
            eprintln!("wrote {path}");
        }
        None => print!("{o}"),
    }
}
