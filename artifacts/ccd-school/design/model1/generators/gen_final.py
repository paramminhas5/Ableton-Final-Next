#!/usr/bin/env python3
"""Model 1 · final. Every screen in the settled style, on one page.
Reuses the settled generators and renders them all with the final CSS (deep screen, silicone pads,
lensed lights, engraved labels), adds the screens that were missing, and the big layouts:
tablet and the desktop / plugin window."""
import os, math
import gen_m6 as V
import gen_m5 as P
import gen_m4 as R4
import gen_m7 as L
import gen_m8 as G
import gen_m9 as H
import gen_m10 as T
import gen_m11 as K
import gen_m12 as F
import gen_m13 as M
import gen_m14 as S
import gen_m15 as Q
import gen_m16 as R
import gen_m17 as X
import gen_m18 as Y

OUT = V.OUT
N, I, CAPC, CAT, SYNTH, DUO = V.N, V.I, V.CAPC, V.CAT, V.SYNTH, V.DUO
key, silk, knob, go_pill = V.key, V.silk, V.knob, V.go_pill
tray, sp = H.tray, K.sp
GO, MINT, LILAC, BLUE, AMBER, WHITE, RED = N["prod"], N["fund"], N["lilac"], N["dj"], "#F3C14F", "#E9E9E6", "#FF4A5A"
PINK = "#FF6FAE"

# loose pads (outside a tray) get the same silicone and backlight as tray pads
FINAL = Y.CSS + T.KNOBS + r"""
.pd{border-radius:10px!important;background:linear-gradient(180deg,var(--spa),var(--spb))!important;color:var(--spt)!important;
 box-shadow:inset 0 2px 0 rgba(255,255,255,.55),inset 0 -3px 0 rgba(0,0,0,.09),inset 0 0 0 1px rgba(0,0,0,.07),0 1px 0 var(--pads),0 2px 0 var(--pads),0 5px 7px -2px var(--shA)!important}
.dark .pd{box-shadow:inset 0 1.5px 0 rgba(255,255,255,.13),inset 0 -3px 0 rgba(0,0,0,.28),inset 0 0 0 1px rgba(0,0,0,.4),0 1px 0 #000,0 2px 0 #000,0 5px 7px -2px var(--shA)!important}
.pd.lit{color:#141416!important;background:radial-gradient(78% 72% at 50% 50%,color-mix(in srgb,var(--c) 34%,#fff) 0,var(--c) 56%,color-mix(in srgb,var(--c) 80%,#000) 100%)!important;
 box-shadow:inset 0 2px 0 rgba(255,255,255,.35),inset 0 -3px 0 rgba(0,0,0,.14),0 0 0 1px color-mix(in srgb,var(--c) 70%,transparent),0 0 14px color-mix(in srgb,var(--c) 50%,transparent)!important}
.big-dev{font-family:"Outfit",system-ui,sans-serif;-webkit-font-smoothing:antialiased;color:var(--ink)}
.titlebar{height:34px;display:flex;align-items:center;gap:10px;padding:0 14px;background:linear-gradient(180deg,#2B2B2F,#1C1C1F);border-bottom:1px solid #000;color:#C9C9CE;font-size:12px;font-weight:500}
.titlebar i{width:11px;height:11px;border-radius:6px;display:inline-block}
"""


def light(html):
    return html.replace('class="dev dark face"', 'class="dev light face"', 1)


def cut(html):
    s = html[html.index('<div class="tray"'):]
    return s[:s.index('</a></div>') + len('</a></div>')]


# ── new phone screens ─────────────────────────────────────────────────────
def quiz_state(state):
    body = F.quiz()
    if state == "right":
        body = body.replace('<span class="ss">question 1 of 3</span><span class="ss">+8 xp</span>', f'<span class="ss" style="color:{MINT}">right · +8 xp</span><span class="ss">1 of 3</span>')
        body = body.replace("which filter keeps the lows and cuts the highs?", "low-pass. it keeps everything under the cutoff.")
        body = body.replace('aria-label="low-pass, picked" style="--c:#FF4F9A;"', f'aria-label="low-pass, right" style="--c:{MINT};"')
        body = body.replace(">check<", ">next<").replace("tap one, it lights up", "the lit pad is the answer")
    else:
        body = body.replace('<span class="ss">question 1 of 3</span><span class="ss">+8 xp</span>', f'<span class="ss" style="color:{RED}">not quite · lost a heart</span><span class="ss">1 of 3</span>')
        body = body.replace("which filter keeps the lows and cuts the highs?", "high-pass keeps the highs. low-pass was right.")
        body = body.replace('<a href="#" class="sp " aria-label="high-pass" style="">', f'<a href="#" class="sp lit" aria-label="high-pass, wrong" style="--c:{RED}">')
        body = body.replace('class="sp lit" aria-label="low-pass, picked" style="--c:#FF4F9A;"', f'class="sp" aria-label="low-pass, the answer" style="--c:{MINT};outline:2px solid {MINT};outline-offset:-2px"')
        body = body.replace(">check<", ">got it<").replace("tap one, it lights up", "the outlined pad was right")
    return body


