#!/usr/bin/env python3
"""Model 1 · real hardware pass. Pads are silicone set into a recessed tray and lit from below,
LEDs are lensed with tinted off states, the screen glows like an OLED, and every screen uses
the full height."""
import os, math
import gen_m6 as V
import gen_m5 as P
import gen_m4 as R
import gen_m7 as L
import gen_m8 as G

OUT = V.OUT
CAT, SYNTH, N, I, CAPC, DUO = V.CAT, V.SYNTH, V.N, V.I, V.CAPC, V.DUO
key, go_pill, silk, header, week_dots = V.key, V.go_pill, V.silk, V.header, V.week_dots
GO, RED = N["prod"], L.RED

REAL = r"""
.light{--bez:#A8A69F;--tray:#B9B7B0;--spa:#F1F0EB;--spb:#DAD8D2;--spt:#2A2A2C}
.dark{--bez:#060607;--tray:#070708;--spa:#3A3B40;--spb:#25262A;--spt:#E9E9E6;
 --grain:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .075 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")}
.silk{margin:20px 2px 10px}
/* engraved seam where the screen section meets the controls */
.seam{height:0;margin:18px -16px 0;border-top:1px solid var(--elo);border-bottom:1px solid var(--ehi);flex:none}
/* LEDs: tinted lens when off, hot centre and spill when on */
.dot{width:7px;height:7px;margin-left:-3.5px;border-radius:50%;
 background:radial-gradient(circle at 38% 32%,rgba(255,255,255,.45) 0 14%,rgba(255,255,255,0) 30%),color-mix(in srgb,var(--c,#9A9AA0) 30%,#1B1B1D);
 box-shadow:0 0 0 1.5px var(--bez),0 1px 0 1.5px var(--hi),inset 0 -1px 1px rgba(0,0,0,.4)}
.dot.on{background:radial-gradient(circle at 45% 40%,#fff 0 15%,color-mix(in srgb,var(--c) 45%,#fff) 30%,var(--c) 64%,color-mix(in srgb,var(--c) 80%,#000) 100%);
 box-shadow:0 0 0 1.5px var(--bez),0 1px 0 1.5px var(--hi),0 0 6px var(--c),0 0 16px color-mix(in srgb,var(--c) 55%,transparent)}
.dash{width:20px;height:4px;border-radius:2px;background:color-mix(in srgb,var(--c,#9A9AA0) 26%,#1B1B1D);box-shadow:0 0 0 1.5px var(--bez),0 1px 0 1.5px var(--hi)}
.dash.on{background:linear-gradient(180deg,color-mix(in srgb,var(--c) 40%,#fff),var(--c) 70%);box-shadow:0 0 0 1.5px var(--bez),0 1px 0 1.5px var(--hi),0 0 6px var(--c),0 0 16px color-mix(in srgb,var(--c) 50%,transparent)}
/* backlit legend on the active key */
.cap.blk svg,.cap.blk .leg{filter:drop-shadow(0 0 3px rgba(255,255,255,.55))}
/* OLED glow on screen text */
.scrf .t22,.scrf .t36,.scrf .big{text-shadow:0 0 14px rgba(255,255,255,.16)}
.glow{text-shadow:0 0 10px color-mix(in srgb,currentColor 55%,transparent)}
/* pad tray: one recess cut into the panel, thin dark gaps */
.tray{display:grid;gap:5px;padding:6px;border-radius:16px;background:var(--tray);
 box-shadow:inset 0 3px 7px var(--shA),inset 0 1px 2px rgba(0,0,0,.35),inset 0 -1px 0 rgba(255,255,255,.06),0 1px 0 var(--hi)}
/* silicone pad: matte pillow dome, no shine */
.sp{position:relative;border-radius:10px;overflow:hidden;color:var(--spt);text-decoration:none;
 background:radial-gradient(130% 100% at 50% 18%,var(--spa),var(--spb));
 box-shadow:inset 0 1px 0 rgba(255,255,255,.28),inset 0 -4px 8px rgba(0,0,0,.16),inset 0 0 0 1px rgba(0,0,0,.08),0 1px 1px rgba(0,0,0,.35);transition:transform 60ms}
.sp:before{content:"";position:absolute;inset:0;background-image:var(--grain);opacity:.9;pointer-events:none}
.sp:active{transform:scale(.97)}
.sp.dim{background:radial-gradient(55% 50% at 50% 56%,color-mix(in srgb,var(--c) 42%,transparent),color-mix(in srgb,var(--c) 10%,transparent) 70%,transparent 100%),radial-gradient(130% 100% at 50% 18%,var(--spa),var(--spb))}
.dark .sp.dim{background:radial-gradient(55% 50% at 50% 56%,color-mix(in srgb,var(--c) 34%,transparent),color-mix(in srgb,var(--c) 8%,transparent) 70%,transparent 100%),radial-gradient(130% 100% at 50% 18%,var(--spa),var(--spb))}
.sp.lit{color:#141416;z-index:1;
 background:radial-gradient(75% 70% at 50% 52%,color-mix(in srgb,var(--c) 30%,#fff) 0,var(--c) 52%,color-mix(in srgb,var(--c) 78%,#000) 100%);
 box-shadow:inset 0 1px 0 rgba(255,255,255,.4),inset 0 -4px 10px rgba(0,0,0,.18),0 0 0 1px color-mix(in srgb,var(--c) 70%,transparent),0 0 14px color-mix(in srgb,var(--c) 60%,transparent),0 0 34px color-mix(in srgb,var(--c) 30%,transparent)}
.sp.red{--c:#FF4A5A}
.sp .lb{position:absolute;left:13px;bottom:12px;right:12px;font-size:17px;font-weight:500;line-height:1.2;letter-spacing:-.01em}
.sp .sb{position:absolute;left:13px;top:12px;right:12px;font-size:11px;font-weight:500;opacity:.62}
.sp .ix{position:absolute;right:12px;top:11px;font-size:10px;font-weight:600;opacity:.45;font-variant-numeric:tabular-nums}
"""
CSS = V.CSS + REAL


