/**
 * Static SVG figure builders — used at CONTENT AUTHORING time to compose
 * diagrams as data (no runtime dependency on chart libraries).
 *
 * Every builder returns a complete `<svg>` string. Figures use `currentColor`
 * for strokes and labels so they adapt to light/dark themes automatically,
 * plus a violet accent ramp that reads on both backgrounds.
 */

const VIOLET = "#7c3aed";
const VIOLET_SOFT = "rgba(124, 58, 237, 0.18)";
const SKY = "#0ea5e9";
const EMERALD = "#059669";
const AMBER = "#d97706";
const RED = "#dc2626";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function label(x: number, y: number, text: string, opts: { size?: number; anchor?: string; fill?: string; weight?: number; italic?: boolean } = {}): string {
  const { size = 14, anchor = "middle", fill = "currentColor", weight = 400, italic = false } = opts;
  return `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" fill="${fill}" font-weight="${weight}"${italic ? ' font-style="italic"' : ""}>${esc(text)}</text>`;
}

function svgWrap(viewBox: string, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" style="width:100%;height:auto;display:block">${body}</svg>`;
}

// ---------------------------------------------------------------------------
// Number line
// ---------------------------------------------------------------------------

export interface NumberLineOpts {
  min: number;
  max: number;
  /** Tick values to label (defaults to every integer if range ≤ 20). */
  ticks?: number[];
  /** Marked points, in order given. */
  marks?: { at: number; label: string; color?: string }[];
  /** Shade between two values (an interval). */
  shade?: { from: number; to: number; color?: string };
  width?: number;
  height?: number;
}

export function numberline(o: NumberLineOpts): string {
  const W = o.width ?? 560;
  const H = o.height ?? 110;
  const pad = 46;
  const y = H * 0.55;
  const span = o.max - o.min;
  const toX = (v: number) => pad + ((v - o.min) / span) * (W - 2 * pad);

  const ticks =
    o.ticks ??
    (span <= 20
      ? Array.from({ length: span + 1 }, (_, i) => o.min + i)
      : Array.from({ length: 11 }, (_, i) => o.min + (span / 10) * i));

  let body = "";
  if (o.shade) {
    const x1 = toX(Math.min(o.shade.from, o.shade.to));
    const x2 = toX(Math.max(o.shade.from, o.shade.to));
    body += `<rect x="${x1}" y="${y - 13}" width="${Math.max(x2 - x1, 2)}" height="26" fill="${o.shade.color ?? VIOLET_SOFT}"/>`;
  }
  body += `<line x1="${pad - 18}" y1="${y}" x2="${W - pad + 18}" y2="${y}" stroke="currentColor" stroke-width="1.75" marker-end="url(#nl-arrow)"/>`;
  body += `<defs><marker id="nl-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>`;
  for (const t of ticks) {
    const x = toX(t);
    body += `<line x1="${x}" y1="${y - 5}" x2="${x}" y2="${y + 5}" stroke="currentColor" stroke-width="1.25"/>`;
    const text = Number.isInteger(t) ? String(t) : String(Number(t.toFixed(2)));
    body += label(x, y + 24, text, { size: 12.5, fill: "currentColor", anchor: "middle" });
  }
  (o.marks ?? []).forEach((m, i) => {
    const x = toX(m.at);
    const above = i % 2 === 0;
    const color = m.color ?? VIOLET;
    const ly = above ? y - 16 : y - 16;
    body += `<line x1="${x}" y1="${y - (above ? 26 : 26)}" x2="${x}" y2="${y}" stroke="${color}" stroke-width="1.5" stroke-dasharray="3 3"/>`;
    body += `<circle cx="${x}" cy="${y}" r="5" fill="${color}"/>`;
    body += label(x, ly - 4, m.label, { size: 13, fill: color, weight: 600 });
  });
  return svgWrap(`0 0 ${W} ${H}`, body);
}

// ---------------------------------------------------------------------------
// Fraction pie
// ---------------------------------------------------------------------------