def listen():
    body = H.listen()
    old = cut(body)
    cells = [sp("kick", "sound a"), sp("bass", "sound b", "lit", GO, aria="bass, picked"), sp("hats", "sound c"), sp("chords", "sound d")]
    return body.replace(old, tray(cells, 2, 2)).replace("a · b · c · d", "tap one, it lights up")


def lead_xy():
    W, Hh = 358, 290
    cells = "".join(f'<div style="position:absolute;top:0;bottom:0;left:{12 + i*(W-24)/7:.0f}px;width:1px;background:rgba(255,255,255,{.14 if i in (0, 7) else .06})"></div>'
                    f'<span style="position:absolute;bottom:8px;left:{12 + i*(W-24)/7 - 6:.0f}px;font-size:10px;color:#77777B">{n}</span>' for i, n in enumerate("abcdefga"))
    rows = "".join(f'<div style="position:absolute;left:0;right:0;top:{y}%;height:1px;background:rgba(255,255,255,.05)"></div>' for y in (25, 50, 75))
    fx, fy = 0.62, 0.34
    dot = (f'<div style="position:absolute;left:{fx*100}%;top:{fy*100}%;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:26px;background:radial-gradient(circle,#fff 0 16%,{BLUE} 46%,rgba(125,150,255,0) 72%);box-shadow:0 0 20px {BLUE}"></div>'
           f'<div style="position:absolute;left:{fx*100}%;top:0;bottom:0;width:1px;background:{BLUE};opacity:.35"></div><div style="position:absolute;top:{fy*100}%;left:0;right:0;height:1px;background:{BLUE};opacity:.35"></div>')
    lab = '<span class="ss" style="position:absolute;left:10px;top:10px">filter open</span><span class="ss" style="position:absolute;left:10px;bottom:24px">filter closed</span>'
    surf = f'<div class="rib" style="flex:1;min-height:0;position:relative;overflow:hidden">{rows}{cells}{lab}{dot}</div>'
    s = Q.scr_line("lead", BLUE, "note · filter", "e · 66", "slide across for the note, up to open the filter")
    s += '<div class="ss" style="margin-top:12px">only notes in a minor · lift your finger to stop</div>'
    return R.play("lead", BLUE, "xy", surf, s, "sound", [("cutoff", .66), ("res", .3), ("attack", .2), ("release", .5)], CAPC["dj"])


def hats_rolls():
    rates = ["1/4", "1/8", "1/16", "1/32"]
    strip = "".join(f'<div style="flex:1;display:flex;align-items:center;justify-content:center;border-top:1px solid rgba(255,255,255,.06);font-size:12px;font-weight:{600 if r == "1/16" else 500};color:{"#141416" if r == "1/16" else "#9A9AA0"};{"background:linear-gradient(180deg," + AMBER + ",#C99A2E);box-shadow:0 0 16px " + AMBER + "aa" if r == "1/16" else ""}">{r}</div>' for r in reversed(rates))
    roll = f'<div class="rib" style="width:96px;display:flex;flex-direction:column;overflow:hidden">{strip}</div>'
    pads = tray([sp("closed hat", state="lit", c=AMBER), sp("open hat"), sp("shaker"), sp("ride")], 2, 2).replace("flex:1;min-height:0", "flex:1")
    surf = f'<div style="flex:1;min-height:0;display:flex;gap:8px">{pads}{roll}</div>'
    s = Q.scr_line("hats", AMBER, "rolling", "1/16", "hold a pad, slide the strip to change the roll")
    s += '<div class="ss" style="margin-top:12px">1/8 and 1/16 for garage · 1/32 for trap rolls</div>'
    return R.play("hats", AMBER, "rolls", surf, s, "sound", [("tune", .5), ("decay", .3), ("open", .2), ("level", .7)], "#C99A2E")


