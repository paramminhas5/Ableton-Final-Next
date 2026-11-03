#!/usr/bin/env python3
"""CCD School · Model 1 · final mix: Field (type, colours, modules, round caps, sequencer)
+ Mix studio (screen, knobs, faders, pads) + controls from every common kind of hardware."""
import os, math, random
import gen_field as F
import gen_mix as X

OUT = F.OUT
CAT, SYNTH = X.CAT, X.SYNTH
N = F.NEON
I = dict(F.ICONS)
I.update({k: v for k, v in X.I.items() if k in ("check", "lock", "flame", "out")})
I["shift"] = '<span style="font-size:13px;font-weight:500">shift</span>'
I["cue"] = '<span style="font-size:12px;font-weight:600;letter-spacing:.04em">cue</span>'
I["sync"] = '<span style="font-size:12px;font-weight:600;letter-spacing:.04em">sync</span>'

EXTRA = r"""
.light{--padoff:#E4E3DE;--slot:#2A2A2C;--tick:rgba(0,0,0,.24)}
.dark{--padoff:#2C2D31;--slot:#060607;--tick:rgba(255,255,255,.2)}
.scr{position:relative;filter:drop-shadow(0 1px 0 rgba(255,255,255,.5)) drop-shadow(0 6px 10px var(--sh))}
.dark .scr{filter:drop-shadow(0 6px 10px var(--sh))}
.scrf{background:#050506;color:#F3F2EF;border-radius:14px;clip-path:polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,0 100%);position:relative;overflow:hidden;box-sizing:border-box;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}
.scrf:after{content:"";position:absolute;inset:0;background:linear-gradient(118deg,rgba(255,255,255,.07),rgba(255,255,255,0) 38%);pointer-events:none}
.ss{color:#8F8F94;font-size:12px;font-weight:500}
.big{font-weight:300;letter-spacing:-.03em;line-height:1}
.val{font-size:11px;font-weight:500;color:var(--sub);font-variant-numeric:tabular-nums}
.dash{width:18px;height:3px;border-radius:2px;background:var(--ledoff)}
.dash.lit{background:var(--c);box-shadow:0 0 6px var(--c),0 0 2px var(--c)}
.pd{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:2px;border-radius:9px;background:var(--padoff);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 1px 0 var(--capside);text-decoration:none;color:var(--ink);font-size:12px;font-weight:600;transition:transform 70ms}
.pd:active{transform:translateY(1px)}
.pd.lit{background:radial-gradient(circle at 50% 40%,rgba(255,255,255,.45),rgba(255,255,255,0) 70%),var(--c);color:#141416;box-shadow:0 0 12px var(--c),inset 0 1px 0 rgba(255,255,255,.5)}
.wide{aspect-ratio:auto!important}
.jog{border-radius:50%;background:repeating-conic-gradient(var(--k1) 0 2.5deg,var(--k2) 2.5deg 5deg);box-shadow:0 5px 12px var(--sh),0 2px 0 var(--capside);display:flex;align-items:center;justify-content:center;position:relative}
.plat{border-radius:50%;background:repeating-radial-gradient(circle,#141416 0 2px,#1C1C1F 2px 3px);display:flex;align-items:center;justify-content:center;position:relative;box-shadow:inset 0 0 0 2px #000}
"""
CSS = F.CSS + EXTRA


def page(name, title, body, w=390, h=844):
    html = F.HEAD.format(title=title, css=CSS, body=body, w=w, h=h)
    html = html.replace("family=Outfit:wght@200;300;400;500;600", "family=Outfit:wght@200;300;400;500;600;700")
    with open(os.path.join(OUT, name), "w") as f:
        f.write(html)
    print("wrote", name)


def lanes(w, rows, sel=None, head=0.0):
    return X.lanes(w, rows, sel, head).replace('font-family="Archivo"', 'font-family="Outfit"')


def enc(cap, led, label, value, frac=None, aria=""):
    rot = "" if frac is None else f'<b style="transform:rotate({-135 + 270*frac:.0f}deg);transform-origin:50% 155%;position:absolute;left:50%;top:8%;width:2px;height:28%;margin-left:-1px;border-radius:1px;background:rgba(255,255,255,.95)"></b>'
    return (f'<div class="m" role="img" aria-label="{aria or label + " " + value}"><span class="led on" style="--c:{led}"></span>'
            f'<div class="well" style="width:56%;margin-top:-14px"><div class="knob"><i style="--c:{cap};position:relative">{rot}</i></div></div>'
            f'<span class="ml" style="bottom:19px;color:var(--ink)">{label}</span><span class="ml" style="bottom:6px">{value}</span></div>')


