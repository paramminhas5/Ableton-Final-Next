#!/usr/bin/env python3
"""Three CCD-own style options, each shown as Today (light) and Studio (dark)."""
import os, math
import gen_model as A

OUT = A.OUT
CAT, SYNTH, I, LED = A.CAT, A.SYNTH, A.I, A.LED


def write(name, title, css, body, fonts):
    html = A.HEAD.replace('<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..800&amp;display=swap" rel="stylesheet">', fonts)
    with open(os.path.join(OUT, name), "w") as f:
        f.write(html.format(title=title, css=css, body=body, w=390, h=844))
    print("wrote", name)

# ═══════════════════════════════ B · VINYL ═════════════════════════════════
B_CSS = r"""
body{margin:0}
.dev{font-family:"Manrope",system-ui,sans-serif;-webkit-font-smoothing:antialiased;color:var(--ink)}
.light{--panel:#EFEDE8;--panel2:#E6E4DE;--face1:#FBFAF7;--face2:#ECEAE4;--sh:rgba(60,52,40,.20);--ink:#17171A;--sub:#6A6862;--ledoff:#D2D0CA;--cap1:#FFFFFF;--cap2:#E2E0DA;--line:rgba(0,0,0,.08);--vinyl:#141416;--groove:#1E1E21}
.dark{--panel:#131722;--panel2:#0E111A;--face1:#232A3B;--face2:#1A2030;--sh:rgba(0,0,0,.6);--ink:#ECEEF4;--sub:#9AA1B5;--ledoff:#2C3346;--cap1:#36405A;--cap2:#232A3C;--line:rgba(255,255,255,.08);--vinyl:#07080B;--groove:#121520}
.pan{background:linear-gradient(180deg,var(--panel),var(--panel2))}
.t{font-weight:800;letter-spacing:-.03em;line-height:1}
.pk{position:relative;display:flex;align-items:center;justify-content:center;gap:8px;border-radius:999px;background:linear-gradient(180deg,var(--face1),var(--face2));box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 2px 0 var(--sh),0 8px 14px -6px var(--sh);color:var(--ink);text-decoration:none;font-size:14px;font-weight:700;transition:transform 70ms}
.pk:active{transform:translateY(2px)}
.pk.go{background:linear-gradient(180deg,#F0559A,#D2307A);color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.4),0 2px 0 #9A1F57,0 10px 18px -6px rgba(210,48,122,.5)}
.pk.sel{box-shadow:inset 0 0 0 2px var(--c),0 0 14px -2px var(--c),0 2px 0 var(--sh)}
.ring{width:10px;height:10px;border-radius:50%;box-shadow:0 0 0 2px var(--c),0 0 8px var(--c)}
.lbl{font-size:12px;font-weight:700;color:var(--sub);letter-spacing:.02em}
.chip{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:15px;background:var(--face2);font-size:13px;font-weight:700}
svg.i{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ks{font-size:11px;font-weight:600;color:var(--sub)}.kw{font-size:12px;font-weight:700}
"""
B_FONTS = '<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&amp;display=swap" rel="stylesheet">'