def sp(label, sub="", ix="", state="", c=None, aria=""):
    cs = f"--c:{c};" if c else ""
    return (f'<a href="#" class="sp {state}" aria-label="{aria or label}" style="{cs}">'
            + (f'<span class="sb">{sub}</span>' if sub else "") + (f'<span class="ix">{ix}</span>' if ix else "")
            + f'<span class="lb">{label}</span></a>')


def tray(cells, cols, rows):
    return f'<div class="tray" style="flex:1;min-height:0;grid-template-columns:repeat({cols},1fr);grid-template-rows:repeat({rows},1fr)">{"".join(cells)}</div>'


def phone(mode, items, extra, bottom_gap=128):
    return (f'<div class="dev {mode} face" style="width:390px;height:844px;overflow:hidden;position:relative">{DUO}'
            f'<div style="position:absolute;left:16px;right:16px;top:10px;bottom:{bottom_gap}px;display:flex;flex-direction:column">{items}</div>{extra}</div>')


def scr(inner, h, pad_="16px", mt=8):
    return f'<div class="scr" style="margin-top:{mt}px;flex:none"><div class="scrf" style="padding:{pad_};height:{h}px">{inner}</div></div>'


def led_bar(lit, n, col, w):
    s = (w - (n - 1) * 3) / n
    return '<span style="display:flex;gap:3px">' + "".join(
        f'<span style="width:{s:.1f}px;height:9px;border-radius:2px;'
        + (f'background:linear-gradient(180deg,color-mix(in srgb,{col} 35%,#fff),{col} 70%);box-shadow:0 0 6px {col},0 0 12px {col}66'
           if i < lit else f'background:color-mix(in srgb,{col} 14%,#0E0E10);box-shadow:inset 0 1px 1px rgba(0,0,0,.6)')
        + '"></span>' for i in range(n)) + '</span>'


# ── QUIZ · dark ───────────────────────────────────────────────────────────
def quiz():
    curve = ('<svg width="326" height="96" viewBox="0 0 326 96" aria-hidden="true" style="display:block">'
             + "".join(f'<path d="M{x} 0V82" stroke="#141417"/>' for x in range(0, 327, 41)) +
             '<path d="M10 34H150C175 34 178 14 190 14S205 56 225 72 260 84 316 86V86H10z" fill="rgba(243,242,239,.06)"/>'
             '<path d="M10 34H150C175 34 178 14 190 14S205 56 225 72 260 84 316 86" fill="none" stroke="#F3F2EF" stroke-width="2" stroke-linecap="round" style="filter:drop-shadow(0 0 4px rgba(255,255,255,.35))"/>'
             '<path d="M10 86H316" stroke="#2A2A2D"/><text x="10" y="96" font-family="Outfit" font-size="9" fill="#77777B">low</text><text x="316" y="96" text-anchor="end" font-family="Outfit" font-size="9" fill="#77777B">high</text></svg>')
    inner = ('<div style="display:flex;justify-content:space-between"><span class="ss">question 1 of 3</span><span class="ss">+8 xp</span></div>'
             '<div class="t22" style="margin-top:10px;max-width:300px">which filter keeps the lows and cuts the highs?</div>'
             f'<div style="margin-top:26px">{curve}</div>')
    cells = [sp("high-pass", ix="a", state="dim", c=GO), sp("low-pass", ix="b", state="lit", c=GO, aria="low-pass, picked"),
             sp("band-pass", ix="c", state="dim", c=GO), sp("notch", ix="d", state="dim", c=GO)]
    items = L.head(4, True, 5) + scr(inner, 236) + '<div class="seam"></div>' + silk("answer", "lit pad is your pick") + tray(cells, 2, 2)
    return phone("dark", items, L.bottom(key(I["shift"], "hint"), go_pill("check")))