def fx_riser():
    bars = "".join(f'<span style="flex:1;height:{8 + i*7}px;border-radius:2px;align-self:flex-end;background:{WHITE if i < 6 else "#2A2A2E"};{"box-shadow:0 0 6px rgba(255,255,255,.5)" if i < 6 else ""}"></span>' for i in range(8))
    meter = f'<div class="rib" style="height:96px;display:flex;gap:6px;align-items:flex-end;padding:12px 16px;flex:none">{bars}</div>'
    fad = ('<div class="m wide" style="flex:1;min-height:0;margin-top:8px;flex-direction:column;justify-content:center;gap:10px">'
           '<div style="position:relative;width:300px;height:30px">'
           + "".join(f'<i style="position:absolute;top:-6px;left:{i*300/8:.0f}px;width:1px;height:{8 if i in (0, 8) else 5}px;background:var(--tick)"></i>' for i in range(9))
           + '<div class="fslot" style="top:12px;left:0;right:0;width:auto;height:6px;margin-left:0"></div>'
           '<div class="fcap" style="top:2px;left:72%;width:30px;height:28px;margin-left:-15px"><i style="left:14px;right:auto;width:2px;top:5px;height:18px"></i></div></div>'
           '<div style="display:flex;justify-content:space-between;width:310px"><span class="eng" style="font-size:11px">calm</span><span class="eng" style="font-size:11px">build</span><span class="eng" style="font-size:11px">peak</span></div></div>')
    drop = '<div style="height:56px;display:flex;margin-top:8px;flex:none">' + tray([sp("let go for the drop", state="dim", c=WHITE)], 1, 1).replace('class="lb"', 'class="lb" style="font-size:13px;left:0;right:0;text-align:center"') + '</div>'
    surf = f'<div style="flex:1;min-height:0;display:flex;flex-direction:column">{meter}{fad}{drop}</div>'
    s = Q.scr_line("fx", WHITE, "build", "6/8", "push up over the bars before the drop")
    s += '<div class="ss" style="margin-top:12px">noise rises, filter opens, then silence on the one</div>'
    return R.play("fx", WHITE, "riser", surf, s, "fx", [("length", .6), ("noise", .5), ("filter", .7), ("reverb", .4)], CAPC["grey"])


# ── tablet: 1180 x 820, landscape ─────────────────────────────────────────
def tablet():
    layers = Q.LAYERS
    slots = "".join(f'<a href="#" class="m wide slot{" on" if n == "drums" else ""}" style="height:64px;flex-direction:row;justify-content:flex-start;gap:10px;padding:0 12px;font-size:12px">'
                    f'<span class="dash{" on" if n == "drums" else ""}" style="--c:{c}"></span>{n}</a>' for n, c in layers)
    slots += "".join('<a href="#" class="m wide slot empty" style="height:64px;flex-direction:row;gap:8px;font-size:12px">' + V.I["plus"].replace('class="i"', 'class="s"') + 'add</a>' for _ in range(2))
    left = f'<div style="width:150px;display:flex;flex-direction:column;gap:8px">{silk("layers", "8")}{slots}</div>'
    screen = H.scr(Q.scr_line("drums", MINT, "decay", "40", "layer 1 · drum rack · a hit sends a ripple")
                   + '<div class="ss" style="margin-top:14px;display:flex;gap:18px"><span>tune 50</span><span>decay 40</span><span>drive 20</span><span>level 80</span><span style="margin-left:auto">ducks: nothing · bass ducks under this</span></div>', 120, "18px 22px", 0)
    views = R.views("drums", "pads")
    rack = cut(M.drum_pads())
    centre = (f'<div style="flex:1;display:flex;flex-direction:column;min-width:0">{screen}<div class="seam" style="margin:16px 0 0"></div>'
              f'{silk("1 · play drums on", "pick how")}{views}<div style="height:12px"></div>{rack}</div>')
    caps = [CAPC["fund"], CAPC["grey"], CAPC["navy"], CAPC["grey"]]
    knobs = '<div class="g" style="grid-template-columns:1fr 1fr">' + "".join(knob(caps[i], n, v, 44, wide=True, h=118) for i, (n, v) in enumerate([("tune", .5), ("decay", .4), ("drive", .2), ("level", .8)])) + '</div>'
    bank = S.bank("sound", ("sound", "eq", "fx", "mix"))
    ms = '<div style="display:flex;gap:6px;margin-top:10px">' + "".join(f'<span class="sp ms" style="flex:1;height:36px">{t}</span>' for t in ("sidechain", "mute", "solo")) + '</div>'
    lv = [.8, .5, .7, .45, .6, .3]
    strips = "".join(f'<div class="m wide" style="height:100%;flex-direction:column;justify-content:space-between;padding:10px 0;border-radius:10px"><span class="dash on" style="--c:{c};width:12px"></span>{Y.fader_unity(lv[i], 150, 24)}<span class="sname" style="font-size:9px">{n}</span></div>' for i, (n, c) in enumerate(layers))
    mini_mix = f'<div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(6,1fr);gap:5px">{strips}</div>'
    right = (f'<div style="width:300px;display:flex;flex-direction:column">{silk("2 · shape drums", "after you play")}{bank}<div style="height:10px"></div>{knobs}{ms}'
             f'{silk("mix", "open the full mix")}{mini_mix}</div>')
    top = ('<div style="display:flex;align-items:center;gap:14px;height:56px">'
           f'<span style="width:34px;height:34px;border-radius:50%;background:#0B0B0C;display:flex;align-items:center;justify-content:center"><img src="{CAT}" alt="" style="width:26px"></span>'
           + Q.header("play").replace('<a href="#" aria-label="Back" style="color:var(--ink);display:flex">' + I["back"] + '</a>', '').replace('height:38px', 'height:56px;flex:1')
           + '<div style="display:grid;grid-template-columns:150px 74px 74px 74px;gap:8px;height:56px">'
           + f'<a href="#" class="m wide"><span class="cap go pill" style="width:88%;height:60%;gap:8px;font-size:15px;font-weight:500">{I["play"]}play</span></a>'
           + key(G.IC["rec"], "rec", style="aspect-ratio:auto") + key(G.IC["undo"], "undo", style="aspect-ratio:auto") + key(I["out"], "to live", style="aspect-ratio:auto") + '</div></div>')
    return (f'<div class="dev dark face" style="width:1180px;height:820px;overflow:hidden;box-sizing:border-box;padding:16px 22px 22px;display:flex;flex-direction:column">{DUO}'
            f'{top}<div style="flex:1;min-height:0;display:flex;gap:22px;margin-top:8px">{left}{centre}{right}</div></div>')


