#!/usr/bin/env python3
"""Model 1 · lesson screens. Every step type in the lesson player, on the instrument."""
import os, math
import gen_m6 as V
import gen_m5 as P
import gen_m4 as R
import gen_m3 as m3

OUT = V.OUT
CAT, SYNTH, N, I, SI, CAPC = V.CAT, V.SYNTH, V.N, V.I, V.SI, V.CAPC
key, knob, pad, phone, go_pill, silk = V.key, V.knob, V.pad, V.phone, V.go_pill, V.silk
RED = "#FF4A5A"


def head(done=2, cur=True, hearts=5, of=7):
    pips = "".join(f'<span style="flex:1;height:3px;border-radius:2px;background:{N["prod"] if i < done else ("var(--ink)" if i == done and cur else "var(--ledoff)")}"></span>' for i in range(of))
    hs = "".join(f'<span style="width:7px;height:7px;border-radius:4px;background:{"radial-gradient(circle,#fff 0 20%," + RED + " 62%)" if i < hearts else "var(--ledoff)"};{"box-shadow:0 0 3px " + RED if i < hearts else ""}"></span>' for i in range(5))
    return (f'<div style="display:flex;align-items:center;gap:12px;height:40px"><a href="#" aria-label="Close" style="color:var(--ink);display:flex">{I["close"]}</a>'
            f'<div style="flex:1;display:flex;gap:4px">{pips}</div><span style="display:flex;gap:3px" aria-label="{hearts} hearts">{hs}</span></div>')


def scr(inner, h=None, pad_="16px", mt=8):
    hh = f"height:{h}px;" if h else ""
    return f'<div class="scr" style="margin-top:{mt}px"><div class="scrf" style="padding:{pad_};{hh}">{inner}</div></div>'


def bottom(*keys_html):
    return f'<div class="g" style="position:absolute;left:16px;right:16px;bottom:24px">{"".join(keys_html)}</div>'


def body_text(t, size=17):
    return f'<p style="margin:0;font-size:{size}px;line-height:1.5;color:var(--ink);font-weight:400;text-wrap:pretty">{t}</p>'


def fact(t):
    return (f'<div class="pd" style="height:auto;padding:12px 14px;align-items:flex-start;flex-direction:row;gap:10px;justify-content:flex-start;text-align:left">'
            f'<span style="width:7px;height:7px;border-radius:4px;margin-top:6px;flex:none;background:radial-gradient(circle,#fff 0 25%,{N["prod"]} 62%);box-shadow:0 0 5px {N["prod"]}"></span>'
            f'<span style="font-size:14px;line-height:1.45;font-weight:500">{t}</span></div>')

# 1 · HOOK ─────────────────────────────────────────────────────────────────
def hook():
    inner = (f'<img src="{SYNTH}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:url(#duo-prod);opacity:.85">'
             '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 30%,rgba(0,0,0,.85))"></div>'
             '<div style="position:absolute;left:18px;right:18px;bottom:18px"><div class="ss">producer 02 · 7 min</div>'
             '<div class="t36" style="margin-top:8px">bass and poli</div>'
             '<div class="ss" style="margin-top:10px;color:#F3F2EF;font-size:13px;line-height:1.45">every track you love sits on a bass line. today you make one.</div></div>')
    tools = ('<div class="g" style="margin-top:6px">' + "".join(
        f'<div class="m" aria-label="{n}"><span class="cap" style="width:48%;margin-top:-10px">{I[ic]}</span><span class="ml">{n}</span></div>' for n, ic in (("knob", "knob"), ("keys", "keys"), ("pads", "pads"))) +
        '<div class="m" style="flex-direction:column;gap:4px"><span class="big" style="font-size:26px;font-weight:200">+50</span><span class="ml" style="bottom:12px">xp</span></div></div>')
    body = head(0, True) + scr(inner, 420, "0") + silk("you'll use", "and earn") + tools
    return phone("light", body, bottom(key(I["back"], "later"), go_pill("let's go", icon="play")))

