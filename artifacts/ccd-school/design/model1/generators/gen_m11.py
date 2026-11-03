#!/usr/bin/env python3
"""Real hardware, round 3. Keeps the full-height spacing and the pad tray. Goes back to the
cleaner knobs and faders (no light rings, no meters), back to the earlier keys with the note
engraved, and pads that are matte and solid when lit, with no glow."""
import os
import gen_m6 as V
import gen_m5 as P
import gen_m4 as R
import gen_m7 as L
import gen_m8 as G
import gen_m9 as H
import gen_m10 as T

OUT = V.OUT
CAT, SYNTH, N, I, CAPC, DUO = V.CAT, V.SYNTH, V.N, V.I, V.CAPC, V.DUO
Q, E, S16 = V.Q, V.E, V.S16
key, go_pill, silk, header, week_dots, knob = V.key, V.go_pill, V.silk, V.header, V.week_dots, V.knob
tray, phone, scr, led_bar = H.tray, H.phone, H.scr, H.led_bar
GO, RED, MINT = N["prod"], L.RED, N["fund"]

PADS = r"""
/* matte silicone: pillow edge on top, lip at the bottom, no glow */
.sp{background:linear-gradient(180deg,var(--spa),var(--spb))!important;
 box-shadow:inset 0 2px 0 rgba(255,255,255,.55),inset 0 -3px 0 rgba(0,0,0,.09),inset 0 0 0 1px rgba(0,0,0,.07),0 1px 1px rgba(0,0,0,.28)!important}
.dark .sp{box-shadow:inset 0 1.5px 0 rgba(255,255,255,.13),inset 0 -3px 0 rgba(0,0,0,.28),inset 0 0 0 1px rgba(0,0,0,.4),0 1px 1px rgba(0,0,0,.5)!important}
.sp.lit{color:#141416;transform:translateY(1px);
 background:linear-gradient(180deg,color-mix(in srgb,var(--c) 80%,#fff),var(--c) 55%,color-mix(in srgb,var(--c) 88%,#000))!important;
 box-shadow:inset 0 2px 0 rgba(255,255,255,.38),inset 0 -3px 0 rgba(0,0,0,.14),inset 0 0 0 1px rgba(0,0,0,.12),0 1px 0 rgba(0,0,0,.25)!important}
.sp .pl{position:absolute;right:12px;top:12px;width:7px;height:7px;border-radius:50%;
 background:radial-gradient(circle at 38% 32%,rgba(255,255,255,.45) 0 14%,rgba(255,255,255,0) 30%),color-mix(in srgb,var(--c) 45%,#1B1B1D);box-shadow:0 0 0 1.5px var(--bez)}
/* the earlier keys, played note solid with no glow */
.kcap.hit{background:linear-gradient(180deg,#FF84B8,#E8418A)!important;box-shadow:inset 0 2px 1px rgba(255,255,255,.45),0 1px 0 #B42766,0 2px 0 #B42766,0 3px 0 #921C51,0 4px 0 #921C51,0 8px 10px -2px var(--shA)!important}
"""
KN = T.KNOBS.split("/* fader cap")[0]  # keep the rubber top and metal skirt, drop nothing else
CSS = H.CSS + KN + PADS


def sp(label, sub="", state="", c=None, dot=None, aria=""):
    cs = f"--c:{c};" if c else ""
    d = f'<span class="pl" style="--c:{dot}"></span>' if dot else ""
    return (f'<a href="#" class="sp {state}" aria-label="{aria or label}" style="{cs}">'
            + (f'<span class="sb">{sub}</span>' if sub else "") + d + f'<span class="lb">{label}</span></a>')


def keys(hit=None, playing=None):
    whites = "cdefgabc"
    wk = ""
    for i, n in enumerate(whites):
        cls = "cap kcap" + (" hit" if i == hit else "")
        ring = f"box-shadow:0 0 0 2px {MINT},0 3px 0 var(--cs2),0 8px 10px -2px var(--shA);" if i == playing else ""
        wk += (f'<a href="#" class="m wide" aria-label="Note {n}" style="height:100%;flex-direction:column;justify-content:flex-start;padding:12px 0 0;border-radius:10px">'
               f'<span class="{cls}" style="width:66%;height:calc(100% - 44px);aspect-ratio:auto;border-radius:999px;{ring}"></span>'
               f'<span class="ml" style="bottom:12px;{"color:var(--ink);font-weight:600" if i in (hit, playing) else ""}">{n}</span></a>')
    col = (358 - 7 * 5) / 8
    sharps = "".join(f'<a href="#" aria-label="Sharp" class="cap blk" style="position:absolute;left:{(i+1)*(col+5)-2.5-15:.1f}px;top:-15px;width:30px;height:30px;z-index:2"></a>' for i in (0, 1, 3, 4, 5))
    return (f'<div style="position:relative;flex:1;min-height:0;margin-top:18px">'
            f'<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:5px;height:100%">{wk}</div>{sharps}</div>')