def key(inner, label=None, cap="", led=None, href="#", aria="", style=""):
    return F.key(inner, label, cap, led, href, aria, style)


def fader(name, led, frac, h=150, aria=None):
    ticks = "".join(f'<span style="position:absolute;left:0;right:0;top:{8 + i*(h-62)/8:.0f}px;display:flex;justify-content:space-between"><i style="width:9px;height:1px;background:var(--tick)"></i><i style="width:9px;height:1px;background:var(--tick)"></i></span>' for i in range(9))
    top = 4 + (1 - frac) * (h - 62)
    return (f'<div class="m wide" role="img" aria-label="{aria or name + " level " + str(int(frac*100)) + "%"}" style="height:{h}px;flex-direction:column;justify-content:flex-start;padding-top:12px;box-sizing:border-box">'
            f'<span class="dash lit" style="--c:{led}"></span>'
            f'<div style="position:relative;width:50px;height:{h-58}px;margin-top:8px">{ticks}'
            f'<div style="position:absolute;left:50%;top:4px;bottom:4px;width:4px;margin-left:-2px;border-radius:2px;background:var(--slot)"></div>'
            f'<div style="position:absolute;left:50%;top:{top:.0f}px;width:36px;height:22px;margin-left:-18px;border-radius:5px;background:linear-gradient(180deg,var(--cap1),var(--cap2));box-shadow:0 3px 5px var(--sh),0 1px 0 var(--capside),inset 0 1px 0 var(--modhi)"><i style="position:absolute;left:6px;right:6px;top:10px;height:2px;background:var(--ink);border-radius:1px"></i></div></div>'
            f'<span class="ml" style="color:var(--ink)">{name}</span></div>')


def pad(label, lit=None, aria="", h=46, style=""):
    return f'<a href="#" class="pd{" lit" if lit else ""}" aria-label="{aria or label}" style="height:{h}px;{"--c:"+lit+";" if lit else ""}{style}">{label}</a>'


def nav(active, color):
    return F.nav(active, color).replace("FTodayL.dc.html", "M2Today.dc.html").replace("FStudioD.dc.html", "M2Studio.dc.html")


def phone(mode, inner, extra=""):
    return f'<div class="dev {mode} face" style="width:390px;height:844px;position:relative;overflow:hidden"><div style="padding:10px 12px 0">{inner}</div>{extra}</div>'


def status():
    return ('<div style="display:flex;align-items:center;justify-content:space-between;height:40px;padding:0 4px">'
            f'<div style="display:flex;align-items:center;gap:8px"><span style="width:26px;height:26px;border-radius:50%;background:#0B0B0C;display:flex;align-items:center;justify-content:center"><img src="{CAT}" alt="" style="width:21px"></span>'
            '<span style="font-size:19px;font-weight:500;letter-spacing:-.02em">ccd</span><span class="tag">school</span></div>'
            '<div style="display:flex;align-items:center;gap:14px"><span style="font-size:15px;font-weight:400">340<span class="lbl" style="margin-left:3px">xp</span></span>'
            f'<span style="display:flex;align-items:center;gap:4px;font-size:15px">{I["flame"]}4</span></div></div>')

Q, E = X.Q, X.E
S16 = X.S16

