#!/usr/bin/env python3
"""Model 1 · v6. Physical finish from v5 + engraved panel lettering from v4.
Knobs carry no numbers; the screen shows what you are touching.
Studio and DJ are each one screen, laid out like real gear."""
import os, math, random
import gen_m5 as P
import gen_m4 as R
import gen_m3 as m3
import gen_m2 as M

OUT = P.OUT
CAT, SYNTH, N, I, SI, DUO, CAPC = P.CAT, P.SYNTH, P.N, P.I, P.SI, P.DUO, P.CAPC
Q, E, S16 = P.Q, P.E, P.S16
key, knob, pad, nav, phone, go_pill, week_dots, header = P.key, P.knob, P.pad, P.nav, P.phone, P.go_pill, P.week_dots, P.header

CSS = P.CSS + r"""
.light{--ehi:rgba(255,255,255,.95);--elo:rgba(0,0,0,.16)}
.dark{--ehi:rgba(255,255,255,.07);--elo:rgba(0,0,0,.75)}
/* engraved lettering: cut into the panel, lit from above */
.ml,.eng{color:var(--print);text-shadow:0 1px 0 var(--ehi),0 -1px 0 var(--elo)}
.ml.on{color:var(--ink)}
.silk{display:flex;align-items:flex-start;gap:7px;font-size:11px;font-weight:500;color:var(--print);letter-spacing:.06em;margin:12px 2px 7px;line-height:14px;text-shadow:0 1px 0 var(--ehi),0 -1px 0 var(--elo)}
.silk i{flex:1;height:5px;border-top:1px solid var(--print);margin-top:7px;opacity:.7;filter:drop-shadow(0 1px 0 var(--ehi))}
.silk i.l{flex:none;width:8px;border-left:1px solid var(--print)}
.silk i.r{border-right:1px solid var(--print)}
.silk i.rs{flex:none;width:8px;border-right:1px solid var(--print)}
.mk{border-radius:50%;background:repeating-conic-gradient(var(--k1) 0 5deg,var(--k2) 5deg 10deg);box-shadow:0 1px 0 var(--cs1),0 2px 0 var(--cs2),0 4px 0 var(--cs2),0 8px 10px -2px var(--shA);display:flex;align-items:center;justify-content:center}
.cell{display:flex;align-items:center;justify-content:center;border-radius:3px}
"""


def silk(label, right=None):
    if right:
        return f'<div class="silk"><i class="l"></i><span>{label}</span><i></i><span>{right}</span><i class="rs"></i></div>'
    return f'<div class="silk"><i class="l"></i><span>{label}</span><i class="r"></i></div>'


def eng_svg_text(x, y, t, anchor="middle", size=11, weight=500, color="var(--print)"):
    return (f'<text x="{x:.1f}" y="{y+1:.1f}" text-anchor="{anchor}" font-family="Outfit" font-size="{size}" font-weight="{weight}" fill="var(--ehi)">{t}</text>'
            f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}" font-family="Outfit" font-size="{size}" font-weight="{weight}" fill="{color}">{t}</text>')