# ── desktop app and plugin window: 1280 x 800, same UI inside a host ─────
def plugin():
    inner = tablet().replace('width:1180px;height:820px', 'width:1280px;height:766px')
    inner = inner.replace('<span style="width:34px;height:34px;border-radius:50%;background:#0B0B0C;display:flex;align-items:center;justify-content:center"><img src="' + CAT + '" alt="" style="width:26px"></span>',
                          '<span style="width:34px;height:34px;border-radius:50%;background:#0B0B0C;display:flex;align-items:center;justify-content:center"><img src="' + CAT + '" alt="" style="width:26px"></span>'
                          f'<span class="tag" style="color:{MINT};border-color:{MINT}">synced to host · 124 bpm</span><span class="tag">8 outputs</span>')
    bar = ('<div class="titlebar"><i style="background:#FF5F57"></i><i style="background:#FEBC2E"></i><i style="background:#28C840"></i>'
           '<span style="margin-left:10px">ccd school · instrument</span><span style="margin-left:auto;color:#77777B">vst3 · au · clap · standalone</span></div>')
    return f'<div style="width:1280px;height:800px;overflow:hidden;border-radius:10px;background:#0E0E10">{bar}{inner}</div>'


def write(name, title, body, w=390, h=844):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(P.HEAD.format(title=title, css=FINAL, body=body, w=w, h=h))
    print("wrote", name)


ROWS = [
    ("learn", [("Today", "today", T.today), ("World", "world · 16 steps", V.world), ("Hook", "lesson · hook", L.hook2), ("Concept", "lesson · concept", L.concept),
               ("Record", "lesson · try it, recording", lambda: K.record("rec")), ("RecordPlay", "lesson · try it, playing back", lambda: K.record("play")), ("Add", "lesson · add to my track", V.add6)]),
    ("steps", [("Quiz", "lesson · quiz", F.quiz), ("Right", "lesson · right", lambda: quiz_state("right")), ("Wrong", "lesson · wrong", lambda: quiz_state("wrong")),
               ("Listen", "lesson · listen and pick", listen), ("Match", "lesson · match", L.match), ("Order", "lesson · order", L.order), ("Type", "lesson · type it", L.type_answer), ("Hearts", "lesson · out of hearts", L.hearts_out)]),
    ("studio", [("Drums", "studio · drums, pads", lambda: R.play("drums", MINT, "pads", cut(M.drum_pads()), Q.scr_line("drums", MINT, "decay", "40", "16 sounds · a hit sends a ripple"), "sound", [("tune", .5), ("decay", .4), ("drive", .2), ("level", .8)])),
                ("Circle", "studio · drums, circle", R.drums_circle), ("Hats", "studio · hats, rolls", hats_rolls), ("Bass", "studio · bass, keys", R.bass_duck),
                ("Glide", "studio · bass, glide", R.bass_glide), ("Chords", "studio · chords, chord pads", R.chords_pads), ("Lead", "studio · lead, xy", lead_xy), ("Riser", "studio · fx, riser", fx_riser)]),
    ("mix", [("Stage", "mix · stage, a clash", Y.stage), ("StageFixed", "mix · stage, fixed", Y.stage_fixed), ("Compare", "mix · hold to compare", Y.stage_compare), ("Faders", "mix · faders", Y.faders),
             ("StudioLight", "studio · light mode", lambda: light(R.bass_glide())), ("DJ", "dj · deck, mixer, deck", V.dj)]),
    ("more", [("Practice", "practice", M.practice), ("Drill", "practice · drill", G.drill), ("Library", "library", G.library), ("Device", "library · device", G.device), ("You", "you", T.profile)]),
    ("start", [("Welcome", "first run · welcome, how it works", G.welcome), ("Pick", "first run · pick a world", lambda: pick()), ("Know", "first run · the fader places you", G.know), ("SignIn", "sign in", G.signin), ("Menu", "menu", G.menu),
               ("RankUp", "moment · rank up", G.rankup), ("Streak", "moment · streak", G.streak), ("WorldDone", "moment · world done", G.world_done)]),
]