export function fractionPie(num: number, den: number, opts: { captionValue?: string } = {}): string {
  const filled = Math.min(Math.max(num, 0), den);
  const cx = 140;
  const cy = 130;
  const r = 100;
  let body = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="1.75"/>`;
  const startAngle = -Math.PI / 2;
  for (let i = 0; i < den; i++) {
    const a0 = startAngle + (i / den) * Math.PI * 2;
    const a1 = startAngle + ((i + 1) / den) * Math.PI * 2;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    body += `<line x1="${cx}" y1="${cy}" x2="${x0}" y2="${y0}" stroke="currentColor" stroke-width="1" opacity="0.55"/>`;
    if (i < filled) {
      const large = a1 - a0 > Math.PI ? 1 : 0;
      body += `<path d="M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z" fill="${VIOLET_SOFT}" stroke="${VIOLET}" stroke-width="1.25"/>`;
    }
  }
  body += label(cx, cy + r + 34, opts.captionValue ?? `${num} of ${den} parts shaded`, { size: 15 });
  return svgWrap("0 0 280 270", body);
}

// ---------------------------------------------------------------------------
// Bar model (ratios, comparisons)
// ---------------------------------------------------------------------------

export function barModel(bars: { value: number; label: string; color?: string; caption?: string }[]): string {
  const W = 560;
  const rowH = 44;
  const gap = 18;
  const H = bars.length * (rowH + gap) + 18;
  const maxV = Math.max(...bars.map((b) => b.value), 1);
  const left = 150;
  const right = W - 40;
  let body = "";
  bars.forEach((b, i) => {
    const y = 14 + i * (rowH + gap);
    const w = ((right - left) * b.value) / maxV;
    const color = b.color ?? VIOLET;
    body += label(left - 12, y + rowH / 2 + 5, b.label, { size: 14, anchor: "end", weight: 500 });
    body += `<rect x="${left}" y="${y}" width="${right - left}" height="${rowH}" rx="6" fill="rgba(127,127,127,0.12)"/>`;
    body += `<rect x="${left}" y="${y}" width="${w}" height="${rowH}" rx="6" fill="${color}" opacity="0.82"/>`;
    body += label(left + w + 10, y + rowH / 2 + 5, b.caption ?? String(b.value), { size: 13.5, anchor: "start", weight: 600, fill: color });
  });
  return svgWrap(`0 0 ${W} ${H}`, body);
}

// ---------------------------------------------------------------------------
// Area model grid (fraction multiplication, distribution)
// ---------------------------------------------------------------------------

export function areaGrid(rows: number, cols: number, shadeRows: number, shadeCols: number, opts: { labels?: [string, string] } = {}): string {
  const size = 34;
  const gap = 0;
  const gridW = cols * (size + gap);
  const gridH = rows * (size + gap);
  const offX = 70;
  const offY = 50;
  let body = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = offX + c * (size + gap);
      const y = offY + r * (size + gap);
      const isShaded = r < shadeRows && c < shadeCols;
      const isRowBand = r < shadeRows;
      const isColBand = c < shadeCols;
      let fill = "rgba(127,127,127,0.10)";
      if (isShaded) fill = "rgba(124, 58, 237, 0.55)";
      else if (isRowBand) fill = "rgba(124, 58, 237, 0.20)";
      else if (isColBand) fill = "rgba(14, 165, 233, 0.20)";
      body += `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${fill}" stroke="currentColor" stroke-width="1"/>`;
    }
  }
  const [rl, cl] = opts.labels ?? ["rows", "columns"];
  body += label(offX + gridW / 2, offY - 14, cl, { size: 13.5, fill: SKY, weight: 600 });
  body += label(offX - 18, offY + gridH / 2, rl, { size: 13.5, fill: VIOLET, weight: 600, anchor: "end" });
  return svgWrap(`0 0 ${offX * 2 + gridW} ${offY + gridH + 16}`, body);
}

// ---------------------------------------------------------------------------
// Right triangle (Pythagoras, trigonometry ratios)
// ---------------------------------------------------------------------------

