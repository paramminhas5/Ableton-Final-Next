#!/usr/bin/env python3
"""Model 1 · the rest of the app. Recording your own line, practice, library, profile,
first run, sign in, menu, the big moments, and desktop."""
import os, math, random
import gen_m6 as V
import gen_m5 as P
import gen_m4 as R
import gen_m3 as m3
import gen_m2 as M
import gen_m7 as L

OUT = V.OUT
CAT, SYNTH, N, I, CAPC = V.CAT, V.SYNTH, V.N, V.I, V.CAPC
Q, E, S16 = V.Q, V.E, V.S16
key, knob, pad, phone, go_pill, silk, header, week_dots = V.key, V.knob, V.pad, V.phone, V.go_pill, V.silk, V.header, V.week_dots
head, scr, bottom, fact, body_text = L.head, L.scr, L.bottom, L.fact, L.body_text
RED = L.RED
GO = N["prod"]
ic = R.ic

EXTRA = {
    "sun": ic('<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>'),
    "loop": ic('<path d="M5 12a7 7 0 0 1 12-5l2 2M19 12a7 7 0 0 1-12 5l-2-2"/><path d="M19 5v4h-4M5 19v-4h4"/>'),
    "bars": ic('<path d="M6 20V11M12 20V5M18 20v-6"/>'),
    "book": ic('<path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15H7.5A2.5 2.5 0 0 0 5 20.5z"/><path d="M5 20.5A2.5 2.5 0 0 1 7.5 18H19v3H7.5"/>'),
    "cmd": ic('<path d="M9 9V6.5A2.5 2.5 0 1 0 6.5 9H17.5A2.5 2.5 0 1 0 15 6.5V17.5A2.5 2.5 0 1 0 17.5 15H6.5A2.5 2.5 0 1 0 9 17.5z"/>'),
    "plug": ic('<path d="M9 3v5M15 3v5M6.5 8h11v3a5.5 5.5 0 0 1-11 0zM12 16.5V21"/>'),
    "star": ic('<path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z"/>'),
    "gear": ic('<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>'),
    "search": ic('<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>'),
    "user": ic('<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>'),
    "mail": ic('<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>'),
    "shield": ic('<path d="M12 3 5 6v5.5c0 4.2 3 7.6 7 9.5 4-1.9 7-5.3 7-9.5V6z"/>'),
    "undo": ic('<path d="M9 7 4.5 11.5 9 16"/><path d="M5 11.5h9a5 5 0 0 1 0 10h-2"/>'),
}
IC = {**I, **EXTRA}


def pips(done, of=4, col=GO):
    return '<div style="display:flex;gap:4px;flex:1">' + "".join(
        f'<span style="flex:1;height:3px;border-radius:2px;background:{col if i < done else ("var(--ink)" if i == done else "var(--ledoff)")}"></span>' for i in range(of)) + '</div>'


def topbar(left_icon, title, right=""):
    return (f'<div style="display:flex;align-items:center;gap:12px;height:48px">'
            f'<a href="#" class="m" aria-label="Back" style="width:44px">{IC[left_icon]}</a>'
            f'<div style="flex:1;min-width:0">{title}</div>{right}</div>')


def nav6(active):
    return P.nav(active).replace("M5", "M6")


def row_mod(inner, h=60, style=""):
    return f'<div class="m wide" style="height:{h}px;justify-content:flex-start;gap:12px;padding:0 14px;{style}">{inner}</div>'


def seg_bar(lit, n=10, col=GO, w=150):
    s = (w - (n - 1) * 3) / n
    return '<span style="display:flex;gap:3px">' + "".join(
        f'<span style="width:{s:.1f}px;height:8px;border-radius:2px;background:{col if i < lit else "#232326"};{"box-shadow:0 0 5px " + col if i < lit else ""}"></span>' for i in range(n)) + '</span>'


def keyboard(h=150, hit=(), outline=None):
    whites = "cdefgabc"
    wk = ""
    for i, n in enumerate(whites):
        ring = ""
        if i in hit:
            ring = f"background:radial-gradient(circle at 50% 30%,#fff 0,rgba(255,255,255,.3) 30%,rgba(255,255,255,0) 60%),{GO};box-shadow:0 0 12px {GO}aa,0 3px 0 #921C51,0 8px 10px -2px var(--shA);"
        elif i == outline:
            ring = f"box-shadow:0 0 0 2px {GO},0 3px 0 var(--cs2),0 8px 10px -2px var(--shA);"
        wk += (f'<a href="#" class="m wide" aria-label="Note {n}" style="height:{h}px;align-items:flex-end;padding-bottom:10px;border-radius:10px">'
               f'<span class="cap" style="width:66%;height:{h-36}px;aspect-ratio:auto;border-radius:999px;{ring}"></span></a>')
    col = (358 - 7 * 5) / 8
    sharps = "".join(f'<a href="#" aria-label="Sharp" class="cap blk" style="position:absolute;left:{(i+1)*(col+5)-2.5-16:.1f}px;top:-16px;width:32px;height:32px;z-index:2"></a>' for i in (0, 1, 3, 4, 5))
    return f'<div style="position:relative;margin-top:22px"><div style="display:grid;grid-template-columns:repeat(8,1fr);gap:5px">{wk}</div>{sharps}</div>'