def world_dial(sel=2, W=166, H=150, size=72):
    """Detented dial with engraved positions that never overlap: labels sit outside the ticks, inside the module."""
    cx, cy = W / 2, H / 2 + 10
    labels = [("basics", -150, N["fund"]), ("dj", -90, N["dj"]), ("producer", -30, N["prod"])]
    r_in, r_out = size / 2 + 8, size / 2 + 15
    out = []
    for i, (lab, a, col) in enumerate(labels):
        on = i == sel
        ar = math.radians(a)
        x0, y0 = cx + r_in * math.cos(ar), cy + r_in * math.sin(ar)
        x1, y1 = cx + r_out * math.cos(ar), cy + r_out * math.sin(ar)
        out.append(f'<path d="M{x0:.1f} {y0:.1f}L{x1:.1f} {y1:.1f}" stroke="{col if on else "var(--print)"}" stroke-width="{2.6 if on else 1.4}" stroke-linecap="round"/>')
        if a == -90:
            tx, ty, anc = cx, y1 - 7, "middle"
        elif a < -90:
            tx, ty, anc = 4, y1 - 8, "start"
        else:
            tx, ty, anc = W - 4, y1 - 8, "end"
        out.append(eng_svg_text(tx, ty, lab, anc, 11, 600 if on else 500, "var(--ink)" if on else "var(--print)"))
    rot = labels[sel][1] + 90
    svg = f'<svg width="{W}" height="{H}" style="position:absolute;inset:0" aria-hidden="true">{"".join(out)}</svg>'
    knobh = (f'<div class="well" style="position:absolute;left:{cx-size/2-8:.0f}px;top:{cy-size/2-8:.0f}px;width:{size+16}px;height:{size+16}px">'
             f'<div class="kb" style="width:{size}px;height:{size}px;margin-top:-4px"><div class="kc" style="--c:var(--c0);width:{size*0.66:.0f}px;height:{size*0.66:.0f}px">'
             f'<b style="background:{labels[sel][2]};box-shadow:0 0 5px {labels[sel][2]};transform:rotate({rot}deg)"></b></div></div></div>')
    return f'<div style="position:relative;width:{W}px;height:{H}px" role="img" aria-label="World dial set to {labels[sel][0]}">{svg}{knobh}</div>'


def mini_knob(cap, frac, size=34):
    rot = -135 + 270 * frac
    return (f'<div class="well" style="width:{size+12}px;height:{size+12}px"><div class="mk" style="width:{size}px;height:{size}px;margin-top:-3px">'
            f'<div class="kc" style="--c:{cap};width:{size*0.66:.0f}px;height:{size*0.66:.0f}px"><b style="transform:rotate({rot:.0f}deg)"></b></div></div></div>')


def slim_fader(frac, h=150, w=40, led=None):
    th = h - 30
    ticks = "".join(f'<i style="position:absolute;left:0;top:{6 + j*th/8:.0f}px;width:{8 if j in (0,2,8) else 5}px;height:1px;background:var(--tick)"></i><i style="position:absolute;right:0;top:{6 + j*th/8:.0f}px;width:{8 if j in (0,2,8) else 5}px;height:1px;background:var(--tick)"></i>' for j in range(9))
    top = 6 + (1 - frac) * th - 11
    led_h = f'<span class="dash on" style="--c:{led};position:absolute;top:-12px;left:50%;margin-left:-9px"></span>' if led else ""
    return (f'<div style="position:relative;width:{w}px;height:{h}px">{led_h}{ticks}<div class="fslot" style="top:2px;bottom:2px"></div>'
            f'<div class="fcap" style="top:{top:.0f}px;width:{w-6}px;margin-left:-{(w-6)/2:.0f}px;height:22px"><i style="top:10px"></i></div></div>')