# 2 · CONCEPT ──────────────────────────────────────────────────────────────
def concept():
    svg = ('<svg width="326" height="118" viewBox="0 0 326 118" aria-hidden="true" style="display:block">'
           '<path d="M0 59H326" stroke="#26262A"/>'
           + "".join(f'<path d="M{x} 0V118" stroke="#1A1A1D"/>' for x in range(0, 327, 41))
           + '<path d="M0 59C20 10 40 10 61 59S102 108 122 59 163 10 183 59 224 108 245 59 285 10 306 59" fill="none" stroke="#FF4F9A" stroke-width="2.4" stroke-linecap="round"/>'
           '<path d="M0 59C6 44 9 44 15 59S24 74 30 59 39 44 45 59 54 74 60 59" fill="none" stroke="#7D96FF" stroke-width="1.4" opacity=".7" transform="translate(0 30) scale(1 .5)"/>'
           '<text x="0" y="114" font-family="Outfit" font-size="10" fill="#8E8E93">40 hz · you feel it more than hear it</text></svg>')
    inner = ('<div style="display:flex;justify-content:space-between"><span class="ss">concept · 2 of 7</span><span class="ss">sub bass</span></div>'
             '<div class="t22" style="margin-top:8px">bass is the slow wave</div>'
             f'<div style="margin-top:16px">{svg}</div>')
    txt = body_text("Low notes move air slowly, around 40 to 120 times a second. That slow push is what you feel in your chest on a club system.")
    body = head(1, True) + scr(inner, 250) + silk("read") + f'<div style="padding:0 2px">{txt}</div><div style="margin-top:14px">{fact("A kick and a bass share the same space. Later you will make them take turns.")}</div>'
    return phone("light", body, bottom(key(I["hear"], "hear it"), go_pill("next")))

# 3 · TRY IT (knobs + keys) ────────────────────────────────────────────────
def tryit():
    return V.lesson()

# 4 · QUIZ ON PADS ─────────────────────────────────────────────────────────
def quiz(state="ask"):
    curve = ('<svg width="320" height="80" viewBox="0 0 320 80" aria-hidden="true" style="display:block">'
             '<path d="M10 30H150C175 30 178 12 190 12S205 50 225 64 260 76 310 78" fill="none" stroke="#F3F2EF" stroke-width="2" stroke-linecap="round" opacity=".85"/>'
             '<path d="M10 78H310" stroke="#2A2A2D"/><text x="10" y="76" font-family="Outfit" font-size="9" fill="#77777B">low</text><text x="310" y="76" text-anchor="end" font-family="Outfit" font-size="9" fill="#77777B">high</text></svg>')
    answers = [("high-pass", False), ("low-pass", True), ("band-pass", False), ("notch", False)]
    q = "which filter keeps the lows and cuts the highs?"
    if state == "ask":
        top = f'<div class="ss">question 1 of 3</div><div class="t22" style="margin-top:8px;max-width:300px">{q}</div><div style="margin-top:16px">{curve}</div>'
    elif state == "right":
        top = (f'<div class="ss" style="color:{N["prod"]}">right · +8 xp</div><div class="t36" style="margin-top:8px">low-pass</div>'
               f'<div class="ss" style="margin-top:10px;color:#F3F2EF;font-size:13px;line-height:1.45">it passes everything below the cutoff. that rounded bass you made was a low-pass.</div>')
    else:
        top = (f'<div class="ss" style="color:{RED}">not quite · lost a heart</div><div class="t36" style="margin-top:8px">high-pass</div>'
               f'<div class="ss" style="margin-top:10px;color:#F3F2EF;font-size:13px;line-height:1.45">a high-pass does the opposite: it keeps the highs. the lit pad is the right one.</div>')
    pads = ""
    for a, ok in answers:
        if state == "ask":
            lit = N["prod"] if a == "low-pass" else None
            pads += pad(a, lit, h=86, style="font-size:15px") if not lit else pad(a, None, h=86, style=f"font-size:15px;box-shadow:inset 0 0 0 2px {N['prod']},inset 0 1.5px 0 var(--hi),0 1px 0 var(--pads),0 2px 0 var(--pads),0 3px 0 var(--pads)")
        elif state == "right":
            pads += pad(a, N["prod"] if ok else None, h=86, style="font-size:15px" + ("" if ok else ";opacity:.5"))
        else:
            if a == "high-pass":
                pads += pad(a, RED, h=86, style="font-size:15px")
            elif ok:
                pads += pad(a, None, h=86, style=f"font-size:15px;box-shadow:inset 0 0 0 2px {N['prod']},0 0 10px {N['prod']}55,inset 0 1.5px 0 var(--hi),0 1px 0 var(--pads),0 2px 0 var(--pads),0 3px 0 var(--pads)")
            else:
                pads += pad(a, None, h=86, style="font-size:15px;opacity:.5")
    grid = f'<div class="g" style="grid-template-columns:1fr 1fr;gap:10px">{pads}</div>'
    hearts = 4 if state == "wrong" else 5
    mode = "dark" if state != "wrong" else "light"
    btn = {"ask": go_pill("check"), "right": go_pill("next", icon="play"), "wrong": go_pill("got it")}[state]
    body = head(4, True, hearts) + scr(top, 210) + silk("answer", "tap a pad") + grid
    return phone(mode, body, bottom(key(I["shift"], "hint"), btn))