# ── 1 · TRY IT, RECORDING YOUR OWN LINE ───────────────────────────────────
def record():
    W, H, rows, cols = 326, 112, 8, 16
    cw, rh = W / cols, H / rows
    played = [(0, 6, 1), (3, 6, 1), (4, 4, 1), (6, 6, 1), (8, 3, 2), (11, 2, 1)]
    head_at = 12.4
    g = []
    for c in range(cols + 1):
        g.append(f'<path d="M{c*cw:.1f} 0V{H}" stroke="{"#2A2A2E" if c % 4 == 0 else "#17171A"}"/>')
    for r in range(rows + 1):
        g.append(f'<path d="M0 {r*rh:.1f}H{W}" stroke="#141417"/>')
    for s, r, ln in played:
        g.append(f'<rect x="{s*cw+1.5:.1f}" y="{r*rh+2:.1f}" width="{ln*cw-3:.1f}" height="{rh-4:.1f}" rx="3" fill="{GO}"/>')
    g.append(f'<rect x="{11*cw+1.5:.1f}" y="{2*rh+2:.1f}" width="{cw-3:.1f}" height="{rh-4:.1f}" rx="3" fill="none" stroke="#fff" stroke-width="1.4"/>')
    g.append(f'<path d="M{head_at*cw:.1f} 0V{H}" stroke="#F3F2EF" stroke-width="1.6"/>')
    roll = f'<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}" aria-hidden="true" style="display:block">{"".join(g)}</svg>'
    recdot = f'<span style="width:9px;height:9px;border-radius:5px;background:radial-gradient(circle,#fff 0 20%,{RED} 60%);box-shadow:0 0 6px {RED}"></span>'
    inner = ('<div style="display:flex;justify-content:space-between;align-items:center">'
             f'<span class="ss" style="display:flex;align-items:center;gap:6px;color:#F3F2EF">{recdot}recording · bar 1 of 1</span><span class="ss">a minor</span></div>'
             '<div class="t22" style="margin-top:8px">play your bass line</div>'
             f'<div style="margin-top:14px">{roll}</div>'
             '<div class="ss" style="margin-top:8px;display:flex;justify-content:space-between"><span style="color:#FF6FAE">6 notes so far</span><span>this is what joins your track</span></div>')
    trans = ('<div class="g">' + key(IC["rec"], "rec", led=RED, aria="Record, on") + key(IC["play"], "play back")
             + key(IC["undo"], "undo") + key('<span style="font-size:13px;font-weight:500">1/16</span>', "snap") + '</div>')
    body = (head(3, True) + scr(inner, 236) + silk("record", "count in · 1 bar") + trans
            + silk("keys", "only notes in a minor sound") + keyboard(148, hit=(2,)))
    return phone("dark", body, bottom(key(IC["loop"], "again"), go_pill("use this line")))


# ── 2 · PRACTICE ──────────────────────────────────────────────────────────
def practice():
    skills = [("eq ear", 6, N["fund"]), ("compression", 3, N["lilac"]), ("tempo", 8, N["dj"]), ("keys", 4, GO)]
    rows = "".join(f'<div style="display:flex;align-items:center;gap:10px;margin-top:9px"><span class="ss" style="width:84px;color:#F3F2EF">{n}</span>{seg_bar(l, 10, c, 170)}<span class="ss" style="margin-left:auto">lv {l}</span></div>' for n, l, c in skills)
    inner = ('<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="ss">practice</div>'
             '<div class="t36" style="margin-top:8px">5 minutes</div></div>'
             '<div style="text-align:right"><div class="ss">today</div><div class="big" style="font-size:30px;margin-top:6px">2<span style="font-size:13px;color:#9A9AA0"> / 5 reps</span></div></div></div>'
             f'<div style="margin-top:16px">{rows}</div>')
    drills = [("which band?", "eq ear · 10 sounds", N["fund"]), ("compressed?", "a or b", None), ("tap the tempo", "tempo · 6 loops", None),
              ("same key?", "keys · 8 pairs", None), ("name the sound", "sound · 10 clips", None), ("review", "8 due from lessons", None)]
    pads = "".join(pad(f'<span style="font-size:15px;font-weight:500">{t}</span><span style="font-size:11px;font-weight:500;{"" if c else "color:var(--sub)"}">{s}</span>', c, t, h=72) for t, s, c in drills)
    right = f'<div style="display:flex;align-items:center;gap:12px">{week_dots()}<span style="font-size:15px;font-weight:300">340<span class="val" style="margin-left:3px">xp</span></span></div>'
    body = (header(right) + scr(inner, 236, "18px 16px") + silk("drills", "lit one is today's pick")
            + f'<div class="g" style="grid-template-columns:1fr 1fr;gap:10px">{pads}</div>')
    return phone("light", body, nav6("practice"))


def drill():
    pts = "M0 60 " + " ".join(f"L{x} {60 - (26*math.exp(-((x-232)/26)**2)):.1f}" for x in range(0, 327, 6))
    curve = (f'<svg width="326" height="84" viewBox="0 0 326 84" aria-hidden="true" style="display:block">'
             + "".join(f'<path d="M{x} 0V76" stroke="#17171A"/>' for x in (82, 163, 245))
             + '<path d="M0 60H326" stroke="#3A3A40" stroke-dasharray="3 4"/>'
             f'<path d="{pts}" fill="none" stroke="{N["fund"]}" stroke-width="2" opacity=".25"/>'
             + "".join(f'<text x="{x}" y="84" text-anchor="middle" font-family="Outfit" font-size="9" fill="#77777B">{t}</text>' for x, t in ((41, "low"), (122, "low mid"), (204, "high mid"), (285, "high"))) + '</svg>')
    inner = ('<div style="display:flex;justify-content:space-between"><span class="ss">eq ear · 3 of 10</span>'
             f'<span class="ss" style="color:#F3F2EF">0:41</span></div>'
             '<div class="t22" style="margin-top:8px">b has one band boosted. which one?</div>'
             f'<div style="margin-top:16px">{curve}</div>'
             '<div class="ss" style="margin-top:6px">the curve shows after you answer</div>')
    ab = ('<div class="g">'
          + f'<a href="#" class="m" aria-label="Play A"><span class="cap" style="margin-top:-22px"><span style="font-size:22px;font-weight:300">a</span></span><span class="ml">original</span></a>'
          + f'<a href="#" class="m" aria-label="Play B, playing"><span class="dot on" style="--c:{N["fund"]}"></span><span class="cap blk" style="margin-top:-22px"><span style="font-size:22px;font-weight:300">b</span></span><span class="ml" style="color:var(--ink)">boosted</span></a>'
          + key(IC["stop"], "stop") + key('<span style="font-size:13px;font-weight:500">loop</span>', "1 bar") + '</div>')
    bands = [("low", "100 hz"), ("low mid", "400 hz"), ("high mid", "2 khz"), ("high", "8 khz")]
    sel = 2
    bp = "".join(pad(f'<span style="font-size:15px">{n}</span><span style="font-size:11px;color:var(--sub)">{f}</span>', None, n, h=78,
                     style=(f"box-shadow:inset 0 0 0 2px {N['fund']},inset 0 1.5px 0 var(--hi),0 1px 0 var(--pads),0 2px 0 var(--pads),0 3px 0 var(--pads)" if i == sel else ""))
                 for i, (n, f) in enumerate(bands))
    top = ('<div style="display:flex;align-items:center;gap:12px;height:40px">'
           f'<a href="#" aria-label="Close" style="color:var(--ink);display:flex">{I["close"]}</a>{pips(2, 10, N["fund"])}'
           f'<span class="val">+4 xp</span></div>')
    body = top + scr(inner, 214) + silk("compare", "switch as often as you like") + ab + silk("pick the band") + f'<div class="g" style="grid-template-columns:1fr 1fr;gap:10px">{bp}</div>'
    return phone("dark", body, bottom(key(I["shift"], "hint"), go_pill("check")))