# ── TODAY ─────────────────────────────────────────────────────────────────
def today(mode):
    rows = [("kick", N["fund"], Q, "full"), ("hats", N["fund"], E, "full"), ("bass", N["prod"], [(0, 1)], "dash"), ("chords", N["lilac"], Q, "full")]
    scr = (f'<div class="scr" style="margin-top:6px"><div class="scrf" style="padding:18px 16px 16px;height:250px">'
           f'<img src="{CAT}" alt="" style="position:absolute;right:16px;top:14px;width:66px">'
           '<div class="ss">your track</div><div class="t36" style="margin-top:8px">3 layers</div>'
           '<div style="display:flex;gap:14px;margin-top:10px"><span class="ss" style="color:#F3F2EF">120 bpm</span><span class="ss" style="color:#F3F2EF">a minor</span><span class="ss" style="color:#F3F2EF">0:16 loop</span></div>'
           f'<div style="margin-top:22px">{R.lanes(338, rows)}</div>'
           f'<div class="ss" style="margin-top:8px">bass joins after <span style="color:#FF6FAE">bass and poli</span></div></div></div>')
    nxt = (f'<a href="M6World.dc.html" class="m wide" style="margin-top:14px;height:108px;justify-content:flex-start;gap:14px;padding:0 12px">'
           f'<img src="{SYNTH}" alt="" style="width:72px;height:72px;border-radius:10px;object-fit:cover;flex:none;filter:url(#duo-prod);box-shadow:inset 0 0 0 1px rgba(0,0,0,.2),0 1px 0 var(--hi)">'
           '<div style="flex:1;text-align:left;min-width:0"><div class="eng t11" style="color:var(--print)">next lesson</div><div class="t22" style="margin-top:4px">bass and poli</div>'
           '<div class="t11" style="margin-top:4px">7 min · knob · keys</div></div>'
           f'<span class="cap go" style="width:62px;flex:none">{I["play"]}</span></a>')
    dial = (f'<div class="m wide" style="grid-column:span 2;height:184px;flex-direction:column;justify-content:flex-start;padding-top:8px">'
            f'{world_dial(2, 166, 146, 66)}<span class="ml">worlds</span></div>')
    gauge = (f'<div class="m wide" style="height:184px;flex-direction:column;justify-content:flex-start;padding-top:16px">'
             f'{m3.meter(9, 3, True, 8)}<span class="ml">today</span></div>')
    hear = (f'<a href="M6Studio.dc.html" class="m wide" aria-label="Hear your track" style="height:184px">'
            f'<span class="cap" style="width:64%;margin-top:-12px">{I["hear"]}</span><span class="ml">hear</span></a>')
    mid = silk("worlds", "today") + f'<div class="g">{dial}{gauge}{hear}</div>'
    right = f'<div style="display:flex;align-items:center;gap:12px">{week_dots()}<span style="font-size:15px;font-weight:300">340<span class="val" style="margin-left:3px">xp</span></span></div>'
    return phone(mode, header(right) + scr + nxt + mid, nav("learn").replace("M5", "M6"))

# ── WORLD ─────────────────────────────────────────────────────────────────
def world():
    head = ('<div style="display:flex;align-items:center;gap:12px;height:48px">'
            f'<a href="M6TodayL.dc.html" class="m" aria-label="Back" style="width:44px">{I["back"]}</a>'
            '<div style="flex:1"><div class="t22">producer</div><div class="t11">first contact · 1 of 16 done</div></div>'
            f'<span class="dash on" style="--c:{N["prod"]}"></span></div>')
    scr = (f'<div class="scr" style="margin-top:10px"><div class="scrf" style="height:176px;display:flex">'
           f'<img src="{SYNTH}" alt="A hand turning a synth knob" style="width:146px;height:100%;object-fit:cover;filter:url(#duo-prod)">'
           '<div style="flex:1;padding:16px;display:flex;flex-direction:column;justify-content:space-between">'
           '<span class="big" style="font-size:40px;font-weight:200">02</span>'
           '<div><div class="t22">bass and poli</div><div class="ss" style="margin-top:6px;color:#F3F2EF">adds bass to your track</div>'
           '<div class="ss" style="margin-top:4px">7 min · you\'ll use a knob and keys</div></div></div></div></div>')
    steps = ""
    for n in range(1, 17):
        if n == 1:
            steps += key(f'<span class="leg" style="font-size:24px">{n}</span>', led=N["prod"], aria="Step 1, done")
        elif n == 2:
            steps += key(f'<span class="leg" style="font-size:24px">{n}</span>', cap="blk", href="M6Lesson.dc.html", aria="Step 2, next")
        elif n <= 8:
            steps += key(f'<span class="leg" style="font-size:24px;color:var(--sub)">{n}</span>', aria=f"Step {n}")
        else:
            steps += f'<div class="m is-dim" aria-label="Step {n}, locked"><span class="leg" style="font-size:22px;color:var(--sub)">{n}</span></div>'
    body = head + scr + silk("first contact", "16 steps") + f'<div class="g">{steps}</div>'
    bottom = ('<div class="g" style="position:absolute;left:16px;right:16px;bottom:24px">' + key(I["hear"], "preview", aria="Preview")
              + go_pill("start step 02", "M6Lesson.dc.html", "play") + '</div>')
    return phone("light", body, bottom)