export function rightTriangle(opts: { a?: string; b?: string; c?: string; angleLabel?: string; rightAngleAt?: "c" | "a" | "b" } = {}): string {
  const a = opts.a ?? "a";
  const b = opts.b ?? "b";
  const c = opts.c ?? "hypotenuse";
  const ax = 90;
  const ay = 250;
  const bx = 470;
  const by = 250;
  const cx = 90;
  const cy = 70;
  let body = `<polygon points="${ax},${ay} ${bx},${by} ${cx},${cy}" fill="rgba(124,58,237,0.10)" stroke="currentColor" stroke-width="2"/>`;
  // right-angle square at the corner between a and b (vertex A)
  body += `<rect x="${ax}" y="${ay - 22}" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.25"/>`;
  // angle arc at C (top vertex)
  body += `<path d="M ${ax + 34} ${cy + 26} A 44 44 0 0 1 ${ax + 8} ${cy + 52}" fill="none" stroke="${AMBER}" stroke-width="1.5"/>`;
  body += label(ax + 52, cy + 34, opts.angleLabel ?? "θ", { size: 16, fill: AMBER, weight: 600, italic: true });
  // side labels
  body += label((ax + bx) / 2, ay + 30, b, { size: 15.5, weight: 600, italic: true, fill: SKY });
  body += label(ax - 22, (ay + cy) / 2, a, { size: 15.5, weight: 600, italic: true, fill: VIOLET, anchor: "end" });
  body += label((ax + bx) / 2 + 46, (ay + cy) / 2 - 6, c, { size: 15.5, weight: 600, italic: true, fill: EMERALD });
  return svgWrap("0 0 560 300", body);
}

// ---------------------------------------------------------------------------
// Balance scale (equations)
// ---------------------------------------------------------------------------

export function balanceScale(left: string, right: string, balanced = true): string {
  const W = 560;
  const H = 210;
  const cx = W / 2;
  const tilt = balanced ? 0 : 6;
  let body = "";
  body += `<line x1="60" y1="70" x2="${W - 60}" y2="70" stroke="currentColor" stroke-width="3" transform="rotate(${tilt} ${cx} 70)"/>`;
  body += `<line x1="${cx}" y1="70" x2="${cx}" y2="168" stroke="currentColor" stroke-width="4"/>`;
  body += `<path d="M ${cx - 46} 172 L ${cx + 46} 172 L ${cx + 30} 186 L ${cx - 30} 186 Z" fill="rgba(127,127,127,0.35)" stroke="currentColor" stroke-width="1.5"/>`;
  body += `<circle cx="${cx}" cy="70" r="7" fill="${VIOLET}"/>`;
  // pans
  const panY = 118;
  body += `<line x1="120" y1="70" x2="120" y2="${panY}" stroke="currentColor" stroke-width="1.5"/>`;
  body += `<path d="M 70 ${panY} L 170 ${panY} L 145 ${panY + 16} L 95 ${panY + 16} Z" fill="rgba(127,127,127,0.18)" stroke="currentColor" stroke-width="1.5"/>`;
  body += label(120, panY + 12, left, { size: 15, weight: 600, fill: "currentColor" });
  body += `<line x1="${W - 120}" y1="70" x2="${W - 120}" y2="${panY}" stroke="currentColor" stroke-width="1.5"/>`;
  body += `<path d="M ${W - 170} ${panY} L ${W - 70} ${panY} L ${W - 95} ${panY + 16} L ${W - 145} ${panY + 16} Z" fill="rgba(127,127,127,0.18)" stroke="currentColor" stroke-width="1.5"/>`;
  body += label(W - 120, panY + 12, right, { size: 15, weight: 600, fill: "currentColor" });
  return svgWrap(`0 0 ${W} ${H}`, body);
}

// ---------------------------------------------------------------------------
// Two/three-circle Venn diagram
// ---------------------------------------------------------------------------

export function venn(sets: { label: string; x: number; y: number; r: number; color: string }[], caption?: string): string {
  let body = "";
  for (const s of sets) {
    body += `<circle cx="${s.x}" cy="${s.y}" r="${s.r}" fill="${s.color}22" stroke="${s.color}" stroke-width="2"/>`;
  }
  for (const s of sets) {
    const lx = s.x - s.r * 0.72;
    body += label(lx, s.y - s.r * 0.78, s.label, { size: 14.5, weight: 600, fill: s.color });
  }
  if (caption) body += label(sets[0].x + sets[1].x ? 280 : 280, 320, caption, { size: 14 });
  return svgWrap("0 0 560 340", body);
}

// ---------------------------------------------------------------------------
// Coordinate plane with a plotted line segment (static, for exercises)
// ---------------------------------------------------------------------------

export interface CoordFigureOpts {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  /** Line segments to draw, each from (x1,y1) to (x2,y2). */
  segments?: { x1: number; y1: number; x2: number; y2: number; color?: string; label?: string; dashed?: boolean }[];
  points?: { x: number; y: number; label?: string; color?: string }[];
}