def record(size, rings, sel=None, center_color="#D2307A", needle=True):
    """rings: list of (name, color, steps[16 bools] or 'empty')"""
    c = size / 2
    s = [f'<svg width="{size}" height="{size}" viewBox="0 0 {size} {size}" aria-hidden="true">',
         f'<circle cx="{c}" cy="{c+3}" r="{c-2}" fill="rgba(0,0,0,.25)"/>',
         f'<circle cx="{c}" cy="{c}" r="{c-2}" fill="var(--vinyl)"/>']
    for r in range(int(c * 0.36), int(c - 6), 3):
        s.append(f'<circle cx="{c}" cy="{c}" r="{r}" fill="none" stroke="var(--groove)" stroke-width="1"/>')
    n = len(rings)
    r_out, r_in = c - 14, c * 0.42
    for i, (name, col, steps) in enumerate(rings):
        r = r_out - i * (r_out - r_in) / max(1, n - 1) if n > 1 else r_out
        if steps == "empty":
            s.append(f'<circle cx="{c}" cy="{c}" r="{r:.1f}" fill="none" stroke="{col}" stroke-width="2" stroke-dasharray="3 6" opacity=".9"/>')
            continue
        op = 1 if sel is None or sel == i else .45
        w = 7 if sel == i else 5
        for k, on in enumerate(steps):
            if not on: continue
            a0 = -90 + k * 22.5 + 2.5; a1 = a0 + 17.5
            x0, y0 = c + r * math.cos(math.radians(a0)), c + r * math.sin(math.radians(a0))
            x1, y1 = c + r * math.cos(math.radians(a1)), c + r * math.sin(math.radians(a1))
            s.append(f'<path d="M{x0:.1f} {y0:.1f}A{r:.1f} {r:.1f} 0 0 1 {x1:.1f} {y1:.1f}" stroke="{col}" stroke-width="{w}" stroke-linecap="round" fill="none" opacity="{op}" style="filter:drop-shadow(0 0 3px {col})"/>')
    lr = c * 0.3
    s.append(f'<circle cx="{c}" cy="{c}" r="{lr:.1f}" fill="{center_color}"/>')
    s.append(f'<image href="{CAT}" x="{c-lr*0.72:.1f}" y="{c-lr*0.56:.1f}" width="{lr*1.44:.1f}" height="{lr*1.08:.1f}"/>')
    s.append(f'<circle cx="{c}" cy="{c}" r="3" fill="var(--vinyl)"/>')
    if needle:
        s.append(f'<path d="M{c} {c-r_out-10}v14" stroke="#F3F2EF" stroke-width="2" stroke-linecap="round"/>')
    s.append("</svg>")
    return "".join(s)


def st(p): return [ch == "x" for ch in p]
KICK, HATS, BASS, CHORD = st("x...x...x...x..."), st("..x...x...x...x."), st("x..x..x.x..x..x."), st("x...x...x...x...")


def b_knob(color, label, value, frac, size=48):
    return A.knob(color, label, value, frac, size)


def b_nav(active):
    out = ""
    for n in ["learn", "practice", "studio", "library"]:
        on = n == active
        out += (f'<a href="#" class="pk{" sel" if on else ""}" style="--c:#FF4F9A;height:54px;flex-direction:column;gap:3px;border-radius:18px">{I[n]}<span class="kw">{n}</span></a>')
    return f'<nav style="position:absolute;left:16px;right:16px;bottom:24px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px">{out}</nav>'


def b_today():
    rings = [("kick", LED["fund"], KICK), ("hats", LED["fund"], HATS), ("bass", LED["prod"], "empty"), ("chords", LED["lilac"], CHORD)]
    legend = "".join(f'<div style="display:flex;align-items:center;gap:8px"><span class="ring" style="--c:{c}"></span><span style="font-size:13px;font-weight:700">{n}</span>{"<span class=ks>add it</span>" if s=="empty" else ""}</div>' for n, c, s in rings)
    body = ('<div style="display:flex;align-items:center;justify-content:space-between;height:44px">'
            '<span class="t" style="font-size:20px">ccd school</span>'
            f'<div style="display:flex;gap:6px"><span class="chip">340 xp</span><span class="chip">{I["flame"]}4</span></div></div>'
            '<div style="display:flex;align-items:center;gap:14px;margin-top:10px">'
            f'{record(214, rings)}'
            f'<div style="display:flex;flex-direction:column;gap:10px"><div class="lbl">your record</div><div class="t" style="font-size:28px">3 layers</div>{legend}</div></div>'
            '<div class="pk" style="margin-top:18px;height:86px;border-radius:24px;justify-content:flex-start;padding:0 12px;gap:12px">'
            f'<img src="{SYNTH}" alt="" style="width:62px;height:62px;border-radius:50%;object-fit:cover">'
            '<div style="flex:1"><div class="ks">next · producer 02</div><div class="t" style="font-size:20px;margin-top:3px">Bass and Poli</div>'
            '<div class="ks" style="color:#C42A70;margin-top:3px">adds a bass ring</div></div></div>'
            '<div style="display:grid;grid-template-columns:1fr 2fr;gap:8px;margin-top:10px">'
            f'<a class="pk" style="height:58px">{I["hear"]}spin it</a><a class="pk go" style="height:58px;font-size:16px">{I["play"]}start lesson</a></div>'
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);justify-items:center;margin-top:14px">'
            + b_knob(LED["fund"], "basics", "5 / 40", .125) + b_knob(LED["dj"], "dj", "1 / 40", .05)
            + b_knob(LED["prod"], "producer", "1 / 91", .02) + b_knob("#17171A", "today", "20 / 50", .4) + '</div>')
    return f'<div class="dev light pan" style="width:390px;height:844px;position:relative;overflow:hidden"><div style="padding:12px 16px 0">{body}</div>{b_nav("learn")}</div>'