# ── LESSON ────────────────────────────────────────────────────────────────
def lesson():
    body = P.lesson()
    body = body.replace('<span class="ml"', '<span class="ml"')
    # add an engraved section label above the keys
    body = body.replace('<div style="position:relative;margin-top:30px"><div style="display:grid;grid-template-columns:repeat(8,1fr);gap:5px">',
                        silk("keys", "play the bass line") + '<div style="position:relative;margin-top:22px"><div style="display:grid;grid-template-columns:repeat(8,1fr);gap:5px">')
    body = body.replace('<div class="g" style="margin-top:14px;grid-template-columns:1fr 1fr">', silk("filter") + '<div class="g" style="grid-template-columns:1fr 1fr">', 1)
    body = body.replace('style="height:180px;align-items:flex-end', 'style="height:150px;align-items:flex-end').replace('height:144px;', 'height:114px;')
    return body.replace("M5", "M6")

# ── STUDIO · one screen, channel strips ──────────────────────────────────
def studio():
    sel = 2
    layers = [("kick", N["fund"], .8), ("hats", N["fund"], .5), ("bass", N["prod"], .7), ("chords", N["lilac"], .45)]
    params = [("cutoff", .62), ("res", .30), ("env", .45), ("glide", .15)]
    pbars = "".join(f'<div style="flex:1"><div class="ss" style="display:flex;justify-content:space-between"><span>{n}</span><span style="color:#F3F2EF">{int(v*100)}%</span></div>'
                    f'<div style="height:4px;border-radius:2px;background:#1E1E21;margin-top:5px"><div style="width:{v*100:.0f}%;height:100%;border-radius:2px;background:{N["prod"] if n=="cutoff" else "#8E8E93"}"></div></div></div>' for n, v in params)
    pat = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0]
    cells = "".join(f'<span class="cell" style="height:22px;background:{N["prod"] if on else "#17171A"};{"box-shadow:0 0 6px " + N["prod"] if on and i==4 else ""};{"outline:1.5px solid #F3F2EF;outline-offset:1px" if i==4 else ""}"></span>' for i, on in enumerate(pat))
    scr = (f'<div class="scr" style="margin-top:6px"><div class="scrf" style="padding:14px 16px;height:206px">'
           '<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="big" style="font-size:30px;color:#FF6FAE">bass</div>'
           '<div class="ss" style="margin-top:4px">layer 3 · from bass and poli</div></div>'
           '<div style="text-align:right"><div class="ss">cutoff</div><div class="big" style="font-size:30px;margin-top:2px">62%</div></div></div>'
           f'<div style="display:flex;gap:12px;margin-top:16px">{pbars}</div>'
           f'<div style="display:grid;grid-template-columns:repeat(16,1fr);gap:3px;margin-top:16px">{cells}</div>'
           '<div class="ss" style="margin-top:7px;display:flex;justify-content:space-between"><span>pattern · tap to edit</span><span>sidechain on</span></div></div></div>')
    knobs = silk("bass", "turn to shape") + ('<div class="g">' + knob(CAPC["prod"], "cutoff", .62, 50) + knob(CAPC["grey"], "res", .3, 50)
                                             + knob(CAPC["navy"], "env", .45, 50) + knob(CAPC["grey"], "glide", .15, 50) + '</div>')
    strips = ""
    for i, (n, c, lv) in enumerate(layers):
        on = i == sel
        strips += (f'<div class="m wide" style="height:236px;flex-direction:column;justify-content:flex-start;padding-top:22px;gap:10px">'
                   f'{slim_fader(lv, 136, 42, c)}'
                   f'<span class="eng" style="font-size:11px;font-weight:{600 if on else 500};{"color:var(--ink)" if on else ""}">{n}</span>'
                   f'<a href="#" aria-label="Select {n}" class="cap{" blk" if on else ""}" style="width:44px;position:relative;text-decoration:none"><span class="leg" style="font-size:17px">{i+1}</span></a></div>')
    strip_row = silk("layers", "level · select") + f'<div class="g">{strips}</div>'
    pads = ('<div class="g" style="margin-top:8px">' + pad("sidechain", N["prod"], h=46) + pad("mute", h=46) + pad("solo", h=46) + pad("shift", h=46) + '</div>')
    head = ('<div style="display:flex;align-items:center;gap:10px;height:40px">'
            f'<a href="M6TodayL.dc.html" aria-label="Back" style="color:var(--ink);display:flex">{I["back"]}</a><span class="t22" style="flex:1">studio</span><span class="tag">my track</span></div>')
    transport = ('<div class="g" style="position:absolute;left:16px;right:16px;bottom:22px;grid-template-columns:2fr 1fr 1fr 1fr">'
                 + f'<a href="#" class="m wide" aria-label="Play"><span class="cap go pill" style="width:88%;height:58%;gap:8px;font-size:15px;font-weight:500">{I["play"]}play</span></a>'
                 + key(I["stop"], "stop") + key(I["plus"], "layer") + key(I["out"], "to live") + '</div>')
    return phone("dark", head + scr + knobs + strip_row + pads, transport)

