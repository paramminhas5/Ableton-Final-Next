"""JUCE VST3 host state: <VST3PluginState><IComponent>size.base64</IComponent>... in JUCE's own 6-bit encoding."""
import re
T = ".ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+"
def dec(s):
    n, body = s.split(".", 1)
    n = int(n); out = bytearray(n); bit = 0
    for ch in body:
        v = T.index(ch)
        for k in range(6):
            if bit < n * 8 and (v >> k) & 1: out[bit >> 3] |= 1 << (bit & 7)
            bit += 1
    return bytes(out)
def enc(b):
    n = len(b); nbits = n * 8; chars = []
    for i in range(0, nbits, 6):
        v = 0
        for k in range(6):
            j = i + k
            if j < nbits and (b[j >> 3] >> (j & 7)) & 1: v |= 1 << k
        chars.append(T[v])
    return f"{n}." + "".join(chars)
def split(st):
    """raw_state -> (prefix bytes, xml str)"""
    i = st.find(b"<?xml"); return st[:i], st[i:].decode("utf-8", "replace")
def component(st):
    pre, x = split(st)
    m = re.search(r"<IComponent>(.*?)</IComponent>", x, re.S)
    return dec(m.group(1).strip())
def with_component(st, comp):
    pre, x = split(st)
    x2 = re.sub(r"<IComponent>(.*?)</IComponent>", lambda m: "<IComponent>" + enc(comp) + "</IComponent>", x, flags=re.S)
    b = x2.encode()
    # the VST3 wrapper prefix: 'VC2!' + little-endian size of the xml
    if pre[:4] == b"VC2!":
        pre = b"VC2!" + len(b).to_bytes(4, "little")
    return pre + b

def surge_xml(p, values):
    """Write values straight into Surge's patch xml in the plugin state (for knobs Surge only applies on
    its message thread, such as the filter type, which a headless host never runs)."""
    st = p.raw_state
    c = component(st)
    xs = int.from_bytes(c[4:8], "little")
    head, xml, tail = c[:32], c[32:32 + xs].decode("latin1"), c[32 + xs:]
    for k, v in values.items():
        if k == "activate":
            for name in v:
                xml = re.sub(rf'(<{name} [^>]*?)deactivated="1"', r'\g<1>deactivated="0"', xml)
            continue
        xml, n = re.subn(rf'(<{k} type="\d+" value=")[^"]*(")', rf"\g<1>{v}\g<2>", xml)
        assert n == 1, (k, n)
    xb = xml.encode("latin1")
    c2 = head[:4] + len(xb).to_bytes(4, "little") + head[8:] + xb + tail
    p.raw_state = with_component(st, c2)

def xml_attrs(p, values):
    """Set attributes anywhere in a JUCE ValueTree state (Odin 2 keeps its osc and filter types there)."""
    st = p.raw_state
    c = component(st)
    i = c.find(b"<?xml")
    head, xml = c[:i], c[i:].decode("latin1")
    for k, v in values.items():
        xml, n = re.subn(rf'(\s{k}=")[^"]*(")', rf"\g<1>{v}\g<2>", xml)
        assert n >= 1, (k, n)
    xb = xml.encode("latin1")
    if head[:4] == b"VC2!":
        head = b"VC2!" + len(xb).to_bytes(4, "little")
    p.raw_state = with_component(st, head + xb)