# ── 3 · LIBRARY ───────────────────────────────────────────────────────────
def mini_dev(kind):
    if kind == "filter":
        return '<svg width="40" height="28" viewBox="0 0 40 28"><path d="M2 10H20C26 10 26 4 29 4S32 18 38 24" fill="none" stroke="#FF4F9A" stroke-width="2" stroke-linecap="round"/></svg>'
    if kind == "comp":
        return '<svg width="40" height="28" viewBox="0 0 40 28"><path d="M2 26 20 8 38 4" fill="none" stroke="#B89CFF" stroke-width="2" stroke-linecap="round"/><path d="M20 26V2" stroke="#55555A" stroke-dasharray="2 2"/></svg>'
    if kind == "reverb":
        return '<svg width="40" height="28" viewBox="0 0 40 28">' + "".join(f'<rect x="{2+i*4}" y="{14-max(1,11-i):.0f}" width="2.4" height="{2*max(1,11-i):.0f}" rx="1" fill="#7D96FF" opacity="{1-i*.08:.2f}"/>' for i in range(10)) + '</svg>'
    return '<svg width="40" height="28" viewBox="0 0 40 28"><path d="M2 14C6 2 10 2 14 14S22 26 26 14 34 2 38 14" fill="none" stroke="#4FE3B6" stroke-width="2"/></svg>'


def library():
    inner = ('<div style="display:flex;align-items:center;gap:10px">' + IC["search"].replace('class="i"', 'class="i" style="color:#9A9AA0"') +
             '<span style="font-size:22px;font-weight:300;letter-spacing:-.01em">filt</span><span style="width:2px;height:24px;background:' + GO + ';margin-left:-8px;box-shadow:0 0 6px ' + GO + '"></span></div>'
             '<div style="display:flex;gap:16px;margin-top:14px"><span class="ss" style="color:#F3F2EF">4 devices</span><span class="ss">2 lessons</span><span class="ss">3 words</span></div>')
    devs = [("filter", "auto filter", "cuts highs or lows", "learned in bass and poli", GO),
            ("comp", "compressor", "evens out loud and quiet", "learn it in producer 06", None),
            ("reverb", "reverb", "puts a sound in a room", "learn it in basics 05", None),
            ("osc", "eq eight", "turns frequencies up or down", "learn it in producer 07", None)]
    rows = ""
    for k, n, what, where, led in devs:
        dot = f'<span class="dot on" style="--c:{led};position:static;margin:0"></span>' if led else '<span class="dot" style="position:static;margin:0"></span>'
        rows += (f'<a href="#" class="m wide" style="height:74px;justify-content:flex-start;gap:14px;padding:0 14px;margin-bottom:10px">'
                 f'<span style="width:56px;height:46px;border-radius:9px;background:#050506;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px #000,inset 0 0 0 1px rgba(255,255,255,.05);flex:none">{mini_dev(k)}</span>'
                 f'<div style="flex:1;min-width:0;text-align:left"><div class="t15">{n}</div><div class="t11" style="margin-top:2px">{what}</div>'
                 f'<div class="eng" style="font-size:10px;margin-top:3px">{where}</div></div>{dot}</a>')
    title = '<div style="display:flex;align-items:center;justify-content:space-between;height:40px"><span class="t22">library</span><span class="val">412 entries</span></div>'
    body = (title + scr(inner, 118, "18px 16px") + '<div style="margin-top:14px">' + P.switch(["devices", "words", "shortcuts"], 0) + '</div>'
            + silk("devices", "light on means you have used it") + rows)
    return phone("light", body, nav6("library"))


