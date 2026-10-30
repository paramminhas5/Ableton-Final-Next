/**
 * A tiny streaming reader for Live's XML. Live writes one tag per line, with
 * values in attributes, so a line scanner is enough and keeps memory flat even
 * for very large Sets. Not a general XML parser: no text nodes, no CDATA.
 */

export type Attrs = Record<string, string>;

export interface XmlHandler {
  open(path: string[], attrs: Attrs): void;
  close(path: string[]): void;
}

const TAG = /^<(\/)?([A-Za-z_][\w.:-]*)((?:\s+[\w.:-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/)?>$/;
const ATTR = /([\w.:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

const ENT: Record<string, string> = { "&quot;": '"', "&apos;": "'", "&lt;": "<", "&gt;": ">", "&amp;": "&", "&#10;": "\n", "&#13;": "\r", "&#9;": "\t" };
const unescape = (s: string) => (s.includes("&") ? s.replace(/&(?:quot|apos|lt|gt|amp|#10|#13|#9);/g, (m) => ENT[m]) : s);

export function parseAttrs(raw: string): Attrs {
  const out: Attrs = {};
  if (!raw) return out;
  ATTR.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ATTR.exec(raw))) out[m[1]] = unescape(m[2] ?? m[3] ?? "");
  return out;
}

export class XmlScanner {
  private path: string[] = [];
  private carry = "";
  private pending = "";
  bytes = 0;

  constructor(
    private h: XmlHandler,
    private maxDepth: number,
    private onDepth: () => never,
  ) {}

  /** Feed decoded text; may end mid-line. */
  push(text: string) {
    const data = this.carry + text;
    const lines = data.split("\n");
    this.carry = lines.pop() ?? "";
    for (const line of lines) this.line(line);
  }

  end() {
    if (this.carry) this.line(this.carry);
    this.carry = "";
  }

  private line(raw: string) {
    let s = raw.trim();
    if (this.pending) {
      // a tag whose attribute value held a newline: keep gluing until it closes
      s = this.pending + "\n" + s;
      this.pending = "";
    }
    if (!s || s.charCodeAt(0) !== 60 /* < */) return;
    if (s.startsWith("<?") || s.startsWith("<!")) return;
    if (!s.endsWith(">")) {
      this.pending = s;
      return;
    }
    const m = TAG.exec(s);
    if (!m) {
      // `>` inside a value on a multi-line attribute: treat as still open
      this.pending = s;
      return;
    }
    const [, closing, tag, rawAttrs, selfClose] = m;
    if (closing) {
      this.path.pop();
      this.h.close(this.path.concat(tag));
      return;
    }
    this.path.push(tag);
    if (this.path.length > this.maxDepth) this.onDepth();
    this.h.open(this.path, parseAttrs(rawAttrs));
    if (selfClose) {
      this.h.close(this.path.slice());
      this.path.pop();
    }
  }
}