# ── DJ · one screen, deck · mixer · deck ─────────────────────────────────
def dj():
    def wv(seed, col, pos, w=326):
        return M.wave(w, 34, seed, col, pos)
    scr = (f'<div class="scr" style="margin-top:6px"><div class="scrf" style="padding:12px 14px;height:196px">'
           f'<div style="display:flex;justify-content:space-between;align-items:baseline"><span class="ss" style="color:{N["fund"]}">a · my track</span>'
           f'<span class="ss"><span style="color:#F3F2EF">124.0</span> bpm · 8a · +0.0%</span></div>'
           f'<div style="margin-top:6px">{wv(3, N["fund"], .55)}</div>'
           '<div style="display:flex;align-items:center;justify-content:center;gap:10px;margin:8px 0">'
           + "".join(f'<span style="width:8px;height:8px;border-radius:4px;background:{"#F3F2EF" if i < 5 else "#2A2A2D"};{"box-shadow:0 0 5px #F3F2EF" if i == 4 else ""}"></span>' for i in range(8))
           + '<span class="ss" style="color:#F3F2EF;margin-left:6px">bring b in · 3 beats</span></div>'
           f'<div>{wv(9, N["dj"], .2)}</div>'
           f'<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:6px"><span class="ss" style="color:{N["dj"]}">b · night bus</span>'
           '<span class="ss"><span style="color:#F3F2EF">124.0</span> bpm · 9a · synced</span></div></div></div>')

    def deck(lbl, col, playing, cues_on):
        jog = M.jog(col, lbl, 116).replace('<span class="lbl">deck ' + lbl + '</span>', '')
        cues = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;width:116px;margin-top:6px">' + "".join(pad(str(k + 1), col if k < cues_on else None, f"Hot cue {k+1}", 26, "border-radius:6px;font-size:10px") for k in range(4)) + '</div>'
        btns = (f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;width:116px;margin-top:8px">'
                + key(I["cue"], None, aria=f"Cue deck {lbl}") + key(I["play"], None, cap="go" if not playing else "blk", led=col if playing else None, aria=f"Play deck {lbl}") + '</div>')
        return f'<div style="display:flex;flex-direction:column;align-items:center">{jog}<span class="eng" style="font-size:11px;margin-top:2px">deck {lbl}</span>{cues}{btns}</div>'

    mixer = ('<div class="m wide" style="flex-direction:column;justify-content:flex-start;padding:10px 6px;gap:6px;height:100%;box-sizing:border-box">'
             '<div style="display:flex;justify-content:space-around;width:100%"><span class="eng" style="font-size:10px">a</span><span class="eng" style="font-size:10px">b</span></div>'
             f'<div style="display:flex;justify-content:space-around;width:100%">{mini_knob(CAPC["grey"], .4, 30)}{mini_knob(CAPC["grey"], .02, 30)}</div><span class="eng" style="font-size:10px">low</span>'
             f'<div style="display:flex;justify-content:space-around;width:100%">{mini_knob(CAPC["grey"], .5, 30)}{mini_knob(CAPC["grey"], .65, 30)}</div><span class="eng" style="font-size:10px">filter</span>'
             f'<div style="display:flex;justify-content:space-around;width:100%;margin-top:14px">{slim_fader(.85, 92, 34, N["fund"])}{slim_fader(.3, 92, 34, N["dj"])}</div>'
             '<span class="eng" style="font-size:10px">volume</span></div>')
    body_ = (f'<div style="display:grid;grid-template-columns:116px 1fr 116px;gap:8px;margin-top:14px;align-items:stretch">'
             f'{deck("a", N["fund"], True, 2)}{mixer}{deck("b", N["dj"], False, 1)}</div>')
    xf = ('<div class="m wide" style="margin-top:12px;height:74px;flex-direction:column;gap:6px">'
          '<div style="position:relative;width:200px;height:26px">'
          + "".join(f'<i style="position:absolute;top:-4px;left:{i*200/8:.0f}px;width:1px;height:{6 if i in (0,4,8) else 4}px;background:var(--tick)"></i>' for i in range(9))
          + '<div class="fslot" style="top:10px;left:0;right:0;width:auto;height:6px;margin-left:0"></div>'
          '<div class="fcap" style="top:1px;left:60%;width:26px;height:26px;margin-left:-13px;background:repeating-linear-gradient(90deg,rgba(0,0,0,0) 0 3px,rgba(0,0,0,.10) 3px 4px),linear-gradient(180deg,var(--c1),var(--c0))"><i style="left:12px;right:auto;width:2px;top:4px;height:18px"></i></div></div>'
          '<div style="display:flex;justify-content:space-between;width:220px"><span class="eng" style="font-size:11px">a</span><span class="eng" style="font-size:11px">crossfader</span><span class="eng" style="font-size:11px">b</span></div></div>')
    head = ('<div style="display:flex;align-items:center;gap:10px;height:40px"><span class="t22" style="flex:1">dj</span><span class="tag">my mix</span>'
            '<span class="val" style="margin-left:8px">step 14 · the blend</span></div>')
    return phone("dark", head + scr + body_ + xf, nav("practice").replace("M5", "M6"))