# ── QUIZ ──────────────────────────────────────────────────────────────────
def quiz():
    body = H.quiz()
    old = body[body.index('<div class="tray"'):]
    old = old[:old.index('</a></div>') + len('</a></div>')]
    cells = [sp("high-pass"), sp("low-pass", state="lit", c=GO, aria="low-pass, picked"), sp("band-pass"), sp("notch")]
    return body.replace(old, tray(cells, 2, 2))


# ── PRACTICE ──────────────────────────────────────────────────────────────
def practice():
    body = H.practice()
    old = body[body.index('<div class="tray"'):]
    old = old[:old.index('</a></div>') + len('</a></div>')]
    cells = [sp("which band?", "eq ear · today's pick", "lit", MINT, aria="Which band, today's pick"),
             sp("compressed?", "compression", dot=N["lilac"]), sp("tap the tempo", "done"),
             sp("same key?", "keys", dot=GO), sp("name the sound", "done"), sp("review", "8 due from lessons", dot=N["dj"])]
    return body.replace(old, tray(cells, 2, 3)).replace("lit is today's pick, dim is ready", "lit is today's pick")


# ── STUDIO ────────────────────────────────────────────────────────────────
def studio():
    sel = 2
    layers = [("kick", MINT, .8), ("hats", MINT, .5), ("bass", GO, .7), ("chords", N["lilac"], .45)]
    params = [("cutoff", .62), ("res", .30), ("env", .45), ("glide", .15)]
    pbars = "".join(f'<div style="flex:1"><div class="ss" style="display:flex;justify-content:space-between"><span>{n}</span><span style="color:#F3F2EF">{int(v*100)}%</span></div>'
                    f'<div style="height:4px;border-radius:2px;background:#1E1E21;margin-top:5px"><div style="width:{v*100:.0f}%;height:100%;border-radius:2px;background:{GO if n=="cutoff" else "#8E8E93"}"></div></div></div>' for n, v in params)
    pat = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0]
    cells = "".join(f'<span class="cell" style="height:20px;background:{GO if on else "#17171A"};{"outline:1.5px solid #F3F2EF;outline-offset:1px" if i==4 else ""}"></span>' for i, on in enumerate(pat))
    inner = ('<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="big" style="font-size:30px;color:#FF6FAE">bass</div>'
             '<div class="ss" style="margin-top:4px">layer 3 · the line you played</div></div>'
             '<div style="text-align:right"><div class="ss">cutoff</div><div class="big" style="font-size:30px;margin-top:2px">62%</div></div></div>'
             f'<div style="display:flex;gap:12px;margin-top:16px">{pbars}</div>'
             f'<div style="display:grid;grid-template-columns:repeat(16,1fr);gap:3px;margin-top:14px">{cells}</div>'
             '<div class="ss" style="margin-top:8px;display:flex;justify-content:space-between"><span>pattern · tap to edit</span><span>sidechain on</span></div>')
    knobs = ('<div class="g">' + knob(CAPC["prod"], "cutoff", .62, 46) + knob(CAPC["grey"], "res", .3, 46)
             + knob(CAPC["navy"], "env", .45, 46) + knob(CAPC["grey"], "glide", .15, 46) + '</div>')
    strips = ""
    for i, (n, c, lv) in enumerate(layers):
        on = i == sel
        strips += (f'<div class="m wide" style="height:100%;flex-direction:column;justify-content:space-between;padding:14px 0 10px">'
                   f'<span class="dash on" style="--c:{c}"></span>{V.slim_fader(lv, 120, 42)}'
                   f'<span class="eng" style="font-size:11px;font-weight:{600 if on else 500};{"color:var(--ink)" if on else ""}">{n}</span>'
                   f'<a href="#" aria-label="Select {n}" class="cap{" blk" if on else ""}" style="width:40px;text-decoration:none"><span class="leg" style="font-size:16px">{i+1}</span></a></div>')
    pads = ('<div style="height:54px;display:flex;margin-top:10px;flex:none">'
            + tray([sp("sidechain", state="lit", c=GO), sp("mute"), sp("solo"), sp("layer +")], 4, 1).replace('class="lb"', 'class="lb" style="font-size:12px;bottom:10px;left:10px"') + '</div>')
    head = ('<div style="display:flex;align-items:center;gap:10px;height:40px;flex:none">'
            f'<a href="#" aria-label="Back" style="color:var(--ink);display:flex">{I["back"]}</a><span class="t22" style="flex:1">studio</span><span class="tag">my track</span></div>')
    transport = ('<div class="g" style="position:absolute;left:16px;right:16px;bottom:24px;grid-template-columns:2fr 1fr 1fr 1fr">'
                 + f'<a href="#" class="m wide" aria-label="Play"><span class="cap go pill" style="width:88%;height:56%;gap:8px;font-size:15px;font-weight:500;margin-top:-12px">{I["play"]}play</span></a>'
                 + key(I["stop"], "stop") + key(I["plus"], "layer") + key(I["out"], "to live") + '</div>')
    items = (head + scr(inner, 196) + '<div class="seam"></div>' + silk("bass", "turn to shape") + knobs
             + silk("layers", "level · select") + f'<div class="g" style="flex:1;min-height:0">{strips}</div>' + pads)
    return phone("dark", items, transport)