# ── reflowed lesson steps: full height, pads in trays ───────────────────
def _ph(mode, items, bottom_keys):
    return H.phone(mode, items, L.bottom(*bottom_keys))


def match():
    inner = ('<div class="ss">match · 6 of 7</div><div class="t22" style="margin-top:10px">pair each knob with what it does</div>'
             '<div style="display:flex;gap:6px;margin-top:26px">' + "".join(f'<span style="flex:1;height:6px;border-radius:3px;background:{c}"></span>' for c in (MINT, BLUE, "#2A2A2D", "#2A2A2D")) + '</div>'
             '<div class="ss" style="margin-top:10px">2 of 4 pairs · matched pairs share a colour</div>')
    rows = [(("cutoff", "on", MINT), ("slides between notes", "", None)), (("resonance", "on", BLUE), ("where the filter starts cutting", "on", MINT)),
            (("glide", "", None), ("a peak at the cutoff", "on", BLUE)), (("envelope", "lit", GO), ("how the sound moves over time", "", None))]
    cells = []
    for l, r in rows:
        for t, st, c in (l, r):
            cells.append(sp(t, state=st, c=c).replace('class="lb"', 'class="lb" style="font-size:14px"'))
    t = tray(cells, 2, 4).replace("grid-template-columns:repeat(2,1fr)", "grid-template-columns:1fr 1.5fr")
    items = L.head(5, True) + H.scr(inner, 170) + '<div class="seam"></div>' + silk("knobs", "what they do") + t
    return _ph("dark", items, (key(I["shift"], "hint"), go_pill("check")))


def order():
    chain = [("osc", GO, 1), ("filter", LILAC, 2), ("amp", MINT, 3), ("out", None, 0)]
    boxes, x = "", 4
    for i, (t, c, n) in enumerate(chain):
        filled = n > 0
        boxes += (f'<rect x="{x}" y="24" width="66" height="40" rx="7" fill="none" stroke="{c if filled else "#3A3A40"}" stroke-width="1.6" {"stroke-dasharray=\"4 4\"" if not filled else ""}/>'
                  f'<text x="{x+33}" y="49" text-anchor="middle" font-family="Outfit" font-size="13" fill="{"#F3F2EF" if filled else "#55555A"}">{t if filled else "?"}</text>')
        if i < 3:
            boxes += f'<path d="M{x+68} 44H{x+84}" stroke="#77777B" stroke-width="1.4"/>'
        x += 86
    inner = ('<div class="ss">order · 3 of 7</div><div class="t22" style="margin-top:10px">follow the sound from start to speaker</div>'
             f'<svg width="340" height="80" viewBox="0 0 340 80" aria-hidden="true" style="display:block;margin-top:34px">{boxes}</svg>'
             '<div class="ss" style="margin-top:14px">3 of 4 placed</div>')
    cells = []
    for t, c, n in [("amp", MINT, 3), ("out", None, 0), ("osc", GO, 1), ("filter", LILAC, 2)]:
        cells.append(sp(t, sub=(str(n) if n else "next"), state=("on" if n else "dim"), c=(c or GO)))
    items = L.head(2, True) + H.scr(inner, 236) + '<div class="seam"></div>' + silk("tap in order", "the glow is the next one") + tray(cells, 2, 2)
    return _ph("light", items, (key(I["back"], "undo"), go_pill("check")))