export function coordFigure(o: CoordFigureOpts): string {
  const W = 460;
  const H = 420;
  const padL = 44;
  const padR = 22;
  const padT = 20;
  const padB = 36;
  const sx = (x: number) => padL + ((x - o.xMin) / (o.xMax - o.xMin)) * (W - padL - padR);
  const sy = (y: number) => H - padB - ((y - o.yMin) / (o.yMax - o.yMin)) * (H - padT - padB);
  let body = "";
  // grid
  for (let gx = Math.ceil(o.xMin); gx <= o.xMax; gx++) {
    body += `<line x1="${sx(gx)}" y1="${sy(o.yMin)}" x2="${sx(gx)}" y2="${sy(o.yMax)}" stroke="currentColor" stroke-width="${gx === 0 ? 1.6 : 0.5}" opacity="${gx === 0 ? 0.9 : 0.18}"/>`;
  }
  for (let gy = Math.ceil(o.yMin); gy <= o.yMax; gy++) {
    body += `<line x1="${sx(o.xMin)}" y1="${sy(gy)}" x2="${sx(o.xMax)}" y2="${sy(gy)}" stroke="currentColor" stroke-width="${gy === 0 ? 1.6 : 0.5}" opacity="${gy === 0 ? 0.9 : 0.18}"/>`;
  }
  if (o.xMin < 0 && o.xMax > 0) body += label(sx(0) - 10, sy(0) + 26, "x", { size: 13, italic: true, anchor: "end" });
  if (o.yMin < 0 && o.yMax > 0) body += label(sx(0) + 10, sy(0) - 8, "y", { size: 13, italic: true, anchor: "start" });
  for (const s of o.segments ?? []) {
    const color = s.color ?? VIOLET;
    body += `<line x1="${sx(s.x1)}" y1="${sy(s.y1)}" x2="${sx(s.x2)}" y2="${sy(s.y2)}" stroke="${color}" stroke-width="2.5"${s.dashed ? ' stroke-dasharray="7 5"' : ""}/>`;
    if (s.label) body += label((sx(s.x1) + sx(s.x2)) / 2 + 8, (sy(s.y1) + sy(s.y2)) / 2 - 8, s.label, { size: 13.5, fill: color, weight: 600 });
  }
  for (const p of o.points ?? []) {
    const color = p.color ?? RED;
    body += `<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="5.5" fill="${color}"/>`;
    if (p.label) body += label(sx(p.x) + 9, sy(p.y) - 8, p.label, { size: 13.5, fill: color, weight: 600, anchor: "start" });
  }
  return svgWrap(`0 0 ${W} ${H}`, body);
}

// ---------------------------------------------------------------------------
// Flow / process diagram (small, vertical or horizontal)
// ---------------------------------------------------------------------------

export function flowDiagram(steps: string[], opts: { direction?: "horizontal" | "vertical" } = {}): string {
  const vertical = opts.direction !== "horizontal";
  const W = vertical ? 380 : 40 + steps.length * 150;
  const H = vertical ? 40 + steps.length * 78 : 120;
  let body = "";
  steps.forEach((s, i) => {
    if (vertical) {
      const y = 20 + i * 78;
      body += `<rect x="40" y="${y}" width="300" height="52" rx="10" fill="${i === steps.length - 1 ? "rgba(5,150,105,0.16)" : VIOLET_SOFT}" stroke="${i === steps.length - 1 ? EMERALD : VIOLET}" stroke-width="1.5"/>`;
      body += label(190, y + 31, s, { size: 14, weight: 500 });
      if (i < steps.length - 1) {
        body += `<line x1="190" y1="${y + 52}" x2="190" y2="${y + 78}" stroke="currentColor" stroke-width="1.5" marker-end="url(#fd-arrow)"/>`;
      }
    } else {
      const x = 20 + i * 150;
      body += `<rect x="${x}" y="34" width="130" height="52" rx="10" fill="${i === steps.length - 1 ? "rgba(5,150,105,0.16)" : VIOLET_SOFT}" stroke="${i === steps.length - 1 ? EMERALD : VIOLET}" stroke-width="1.5"/>`;
      body += label(x + 65, 60, s, { size: 13, weight: 500 });
      if (i < steps.length - 1) {
        body += `<line x1="${x + 130}" y1="60" x2="${x + 150}" y2="60" stroke="currentColor" stroke-width="1.5" marker-end="url(#fd-arrow)"/>`;
      }
    }
  });
  body += `<defs><marker id="fd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>`;
  return svgWrap(`0 0 ${W} ${H}`, body);
}