# 5 · LISTEN AND PICK ──────────────────────────────────────────────────────
def listen():
    import random
    random.seed(7)
    bars = "".join(f'<rect x="{i*4.1:.1f}" y="{40-a:.1f}" width="2.4" height="{2*a:.1f}" rx="1" fill="{"#FF4F9A" if i < 30 else "#3A3A40"}"/>' for i, a in ((i, 6 + 30 * random.random() * (1 if i % 8 < 2 else .45)) for i in range(80)))
    inner = ('<div class="ss">listen · 5 of 7</div><div class="t22" style="margin-top:8px">which sound is the bass?</div>'
             f'<svg width="326" height="80" viewBox="0 0 326 80" aria-hidden="true" style="display:block;margin-top:20px">{bars}<path d="M123 0V80" stroke="#F3F2EF" stroke-width="1.5"/></svg>'
             '<div class="ss" style="margin-top:8px;display:flex;justify-content:space-between"><span>playing · 0:03</span><span>play as many times as you like</span></div>')
    transport = ('<div style="display:flex;justify-content:center;gap:22px;margin-top:6px">'
                 '<div style="width:96px">' + key(I["play"], "play", cap="go") + '</div>'
                 '<div style="width:96px">' + key('<span style="font-size:13px;font-weight:500">½×</span>', "slower") + '</div></div>')
    pads = ('<div class="g" style="grid-template-columns:repeat(3,1fr);gap:10px">'
            + pad('<span style="font-size:22px;font-weight:200">a</span><span>first</span>', None, "Sound a", h=92)
            + pad('<span style="font-size:22px;font-weight:200">b</span><span>second</span>', N["prod"], "Sound b", h=92)
            + pad('<span style="font-size:22px;font-weight:200">c</span><span>third</span>', None, "Sound c", h=92) + '</div>')
    body = head(4, True) + scr(inner, 200) + silk("transport") + transport + silk("pick one", "a · b · c") + pads
    return phone("light", body, bottom(key(I["shift"], "hint"), go_pill("check")))

