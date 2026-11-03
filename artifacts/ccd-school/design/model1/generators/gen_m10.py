#!/usr/bin/env python3
"""Real hardware pass, round 2: Today, Studio, Record, You. Adds rubber-topped knobs on
knurled metal skirts with LED value rings, LED meters beside faders, full-height layouts."""
import os, math
import gen_m6 as V
import gen_m5 as P
import gen_m4 as R
import gen_m7 as L
import gen_m8 as G
import gen_m9 as H

OUT = V.OUT
CAT, SYNTH, N, I, CAPC, DUO = V.CAT, V.SYNTH, V.N, V.I, V.CAPC, V.DUO
Q, E, S16 = V.Q, V.E, V.S16
key, go_pill, silk, header, week_dots = V.key, V.go_pill, V.silk, V.header, V.week_dots
sp, tray, phone, scr, led_bar = H.sp, H.tray, H.phone, H.scr, H.led_bar
GO, RED = N["prod"], L.RED

KNOBS = r"""
/* knurled metal skirt */
.light{--sk1:#E9E9EA;--sk2:#9A9A9E}
.dark{--sk1:#6A6B70;--sk2:#26272A}
.kb{background:repeating-conic-gradient(rgba(0,0,0,.20) 0 1.6deg,rgba(255,255,255,.14) 1.6deg 3.2deg),radial-gradient(circle at 50% 28%,var(--sk1),var(--sk2) 78%)!important}
/* matte rubber top, pointer inlaid */
.kc{background:radial-gradient(circle at 50% 32%,color-mix(in srgb,var(--c) 82%,#fff) 0,var(--c) 52%,color-mix(in srgb,var(--c) 82%,#000) 100%)!important;
 box-shadow:inset 0 1px 1px rgba(255,255,255,.28),inset 0 -2px 4px rgba(0,0,0,.32),0 0 0 1px rgba(0,0,0,.25)!important}
.kc:before{content:"";position:absolute;inset:0;border-radius:50%;background-image:var(--grain);opacity:.8}
.kc b{background:#F6F5F1!important;box-shadow:inset 0 1px 1px rgba(0,0,0,.45),0 0 0 .5px rgba(0,0,0,.2)!important;z-index:1}
/* fader cap: brushed top, recessed line */
.fcap{background:repeating-linear-gradient(90deg,rgba(255,255,255,.0) 0 1px,rgba(255,255,255,.06) 1px 2px),repeating-linear-gradient(180deg,rgba(0,0,0,0) 0 3px,rgba(0,0,0,.12) 3px 4px),linear-gradient(180deg,var(--c1),var(--c0))!important}
.fcap i{box-shadow:0 1px 0 var(--hi)}
"""
CSS = H.CSS + KNOBS


def ring(frac, col, size, n=15):
    c = size / 2
    r = c - 4
    out = ""
    for i in range(n):
        a = math.radians(135 + i * 270 / (n - 1))
        x, y = c + r * math.cos(a), c + r * math.sin(a)
        on = i / (n - 1) <= frac + 1e-6
        if on:
            out += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="2.3" fill="{col}" style="filter:drop-shadow(0 0 2.5px {col})"/><circle cx="{x-.6:.1f}" cy="{y-.6:.1f}" r=".8" fill="#fff" opacity=".8"/>'
        else:
            out += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="2.1" fill="color-mix(in srgb,{col} 22%,#1B1B1D)" stroke="var(--bez)" stroke-width=".8"/>'
    return f'<svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" style="position:absolute;inset:0" aria-hidden="true">{out}</svg>'


def rknob(cap, label, frac, size=48, col=None, h=None, on=False):
    rot = -135 + 270 * frac
    well = size + 14
    box = well + 20
    rg = ring(frac, col or "#9A9AA0", box)
    hh = f"height:{h}px;" if h else ""
    return (f'<div class="m wide" role="img" aria-label="{label}" style="{hh}flex-direction:column;justify-content:center">'
            f'<div style="position:relative;width:{box}px;height:{box}px;display:flex;align-items:center;justify-content:center;margin-top:-14px">{rg}'
            f'<div class="well" style="width:{well}px;height:{well}px"><div class="kb" style="width:{size}px;height:{size}px;margin-top:-4px">'
            f'<div class="kc" style="--c:{cap};width:{size*0.66:.0f}px;height:{size*0.66:.0f}px"><b style="transform:rotate({rot:.0f}deg)"></b></div></div></div></div>'
            f'<span class="ml" style="{"color:var(--ink);font-weight:600" if on else ""}">{label}</span></div>')