def write(name, title, body, w=390, h=844):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(P.HEAD.format(title=title, css=CSS, body=body, w=w, h=h))
    print("wrote", name)


if __name__ == "__main__":
    write("M6TodayL.dc.html", "Today · light", today("light"))
    write("M6TodayD.dc.html", "Today · dark", today("dark"))
    write("M6World.dc.html", "World", world())
    write("M6Lesson.dc.html", "Lesson", lesson())
    write("M6Studio.dc.html", "Studio · one screen", studio())
    write("M6DJ.dc.html", "DJ · one screen", dj())


# ── ADD (v6) and component sheet (v6) ────────────────────────────────────
def add6():
    rows = [("kick", N["fund"], Q, "full"), ("hats", N["fund"], E, "full"), ("bass", N["prod"], S16, "new"), ("chords", N["lilac"], Q, "full")]
    head = ('<div style="display:flex;align-items:center;justify-content:space-between;height:48px">'
            f'<a href="M6TodayL.dc.html" class="m" aria-label="Close" style="width:44px">{I["close"]}</a>'
            '<span style="font-size:15px;font-weight:300">+50<span class="val" style="margin-left:3px">xp</span></span></div>')
    scr = (f'<div class="scr" style="margin-top:10px"><div class="scrf" style="padding:18px 16px;height:288px;display:flex;flex-direction:column;justify-content:space-between">'
           f'<img src="{CAT}" alt="" style="position:absolute;right:16px;top:16px;width:78px">'
           '<div><div class="ss">you learned</div><div class="t36" style="margin-top:8px;max-width:200px">bass and poli</div>'
           '<div class="ss" style="margin-top:10px;color:#F3F2EF">new layer · bass · cutoff 40% · glide 10%</div></div>'
           f'<div>{R.lanes(338, rows, sel=2)}<div class="ss" style="margin-top:8px">joins your track when you add it</div></div></div></div>')
    knobs = silk("shape it first", "the screen shows values") + ('<div class="g" style="grid-template-columns:1fr 1fr">'
             + knob(CAPC["prod"], "cutoff", .4, 84, N["prod"], wide=True, h=190) + knob(CAPC["navy"], "glide", .1, 84, N["prod"], wide=True, h=190) + '</div>')
    bottom = ('<div class="g" style="position:absolute;left:16px;right:16px;bottom:24px">' + key(I["hear"], "hear", aria="Hear it")
              + go_pill("add to my track", "M6Studio.dc.html", "plus") + '</div>')
    return phone("light", head + scr + knobs, bottom)