# 6 · MATCH ────────────────────────────────────────────────────────────────
def match():
    left = [("cutoff", N["fund"]), ("resonance", N["dj"]), ("glide", None), ("envelope", None)]
    right = [("slides between notes", None), ("where the filter starts cutting", N["fund"]), ("a peak at the cutoff", N["dj"]), ("how the sound moves over time", "sel")]
    col = lambda items: "".join(
        pad(t, c if c and c != "sel" else None, h=70, style="font-size:13px;padding:0 10px;text-align:center;line-height:1.3" + (f";box-shadow:inset 0 0 0 2px {N['prod']},inset 0 1.5px 0 var(--hi),0 1px 0 var(--pads),0 2px 0 var(--pads),0 3px 0 var(--pads)" if c == "sel" else ""))
        for t, c in items)
    inner = ('<div class="ss">match · 6 of 7</div><div class="t22" style="margin-top:8px">pair each knob with what it does</div>'
             '<div style="display:flex;gap:6px;margin-top:22px">' + "".join(f'<span style="flex:1;height:6px;border-radius:3px;background:{c}"></span>' for c in (N["fund"], N["dj"], "#2A2A2D", "#2A2A2D")) + '</div>'
             '<div class="ss" style="margin-top:8px">2 of 4 pairs</div>')
    grid = (f'<div style="display:grid;grid-template-columns:1fr 1.4fr;gap:10px">'
            f'<div style="display:flex;flex-direction:column;gap:10px">{col([(t, c if c else ("sel" if t == "envelope" else None)) for t, c in left])}</div>'
            f'<div style="display:flex;flex-direction:column;gap:10px">{col([(t, None if c == "sel" else c) for t, c in right])}</div></div>')
    body = head(5, True) + scr(inner, 150) + silk("knobs", "what they do") + grid
    return phone("dark", body, bottom(key(I["shift"], "hint"), go_pill("check")))

# 7 · ORDER ────────────────────────────────────────────────────────────────
def order():
    chain = [("osc", N["prod"], 1), ("filter", N["lilac"], 2), ("amp", N["fund"], 3), ("out", None, 0)]
    boxes = ""
    x = 6
    for i, (t, c, n) in enumerate(chain):
        filled = n > 0
        boxes += (f'<rect x="{x}" y="22" width="64" height="34" rx="6" fill="none" stroke="{c if filled else "#3A3A40"}" stroke-width="1.6" {"stroke-dasharray=\"4 4\"" if not filled else ""}/>'
                  f'<text x="{x+32}" y="44" text-anchor="middle" font-family="Outfit" font-size="12" fill="{"#F3F2EF" if filled else "#55555A"}">{t if filled else "?"}</text>')
        if i < 3:
            boxes += f'<path d="M{x+66} 39H{x+82}" stroke="#77777B" stroke-width="1.4"/>'
        x += 84
    inner = ('<div class="ss">order · 3 of 7</div><div class="t22" style="margin-top:8px">follow the sound from start to speaker</div>'
             f'<svg width="330" height="70" viewBox="0 0 330 70" aria-hidden="true" style="display:block;margin-top:22px">{boxes}</svg>')
    ks = ""
    for t, c, n in [("amp", N["fund"], 3), ("out", None, 0), ("osc", N["prod"], 1), ("filter", N["lilac"], 2)]:
        leg = f'<span style="font-size:13px;font-weight:500">{t}</span>'
        num = f'<span style="position:absolute;top:8px;left:10px;font-size:11px;font-weight:600;color:{c}">{n}</span>' if n else ""
        ks += (f'<a href="#" class="m" aria-label="{t}">{num}{"<span class=\"dot on\" style=\"--c:" + c + "\"></span>" if c else ""}'
               f'<span class="cap{" blk" if t == "out" else ""}" style="width:62%">{leg}</span></a>')
    body = head(2, True) + scr(inner, 170) + silk("tap in order", "1 · 2 · 3 · 4") + f'<div class="g">{ks}</div>' + f'<div style="margin-top:14px">{fact("The next one is out: where the sound leaves for your speakers.")}</div>'
    return phone("light", body, bottom(key(I["back"], "undo"), go_pill("check")))

