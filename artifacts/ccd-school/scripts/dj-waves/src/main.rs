//! Reads tracks as JSON lines on stdin: {"id","bpm","beats","stems":[{"name","inst","pad","events":[[note,vel,start,len],...]}]}
//! and writes one JSON line per track: {"id","bins","stems":{"drums":[low,mid,high],...}} where each band is
//! `bins` RMS levels (4 per beat) as 0..255, measured on the engine's own render (48 kHz).
use ccd_engine::engine::{cmd, Cmd, Engine};
use std::io::{BufRead, Write};

const SR: f32 = 48_000.0;
const PER_BEAT: usize = 4;

struct OnePole { a: f32, z: f32 }
impl OnePole {
    fn lp(fc: f32) -> Self { OnePole { a: 1.0 - (-2.0 * std::f32::consts::PI * fc / SR).exp(), z: 0.0 } }
    fn tick(&mut self, x: f32) -> f32 { self.z += self.a * (x - self.z); self.z }
}

fn num(v: &str) -> f64 { v.trim().parse().unwrap_or(0.0) }

fn main() {
    let stdin = std::io::stdin();
    let mut out = std::io::stdout();
    for line in stdin.lock().lines() {
        let line = line.unwrap();
        if line.trim().is_empty() { continue; }
        // A tiny hand parser for our own fixed format: fields separated by '|', events by ';'.
        // id|bpm|beats|stem:inst:pad:n,v,s,l;n,v,s,l|stem:...
        let parts: Vec<&str> = line.split('|').collect();
        let id = parts[0];
        let bpm = num(parts[1]);
        let beats = num(parts[2]);
        let mut stems_json = Vec::new();
        for st in &parts[3..] {
            let f: Vec<&str> = st.splitn(4, ':').collect();
            let (name, inst, pad) = (f[0], num(f[1]) as u32, num(f[2]) as u32);
            let e = Engine::new(SR);
            let send = |kind, layer, a, x: f32, y: f64, z: f64| e.send(Cmd { kind, layer, a, x, y, z });
            send(cmd::INSTRUMENT, 0, inst, 0.0, 0.0, 0.0);
            send(cmd::TEMPO, 0, 0, 0.0, bpm, 0.0);
            send(cmd::LOOP, 0, 0, 0.0, beats, 0.0);
            let _ = pad;
            send(cmd::EV_CLEAR, 0, 0, 0.0, 0.0, 0.0);
            for ev in f[3].split(';').filter(|x| !x.is_empty()) {
                let v: Vec<f64> = ev.split(',').map(num).collect();
                send(cmd::EV_ADD, 0, v[0] as u32, v[1] as f32, v[2], v[3]);
            }
            send(cmd::EV_COMMIT, 0, 0, 0.0, 0.0, 0.0);
            send(cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
            let spb = (SR as f64 * 60.0 / bpm) as f64;
            let bins = (beats as usize) * PER_BEAT;
            let per_bin = spb / PER_BEAT as f64;
            let total = (spb * beats) as usize;
            let (mut l1, mut l2, mut h1, mut h2) = (OnePole::lp(220.0), OnePole::lp(220.0), OnePole::lp(2600.0), OnePole::lp(2600.0));
            let mut acc = vec![[0.0f64; 3]; bins];
            let mut cnt = vec![0usize; bins];
            let mut done = 0usize;
            while done < total {
                let n = 256.min(total - done);
                unsafe { e.process(n) };
                let c = unsafe { e.core() };
                for i in 0..n {
                    let x = 0.5 * (c.out_l[i] + c.out_r[i]);
                    let low = l2.tick(l1.tick(x));
                    let below_high = h2.tick(h1.tick(x));
                    let high = x - below_high;
                    let mid = below_high - low;
                    let b = (((done + i) as f64) / per_bin) as usize;
                    if b < bins { acc[b][0] += (low * low) as f64; acc[b][1] += (mid * mid) as f64; acc[b][2] += (high * high) as f64; cnt[b] += 1; }
                }
                done += n;
            }
            let band = |k: usize| -> String {
                let v: Vec<String> = (0..bins).map(|b| {
                    let rms = (acc[b][k] / cnt[b].max(1) as f64).sqrt();
                    // -54 db to 0 db onto 0..255
                    let db = 20.0 * rms.max(1e-9).log10();
                    (((db + 54.0) / 54.0).clamp(0.0, 1.0) * 255.0).round().to_string()
                }).collect();
                format!("[{}]", v.join(","))
            };
            stems_json.push(format!("\"{}\":[{},{},{}]", name, band(0), band(1), band(2)));
        }
        writeln!(out, "{{\"id\":\"{}\",\"bins\":{},\"stems\":{{{}}}}}", id, (beats as usize) * PER_BEAT, stems_json.join(",")).unwrap();
    }
}