def device():
    cx = 30 + 0.42 * 280
    curve = (f'<svg width="326" height="96" viewBox="0 0 330 100" aria-hidden="true" style="display:block">'
             f'<path d="M30 42H{cx-34:.0f}C{cx-12:.0f} 42 {cx-10:.0f} 12 {cx:.0f} 12S{cx+18:.0f} 50 {cx+40:.0f} 74S{cx+80:.0f} 92 310 94V94H30z" fill="rgba(255,79,154,.10)"/>'
             f'<path d="M30 42H{cx-34:.0f}C{cx-12:.0f} 42 {cx-10:.0f} 12 {cx:.0f} 12S{cx+18:.0f} 50 {cx+40:.0f} 74S{cx+80:.0f} 92 310 94" fill="none" stroke="#FF4F9A" stroke-width="2" stroke-linecap="round"/>'
             '<path d="M30 94H310" stroke="#2A2A2D"/></svg>')
    inner = ('<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="ss">audio effect</div><div class="t22" style="margin-top:6px">auto filter</div></div>'
             '<div style="text-align:right"><div class="ss">cutoff</div><div class="big" style="font-size:28px;color:#FF6FAE;margin-top:4px">640<span style="font-size:12px"> hz</span></div></div></div>'
             f'<div style="margin-top:14px">{curve}</div>')
    knobs = ('<div class="g" style="grid-template-columns:repeat(3,1fr)">' + knob(CAPC["prod"], "cutoff", .42, 52, wide=True, h=122)
             + knob(CAPC["grey"], "resonance", .3, 52, wide=True, h=122) + knob(CAPC["navy"], "lfo", .15, 52, wide=True, h=122) + '</div>')
    learn = (f'<a href="#" class="m wide" style="margin-top:12px;height:92px;justify-content:flex-start;gap:14px;padding:0 12px">'
             f'<img src="{SYNTH}" alt="" style="width:64px;height:64px;border-radius:10px;object-fit:cover;flex:none;filter:url(#duo-prod)">'
             '<div style="flex:1;text-align:left"><div class="eng" style="font-size:11px">learn it in</div><div class="t15" style="margin-top:3px">bass and poli</div><div class="t11" style="margin-top:2px">producer 02 · done</div></div>'
             f'<span class="dot on" style="--c:{GO};position:static;margin:0 6px 0 0"></span></a>')
    t = topbar("back", '<div class="t22">auto filter</div><div class="t11">library · devices</div>', '<span class="tag">in live 12</span>')
    body = (t + scr(inner, 186) + silk("try it", "turn anything, nothing breaks") + knobs
            + silk("reach for it") + fact("When a sound is too bright, or you want a slow sweep before the drop.") + learn)
    return phone("dark", body, bottom(key(I["hear"], "hear"), go_pill("put it on my bass", icon="plus")))


# ── 4 · PROFILE ───────────────────────────────────────────────────────────
def profile():
    inner = (f'<div style="display:flex;gap:14px;align-items:center">'
             f'<span style="width:62px;height:62px;border-radius:50%;background:#16161A;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px #000,inset 0 0 0 1px rgba(255,255,255,.08);flex:none"><img src="{CAT}" alt="" style="width:46px"></span>'
             '<div style="flex:1"><div class="t22">param</div><div class="ss" style="margin-top:4px;color:#F3F2EF">selector · rank 4 of 10</div></div></div>'
             f'<div style="margin-top:20px;display:flex;align-items:center;gap:10px">{seg_bar(7, 16, GO, 260)}<span class="ss" style="margin-left:auto">160 to rank 5</span></div>')
    stats = [("12", "day streak", GO), ("3420", "xp", "#F3F2EF"), ("9", "lessons", N["fund"]), ("3", "layers", N["lilac"])]
    st = "".join(f'<div class="m wide" style="height:92px;flex-direction:column;gap:8px;justify-content:flex-start;padding-top:12px">{m3.digits(v, 20, c, 6)}<span class="ml">{l}</span></div>' for v, l, c in stats)

    def setting(label, ctrl):
        return f'<div class="m wide" style="height:56px;justify-content:space-between;padding:0 10px 0 16px;margin-bottom:8px"><span class="eng" style="font-size:13px">{label}</span><div style="width:196px">{ctrl}</div></div>'
    sets = (setting("look", P.switch(["light", "dark", "auto"], 2)) + setting("learning", P.switch(["flow", "free"], 0))
            + setting("hints", P.switch(["normal", "hard"], 0)) + setting("sound", P.switch(["on", "off"], 0)))
    acct = ('<div class="g" style="grid-template-columns:1fr 1fr;gap:10px">'
            + pad('<span style="font-size:14px">save to cloud</span><span style="font-size:11px">sign in</span>', GO, "Save to cloud", h=60)
            + pad('<span style="font-size:14px">placement check</span><span style="font-size:11px;color:var(--sub)">skip ahead</span>', None, "Placement check", h=60) + '</div>')
    t = topbar("back", '<div class="t22">you</div>', f'<a href="#" class="m" aria-label="Share profile" style="width:44px">{I["out"]}</a>')
    body = t + scr(inner, 150, "18px 16px") + f'<div class="g" style="margin-top:12px">{st}</div>' + silk("settings") + sets + silk("account") + acct
    return phone("light", body)


# ── 5 · FIRST RUN ─────────────────────────────────────────────────────────
def welcome():
    inner = (f'<div style="position:absolute;inset:0;background:radial-gradient(60% 50% at 50% 42%,rgba(255,79,154,.22),rgba(0,0,0,0) 70%)"></div>'
             f'<img src="{CAT}" alt="" style="position:absolute;left:50%;top:34px;width:150px;margin-left:-75px">'
             '<div style="position:absolute;left:20px;right:20px;bottom:20px">'
             '<div class="ss">ccd school</div><div class="t36" style="margin-top:8px">learn music by playing it</div>'
             '<div class="ss" style="margin-top:10px;color:#F3F2EF;font-size:13px;line-height:1.45">every lesson adds a part to a track that is yours. by the end you have something to play out.</div></div>')
    worlds = [("basics", "how sound works", N["fund"], False), ("dj", "mix two tracks", N["dj"], False), ("producer", "make a track", GO, True)]
    ws = "".join(
        f'<a href="#" class="m wide" aria-label="{n}" style="height:132px;flex-direction:column;justify-content:flex-start;padding-top:14px;gap:10px">'
        f'<span class="dash{" on" if on else ""}" style="--c:{c}"></span>'
        f'<span class="cap{" blk" if on else ""}" style="width:52px"><span style="width:10px;height:10px;border-radius:5px;background:{c};box-shadow:0 0 6px {c}"></span></span>'
        f'<span style="font-size:14px;font-weight:{600 if on else 500}">{n}</span><span class="t11" style="margin-top:-6px">{d}</span></a>' for n, d, c, on in worlds)
    top = f'<div style="display:flex;align-items:center;gap:12px;height:40px">{pips(0, 3)}<span class="val">1 of 3</span></div>'
    body = top + scr(inner, 380, "0") + silk("what do you want to make?", "change it any time") + f'<div class="g" style="grid-template-columns:repeat(3,1fr)">{ws}</div>'
    return phone("dark", body, bottom(key(IC["user"], "sign in"), go_pill("start", icon="play")))