def type_answer():
    inner = ('<div class="ss">type it · 6 of 7</div><div class="t22" style="margin-top:10px">what tempo is this loop?</div>'
             '<div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:28px">' + V.m3.digits("124", 50, GO, 10) +
             '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px"><span class="ss">bpm</span><span class="ss">tap the pads</span></div></div>')
    nums = [sp(n, state=("lit" if n == "4" else ""), c=GO).replace('class="lb"', 'class="lb" style="font-size:26px;font-weight:200;left:0;right:0;text-align:center;bottom:auto;top:50%;transform:translateY(-50%)"') for n in "1234567890"]
    extra = ('<div style="height:52px;display:flex;margin-top:10px;flex:none">'
             + tray([sp("delete"), sp("hear again"), sp("tap tempo")], 3, 1).replace("flex:1;min-height:0", "flex:1").replace('class="lb"', 'class="lb" style="font-size:12px;left:0;right:0;text-align:center;bottom:auto;top:50%;transform:translateY(-50%)"') + '</div>')
    items = L.head(5, True) + H.scr(inner, 210) + '<div class="seam"></div>' + silk("number pads", "or tap along") + tray(nums, 5, 2) + extra
    return _ph("dark", items, (key(I["shift"], "hint"), go_pill("check")))


def hearts_out():
    inner = ('<div class="ss">flow mode</div><div class="t22" style="margin-top:10px">out of hearts</div>'
             '<div style="display:flex;gap:8px;margin-top:22px">' + "".join('<span style="width:14px;height:14px;border-radius:7px;background:#2A2A2D;box-shadow:inset 0 1px 2px #000"></span>' for _ in range(5)) + '</div>'
             '<div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:40px">' + V.m3.digits("3 59", 40, RED, 10) +
             '<span class="ss">until a heart comes back</span></div>')
    cells = [sp("practice", "2 min · earn one back", "dim", GO), sp("free mode", "no hearts, no gates")]
    items = (L.head(4, False, 0) + H.scr(inner, 250) + '<div class="seam"></div>' + silk("keep going") + tray(cells, 2, 1)
             + f'<div style="margin-top:14px;flex:none">{L.fact("Your track and your progress are safe. Nothing resets.")}</div>')
    return _ph("light", items, (key(I["close"], "leave"), go_pill("practice for a heart")))


def drill():
    # rebuild cleanly instead of patching the old grid
    pts = "M0 60 " + " ".join(f"L{x} {60 - (26*math.exp(-((x-232)/26)**2)):.1f}" for x in range(0, 327, 6))
    inner = ('<div style="display:flex;justify-content:space-between"><span class="ss">eq ear · 3 of 10</span><span class="ss" style="color:#F3F2EF">0:41</span></div>'
             '<div class="t22" style="margin-top:10px">b has one band boosted. which one?</div>'
             f'<svg width="326" height="84" viewBox="0 0 326 84" aria-hidden="true" style="display:block;margin-top:22px"><path d="M0 60H326" stroke="#3A3A40" stroke-dasharray="3 4"/><path d="{pts}" fill="none" stroke="{MINT}" stroke-width="2" opacity=".25"/>'
             + "".join(f'<text x="{x}" y="82" text-anchor="middle" font-family="Outfit" font-size="9" fill="#77777B">{t}</text>' for x, t in ((41, "low"), (122, "low mid"), (204, "high mid"), (285, "high"))) + '</svg>'
             '<div class="ss" style="margin-top:8px">the curve shows after you answer</div>')
    ab = ('<div class="g">'
          + '<a href="#" class="m" aria-label="Play A"><span class="cap" style="width:56%;margin-top:-12px"><span style="font-size:22px;font-weight:300">a</span></span><span class="ml">original</span></a>'
          + f'<a href="#" class="m" aria-label="Play B, playing"><span class="dot on" style="--c:{MINT}"></span><span class="cap blk" style="width:56%;margin-top:-12px"><span style="font-size:22px;font-weight:300">b</span></span><span class="ml" style="color:var(--ink)">boosted</span></a>'
          + key(I["stop"], "stop") + key('<span style="font-size:13px;font-weight:500">loop</span>', "1 bar") + '</div>')
    cells = [sp("low", "100 hz"), sp("low mid", "400 hz"), sp("high mid", "2 khz", "lit", MINT), sp("high", "8 khz")]
    top = ('<div style="display:flex;align-items:center;gap:12px;height:40px;flex:none">'
           f'<a href="#" aria-label="Close" style="color:var(--ink);display:flex">{I["close"]}</a>{G.pips(2, 10, MINT)}<span class="val">+4 xp</span></div>')
    items = top + H.scr(inner, 220) + '<div class="seam"></div>' + silk("compare", "switch as often as you like") + ab + silk("pick the band", "tap one, it lights up") + tray(cells, 2, 2)
    return _ph("dark", items, (key(I["shift"], "hint"), go_pill("check")))