def vmeter(lit, n=10, col=N["fund"], h=130):
    s = (h - (n - 1) * 3) / n
    cols = [col] * (n - 3) + ["#F3C14F"] * 2 + [RED]
    segs = "".join(
        f'<span style="width:6px;height:{s:.1f}px;border-radius:1.5px;'
        + (f'background:{cols[i]};box-shadow:0 0 5px {cols[i]}' if i < lit else f'background:color-mix(in srgb,{cols[i]} 18%,#111113)')
        + '"></span>' for i in range(n))
    return f'<div style="display:flex;flex-direction:column-reverse;gap:3px;padding:4px 3px;border-radius:4px;background:#050506;box-shadow:inset 0 1px 2px #000,0 1px 0 var(--hi)">{segs}</div>'


# ── TODAY · light ─────────────────────────────────────────────────────────
def today():
    rows = [("kick", N["fund"], Q, "full"), ("hats", N["fund"], E, "full"), ("bass", N["prod"], [(0, 1)], "dash"), ("chords", N["lilac"], Q, "full")]
    inner = (f'<img src="{CAT}" alt="" style="position:absolute;right:16px;top:14px;width:66px">'
             '<div class="ss">your track</div><div class="t36" style="margin-top:8px">3 layers</div>'
             '<div style="display:flex;gap:14px;margin-top:10px"><span class="ss" style="color:#F3F2EF">120 bpm</span><span class="ss" style="color:#F3F2EF">a minor</span><span class="ss" style="color:#F3F2EF">0:16 loop</span></div>'
             f'<div style="margin-top:24px">{R.lanes(326, rows)}</div>'
             '<div class="ss" style="margin-top:10px">bass joins after <span class="glow" style="color:#FF6FAE">bass and poli</span></div>')
    nxt = (f'<a href="#" class="m wide" style="height:104px;justify-content:flex-start;gap:14px;padding:0 12px;flex:none">'
           f'<span style="width:72px;height:72px;border-radius:10px;overflow:hidden;flex:none;box-shadow:0 0 0 2px #000,0 1px 0 var(--hi)"><img src="{SYNTH}" alt="" style="width:100%;height:100%;object-fit:cover;filter:url(#duo-prod)"></span>'
           '<div style="flex:1;text-align:left;min-width:0"><div class="eng" style="font-size:11px">next lesson · producer 02</div><div class="t22" style="margin-top:4px">bass and poli</div>'
           '<div class="t11" style="margin-top:4px">7 min · filter knob · keys</div></div>'
           f'<span class="cap go" style="width:58px;flex:none">{I["play"]}</span></a>')
    dial = (f'<div class="m wide" style="grid-column:span 2;height:100%;flex-direction:column;justify-content:center">'
            f'<div style="margin-top:-14px">{V.world_dial(2, 166, 146, 66)}</div><span class="ml">worlds</span></div>')
    gauge = f'<div class="m wide" style="height:100%;flex-direction:column;justify-content:center"><div style="margin-top:-16px">{vmeter(4, 9, N["fund"], 112)}</div><span class="ml">today</span></div>'
    hear = (f'<a href="#" class="m wide" aria-label="Hear your track" style="height:100%;flex-direction:column;justify-content:center">'
            f'<span class="cap" style="width:58%;aspect-ratio:1;margin-top:-16px">{I["hear"]}</span><span class="ml">hear</span></a>')
    right = f'<div style="display:flex;align-items:center;gap:12px">{week_dots()}<span style="font-size:15px;font-weight:300">340<span class="val" style="margin-left:3px">xp</span></span></div>'
    items = (header(right) + scr(inner, 236, "18px 16px") + '<div class="seam"></div><div style="height:16px"></div>' + nxt
             + silk("worlds", "today") + f'<div class="g" style="flex:1;min-height:0">{dial}{gauge}{hear}</div>')
    return phone("light", items, G.nav6("learn"))