def know():
    marks = [("i play out", 1.0), ("i finish tracks", .72), ("i have made a loop", .46), ("i have opened live", .22), ("never tried", 0.0)]
    fh, top_pad = 300, 19
    th = fh - 70
    lab = ""
    for t, f in marks:
        y = top_pad + 12 + (1 - f) * th
        on = abs(f - .46) < .01
        lab += (f'<div style="position:absolute;left:0;top:{y-8:.0f}px;display:flex;align-items:center;gap:10px">'
                f'<i style="width:18px;height:1.5px;background:{GO if on else "var(--print)"}"></i>'
                f'<span class="eng" style="font-size:14px;{"color:var(--ink);font-weight:600" if on else ""}">{t}</span></div>')
    fad = P.fader("you", GO, .46, fh, "How much you know")
    panel = (f'<div style="display:grid;grid-template-columns:96px 1fr;gap:10px;margin-top:2px">{fad}'
             f'<div class="m wide" style="height:{fh}px;position:relative;display:block;padding-left:16px"><div style="position:relative;height:100%">{lab}</div></div></div>')
    inner = ('<div class="ss">2 of 3 · slide the fader</div><div class="t22" style="margin-top:8px">how much have you made?</div>'
             '<div style="display:flex;align-items:baseline;justify-content:space-between;margin-top:22px">'
             '<span class="ss" style="color:#F3F2EF">you start at</span><span class="big" style="font-size:30px;color:#FF6FAE">producer 04</span></div>'
             '<div class="ss" style="margin-top:8px">we skip what you know. you can always go back.</div>')
    top = f'<div style="display:flex;align-items:center;gap:12px;height:40px">{pips(1, 3)}<span class="val">2 of 3</span></div>'
    body = top + scr(inner, 168) + silk("fader") + panel + '<div style="margin-top:12px">' + pad('<span style="font-size:14px">not sure? take a 3 minute check</span>', None, "Placement check", h=50) + '</div>'
    return phone("light", body, bottom(key(I["back"], "back"), go_pill("next")))


def signin():
    rows = [("kick", N["fund"], Q, "full"), ("hats", N["fund"], E, "full"), ("bass", N["prod"], S16, "full")]
    inner = (f'<img src="{CAT}" alt="" style="position:absolute;right:16px;top:16px;width:60px">'
             '<div class="ss">save your track</div><div class="t36" style="margin-top:8px;max-width:220px">keep it on every device</div>'
             f'<div style="margin-top:24px">{R.lanes(326, rows)}</div>'
             '<div style="display:flex;gap:14px;margin-top:12px"><span class="ss" style="color:#F3F2EF">340 xp</span><span class="ss" style="color:#F3F2EF">3 layers</span><span class="ss" style="color:#F3F2EF">12 days</span><span class="ss">all come with you</span></div>')
    field = ('<div class="scr" style="border-radius:16px;padding:5px"><div style="height:52px;border-radius:12px;background:var(--t1);box-shadow:inset 0 2px 4px var(--shA);display:flex;align-items:center;gap:10px;padding:0 14px;color:var(--sub)">'
             f'{IC["mail"]}<span style="font-size:15px;color:var(--ink)">param@</span><span style="width:2px;height:20px;background:{GO};margin-left:-8px"></span></div></div>')
    alt = ('<div class="g" style="grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">'
           + pad('<span style="font-size:14px">google</span>', None, "Continue with Google", h=54) + pad('<span style="font-size:14px">apple</span>', None, "Continue with Apple", h=54) + '</div>')
    t = topbar("close", '<div class="t22">sign in</div>')
    body = t + scr(inner, 236) + silk("email", "we send a link, no password") + field + silk("or") + alt
    return phone("light", body, bottom(key(I["back"], "later"), go_pill("send me a link")))


# ── 6 · MENU AND SEARCH ───────────────────────────────────────────────────
def menu():
    inner = ('<div style="display:flex;align-items:center;gap:10px">' + IC["search"].replace('class="i"', 'class="i" style="color:#9A9AA0"') +
             '<span style="font-size:18px;font-weight:300;color:#77777B">lessons, devices, words</span></div>'
             '<div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">'
             + "".join(f'<span style="font-size:12px;font-weight:500;color:#C9C9CE;border:1px solid #2E2E33;border-radius:999px;padding:5px 10px">{t}</span>' for t in ("sidechain", "warp", "eq", "beatmatch"))
             + '</div><div class="ss" style="margin-top:10px">recent searches</div>')
    items = [("sun", "daily"), ("loop", "review"), ("bars", "league"), ("book", "words"), ("cmd", "shortcuts"), ("plug", "setup"), ("star", "pro"), ("gear", "settings")]
    ks = "".join(key(IC[i], n, led=(GO if n == "review" else None)) for i, n in items)
    worlds = [("basics", "4 of 22", N["fund"]), ("dj", "0 of 18", N["dj"]), ("producer", "1 of 40", GO)]
    wrows = "".join(f'<a href="#" class="m wide" style="height:54px;justify-content:flex-start;gap:12px;padding:0 16px;margin-bottom:8px"><span class="dash on" style="--c:{c}"></span>'
                    f'<span class="t15" style="flex:1;text-align:left">{n}</span><span class="val">{d}</span></a>' for n, d, c in worlds)
    t = ('<div style="display:flex;align-items:center;justify-content:space-between;height:48px"><span class="t22">menu</span>'
         f'<a href="#" class="m" aria-label="Close" style="width:44px">{I["close"]}</a></div>')
    body = t + scr(inner, 128, "18px 16px") + silk("go to", "the lit one has 8 due") + f'<div class="g">{ks}</div>' + silk("worlds") + wrows
    foot = '<div style="position:absolute;left:0;right:0;bottom:30px;display:flex;justify-content:center;gap:28px"><a href="#" class="eng" style="font-size:12px;text-decoration:none">help</a><a href="#" class="eng" style="font-size:12px;text-decoration:none">sign out</a></div>'
    return phone("dark", body, foot)