def hook():
    return L.hook2().replace("height:178px", "height:150px")


def world():
    return V.world().replace("7 min · you'll use a knob and keys", "7 min · filter knob · keys")



# ── first run, more descriptive ──────────────────────────────────────────
def welcome2():
    rows = [("kick", MINT, R4.Q if hasattr(R4, "Q") else V.Q, "full"), ("hats", MINT, V.E, "full"), ("bass", GO, V.S16, "full"), ("chords", LILAC, V.Q, "dash")]
    inner = (f'<div style="position:absolute;inset:0;background:radial-gradient(70% 55% at 75% 20%,rgba(255,79,154,.22),rgba(0,0,0,0) 70%)"></div>'
             f'<img src="{CAT}" alt="" style="position:absolute;right:14px;top:14px;width:92px">'
             '<div style="position:relative"><div class="ss">ccd school</div>'
             '<div class="t36" style="margin-top:8px;max-width:220px;line-height:1.05;font-size:31px">learn music by making it</div>'
             '<div class="ss" style="margin-top:10px;color:#D9D9DC;font-size:12.5px;line-height:1.45;max-width:300px">a real instrument in your pocket. every lesson teaches one thing and adds it to a track that is yours.</div>'
             f'<div style="margin-top:14px">{R4.lanes(318, rows)}</div>'
             '<div class="ss" style="margin-top:8px;display:flex;justify-content:space-between"><span>your track after 4 lessons</span><span>120 bpm · a minor</span></div></div>')
    def row(icon_svg, title, desc):
        return (f'<div class="m wide" style="height:100%;justify-content:flex-start;gap:14px;padding:0 14px">'
                f'<span style="width:46px;height:46px;border-radius:12px;background:#050506;display:flex;align-items:center;justify-content:center;flex:none;box-shadow:0 0 0 2px #000,inset 0 0 0 1px rgba(255,255,255,.06)">{icon_svg}</span>'
                f'<div style="text-align:left;min-width:0"><div class="t15">{title}</div><div class="t11" style="margin-top:3px;line-height:1.35">{desc}</div></div></a>').replace("</a>", "</div>")
    ic_controls = ('<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><circle cx="9" cy="9" r="6" fill="none" stroke="#F3F2EF" stroke-width="1.6"/><path d="M9 9l3-3" stroke="' + GO + '" stroke-width="1.8" stroke-linecap="round"/>'
                   '<rect x="17" y="4" width="9" height="9" rx="2" fill="' + MINT + '"/><rect x="4" y="18" width="9" height="9" rx="2" fill="none" stroke="#F3F2EF" stroke-width="1.4"/><path d="M21.5 17v10M18.5 22h6" stroke="#F3F2EF" stroke-width="1.4" stroke-linecap="round"/></svg>')
    ic_track = ('<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><rect x="3" y="5" width="24" height="4" rx="2" fill="' + MINT + '"/><rect x="3" y="13" width="16" height="4" rx="2" fill="' + GO + '"/>'
                '<rect x="3" y="21" width="9" height="4" rx="2" fill="none" stroke="' + LILAC + '" stroke-width="1.4" stroke-dasharray="2 2"/><path d="M22 23h6M25 20v6" stroke="#F3F2EF" stroke-width="1.5" stroke-linecap="round"/></svg>')
    ic_live = ('<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><circle cx="8" cy="15" r="4" fill="none" stroke="#F3F2EF" stroke-width="1.6"/><circle cx="22" cy="15" r="4" fill="' + BLUE + '"/>'
               '<path d="M12 15h6" stroke="#F3F2EF" stroke-width="1.6" stroke-dasharray="2 2"/></svg>')
    rows_html = ('<div style="flex:1;min-height:0;display:grid;grid-template-rows:repeat(3,1fr);gap:8px">'
                 + row(ic_controls, "learn on real controls", "knobs, pads, keys and faders that work like studio gear")
                 + row(ic_track, "build a track that is yours", "each lesson adds a layer. you shape it, then choose to keep it")
                 + row(ic_live, "take it to ableton live", "play in time with live over link, send your track as midi and stems") + '</div>')
    tip = f'<div style="margin-top:10px;flex:none">{L.fact("Headphones help. Phone speakers lose most of the bass.")}</div>'
    top = f'<div style="display:flex;align-items:center;gap:12px;height:40px;flex:none">{G.pips(0, 4)}<span class="val">1 of 4</span></div>'
    items = top + H.scr(inner, 316, "18px 20px") + '<div class="seam"></div>' + silk("how it works", "5 minutes a day · headphones help") + rows_html
    return H.phone("dark", items, L.bottom(key(G.IC["user"], "sign in"), go_pill("let's start", icon="play")))