# ── 1 · TODAY ─────────────────────────────────────────────────────────────
def today():
    rows = [("kick", N["fund"], Q, "full"), ("hats", N["fund"], E, "full"), ("bass", N["prod"], [(0, 1)], "dash"), ("chords", N["lilac"], Q, "full")]
    scr = (f'<div class="scr" style="margin-top:6px"><div class="scrf" style="padding:16px 16px 18px;height:212px">'
           f'<img src="{CAT}" alt="" style="position:absolute;right:16px;top:14px;width:66px">'
           '<div class="ss">your track</div><div class="big" style="font-size:38px;margin-top:4px">3 layers</div>'
           '<div class="ss" style="margin-top:6px">120 bpm · bass is next</div>'
           f'<div style="margin-top:16px">{lanes(334, rows)}</div></div></div>')
    nxt = ('<div class="g" style="margin-top:8px">'
           '<a href="M2World.dc.html" class="m wide" style="grid-column:span 3;height:88px;justify-content:flex-start;gap:12px;padding:0 12px">'
           f'<img src="{SYNTH}" alt="" style="width:62px;height:62px;border-radius:8px;object-fit:cover;flex:none">'
           '<div style="text-align:left"><div class="lbl">next · producer 02</div><div style="font-size:21px;font-weight:400;letter-spacing:-.02em;margin-top:2px">bass and poli</div>'
           '<div class="val" style="color:#C42A70;font-weight:600;margin-top:3px">adds bass · 7 min</div></div></a>'
           + key(I["play"], "learn", cap="go", href="M2World.dc.html", aria="Start lesson") + '</div>')
    encs = ('<div class="g" style="margin-top:12px">'
            + enc(F.C["fund"], N["fund"], "basics", "5/40", 5/40) + enc(F.C["dj"], N["dj"], "dj", "1/40", 1/40)
            + enc(F.C["prod"], N["prod"], "producer", "1/91", 1/91) + enc("#2B355E", "#F2F1EE", "today", "20/50", .4) + '</div>')
    steps = ('<div class="g" style="margin-top:5px">'
             + key('<span class="leg">1</span>', led=N["prod"], aria="Step 1, done")
             + key('<span class="leg">2</span>', cap="blk", href="M2World.dc.html", aria="Step 2, next")
             + key('<span class="leg" style="color:var(--sub)">3</span>', aria="Step 3")
             + key('<span class="leg" style="color:var(--sub)">4</span>', aria="Step 4") + '</div>')
    practice = ('<div style="display:flex;justify-content:space-between;margin:14px 4px 7px"><span class="lbl">practice</span><span class="lbl">2 min each</span></div>'
                '<div class="g">' + pad("review · 3", N["lilac"], "Review, 3 due") + pad("ear gym") + pad("beat") + pad("quiz") + '</div>')
    return phone("light", status() + scr + nxt + encs + steps + practice, nav("learn", N["prod"]))


# ── 2 · WORLD (the Field sequencer) ──────────────────────────────────────
def world():
    b = F.world()
    return (b.replace("FTodayL.dc.html", "M2Today.dc.html").replace("FAddL.dc.html", "M2Lesson.dc.html"))