# ── 7 · MOMENTS ───────────────────────────────────────────────────────────
def vu_dark(frac=.86, w=300):
    h = w * .52
    cx, cy, r = w / 2, h * .96, w * .44
    t = ""
    for i in range(21):
        a = math.radians(-152 + i * 6.2)
        x0, y0 = cx + r * math.cos(a), cy + r * math.sin(a)
        L_ = 12 if i % 5 == 0 else 6
        x1, y1 = cx + (r - L_) * math.cos(a), cy + (r - L_) * math.sin(a)
        t += f'<path d="M{x0:.1f} {y0:.1f}L{x1:.1f} {y1:.1f}" stroke="{GO if i >= 16 else "#55555A"}" stroke-width="{1.8 if i % 5 == 0 else 1.2}"/>'
    a = math.radians(-152 + frac * 124)
    nx, ny = cx + (r + 4) * math.cos(a), cy + (r + 4) * math.sin(a)
    arc = f'<path d="M{cx + r*math.cos(math.radians(-152+16*6.2)):.1f} {cy + r*math.sin(math.radians(-152+16*6.2)):.1f}A{r} {r} 0 0 1 {cx + r*math.cos(math.radians(-28)):.1f} {cy + r*math.sin(math.radians(-28)):.1f}" fill="none" stroke="{GO}" stroke-width="3" opacity=".35"/>'
    return (f'<svg width="{w}" height="{h:.0f}" viewBox="0 0 {w} {h:.0f}" aria-hidden="true" style="display:block;margin:0 auto">{arc}{t}'
            f'<path d="M{cx} {cy}L{nx:.1f} {ny:.1f}" stroke="#F3F2EF" stroke-width="2" stroke-linecap="round" style="filter:drop-shadow(0 0 4px rgba(255,255,255,.5))"/><circle cx="{cx}" cy="{cy}" r="6" fill="#F3F2EF"/></svg>')


def mini_xf():
    return ('<svg width="72" height="34" viewBox="0 0 72 34" aria-hidden="true"><rect x="4" y="15" width="64" height="5" rx="2.5" fill="#232325"/>'
            '<rect x="40" y="5" width="16" height="24" rx="3" fill="#F6F5F1" stroke="#BDBBB4"/><path d="M48 9v16" stroke="#18181A" stroke-width="1.5"/></svg>')


def mini_jog():
    return ('<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#D9D7D1" stroke="#BDBBB4"/>'
            '<circle cx="20" cy="20" r="12" fill="#18181A"/><circle cx="20" cy="20" r="3" fill="#7D96FF"/><path d="M20 9v5" stroke="#F3F2EF" stroke-width="1.5"/></svg>')


def rankup():
    inner = (f'<img src="{CAT}" alt="" style="position:absolute;right:18px;top:18px;width:64px">'
             '<div class="ss">rank up</div>'
             f'<div style="margin-top:26px">{vu_dark(.88, 300)}</div>'
             '<div style="text-align:center;margin-top:10px"><div class="t36" style="font-size:44px">selector</div>'
             '<div class="ss" style="margin-top:8px;color:#F3F2EF">rank 4 of 10 · 3,420 xp</div></div>')
    unl = [(mini_xf(), "crossfader", "now in dj"), (mini_jog(), "jog wheels", "now in dj")]
    u = "".join(f'<div class="m wide" style="height:118px;flex-direction:column;gap:8px">{s}<span style="font-size:14px;font-weight:500">{n}</span><span class="t11" style="margin-top:-6px">{d}</span></div>' for s, n, d in unl)
    top = ('<div style="display:flex;align-items:center;justify-content:flex-end;height:40px">' + f'<a href="#" aria-label="Close" style="color:var(--ink);display:flex">{I["close"]}</a></div>')
    body = top + scr(inner, 372) + silk("unlocked", "controls you can use now") + f'<div class="g" style="grid-template-columns:1fr 1fr">{u}</div>'
    return phone("dark", body, bottom(key(I["out"], "share"), go_pill("keep going", icon="play")))


def streak():
    days = "mtwtfss"
    inner = ('<div style="display:flex;justify-content:space-between"><span class="ss">streak</span>'
             f'<span class="ss" style="display:flex;align-items:center;gap:6px;color:#F3F2EF">{IC["shield"].replace("class=\"i\"", "class=\"s\"")}shield ready</span></div>'
             f'<div style="display:flex;justify-content:center;margin-top:26px">{m3.digits("12", 76, GO, 14)}</div>'
             '<div style="text-align:center;margin-top:14px"><div class="t22">days in a row</div>'
             '<div class="ss" style="margin-top:8px;color:#F3F2EF;font-size:13px">miss a day and the shield keeps it going.</div></div>')
    ks = ""
    for i, d in enumerate(days):
        done = i < 5
        today_ = i == 4
        ks += (f'<div class="m" aria-label="{d}{", done" if done else ""}" style="border-radius:11px">'
               f'<span class="dot{" on" if done else ""}" style="--c:{GO}"></span>'
               f'<span class="cap{" blk" if today_ else ""}" style="width:64%;margin-top:6px"><span style="font-size:13px;font-weight:500">{d}</span></span></div>')
    week = f'<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">{ks}</div>'
    next_ = ('<div class="m wide" style="height:80px;margin-top:12px;justify-content:space-between;padding:0 16px">'
             '<div style="text-align:left"><div class="eng" style="font-size:11px">next milestone</div><div class="t15" style="margin-top:4px">14 days · a second shield</div></div>'
             f'{m3.digits("2", 22, "#F3F2EF", 6)}</div>')
    body = '<div style="height:40px"></div>' + scr(inner, 330) + silk("this week") + week + next_
    return phone("light", body, bottom(key(I["out"], "share"), go_pill("continue")))