def b_studio():
    rings = [("kick", LED["fund"], KICK), ("hats", LED["fund"], HATS), ("bass", LED["prod"], BASS), ("chords", LED["lilac"], CHORD)]
    layers = "".join(f'<a class="pk{" sel" if i==2 else ""}" style="--c:{c};height:48px;font-size:13px"><span class="ring" style="--c:{c};width:8px;height:8px"></span>{n}</a>' for i, (n, c, _) in enumerate(rings))
    body = ('<div style="display:flex;align-items:center;justify-content:space-between;height:44px">'
            '<span class="t" style="font-size:24px">studio</span><span class="lbl">4 layers · 120 bpm</span></div>'
            f'<div style="display:flex;justify-content:center;margin-top:4px;position:relative">{record(270, rings, sel=2)}'
            '<div style="position:absolute;right:0;top:6px;text-align:right"><div class="ks">editing</div><div class="t" style="font-size:22px;color:#FF5AA3">bass</div></div></div>'
            f'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px">{layers}</div>'
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);justify-items:center;margin-top:12px">'
            + b_knob(LED["prod"], "cutoff", "62%", .62) + b_knob(LED["prod"], "res", "30%", .3) + b_knob(LED["prod"], "glide", "15%", .15) + b_knob(LED["prod"], "level", "75%", .75) + '</div>'
            '<div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:8px;margin-top:12px">'
            f'<a class="pk go" style="height:54px;font-size:15px">{I["play"]}play</a><a class="pk" style="height:54px">{I["plus"]}</a><a class="pk" style="height:54px">{I["out"]}</a></div>')
    return f'<div class="dev dark pan" style="width:390px;height:844px;position:relative;overflow:hidden"><div style="padding:12px 16px 0">{body}</div>{b_nav("studio")}</div>'

# ═══════════════════════════════ C · LINE ══════════════════════════════════
C_CSS = r"""
body{margin:0}
.dev{font-family:"Archivo",system-ui,sans-serif;-webkit-font-smoothing:antialiased;color:var(--ink)}
.light{--paper:#FAFAF5;--dots:rgba(0,0,0,.09);--ink:#141416;--sub:#5E5D58;--key:#FFFFFF;--lcd:#DDE3DA;--lcdink:#141416;--lcdsub:#55604F;--ledoff:#E2E1DA}
.dark{--paper:#151517;--dots:rgba(255,255,255,.07);--ink:#EDEBE4;--sub:#A3A29C;--key:#1D1D20;--lcd:#07120E;--lcdink:#4FE3B6;--lcdsub:#2E8A6C;--ledoff:#2B2B2F}
.pan{background-color:var(--paper);background-image:radial-gradient(circle,var(--dots) 1px,transparent 1.3px);background-size:16px 16px}
.cond{font-stretch:68%;font-weight:800;text-transform:uppercase;line-height:.9;letter-spacing:0}
.mono{font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.02em}
.lk{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;border:1.5px solid var(--ink);border-radius:12px;background:var(--key);box-shadow:0 3px 0 0 var(--ink);color:var(--ink);text-decoration:none;transition:transform 60ms,box-shadow 60ms}
.lk:active{transform:translateY(3px);box-shadow:0 0 0 0 var(--ink)}
.lk.go{background:#E8418A;color:#fff}
.lk.sel{background:var(--ink);color:var(--paper)}
.led{position:absolute;top:7px;right:7px;width:7px;height:7px;border-radius:50%;border:1.5px solid var(--ink);background:var(--ledoff)}
.led.on{background:var(--c)}
.lcd{border:1.5px solid var(--ink);border-radius:14px;background:var(--lcd);color:var(--lcdink);box-shadow:0 3px 0 0 var(--ink),inset 0 0 0 5px var(--paper),inset 0 0 0 6.5px var(--ink);padding:20px 22px;position:relative;overflow:hidden}
.lsub{color:var(--lcdsub)}
svg.i{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.kw{font-size:12px;font-weight:700}
"""
C_FONTS = '<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&amp;family=JetBrains+Mono:wght@500&amp;display=swap" rel="stylesheet">'