# 8 · TYPE THE ANSWER (number pads) ────────────────────────────────────────
def type_answer():
    inner = ('<div class="ss">type it · 6 of 7</div><div class="t22" style="margin-top:8px">what tempo is this loop?</div>'
             '<div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:22px">' + m3.digits("124", 46, N["prod"], 10) +
             '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px"><span class="ss">bpm</span><span class="ss">tap the pads</span></div></div>')
    nums = "".join(pad(f'<span style="font-size:24px;font-weight:200">{n}</span>', N["prod"] if n in ("1", "2", "4") else None, f"Digit {n}", h=62) for n in "1234567890")
    pads = f'<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px">{nums}</div>'
    extra = '<div class="g" style="margin-top:10px;grid-template-columns:1fr 1fr 1fr">' + pad("delete", None, "Delete", 52) + pad("hear again", None, "Hear again", 52) + pad("tap tempo", None, "Tap tempo", 52) + '</div>'
    body = head(5, True) + scr(inner, 190) + silk("number pads", "or tap along") + pads + extra
    return phone("dark", body, bottom(key(I["shift"], "hint"), go_pill("check")))

# 9 · OUT OF HEARTS ────────────────────────────────────────────────────────
def hearts_out():
    inner = ('<div class="ss">flow mode</div><div class="t22" style="margin-top:8px">out of hearts</div>'
             '<div style="display:flex;gap:8px;margin-top:18px">' + "".join('<span style="width:14px;height:14px;border-radius:7px;background:#2A2A2D"></span>' for _ in range(5)) + '</div>'
             '<div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:26px">' + m3.digits("3 59", 34, RED, 8) +
             '<span class="ss">until a heart comes back</span></div>')
    opts = ('<div class="g" style="grid-template-columns:1fr 1fr;gap:10px">'
            + pad('<span style="font-size:15px">practice</span><span style="font-size:11px;font-weight:500">2 min · earn one back</span>', N["prod"], "Practice to earn a heart", h=88)
            + pad('<span style="font-size:15px">free mode</span><span style="font-size:11px;font-weight:500;color:var(--sub)">no hearts, no gates</span>', None, "Switch to free mode", h=88) + '</div>')
    body = head(4, False, 0) + scr(inner, 200) + silk("keep going") + opts + f'<div style="margin-top:14px">{fact("Your track and your progress are safe. Nothing resets.")}</div>'
    return phone("dark", body, bottom(key(I["close"], "leave"), go_pill("practice for a heart")))


def write(name, title, body):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(P.HEAD.format(title=title, css=V.CSS, body=body, w=390, h=844))
    print("wrote", name)


if __name__ == "__main__":
    write("L7Hook.dc.html", "Lesson · hook", hook())
    write("L7Concept.dc.html", "Lesson · concept", concept())
    write("L7Try.dc.html", "Lesson · try it", tryit())
    write("L7Quiz.dc.html", "Lesson · quiz on pads", quiz("ask"))
    write("L7Right.dc.html", "Lesson · right", quiz("right"))
    write("L7Wrong.dc.html", "Lesson · wrong", quiz("wrong"))
    write("L7Listen.dc.html", "Lesson · listen and pick", listen())
    write("L7Match.dc.html", "Lesson · match", match())
    write("L7Order.dc.html", "Lesson · order", order())
    write("L7Type.dc.html", "Lesson · type it", type_answer())
    write("L7Hearts.dc.html", "Lesson · out of hearts", hearts_out())


# 1b · HOOK, contextual ────────────────────────────────────────────────────
def mini_knob_svg(col="#E8418A", rot=-30):
    return (f'<svg width="38" height="38" viewBox="0 0 38 38" aria-hidden="true"><circle cx="19" cy="20" r="16" fill="rgba(0,0,0,.18)"/>'
            '<circle cx="19" cy="19" r="16" fill="url(#kn)"/><circle cx="19" cy="19" r="10" fill="' + col + '"/>'
            f'<rect x="18" y="10" width="2" height="7" rx="1" fill="#fff" transform="rotate({rot} 19 19)"/>'
            '<defs><radialGradient id="kn"><stop offset=".6" stop-color="#D9D7D1"/><stop offset="1" stop-color="#B9B7B0"/></radialGradient></defs></svg>')