def world_done():
    rows = [("kick", N["fund"], Q, "full"), ("hats", N["fund"], E, "full"), ("bass", N["prod"], S16, "full"), ("chords", N["lilac"], Q, "full"),
            ("lead", N["prod"], [(.25, .5), (.75, 1)], "full"), ("pad", N["lilac"], [(0, 1)], "full"), ("perc", N["fund"], S16, "full"), ("fx", N["dj"], [(.9, 1)], "full")]
    inner = (f'<img src="{CAT}" alt="" class="" style="position:absolute;right:16px;top:16px;width:66px">'
             '<div class="ss">world done</div><div class="t36" style="margin-top:8px">producer</div>'
             '<div style="display:flex;gap:14px;margin-top:10px"><span class="ss" style="color:#F3F2EF">40 lessons</span><span class="ss" style="color:#F3F2EF">8 layers</span><span class="ss" style="color:#F3F2EF">2:08</span></div>'
             f'<div style="margin-top:20px">{R.lanes(326, rows)}</div>'
             '<div class="ss" style="margin-top:8px">every layer is one you chose to add</div>')
    opts = [(I["out"], "send to live", "a midi file, one track per layer"), (mini_jog(), "mix it in dj", "your track on deck a")]
    o = "".join(f'<a href="#" class="m wide" style="height:120px;flex-direction:column;gap:6px;padding:0 10px"><span class="cap" style="width:46px">{s}</span>'
                f'<span style="font-size:14px;font-weight:500">{n}</span><span class="t11" style="text-align:center;margin-top:-4px">{d}</span></a>' if "svg class" in s else
                f'<a href="#" class="m wide" style="height:120px;flex-direction:column;gap:6px;padding:0 10px">{s}'
                f'<span style="font-size:14px;font-weight:500">{n}</span><span class="t11" style="text-align:center;margin-top:-4px">{d}</span></a>' for s, n, d in opts)
    body = '<div style="height:40px"></div>' + scr(inner, 372) + silk("take it further") + f'<div class="g" style="grid-template-columns:1fr 1fr">{o}</div>'
    return phone("dark", body, bottom(key(I["out"], "share"), go_pill("open studio")))