# ── 3 · LESSON: try it with a knob and a keyboard ─────────────────────────
def lesson():
    # low-pass curve with resonance bump at cutoff ~ 0.42
    cx = 40 + 0.42 * 270
    curve = (f'<svg width="326" height="118" viewBox="0 0 326 118" aria-hidden="true" style="display:block">'
             + "".join(f'<path d="M{40+i*67.5:.0f} 8V106" stroke="#1E1E21"/>' for i in range(5))
             + '<path d="M40 106H310" stroke="#2A2A2D"/>'
             f'<path d="M40 52H{cx-34:.0f}C{cx-12:.0f} 52 {cx-10:.0f} 22 {cx:.0f} 22S{cx+18:.0f} 60 {cx+40:.0f} 86S{cx+80:.0f} 104 310 106" fill="none" stroke="#FF4F9A" stroke-width="2.2" stroke-linecap="round" style="filter:drop-shadow(0 0 4px #FF4F9A)"/>'
             f'<path d="M40 52H{cx-34:.0f}C{cx-12:.0f} 52 {cx-10:.0f} 22 {cx:.0f} 22S{cx+18:.0f} 60 {cx+40:.0f} 86S{cx+80:.0f} 104 310 106V106H40z" fill="rgba(255,79,154,.10)"/>'
             f'<path d="M{cx:.0f} 8V106" stroke="#F3F2EF" stroke-width="1" stroke-dasharray="2 3"/>'
             '<text x="40" y="118" font-family="Outfit" font-size="9" fill="#77777B">20</text><text x="292" y="118" font-family="Outfit" font-size="9" fill="#77777B">20k</text>'
             '</svg>')
    pips = "".join(f'<span style="flex:1;height:3px;border-radius:2px;background:{"#FF4F9A" if i<3 else ("#F2F1EE" if i==3 else "var(--ledoff)")};{"box-shadow:0 0 6px #FF4F9A" if i<3 else ""}"></span>' for i in range(7))
    head = ('<div style="display:flex;align-items:center;gap:10px;height:40px">'
            '<a href="M2World.dc.html" aria-label="Close" style="color:var(--ink)">' + I["close"] + '</a>'
            f'<div style="flex:1;display:flex;gap:4px">{pips}</div>'
            '<span style="display:flex;gap:3px" aria-label="5 hearts">' + "".join('<span style="width:7px;height:7px;border-radius:4px;background:#FF4A5A;box-shadow:0 0 5px #FF4A5A"></span>' for _ in range(5)) + '</span></div>')
    scr = (f'<div class="scr" style="margin-top:8px"><div class="scrf" style="padding:16px 14px 12px;height:236px">'
           '<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:0 2px"><div><div class="ss">try it · step 4 of 7</div>'
           '<div style="font-size:20px;font-weight:400;margin-top:4px;line-height:1.25;max-width:230px">turn cutoff down until the bass sounds rounder</div></div>'
           '<div style="text-align:right"><div class="ss">cutoff</div><div class="big" style="font-size:30px;margin-top:2px;color:#FF6FAE">640<span style="font-size:14px"> hz</span></div></div></div>'
           f'<div style="margin-top:10px">{curve}</div></div></div>')
    encs = ('<div class="g" style="margin-top:12px">'
            + enc(F.C["prod"], N["prod"], "cutoff", "640 hz", .42)
            + enc("#9C9EA4", N["lilac"], "resonance", "35%", .35)
            + '<div class="m" style="flex-direction:column;gap:6px;padding:8px;box-sizing:border-box"><span class="lbl" style="font-size:11px">hardware</span>'
              '<span style="font-size:12px;line-height:1.3;text-align:center">same knob on a <b style="font-weight:600">minilogue</b>, <b style="font-weight:600">circuit</b>, <b style="font-weight:600">ableton</b></span></div>'
            + key(I["hear"], "a / b", aria="Compare before and after") + '</div>')
    # OP-1 style keyboard: 8 naturals as pills, sharps as black dots between
    whites = ['c', 'd', 'e', 'f', 'g', 'a', 'b', 'c']
    wk = "".join(f'<a href="#" class="m wide" aria-label="Note {n}" style="height:128px;align-items:flex-end;padding-bottom:10px;box-sizing:border-box"><span class="cap pill" style="width:64%;height:88px;align-items:flex-end;padding-bottom:6px;box-sizing:border-box;{"box-shadow:0 0 0 2px #FF4F9A,0 2px 0 var(--capside);" if i==5 else ""}"><span style="font-size:11px;color:var(--sub)">{n}</span></span></a>' for i, n in enumerate(whites))
    col = (366 - 7 * 4) / 8
    sharps = ""
    for i in (0, 1, 3, 4, 5):
        x = (i + 1) * (col + 4) - 2 - 15
        sharps += f'<a href="#" aria-label="Sharp" style="position:absolute;left:{x:.1f}px;top:-18px;width:32px;height:32px;border-radius:50%;background:radial-gradient(circle at 50% 30%,#303032,#0D0D0E 72%);box-shadow:0 2px 0 #000,0 4px 8px var(--sh);z-index:2"></a>'
    keys = (f'<div style="position:relative;margin-top:34px"><div style="display:grid;grid-template-columns:repeat(8,1fr);gap:4px">{wk}</div>{sharps}</div>'
            '<div class="val" style="text-align:center;margin-top:8px">play the bass line · a is lit</div>')
    bottom = ('<div class="g" style="position:absolute;left:12px;right:12px;bottom:22px">'
              + key(I["shift"], "hint", aria="Show a hint")
              + '<a href="#" class="m wide" aria-label="Check" style="grid-column:span 3"><span class="cap go pill" style="width:90%;height:64%;gap:8px;font-size:17px;font-weight:500">sounds right</span></a></div>')
    return phone("dark", head + scr + encs + keys, bottom)