def world_pic(kind, col):
    w, h = 96, 84
    if kind == "basics":
        d = "M4 42 " + " ".join(f"L{x} {42 - 26*math.sin(x/88*2*math.pi*2):.1f}" for x in range(4, 93, 2))
        art = (f'<path d="M4 42H92" stroke="#2A2A2E"/><path d="{d}" fill="none" stroke="{col}" stroke-width="2.4" stroke-linecap="round"/>'
               + "".join(f'<rect x="{10+i*20}" y="70" width="12" height="6" rx="2" fill="{col if i in (0, 2) else "#2A2A2E"}"/>' for i in range(4)))
    elif kind == "dj":
        art = (f'<circle cx="26" cy="34" r="19" fill="#1A1A1D" stroke="{MINT}" stroke-width="2"/><circle cx="26" cy="34" r="5" fill="{MINT}"/>'
               f'<circle cx="70" cy="34" r="19" fill="#1A1A1D" stroke="{col}" stroke-width="2"/><circle cx="70" cy="34" r="5" fill="{col}"/>'
               f'<rect x="22" y="68" width="52" height="5" rx="2.5" fill="#2A2A2E"/><rect x="52" y="63" width="10" height="15" rx="2" fill="#F3F2EF"/>')
    else:
        lanes = [(MINT, [(0, 1)]), (MINT, [(i/8, i/8 + .08) for i in range(8)]), (col, [(0, .12), (.25, .37), (.5, .62), (.75, .87)]), (LILAC, [(0, .48), (.52, 1)]), (BLUE, [(.25, .45), (.7, .9)])]
        art = ""
        for r, (c, segs) in enumerate(lanes):
            for x0, x1 in segs:
                art += f'<rect x="{6 + x0*84:.1f}" y="{10 + r*14}" width="{max(3, (x1-x0)*84 - 2):.1f}" height="8" rx="2" fill="{c}"/>'
    return (f'<span style="width:{w}px;height:{h}px;border-radius:12px;background:radial-gradient(120% 100% at 50% 0%,#141417,#050506);flex:none;'
            f'box-shadow:0 0 0 2px #000,inset 0 0 0 1px rgba(255,255,255,.05),inset 0 6px 12px rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center">'
            f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" aria-hidden="true">{art}</svg></span>')


def pick():
    worlds = [("basics", "how sound works", "22 lessons · new here", MINT, ""),
              ("dj", "mix two tracks", "18 lessons", BLUE, ""),
              ("producer", "make a track", "40 lessons", GO, "lit")]
    cells = []
    for n, what, meta, c, st in worlds:
        cells.append(f'<a href="#" class="sp {st}" aria-label="{n}, {what}" style="--c:{c};display:flex;align-items:center;gap:14px;padding:0 12px">'
                     f'{world_pic(n, c)}'
                     f'<span style="display:flex;flex-direction:column;gap:4px;position:relative;z-index:1"><span style="font-size:22px;font-weight:400;letter-spacing:-.01em">{n}</span>'
                     f'<span style="font-size:13px;font-weight:500;opacity:.8">{what}</span><span style="font-size:11px;font-weight:600;opacity:.55">{meta}</span></span></a>')
    t = tray(cells, 1, 3)
    inner = ('<div class="ss">2 of 4</div><div class="t22" style="margin-top:10px">what do you want to make?</div>'
             '<div class="ss" style="margin-top:12px;color:#D9D9DC;font-size:13px">switch any time. your track comes with you.</div>')
    top = f'<div style="display:flex;align-items:center;gap:12px;height:40px;flex:none">{G.pips(1, 4)}<span class="val">2 of 4</span></div>'
    items = top + H.scr(inner, 110, "20px 20px") + '<div class="seam"></div>' + silk("worlds", "tap one, it lights up") + t
    return H.phone("light", items, L.bottom(key(I["back"], "back"), go_pill("next")))


for _row, _items in ROWS:
    for _i, (_n, _t, _fn) in enumerate(_items):
        _repl = {"Welcome": welcome2, "Match": match, "Order": order, "Type": type_answer, "Hearts": hearts_out, "Drill": drill, "Hook": hook, "World": world}
        if _n in _repl:
            _items[_i] = (_n, _t, _repl[_n])


if __name__ == "__main__":
    for row, items in ROWS:
        for n, t, fn in items:
            write(f"Z{n}.dc.html", t, fn())
    write("ZTablet.dc.html", "tablet · studio, landscape", tablet(), 1180, 820)
    write("ZPlugin.dc.html", "desktop app and plugin window", plugin(), 1280, 800)