# ── 8 · DESKTOP ───────────────────────────────────────────────────────────
def desktop():
    sel = 2
    layers = [("kick", N["fund"], .8), ("hats", N["fund"], .5), ("bass", N["prod"], .7), ("chords", N["lilac"], .45),
              ("lead", N["prod"], .6), ("pad", N["lilac"], .35)]
    rail_items = [("learn", False), ("practice", False), ("studio", True), ("library", False)]
    rail = "".join(f'<a href="#" class="m" aria-label="{n}" style="width:64px"><span class="dot{" on" if on else ""}" style="--c:#F4F3F0"></span>'
                   f'<span class="cap{" blk" if on else ""}" style="width:56%;margin-top:-22px">{I[n]}</span><span class="ml" style="{"color:var(--ink)" if on else ""}">{n}</span></a>' for n, on in rail_items)
    rail = (f'<div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding-top:6px">'
            f'<span style="width:40px;height:40px;border-radius:50%;background:#0B0B0C;display:flex;align-items:center;justify-content:center;margin-bottom:14px;box-shadow:0 1px 0 var(--hi)"><img src="{CAT}" alt="" style="width:32px"></span>{rail}</div>')
    # left: learn column
    lrows = [("kick", N["fund"], Q, "full"), ("hats", N["fund"], E, "full"), ("bass", N["prod"], S16, "full"), ("chords", N["lilac"], Q, "full")]
    steps = ""
    for n in range(1, 17):
        if n <= 2:
            steps += key(f'<span class="leg" style="font-size:20px">{n}</span>', led=GO)
        elif n == 3:
            steps += key(f'<span class="leg" style="font-size:20px">{n}</span>', cap="blk")
        elif n <= 8:
            steps += key(f'<span class="leg" style="font-size:20px;color:var(--sub)">{n}</span>')
        else:
            steps += f'<div class="m is-dim"><span class="leg" style="font-size:18px;color:var(--sub)">{n}</span></div>'
    nxt = (f'<a href="#" class="m wide" style="margin-top:12px;height:100px;justify-content:flex-start;gap:14px;padding:0 12px">'
           f'<img src="{SYNTH}" alt="" style="width:70px;height:70px;border-radius:10px;object-fit:cover;flex:none;filter:url(#duo-prod)">'
           '<div style="flex:1;text-align:left"><div class="eng" style="font-size:11px">next lesson · producer 03</div><div class="t22" style="margin-top:4px">kick and bass take turns</div>'
           '<div class="t11" style="margin-top:4px">8 min · sidechain · faders</div></div>'
           f'<span class="cap go" style="width:58px;flex:none">{I["play"]}</span></a>')
    left = ('<div style="width:384px;flex:none">'
            '<div style="display:flex;align-items:center;justify-content:space-between;height:40px"><span class="t22">learn</span>'
            f'<div style="display:flex;gap:12px;align-items:center">{week_dots()}<span style="font-size:15px;font-weight:300">3,420<span class="val" style="margin-left:3px">xp</span></span></div></div>'
            + nxt + silk("producer", "first contact · 16 steps") + f'<div class="g" style="gap:7px">{steps}</div>'
            + silk("practice", "2 of 5 reps") + '<div class="g" style="grid-template-columns:1fr 1fr;gap:8px">'
            + pad('<span style="font-size:14px">which band?</span><span style="font-size:11px">eq ear</span>', N["fund"], "Which band drill", h=60) + pad('<span style="font-size:14px">review</span><span style="font-size:11px;color:var(--sub)">8 due</span>', None, "Review, 8 due", h=60) + '</div></div>')
    # studio
    params = [("cutoff", .62), ("res", .30), ("env", .45), ("glide", .15)]
    pbars = "".join(f'<div style="flex:1"><div class="ss" style="display:flex;justify-content:space-between"><span>{n}</span><span style="color:#F3F2EF">{int(v*100)}%</span></div>'
                    f'<div style="height:4px;border-radius:2px;background:#1E1E21;margin-top:5px"><div style="width:{v*100:.0f}%;height:100%;border-radius:2px;background:{GO if n=="cutoff" else "#8E8E93"}"></div></div></div>' for n, v in params)
    srows = [("kick", N["fund"], Q, "full"), ("hats", N["fund"], E, "full"), ("bass", N["prod"], S16, "full"), ("chords", N["lilac"], Q, "full"),
             ("lead", N["prod"], [(.25, .5), (.75, 1)], "full"), ("pad", N["lilac"], [(0, 1)], "full")]
    sscr = (f'<div class="scr"><div class="scrf" style="padding:16px 18px;height:300px">'
            '<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="ss">my track · 6 layers · 124 bpm · a minor</div>'
            '<div class="big" style="font-size:34px;color:#FF6FAE;margin-top:8px">bass</div><div class="ss" style="margin-top:4px">layer 3 · from bass and poli · the line you played</div></div>'
            '<div style="text-align:right"><div class="ss">cutoff</div><div class="big" style="font-size:34px;margin-top:8px">62%</div></div></div>'
            f'<div style="display:flex;gap:16px;margin-top:16px">{pbars}</div>'
            f'<div style="margin-top:18px">{R.lanes(780, srows, sel=2, head=.37)}</div></div></div>')
    strips = ""
    for i, (n, c, lv) in enumerate(layers):
        on = i == sel
        strips += (f'<div class="m wide" style="height:330px;flex-direction:column;justify-content:flex-start;padding-top:14px;gap:8px">'
                   f'{V.mini_knob(CAPC["prod"] if on else CAPC["grey"], .55 - i*.05, 30)}{V.mini_knob(CAPC["grey"], .3 + i*.06, 30)}'
                   f'<div style="height:6px"></div>{V.slim_fader(lv, 140, 40, c)}'
                   f'<span class="eng" style="font-size:11px;font-weight:{600 if on else 500};{"color:var(--ink)" if on else ""}">{n}</span>'
                   f'<a href="#" aria-label="Select {n}" class="cap{" blk" if on else ""}" style="width:40px;text-decoration:none"><span class="leg" style="font-size:16px">{i+1}</span></a></div>')
    big_knobs = ('<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">'
                 + knob(CAPC["prod"], "cutoff", .62, 56, GO, wide=True, h=160) + knob(CAPC["grey"], "res", .3, 56, wide=True, h=160)
                 + knob(CAPC["navy"], "env", .45, 56, wide=True, h=160) + knob(CAPC["grey"], "glide", .15, 56, wide=True, h=160) + '</div>')
    pads_ = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px">' + pad("sidechain", GO, h=44) + pad("mute", h=44) + pad("solo", h=44) + pad("layer +", h=44) + '</div>'
    transport = ('<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:8px;margin-top:12px">'
                 + f'<a href="#" class="m wide" style="height:74px"><span class="cap go pill" style="width:88%;height:58%;gap:8px;font-size:15px;font-weight:500">{I["play"]}play</span></a>'
                 + key(I["stop"], "stop", style="aspect-ratio:auto;height:74px") + key('<span style="font-size:13px;font-weight:500">124</span>', "tempo", style="aspect-ratio:auto;height:74px")
                 + key(I["out"], "to live", style="aspect-ratio:auto;height:74px") + '</div>')
    studio = ('<div style="flex:1;min-width:0">'
              '<div style="display:flex;align-items:center;justify-content:space-between;height:40px"><span class="t22">studio</span><span class="tag">my track</span></div>'
              + sscr + '<div style="display:grid;grid-template-columns:1fr 324px;gap:16px">'
              + '<div>' + silk("layers", "shape · level · select") + f'<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px">{strips}</div></div>'
              + '<div>' + silk("bass", "turn to shape") + big_knobs + pads_ + transport + '</div></div></div>')
    body = (f'<div class="dev dark face" style="width:1440px;height:900px;overflow:hidden;box-sizing:border-box;padding:22px 26px;display:flex;gap:26px">{V.DUO}'
            f'{rail}{left}{studio}</div>')
    return body


def write(name, title, body, w=390, h=844):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(P.HEAD.format(title=title, css=V.CSS, body=body, w=w, h=h))
    print("wrote", name)


SCREENS = [
    ("R8Record", "Try it · records the line you play", record),
    ("R8Practice", "Practice · five minutes, one thumb", practice),
    ("R8Drill", "Practice drill · a/b and band pads", drill),
    ("R8Library", "Library · search on the screen", library),
    ("R8Device", "Library · a device you can play", device),
    ("R8Profile", "You · stats and settings", profile),
    ("R8Welcome", "First run · pick what to make", welcome),
    ("R8Know", "First run · the fader places you", know),
    ("R8SignIn", "Sign in · keep your track", signin),
    ("R8Menu", "Menu · search and shortcuts", menu),
    ("R8RankUp", "Moment · rank up unlocks controls", rankup),
    ("R8Streak", "Moment · streak", streak),
    ("R8WorldDone", "Moment · world done", world_done),
]

if __name__ == "__main__":
    for n, t, fn in SCREENS:
        write(f"{n}.dc.html", t, fn())
    write("R8Desktop.dc.html", "Desktop · learn and studio side by side", desktop(), 1440, 900)