# ── 4 · STUDIO: layer select, knobs, faders, pads ─────────────────────────
def studio():
    rows = [("kick", N["fund"], Q, "full"), ("hats", N["fund"], E, "full"), ("bass", N["prod"], S16, "full"), ("chords", N["lilac"], Q, "full")]
    head = ('<div style="display:flex;align-items:center;justify-content:space-between;height:40px;padding:0 4px">'
            '<div style="display:flex;align-items:center;gap:7px"><span style="font-size:19px;font-weight:500;letter-spacing:-.02em">studio</span><span class="tag">my track</span></div>'
            '<span class="val">4 layers · 120 bpm</span></div>')
    scr = (f'<div class="scr" style="margin-top:4px"><div class="scrf" style="padding:14px 16px 14px;height:176px">'
           '<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="ss">editing · page 1</div>'
           '<div class="big" style="font-size:30px;margin-top:3px;color:#FF6FAE">bass</div></div>'
           '<div style="text-align:right"><div class="ss">cutoff</div><div class="big" style="font-size:30px;margin-top:3px">62%</div></div></div>'
           f'<div style="margin-top:12px">{lanes(334, rows, sel=2)}</div></div></div>')
    layers = ('<div class="g" style="margin-top:8px">'
              + "".join(key(f'<span class="leg" style="font-size:22px">{i+1}</span>', n, cap="blk" if i == 2 else "", led=c, aria=f"Layer {i+1}, {n}")
                        for i, (n, c) in enumerate([("kick", N["fund"]), ("hats", N["fund"]), ("bass", N["prod"]), ("chords", N["lilac"])])) + '</div>')
    encs = ('<div class="g" style="margin-top:5px">'
            + enc(F.C["prod"], N["prod"], "cutoff", "62%", .62) + enc(F.C["prod"], N["lilac"], "resonance", "30%", .3)
            + enc(F.C["prod"], N["dj"], "envelope", "45%", .45) + enc(F.C["prod"], N["fund"], "glide", "15%", .15) + '</div>')
    faders = ('<div class="g" style="margin-top:5px">'
              + fader("kick", N["fund"], .8, 136) + fader("hats", N["fund"], .5, 136) + fader("bass", N["prod"], .7, 136) + fader("chords", N["lilac"], .45, 136) + '</div>')
    pads = ('<div class="g" style="margin-top:5px">'
            + pad("sidechain", N["prod"], "Sidechain on") + pad("mute") + pad("solo") + pad("shift", None, "Shift for page 2") + '</div>')
    transport = ('<div class="g" style="margin-top:5px">'
                 + key(I["play"], "play", cap="go", aria="Play")
                 + key(I["stop"], "stop", aria="Stop")
                 + key(I["plus"], "layer", aria="Add a layer")
                 + key(I["out"], "to live", aria="Export to Ableton Live") + '</div>')
    return phone("dark", head + scr + layers + encs + faders + pads + transport)