def c_knob(color, label, value, frac, size=44):
    W = size + 22; c = W / 2; r = size / 2
    ticks = ""
    for i in range(11):
        a = math.radians(135 + i * 27)
        on = i / 10 <= frac + 1e-6 and frac > 0
        x0, y0 = c + (r + 4) * math.cos(a), c + (r + 4) * math.sin(a)
        x1, y1 = c + (r + 9) * math.cos(a), c + (r + 9) * math.sin(a)
        ticks += f'<path d="M{x0:.1f} {y0:.1f}L{x1:.1f} {y1:.1f}" stroke="var(--ink)" stroke-width="{2.2 if on else 1}" opacity="{1 if on else .35}" stroke-linecap="round"/>'
    a = math.radians(135 + 270 * frac)
    px, py = c + (r - 6) * math.cos(a), c + (r - 6) * math.sin(a)
    svg = (f'<svg width="{W}" height="{W}" viewBox="0 0 {W} {W}" aria-hidden="true">{ticks}'
           f'<circle cx="{c}" cy="{c+3}" r="{r}" fill="var(--ink)"/><circle cx="{c}" cy="{c}" r="{r}" fill="{color}" stroke="var(--ink)" stroke-width="1.5"/>'
           f'<path d="M{c} {c}L{px:.1f} {py:.1f}" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round"/></svg>')
    return f'<div style="display:flex;flex-direction:column;align-items:center;gap:1px">{svg}<span class="kw">{label}</span><span class="mono" style="color:var(--sub)">{value}</span></div>'


def c_lanes(w, rows, sel=None):
    lh, gap, nameW = 16, 8, 56
    h = len(rows) * (lh + gap)
    s = [f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" aria-hidden="true" style="display:block">']
    for i, (name, col, segs, kind) in enumerate(rows):
        y = i * (lh + gap)
        s.append(f'<text x="0" y="{y+12}" font-family="JetBrains Mono" font-size="11" fill="currentColor">{name}</text>')
        for a, b in segs:
            xa, xb = nameW + (w - nameW) * a + 1.5, nameW + (w - nameW) * b - 1.5
            if kind == "dash":
                s.append(f'<rect x="{xa:.1f}" y="{y+.75}" width="{xb-xa:.1f}" height="{lh-1.5}" rx="3" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3"/>')
            else:
                s.append(f'<rect x="{xa:.1f}" y="{y}" width="{xb-xa:.1f}" height="{lh}" rx="3" fill="{col}" stroke="var(--lcdink)" stroke-width="{2 if sel==i else 1.2}"/>')
        if kind == "dash":
            s.append(f'<text x="{(nameW+w)/2}" y="{y+12}" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="currentColor">+ from a lesson</text>')
    s.append("</svg>")
    return "".join(s)


def c_nav(active):
    out = ""
    for n in ["learn", "practice", "studio", "library"]:
        on = n == active
        out += f'<a href="#" class="lk{" sel" if on else ""}" style="height:58px">{I[n]}<span class="kw">{n}</span></a>'
    return f'<nav style="position:absolute;left:16px;right:16px;bottom:26px;display:grid;grid-template-columns:repeat(4,1fr);gap:9px">{out}</nav>'


def c_today():
    Q, E = A.Q, A.E
    rows = [("kick", LED["fund"], Q, "full"), ("hats", LED["fund"], E, "full"), ("bass", "", [(0, 1)], "dash"), ("chords", LED["lilac"], Q, "full")]
    body = ('<div style="display:flex;align-items:center;justify-content:space-between;height:44px">'
            '<div style="display:flex;align-items:center;gap:8px"><img src="/_blob/6cb473e03d86e151b5e534529d518ad5" alt="" style="width:34px;filter:invert(1) contrast(2)"><span class="cond" style="font-size:24px">ccd school</span></div>'
            '<span class="mono">340 xp · 4 day streak</span></div>'
            '<div class="lcd" style="margin-top:10px;height:236px">'
            '<div class="mono lsub">your track</div><div class="cond" style="font-size:40px;margin-top:4px">3 layers</div>'
            '<div class="mono lsub" style="margin-top:4px">120 bpm</div>'
            f'<div style="margin-top:18px">{c_lanes(300, rows)}</div></div>'
            '<div class="lk" style="margin-top:18px;flex-direction:row;justify-content:flex-start;gap:12px;padding:10px;height:auto">'
            f'<img src="{SYNTH}" alt="" style="width:60px;height:60px;border-radius:8px;border:1.5px solid var(--ink);object-fit:cover;filter:grayscale(.2)">'
            '<div><div class="mono" style="color:var(--sub)">next · producer 02</div><div class="cond" style="font-size:26px;margin-top:3px">bass and poli</div>'
            '<div class="mono" style="margin-top:3px;color:#C42A70">adds bass</div></div></div>'
            '<div style="display:grid;grid-template-columns:1fr 2fr;gap:9px;margin-top:12px">'
            f'<a class="lk" style="height:58px">{I["hear"]}<span class="kw">hear track</span></a>'
            f'<a class="lk go" style="height:58px;flex-direction:row;gap:8px">{I["play"]}<span class="kw" style="font-size:16px">start lesson</span></a></div>'
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);justify-items:center;margin-top:14px">'
            + c_knob(LED["fund"], "basics", "05/40", .125) + c_knob(LED["dj"], "dj", "01/40", .05) + c_knob(LED["prod"], "producer", "01/91", .02) + c_knob("#FAFAF5", "today", "20/50", .4) + '</div>')
    return f'<div class="dev light pan" style="width:390px;height:844px;position:relative;overflow:hidden"><div style="padding:12px 16px 0">{body}</div>{c_nav("learn")}</div>'