# ── STUDIO · dark ─────────────────────────────────────────────────────────
def studio():
    sel = 2
    layers = [("kick", N["fund"], .8, 7), ("hats", N["fund"], .5, 5), ("bass", N["prod"], .7, 8), ("chords", N["lilac"], .45, 4)]
    params = [("cutoff", .62), ("res", .30), ("env", .45), ("glide", .15)]
    pbars = "".join(f'<div style="flex:1"><div class="ss" style="display:flex;justify-content:space-between"><span>{n}</span><span style="color:#F3F2EF">{int(v*100)}%</span></div>'
                    f'<div style="height:4px;border-radius:2px;background:#1E1E21;margin-top:5px"><div style="width:{v*100:.0f}%;height:100%;border-radius:2px;background:{GO if n=="cutoff" else "#8E8E93"};{"box-shadow:0 0 6px " + GO if n=="cutoff" else ""}"></div></div></div>' for n, v in params)
    pat = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0]
    cells = "".join(f'<span class="cell" style="height:20px;background:{GO if on else "#17171A"};{"box-shadow:0 0 6px " + GO if on else ""};{"outline:1.5px solid #F3F2EF;outline-offset:1px" if i==4 else ""}"></span>' for i, on in enumerate(pat))
    inner = ('<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="big glow" style="font-size:30px;color:#FF6FAE">bass</div>'
             '<div class="ss" style="margin-top:4px">layer 3 · the line you played</div></div>'
             '<div style="text-align:right"><div class="ss">cutoff</div><div class="big" style="font-size:30px;margin-top:2px">62%</div></div></div>'
             f'<div style="display:flex;gap:12px;margin-top:16px">{pbars}</div>'
             f'<div style="display:grid;grid-template-columns:repeat(16,1fr);gap:3px;margin-top:14px">{cells}</div>')
    knobs = ('<div class="g">' + rknob(CAPC["prod"], "cutoff", .62, 34, GO, h=104, on=True) + rknob(CAPC["grey"], "res", .3, 34, GO, h=104)
             + rknob(CAPC["navy"], "env", .45, 34, GO, h=104) + rknob(CAPC["grey"], "glide", .15, 34, GO, h=104) + '</div>')
    strips = ""
    for i, (n, c, lv, m) in enumerate(layers):
        on = i == sel
        strips += (f'<div class="m wide" style="height:100%;flex-direction:column;justify-content:space-between;padding:14px 0 10px;gap:6px">'
                   f'<div style="display:flex;gap:6px;align-items:flex-end">{V.slim_fader(lv, 108, 38, c)}{vmeter(m, 10, c, 98)}</div>'
                   f'<span class="eng" style="font-size:11px;font-weight:{600 if on else 500};{"color:var(--ink)" if on else ""}">{n}</span>'
                   f'<a href="#" aria-label="Select {n}" class="cap{" blk" if on else ""}" style="width:40px;text-decoration:none"><span class="leg" style="font-size:16px">{i+1}</span></a></div>')
    strip_row = silk("layers", "level · meter · select").replace('margin:20px 2px 10px','')  + f'<div class="g" style="flex:1;min-height:0">{strips}</div>'
    pads = '<div style="height:52px;display:flex;margin-top:10px;flex:none">' + tray([sp("sidechain", state="lit", c=GO), sp("mute", state="dim", c="#F3C14F"), sp("solo", state="dim", c=N["dj"]), sp("layer +", state="")], 4, 1).replace("flex:1;min-height:0", "flex:1") + '</div>'
    pads = pads.replace('class="lb"', 'class="lb" style="font-size:12px;bottom:9px;left:10px"')
    head = ('<div style="display:flex;align-items:center;gap:10px;height:40px;flex:none">'
            f'<a href="#" aria-label="Back" style="color:var(--ink);display:flex">{I["back"]}</a><span class="t22" style="flex:1">studio</span><span class="tag">my track</span></div>')
    transport = ('<div class="g" style="position:absolute;left:16px;right:16px;bottom:24px;grid-template-columns:2fr 1fr 1fr 1fr">'
                 + f'<a href="#" class="m wide" aria-label="Play"><span class="cap go pill" style="width:88%;height:56%;gap:8px;font-size:15px;font-weight:500;margin-top:-12px">{I["play"]}play</span></a>'
                 + key(I["stop"], "stop") + key(I["plus"], "layer") + key(I["out"], "to live") + '</div>')
    items = head + scr(inner, 178) + '<div class="seam"></div>' + silk("bass", "turn to shape") + knobs + strip_row + pads
    return phone("dark", items, transport)