# ── 5 · DJ: two decks, jog wheels, EQ, faders, crossfader ────────────────
def wave(w, h, seed, col, playpos=.35):
    random.seed(seed)
    bars = []
    n = 110
    for i in range(n):
        beat = 1 if i % 8 == 0 else 0
        a = (0.35 + 0.5 * random.random()) * (1 if (i // 16) % 4 != 3 else .5) + beat * .2
        bh = min(1, a) * (h / 2 - 4)
        x = i * w / n
        op = 1 if x / w > playpos else .45
        bars.append(f'<rect x="{x:.1f}" y="{h/2-bh:.1f}" width="{w/n-1:.1f}" height="{2*bh:.1f}" fill="{col}" opacity="{op}"/>')
    px = w * playpos
    grid = "".join(f'<path d="M{i*w/16:.1f} 0v4M{i*w/16:.1f} {h-4}v4" stroke="#55555A"/>' for i in range(17))
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" aria-hidden="true" style="display:block">{grid}{"".join(bars)}<path d="M{px:.1f} 0V{h}" stroke="#F3F2EF" stroke-width="1.5"/></svg>'


def jog(color, label, size=170):
    return (f'<div style="display:flex;flex-direction:column;align-items:center;gap:6px">'
            f'<div class="jog" style="width:{size}px;height:{size}px" role="img" aria-label="Jog wheel, deck {label}">'
            f'<div style="position:absolute;inset:6px;border-radius:50%;box-shadow:0 0 0 2px {color},0 0 12px {color};opacity:.9"></div>'
            f'<div class="plat" style="width:{size-34}px;height:{size-34}px">'
            f'<div style="width:{size*0.36:.0f}px;height:{size*0.36:.0f}px;border-radius:50%;background:{color};display:flex;align-items:center;justify-content:center"><img src="{CAT}" alt="" style="width:70%"></div>'
            f'<span style="position:absolute;top:6px;left:50%;width:2px;height:16px;margin-left:-1px;background:#F3F2EF;border-radius:1px"></span></div></div>'
            f'<span class="lbl">deck {label}</span></div>')


def dj():
    head = ('<div style="display:flex;align-items:center;justify-content:space-between;height:40px;padding:0 4px">'
            '<div style="display:flex;align-items:center;gap:7px"><span style="font-size:19px;font-weight:500;letter-spacing:-.02em">dj</span><span class="tag">my mix</span></div>'
            '<span class="val">step 14 · the blend</span></div>')
    scr = (f'<div class="scr" style="margin-top:4px"><div class="scrf" style="padding:12px 14px;height:150px">'
           '<div style="display:flex;justify-content:space-between"><span class="ss" style="color:#4FE3B6">a · my track · 124.0</span><span class="ss" style="color:#7D96FF">b · night bus · 124.0</span></div>'
           f'<div style="margin-top:6px">{wave(338, 44, 3, "#4FE3B6", .55)}</div>'
           f'<div style="margin-top:6px">{wave(338, 44, 9, "#7D96FF", .2)}</div>'
           '<div class="ss" style="margin-top:6px;text-align:center;color:#F3F2EF">bring b in on the next phrase · 8 beats</div></div></div>')
    jogs = f'<div style="display:flex;justify-content:space-between;margin-top:12px;padding:0 4px">{jog(N["fund"], "a")}{jog(N["dj"], "b")}</div>'
    eqs = ('<div class="g" style="margin-top:10px">'
           + enc("#9C9EA4", N["fund"], "low a", "-4 db", .4) + enc("#9C9EA4", N["fund"], "filter a", "off", .5)
           + enc("#9C9EA4", N["dj"], "filter b", "hp 30%", .65) + enc("#9C9EA4", N["dj"], "low b", "kill", 0.02) + '</div>')
    # channel faders + crossfader
    xf = ('<div class="m wide" style="grid-column:span 2;height:96px;flex-direction:column;gap:10px">'
          '<div style="position:relative;width:130px;height:24px">'
          + "".join(f'<i style="position:absolute;top:0;left:{i*130/8:.0f}px;width:1px;height:5px;background:var(--tick)"></i><i style="position:absolute;bottom:0;left:{i*130/8:.0f}px;width:1px;height:5px;background:var(--tick)"></i>' for i in range(9))
          + '<div style="position:absolute;top:10px;left:0;right:0;height:4px;border-radius:2px;background:var(--slot)"></div>'
          '<div style="position:absolute;top:1px;left:46px;width:22px;height:22px;border-radius:4px;background:linear-gradient(180deg,var(--cap1),var(--cap2));box-shadow:0 3px 5px var(--sh),inset 0 1px 0 var(--modhi)"><i style="position:absolute;top:5px;bottom:5px;left:10px;width:2px;background:var(--ink)"></i></div></div>'
          '<span class="ml" style="color:var(--ink)">crossfader</span></div>')
    faders = ('<div class="g" style="margin-top:5px;align-items:end">'
              + fader("vol a", N["fund"], .85, 96) + xf + fader("vol b", N["dj"], .3, 96) + '</div>')
    btns = ('<div class="g" style="margin-top:5px">'
            + key(I["cue"], "deck a", aria="Cue deck A") + key(I["play"], "deck a", cap="go", aria="Play deck A")
            + key(I["sync"], "deck b", aria="Sync deck B") + key(I["play"], "deck b", aria="Play deck B") + '</div>')
    return phone("dark", head + scr + jogs + eqs + faders + btns)


if __name__ == "__main__":
    page("M2Today.dc.html", "Today", today())
    page("M2World.dc.html", "World", world())
    page("M2Lesson.dc.html", "Lesson", lesson())
    page("M2Studio.dc.html", "Studio", studio())
    page("M2DJ.dc.html", "DJ", dj())
