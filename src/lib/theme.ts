export const theme = {
  bg: "#08101f",
  panel: "#0b1526",
  grid: "rgba(148, 178, 205, 0.10)",
  gridStrong: "rgba(148, 178, 205, 0.18)",
  text: "#cbd8e8",
  muted: "#7d93ad",
  aqua: "#38e1c4",
  aquaSoft: "rgba(56, 225, 196, 0.16)",
  ember: "#f8b13c",
  rose: "#fb7185",
  violet: "#a78bfa",
  sky: "#60a5fa",
  lime: "#a3e635",
  white: "#eef6ff",
};

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const fmt = (v: number, d = 1) => {
  if (!Number.isFinite(v)) return "∞";
  if (Math.abs(v) >= 1000) return v.toFixed(0);
  if (Math.abs(v) < 0.01 && v !== 0) return v.toExponential(1);
  return v.toFixed(d);
};

/** Draw an arrow from (x1,y1) to (x2,y2). */
export function arrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width = 2,
  head = 8,
) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 0.5) return;
  const h = Math.min(head, len * 0.55);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - Math.cos(ang) * h * 0.7, y2 - Math.sin(ang) * h * 0.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(ang - 0.42) * h, y2 - Math.sin(ang - 0.42) * h);
  ctx.lineTo(x2 - Math.cos(ang + 0.42) * h, y2 - Math.sin(ang + 0.42) * h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  opts: { color?: string; size?: number; align?: CanvasTextAlign; weight?: string; bg?: string } = {},
) {
  const { color = theme.text, size = 11, align = "center", weight = "500", bg } = opts;
  ctx.save();
  ctx.font = `${weight} ${size}px "JetBrains Mono", "Noto Sans Sinhala", monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  if (bg) {
    const w = ctx.measureText(text).width;
    const padX = 5;
    const left = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
    const r = (t: number) => t;
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(left - padX, y - size * 0.85, w + padX * 2, size * 1.7, 4) : r(0);
    ctx.fill();
    ctx.fillStyle = color;
  }
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function grid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  step = 32,
  color = theme.grid,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let x = 0.5; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0.5; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

/** Axis frame for small insets. */
export function axes(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  xLabel = "",
  yLabel = "",
) {
  ctx.save();
  ctx.strokeStyle = "rgba(148,178,205,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.stroke();
  ctx.fillStyle = theme.muted;
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.textAlign = "left";
  if (xLabel) ctx.fillText(xLabel, x + w - ctx.measureText(xLabel).width, y + h + 13);
  if (yLabel) ctx.fillText(yLabel, x - 4, y - 6);
  ctx.restore();
}

export function plot(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  w: number,
  h: number,
  fn: (u: number) => number,
  color: string,
  samples = 220,
  width = 1.8,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  ctx.beginPath();
  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    const v = fn(u);
    const px = x0 + u * w;
    const py = y0 + h - v * h;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r = 6,
) {
  ctx.beginPath();
  const rr = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
