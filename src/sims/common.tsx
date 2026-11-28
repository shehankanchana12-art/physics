import type { ReactNode } from "react";
import { Move3d, Sparkles } from "lucide-react";
import type { SimMeta } from "../data/syllabus";
import { Canvas, type DrawFn } from "../components/Canvas";
import { SimHeader } from "../components/ui";
import { theme } from "../lib/theme";
import { useLang } from "../lib/language";

export type SimProps = { meta: SimMeta; onStudy: () => void };

export function SimShell({
  meta,
  onStudy,
  draw,
  controls,
  footer,
  height = 400,
  badge,
}: {
  meta: SimMeta;
  onStudy: () => void;
  draw: DrawFn;
  controls: ReactNode;
  footer?: ReactNode;
  height?: number;
  badge?: string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_296px]">
      <div className="panel overflow-hidden">
        <SimHeader title={meta.si} en={meta.en} onStudy={onStudy} />
        <div className="p-2.5">
          <div className="relative overflow-hidden rounded-xl border border-white/[0.05] bg-ink-950/60">
            <Canvas draw={draw} height={height} onActivate={onStudy} title={meta.en} />
            {badge ? (
              <span className="pointer-events-none absolute right-2.5 top-2.5 rounded-md border border-aqua-400/20 bg-ink-950/70 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-widest text-aqua-400/80">
                {badge}
              </span>
            ) : null}
          </div>
        </div>
        {footer ? <div className="border-t border-white/[0.06] p-3">{footer}</div> : null}
      </div>
      <aside className="panel h-fit space-y-3.5 p-3.5">
        <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.15em] text-slate-500">
          <Sparkles className="h-3 w-3 text-aqua-400/70" />
          පාලක පුවරුව · Controls
        </div>
        {controls}
      </aside>
    </div>
  );
}

export function VectorButton({
  on,
  onToggle,
  label = "දෛශික වෙන් කරන්න",
  en = "Resolve / explode vectors",
}: {
  on: boolean;
  onToggle: () => void;
  label?: string;
  en?: string;
}) {
  const { showEn } = useLang();
  return (
    <button
      onClick={onToggle}
      className={`group flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left transition ${
        on
          ? "border-ember/50 bg-ember/15 text-ember shadow-[0_0_24px_-12px_rgba(248,177,60,0.9)]"
          : "border-white/10 bg-ink-900/60 text-slate-300 hover:border-ember/30"
      }`}
      aria-pressed={on}
    >
      <span className="flex items-center gap-2">
        <Move3d className="h-3.5 w-3.5" />
        <span className="leading-tight">
          <span className="block text-[11.5px] font-semibold">{label}</span>
          {showEn ? <span className="en block text-[9px]">{en}</span> : null}
        </span>
      </span>
      <span
        className={`rounded px-1.5 py-0.5 font-mono text-[9px] ${
          on ? "bg-ember/25 text-ember" : "bg-white/5 text-slate-500"
        }`}
      >
        {on ? "ON" : "OFF"}
      </span>
    </button>
  );
}

/** Small translucent HUD block drawn on canvas. */
export function hud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rows: [string, string][],
  width = 132,
) {
  const lh = 15;
  const h = rows.length * lh + 10;
  ctx.save();
  ctx.fillStyle = "rgba(5,10,20,0.72)";
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, width, h, 6);
  else ctx.rect(x, y, width, h);
  ctx.fill();
  ctx.stroke();
  ctx.font = '9.5px "JetBrains Mono", monospace';
  rows.forEach(([k, v], i) => {
    ctx.fillStyle = theme.muted;
    ctx.textAlign = "left";
    ctx.fillText(k, x + 8, y + 16 + i * lh);
    ctx.fillStyle = theme.text;
    ctx.textAlign = "right";
    ctx.fillText(v, x + width - 8, y + 16 + i * lh);
  });
  ctx.restore();
}

/** Canvas energy bars (KE / PE / dissipated). */
export function canvasBars(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  items: { label: string; value: number; color: string }[],
  title = "ශක්තිය / ENERGY",
) {
  const total = Math.max(1e-6, items.reduce((s, i) => s + Math.max(0, i.value), 0));
  ctx.save();
  ctx.font = '8.5px "JetBrains Mono", monospace';
  ctx.fillStyle = theme.muted;
  ctx.textAlign = "left";
  ctx.fillText(title, x, y - 8);
  items.forEach((it, i) => {
    const rowY = y + i * 19;
    const frac = Math.min(1, Math.max(0, it.value) / total);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, rowY, w, 5, 3);
    else ctx.rect(x, rowY, w, 5);
    ctx.fill();
    ctx.fillStyle = it.color;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, rowY, Math.max(2, w * frac), 5, 3);
    else ctx.rect(x, rowY, Math.max(2, w * frac), 5);
    ctx.fill();
    ctx.fillStyle = theme.text;
    ctx.textAlign = "left";
    ctx.fillText(it.label, x, rowY + 15);
    ctx.textAlign = "right";
    ctx.fillStyle = it.color;
    ctx.fillText(`${it.value.toFixed(0)} J`, x + w, rowY + 15);
  });
  ctx.restore();
}

export function axisTicks(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color = "rgba(148,178,205,0.35)",
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}