# ── RECORD · dark ─────────────────────────────────────────────────────────
def record():
    W, Hh, rows, cols = 326, 112, 8, 16
    cw, rh = W / cols, Hh / rows
    played = [(0, 6, 1), (3, 6, 1), (4, 4, 1), (6, 6, 1), (8, 3, 2), (11, 2, 1)]
    g = [f'<path d="M{c*cw:.1f} 0V{Hh}" stroke="{"#2A2A2E" if c % 4 == 0 else "#17171A"}"/>' for c in range(cols + 1)]
    g += [f'<path d="M0 {r*rh:.1f}H{W}" stroke="#141417"/>' for r in range(rows + 1)]
    g += [f'<rect x="{s*cw+1.5:.1f}" y="{r*rh+2:.1f}" width="{ln*cw-3:.1f}" height="{rh-4:.1f}" rx="3" fill="{GO}" style="filter:drop-shadow(0 0 4px {GO})"/>' for s, r, ln in played]
    g.append(f'<path d="M{12.4*cw:.1f} 0V{Hh}" stroke="#F3F2EF" stroke-width="1.6"/>')
    roll = f'<svg width="{W}" height="{Hh}" viewBox="0 0 {W} {Hh}" aria-hidden="true" style="display:block">{"".join(g)}</svg>'
    recdot = f'<span class="dot on" style="--c:{RED};position:static;margin:0"></span>'
    inner = ('<div style="display:flex;justify-content:space-between;align-items:center">'
             f'<span class="ss" style="display:flex;align-items:center;gap:8px;color:#F3F2EF">{recdot}recording · bar 1 of 1</span><span class="ss">a minor</span></div>'
             '<div class="t22" style="margin-top:10px">play your bass line</div>'
             f'<div style="margin-top:16px">{roll}</div>'
             '<div class="ss" style="margin-top:10px;display:flex;justify-content:space-between"><span class="glow" style="color:#FF6FAE">6 notes so far</span><span>this is what joins your track</span></div>')
    trans = ('<div class="g">' + key(G.IC["rec"], "rec", led=RED, aria="Record, on") + key(I["play"], "play back")
             + key(G.IC["undo"], "undo") + key('<span style="font-size:13px;font-weight:500">1/16</span>', "snap") + '</div>')
    whites = "cdefgabc"
    wk = ""
    for i, n in enumerate(whites):
        hit = i == 2
        style = (f"background:radial-gradient(60% 40% at 50% 30%,#fff 0,rgba(255,255,255,0) 70%),{GO};box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 0 14px {GO}aa,0 2px 0 #921C51,0 6px 8px -2px var(--shA)" if hit else "")
        base = "background:radial-gradient(120% 70% at 50% 15%,#F4F3EF,#CFCDC6);color:#2A2A2C;"
        wk += f'<a href="#" class="sp" aria-label="Note {n}" style="border-radius:8px;{base}{style}"><span class="lb" style="font-size:11px;left:0;right:0;text-align:center;bottom:10px;{"color:#141416" if hit else "opacity:.55"}">{n}</span></a>'
    col = (358 - 12 - 7 * 4) / 8
    sharps = "".join(f'<a href="#" aria-label="Sharp" style="position:absolute;left:{6 + (i+1)*(col+4) - 2 - 13:.1f}px;top:6px;width:26px;height:46%;border-radius:0 0 6px 6px;z-index:2;'
                     'background:linear-gradient(180deg,#0E0E10,#232327 85%,#2E2E33);box-shadow:inset 0 -3px 0 #3A3A40,0 3px 4px rgba(0,0,0,.5)"></a>' for i in (0, 1, 3, 4, 5))
    keys = (f'<div style="position:relative;flex:1;min-height:0;display:flex">'
            f'<div class="tray" style="flex:1;grid-template-columns:repeat(8,1fr);gap:4px">{wk}</div>{sharps}</div>')
    items = (L.head(3, True) + scr(inner, 228) + '<div class="seam"></div>' + silk("record", "count in · 1 bar") + trans
             + silk("keys", "only notes in a minor sound") + keys)
    return phone("dark", items, L.bottom(key(G.IC["loop"], "again"), go_pill("use this line")))