# ── LISTEN · light ────────────────────────────────────────────────────────
def listen():
    import random
    random.seed(7)
    bars = "".join(f'<rect x="{i*4.1:.1f}" y="{46-a:.1f}" width="2.4" height="{2*a:.1f}" rx="1" fill="{"#FF4F9A" if i < 30 else "#34343A"}"/>'
                   for i, a in ((i, 6 + 34 * random.random() * (1 if i % 8 < 2 else .45)) for i in range(80)))
    inner = ('<div style="display:flex;justify-content:space-between"><span class="ss">listen · 5 of 7</span><span class="ss" style="color:#F3F2EF">0:03</span></div>'
             '<div class="t22" style="margin-top:10px">which sound is the bass?</div>'
             f'<svg width="326" height="92" viewBox="0 0 326 92" aria-hidden="true" style="display:block;margin-top:26px;filter:drop-shadow(0 0 5px rgba(255,79,154,.35))">{bars}'
             '<path d="M123 0V92" stroke="#F3F2EF" stroke-width="1.5"/></svg>'
             '<div class="ss" style="margin-top:10px;display:flex;justify-content:space-between"><span>playing the full loop</span><span>as many times as you like</span></div>')
    trans = ('<div class="g">' + key(I["play"], "play", cap="go") + key(I["stop"], "stop")
             + key('<span style="font-size:13px;font-weight:500">½×</span>', "slower") + key(G.IC["loop"], "loop", led=GO) + '</div>')
    cells = [sp("kick", "sound a", "1", "dim", GO), sp("bass", "sound b", "2", "lit", GO, "bass, picked"),
             sp("hats", "sound c", "3", "dim", GO), sp("chords", "sound d", "4", "dim", GO)]
    items = (L.head(4, True) + scr(inner, 228) + '<div class="seam"></div>' + silk("transport") + trans
             + silk("pick one", "a · b · c · d") + tray(cells, 2, 2))
    return phone("light", items, L.bottom(key(I["shift"], "hint"), go_pill("check")))


# ── PRACTICE · light ──────────────────────────────────────────────────────
def practice():
    skills = [("eq ear", 6, N["fund"]), ("compression", 3, N["lilac"]), ("tempo", 8, N["dj"]), ("keys", 4, GO)]
    rows = "".join(f'<div style="display:flex;align-items:center;gap:10px;margin-top:12px"><span class="ss" style="width:84px;color:#F3F2EF">{n}</span>'
                   f'{led_bar(l, 10, c, 170)}<span class="ss" style="margin-left:auto">lv {l}</span></div>' for n, l, c in skills)
    inner = ('<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="ss">practice</div>'
             '<div class="t36" style="margin-top:8px">5 minutes</div></div>'
             '<div style="text-align:right"><div class="ss">today</div><div class="big" style="font-size:32px;margin-top:6px">2<span style="font-size:13px;color:#9A9AA0"> / 5 reps</span></div></div></div>'
             f'<div style="margin-top:20px">{rows}</div>')
    cells = [sp("which band?", "eq ear · today's pick", "", "lit", N["fund"], "Which band, today's pick"),
             sp("compressed?", "compression", "", "dim", N["lilac"]),
             sp("tap the tempo", "done", "", "", None),
             sp("same key?", "keys", "", "dim", GO),
             sp("name the sound", "done", "", "", None),
             sp("review", "8 due from lessons", "", "dim", N["dj"])]
    right = f'<div style="display:flex;align-items:center;gap:12px">{week_dots()}<span style="font-size:15px;font-weight:300">340<span class="val" style="margin-left:3px">xp</span></span></div>'
    items = header(right) + scr(inner, 236, "18px 16px") + '<div class="seam"></div>' + silk("drills", "lit is today's pick, dim is ready") + tray(cells, 2, 3)
    return phone("light", items, G.nav6("practice"))


def write(name, title, body):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(P.HEAD.format(title=title, css=CSS, body=body, w=390, h=844))
    print("wrote", name)


SCREENS = [("H9Quiz", "Real · quiz pads in a tray, dark", quiz), ("H9Listen", "Real · listen, transport and pads", listen), ("H9Practice", "Real · practice, LED meters and pads", practice)]

if __name__ == "__main__":
    for n, t, fn in SCREENS:
        write(f"{n}.dc.html", t, fn())