def c_studio():
    Q, E = A.Q, A.E
    rows = [("kick", LED["fund"], Q, "full"), ("hats", LED["fund"], E, "full"), ("bass", LED["prod"], E, "full"), ("chords", LED["lilac"], Q, "full")]
    layers = "".join(f'<a class="lk{" sel" if i==2 else ""}" style="height:60px"><span class="led on" style="--c:{c}"></span><span class="cond" style="font-size:22px">{i+1}</span><span class="kw">{n}</span></a>' for i, (n, c, _, _) in enumerate(rows))
    body = ('<div style="display:flex;align-items:center;justify-content:space-between;height:44px">'
            '<span class="cond" style="font-size:28px">studio</span><span class="mono">4 layers · 120 bpm</span></div>'
            '<div class="lcd" style="margin-top:8px;height:226px">'
            '<div style="display:flex;justify-content:space-between"><div><div class="mono lsub">editing</div><div class="cond" style="font-size:34px;margin-top:3px">bass</div></div>'
            '<div style="text-align:right"><div class="mono lsub">cutoff</div><div class="cond" style="font-size:34px;margin-top:3px">62%</div></div></div>'
            f'<div style="margin-top:20px">{c_lanes(300, rows, sel=2)}</div></div>'
            f'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:16px">{layers}</div>'
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);justify-items:center;margin-top:12px">'
            + c_knob(LED["prod"], "cutoff", "62%", .62) + c_knob(LED["prod"], "res", "30%", .3) + c_knob(LED["prod"], "glide", "15%", .15) + c_knob(LED["prod"], "level", "75%", .75) + '</div>'
            '<div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:9px;margin-top:12px">'
            f'<a class="lk go" style="height:54px;flex-direction:row;gap:8px">{I["play"]}<span class="kw" style="font-size:15px">play</span></a><a class="lk" style="height:54px">{I["plus"]}<span class="kw">layer</span></a><a class="lk" style="height:54px">{I["out"]}<span class="kw">to live</span></a></div>')
    return f'<div class="dev dark pan" style="width:390px;height:844px;position:relative;overflow:hidden"><div style="padding:12px 16px 0">{body}</div>{c_nav("studio")}</div>'


if __name__ == "__main__":
    write("OptA_Today.dc.html", "A · Notch · Today", A.CSS, A.today("light"), A.HEAD.split("<style>")[0].split("<helmet>\n")[1].strip())
    write("OptA_Studio.dc.html", "A · Notch · Studio", A.CSS, A.studio(), A.HEAD.split("<style>")[0].split("<helmet>\n")[1].strip())
    write("OptB_Today.dc.html", "B · Vinyl · Today", B_CSS, b_today(), B_FONTS)
    write("OptB_Studio.dc.html", "B · Vinyl · Studio", B_CSS, b_studio(), B_FONTS)
    write("OptC_Today.dc.html", "C · Line · Today", C_CSS, c_today(), C_FONTS)
    write("OptC_Studio.dc.html", "C · Line · Studio", C_CSS, c_studio(), C_FONTS)