# ── RECORD · two states ──────────────────────────────────────────────────
def record(state="rec"):
    W, Hh, rows, cols = 326, 104, 8, 16
    cw, rh = W / cols, Hh / rows
    played = [(0, 6, 1), (3, 6, 1), (4, 4, 1), (6, 6, 1), (8, 3, 2), (11, 2, 1)]
    if state == "play":
        played += [(13, 4, 1), (14, 6, 2)]
    head_at = 12.4 if state == "rec" else 5.5
    g = [f'<path d="M{c*cw:.1f} 0V{Hh}" stroke="{"#2A2A2E" if c % 4 == 0 else "#17171A"}"/>' for c in range(cols + 1)]
    g += [f'<path d="M0 {r*rh:.1f}H{W}" stroke="#141417"/>' for r in range(rows + 1)]
    for s, r, ln in played:
        now = state == "play" and s <= head_at < s + ln
        g.append(f'<rect x="{s*cw+1.5:.1f}" y="{r*rh+2:.1f}" width="{ln*cw-3:.1f}" height="{rh-4:.1f}" rx="3" fill="{"#fff" if now else GO}"/>')
    g.append(f'<path d="M{head_at*cw:.1f} 0V{Hh}" stroke="{"#F3F2EF" if state == "rec" else MINT}" stroke-width="1.6"/>')
    roll = f'<svg width="{W}" height="{Hh}" viewBox="0 0 {W} {Hh}" aria-hidden="true" style="display:block">{"".join(g)}</svg>'
    if state == "rec":
        status = f'<span class="dot on" style="--c:{RED};position:static;margin:0"></span>recording · bar 1 of 1'
        title, foot_l, foot_r = "play your bass line", "6 notes so far", "press play to stop and hear it"
    else:
        status = f'<span class="dot on" style="--c:{MINT};position:static;margin:0"></span>playing back · looping'
        title, foot_l, foot_r = "your bass line", "8 notes", "press rec to add more on top"
    inner = ('<div style="display:flex;justify-content:space-between;align-items:center">'
             f'<span class="ss" style="display:flex;align-items:center;gap:8px;color:#F3F2EF">{status}</span><span class="ss">a minor</span></div>'
             f'<div class="t22" style="margin-top:10px">{title}</div>'
             f'<div style="margin-top:16px">{roll}</div>'
             f'<div class="ss" style="margin-top:10px;display:flex;justify-content:space-between"><span style="color:#FF6FAE">{foot_l}</span><span>{foot_r}</span></div>')
    rec_on, play_on = state == "rec", state == "play"
    rec_cap = '<span style="width:14px;height:14px;border-radius:7px;background:' + (RED if rec_on else "#5A2A30") + '"></span>'
    trans = ('<div class="g">'
             + f'<a href="#" class="m" aria-label="Record{", on" if rec_on else ""}"><span class="dot{" on" if rec_on else ""}" style="--c:{RED}"></span><span class="cap" style="width:56%;margin-top:-12px">{rec_cap}</span><span class="ml" style="{"color:var(--ink);font-weight:600" if rec_on else ""}">rec</span></a>'
             + f'<a href="#" class="m" aria-label="Play{", on" if play_on else ""}"><span class="dot{" on" if play_on else ""}" style="--c:{MINT}"></span><span class="cap{" blk" if play_on else ""}" style="width:56%;margin-top:-12px">{I["play"] if not play_on else I["stop"]}</span><span class="ml" style="{"color:var(--ink);font-weight:600" if play_on else ""}">{"stop" if play_on else "play"}</span></a>'
             + key(G.IC["undo"], "undo") + key('<span style="font-size:13px;font-weight:500">1/16</span>', "snap") + '</div>')
    kb = keys(hit=2) if state == "rec" else keys(playing=4)
    items = (L.head(3, True) + scr(inner, 220) + '<div class="seam"></div>' + silk("transport", "rec records · play loops it") + trans
             + silk("keys", "only notes in a minor sound") + kb)
    btn = go_pill("use this line")
    return phone("dark", items, L.bottom(key(G.IC["loop"], "clear"), btn))


def write(name, title, body):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(P.HEAD.format(title=title, css=CSS, body=body, w=390, h=844))
    print("wrote", name)


if __name__ == "__main__":
    write("V3Quiz.dc.html", "After · quiz", quiz())
    write("V3Practice.dc.html", "After · practice", practice())
    write("V3Studio.dc.html", "After · studio", studio())
    write("V3RecordRec.dc.html", "After · record, recording", record("rec"))
    write("V3RecordPlay.dc.html", "After · record, playing back", record("play"))