def mini_keys_svg():
    w = "".join(f'<rect x="{2+i*7}" y="4" width="6" height="28" rx="2" fill="{"#FF4F9A" if i==5 else "#F6F5F1"}" stroke="#BDBBB4"/>' for i in range(5))
    b = "".join(f'<rect x="{6+i*7}" y="4" width="4" height="16" rx="1.5" fill="#1A1A1C"/>' for i in (0, 1, 3))
    return f'<svg width="40" height="36" viewBox="0 0 40 36" aria-hidden="true">{w}{b}</svg>'


def mini_pads_svg():
    c = ["#FF4F9A", "#E4E3DE", "#E4E3DE", "#E4E3DE"]
    return '<svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">' + "".join(f'<rect x="{2+(i%2)*17}" y="{2+(i//2)*17}" width="15" height="15" rx="3" fill="{c[i]}" stroke="#BDBBB4"/>' for i in range(4)) + '</svg>'


def hook2():
    inner = (f'<img src="{SYNTH}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:url(#duo-prod);opacity:.8">'
             '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.1),rgba(0,0,0,.88))"></div>'
             '<div style="position:absolute;left:18px;right:18px;bottom:16px"><div class="ss">producer 02 · 7 min · +50 xp</div>'
             '<div class="t36" style="margin-top:6px">bass and poli</div>'
             '<div class="ss" style="margin-top:8px;color:#F3F2EF;font-size:13px;line-height:1.4">every track you love sits on a bass line. today you make one.</div></div>')
    learn = [("01", "what a bass line does in a track"), ("02", "how a filter makes bass round or bright"), ("03", "why bass and kick take turns")]
    learn_rows = "".join(f'<div style="display:flex;gap:12px;align-items:baseline;padding:7px 2px;border-top:1px solid var(--line,rgba(0,0,0,.08))"><span class="big" style="font-size:15px;font-weight:300;color:var(--print);width:20px">{n}</span><span style="font-size:15px;line-height:1.35">{t}</span></div>' for n, t in learn)
    rows = [("kick", N["fund"], R.Q, "full"), ("hats", N["fund"], R.E, "full"), ("bass", N["prod"], [(0, 1)], "dash"), ("chords", N["lilac"], R.Q, "full")]
    track = (f'<div class="scr" style="margin-top:0"><div class="scrf" style="padding:12px 14px">'
             f'<div style="display:flex;justify-content:space-between"><span class="ss" style="color:#FF6FAE">+ bass · the line you play</span><span class="ss">fills in as you play</span></div>'
             f'<div style="margin-top:8px">{R.lanes(326, rows, sel=2).replace("font-family=\"Archivo\"", "font-family=\"Outfit\"")}</div></div></div>')
    tools = [(mini_knob_svg(), "filter knob", "round the bass"), (mini_keys_svg(), "keys", "play the bass line"), (mini_pads_svg(), "answer pads", "3 quick questions")]
    tool_mods = "".join(f'<div class="m wide" style="height:94px;flex-direction:column;gap:5px;padding:10px 6px;justify-content:flex-start;padding-top:10px">{svg}'
                        f'<span style="font-size:13px;font-weight:500">{name}</span><span class="t11" style="text-align:center;line-height:1.25">{why}</span></div>' for svg, name, why in tools)
    body = (head(0, True) + scr(inner, 178, "0") + silk("you'll learn") + f'<div>{learn_rows}</div>'
            + silk("adds to your track") + track + silk("you'll use") + f'<div class="g" style="grid-template-columns:repeat(3,1fr)">{tool_mods}</div>')
    return phone("light", body, bottom(key(I["back"], "later"), go_pill("let's go", icon="play")))


if __name__ == "__main__":
    write("L7Hook2.dc.html", "Lesson · hook, contextual", hook2())