def sheet6(mode):
    m3.key = key
    m3.enc = lambda cap, led, label, value, frac=.5, aria="": knob(cap, label, frac, 46, led)
    m3.fader = lambda name, led, frac, h=150, aria=None: P.fader(name, led, frac, max(h, 170))
    m3.pad = pad
    m3.lanes = R.lanes
    m3.I = I
    m3.mode_dial = lambda sel=2, size=104, labels=None, cols=None: world_dial(sel, 200, 170, 80)
    m3.M.status = lambda: header('<span style="font-size:15px;font-weight:300">340<span class="val" style="margin-left:3px">xp</span></span>')
    m3.M.nav = lambda a, c=None: nav(a).replace("position:absolute;left:16px;right:16px;bottom:24px", "position:absolute;left:0;right:0;bottom:0")
    body = m3.sheet(mode)
    body = body.replace('style="width:1600px;box-sizing:border-box;padding:48px 56px;background:', 'data-x="1" style="width:1600px;box-sizing:border-box;padding:48px 56px;background-image:var(--grain);background-color:')
    body = body.replace("mint light + tick sound", "world colour + tick").replace("red light, lose a heart", "red, lose a heart")
    return body


SHEET_CSS = CSS + ".light,.dark{--cap1:var(--c1);--cap2:var(--c0);--padoff:var(--padt);--mod2:var(--t2);--mod:var(--t1);--modhi:var(--hi);--capside:var(--cs2);--sh:var(--shA);--line:rgba(128,128,128,.15)}.cap.pill:not(.go){background:radial-gradient(70% 120% at 50% 60%,var(--c0) 0 45%,var(--c1) 90%)}" + R.SHEET_EXTRA.replace(".panel{", ".panel{box-shadow:inset 0 2px 6px var(--shA),inset 0 -1px 0 var(--hi);") + ".sec{text-shadow:0 1px 0 var(--ehi),0 -1px 0 var(--elo)}"

if __name__ == "__main__":
    write("M6Add.dc.html", "Add to my track", add6())
    for md in ("light", "dark"):
        with open(os.path.join(OUT, f"M6Sheet_{md}.dc.html"), "w") as f:
            f.write(P.HEAD.format(title=f"Components · {md}", css=SHEET_CSS, body=sheet6(md), w=1600, h=3100))
        print("wrote sheet", md)