# ── YOU · light ───────────────────────────────────────────────────────────
def profile():
    inner = (f'<div style="display:flex;gap:14px;align-items:center">'
             f'<span style="width:60px;height:60px;border-radius:50%;background:#16161A;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px #000,inset 0 0 0 1px rgba(255,255,255,.08);flex:none"><img src="{CAT}" alt="" style="width:44px"></span>'
             '<div style="flex:1"><div class="t22">param</div><div class="ss" style="margin-top:4px;color:#F3F2EF">selector · rank 4 of 10</div></div></div>'
             f'<div style="margin-top:20px;display:flex;align-items:center;gap:10px">{led_bar(7, 16, GO, 236)}<span class="ss" style="margin-left:auto">160 to rank 5</span></div>')
    stats = [("12", "day streak", GO), ("3420", "xp", "#F3F2EF"), ("9", "lessons", N["fund"]), ("3", "layers", N["lilac"])]
    st = "".join(f'<div class="m wide" style="height:96px;flex-direction:column;gap:8px;justify-content:center"><div style="margin-top:-14px;filter:drop-shadow(0 0 4px {c}55)">{V.m3.digits(v, 20, c, 6)}</div><span class="ml">{l}</span></div>' for v, l, c in stats)

    def setting(label, opts, sel, led=None):
        sw = P.switch(opts, sel)
        dot = f'<span class="dot on" style="--c:{led};position:static;margin:0 0 0 2px"></span>' if led else '<span class="dot" style="position:static;margin:0 0 0 2px"></span>'
        return (f'<div class="m wide" style="height:100%;justify-content:space-between;padding:0 10px 0 14px">'
                f'<span style="display:flex;align-items:center;gap:10px">{dot}<span class="eng" style="font-size:13px">{label}</span></span><div style="width:196px">{sw}</div></div>')
    sets = ('<div style="flex:1;min-height:0;display:grid;grid-template-rows:repeat(4,1fr);gap:8px">'
            + setting("look", ["light", "dark", "auto"], 2, "#F4F3F0") + setting("learning", ["flow", "free"], 0, GO)
            + setting("hints", ["normal", "hard"], 0) + setting("sound", ["on", "off"], 0, N["fund"]) + '</div>')
    acct = '<div style="height:70px;display:flex">' + tray([sp("save to cloud", "sign in", state="lit", c=GO), sp("placement check", "skip ahead", state="dim", c=N["dj"])], 2, 1).replace('class="lb"', 'class="lb" style="font-size:14px"') + '</div>'
    t = G.topbar("back", '<div class="t22">you</div>', f'<a href="#" class="m" aria-label="Share profile" style="width:44px">{I["out"]}</a>')
    items = t + scr(inner, 146, "18px 16px") + '<div class="seam"></div>' + f'<div class="g" style="margin-top:16px;flex:none">{st}</div>' + silk("settings") + sets + silk("account") + acct
    return phone("light", items, "", 24)


def write(name, title, body):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(P.HEAD.format(title=title, css=CSS, body=body, w=390, h=844))
    print("wrote", name)


SCREENS = [("H10Today", "Real · today", today), ("H10Studio", "Real · studio, ring knobs and meters", studio),
           ("H10Record", "Real · record your line on silicone keys", record), ("H10Profile", "Real · you, switches and readouts", profile)]

if __name__ == "__main__":
    for n, t, fn in SCREENS:
        write(f"{n}.dc.html", t, fn())
