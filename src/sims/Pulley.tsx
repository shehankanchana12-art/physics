import { useRef, useState } from "react";
import { Slider, Stat } from "../components/ui";
import { arrow, grid, label, theme } from "../lib/theme";
import { SimShell, VectorButton, hud, type SimProps } from "./common";

export default function Pulley({ meta, onStudy }: SimProps) {
  const [m1, setM1] = useState(4);
  const [m2, setM2] = useState(2);
  const [vectors, setVectors] = useState(true);
  const phase = useRef(0);
  const g = 9.8;

  const a = ((m1 - m2) * g) / (m1 + m2);
  const T = (2 * m1 * m2 * g) / (m1 + m2);

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, _t: number, dt: number) => {
    grid(ctx, w, h, 34);
    const cx = w / 2;
    const cy = 92;
    const r = 34;

    phase.current = (phase.current + dt * Math.min(1.4, Math.abs(a) / 3 + 0.15)) % 1;
    const travel = Math.sin(phase.current * Math.PI) * 70;
    const dir = a >= 0 ? 1 : -1;

    // ceiling
    ctx.strokeStyle = "rgba(148,178,205,0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 90, 26);
    ctx.lineTo(cx + 90, 26);
    ctx.stroke();
    for (let x = cx - 84; x < cx + 90; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 26);
      ctx.lineTo(x + 8, 34);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(148,178,205,0.5)";
    ctx.beginPath();
    ctx.moveTo(cx, 26);
    ctx.lineTo(cx, cy - r);
    ctx.stroke();

    // pulley
    ctx.save();
    const pg = ctx.createRadialGradient(cx - 8, cy - 10, 4, cx, cy, r);
    pg.addColorStop(0, "#1d3a4d");
    pg.addColorStop(1, "#0b1b2b");
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(56,225,196,0.65)";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = "rgba(56,225,196,0.8)";
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    label(ctx, "කප්පිය", cx, cy + r + 16, { size: 9, color: theme.muted });

    // rope + masses
    const leftTop = cy - r;
    const rightTop = cy - r;
    const leftY = leftTop + 78 + travel * dir;
    const rightY = rightTop + 78 - travel * dir;

    ctx.strokeStyle = "#cbd8e8";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - r, leftTop);
    ctx.lineTo(cx - r, leftY - 6);
    ctx.moveTo(cx + r, rightTop);
    ctx.lineTo(cx + r, rightY - 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 0, true);
    ctx.stroke();

    const box = (x: number, y: number, m: number, color: string) => {
      const bw = 46;
      const bh = 32 + m * 2.4;
      ctx.save();
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x - bw / 2, y - 6, bw, bh, 5);
      else ctx.rect(x - bw / 2, y - 6, bw, bh);
      ctx.fill();
      ctx.restore();
      label(ctx, `${m} kg`, x, y + bh / 2 - 4, { size: 10, color: "#04121a", weight: "600" });

      if (vectors) {
        const F = 34 + m * 6;
        arrow(ctx, x, y + bh + 4, x, y + bh + 4 + F, theme.rose, 2, 7);
        label(ctx, `m g = ${(m * g).toFixed(0)} N`, x, y + bh + 16 + F, { size: 8.5, color: theme.rose });
        arrow(ctx, x, y - 6, x, y - 6 - Math.min(70, T * 0.7), theme.sky, 2, 7);
        label(ctx, `T = ${T.toFixed(0)} N`, x, y - 20 - Math.min(70, T * 0.7), { size: 8.5, color: theme.sky });
      }
    };
    box(cx - r, leftY, m1, "rgba(56,225,196,0.9)");
    box(cx + r, rightY, m2, "rgba(248,177,60,0.9)");

    // direction arrow
    const dirLabel = a > 0 ? "m₁ පහළට යයි" : a < 0 ? "m₂ පහළට යයි" : "සමතුලිතයි";
    arrow(ctx, cx + 96, cy + 4, cx + 96, cy + 4 + (a >= 0 ? 26 : -26), theme.violet, 2, 7);
    label(ctx, dirLabel, cx + 100, cy + 46, { size: 9, color: theme.violet, align: "left" });

    hud(ctx, 10, 10, [
      ["a", `${a.toFixed(2)} m/s²`],
      ["T", `${T.toFixed(1)} N`],
      ["Σm", `${(m1 + m2).toFixed(1)} kg`],
      ["g", "9.8 m/s²"],
    ]);

    // acceleration formula strip
    label(ctx, "a = (m₁ − m₂)g / (m₁ + m₂)", w - 12, h - 14, {
      size: 9.5,
      color: theme.muted,
      align: "right",
    });
  };

  return (
    <SimShell
      meta={meta}
      onStudy={onStudy}
      draw={draw}
      height={430}
      badge="ATWOOD"
      controls={
        <>
          <VectorButton on={vectors} onToggle={() => setVectors((v) => !v)} />
          <Slider label="වම් ස්කන්ධය m₁" en="Left mass, m₁" value={m1} min={0.5} max={10} step={0.5} digits={1} unit="kg" onChange={setM1} />
          <Slider label="දකුණු ස්කන්ධය m₂" en="Right mass, m₂" value={m2} min={0.5} max={10} step={0.5} digits={1} unit="kg" onChange={setM2} />
          <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-2.5 text-[10.5px] leading-relaxed text-slate-400">
            තන්තුව ඇදී නොයන හා කප්පිය සැහැල්ලු නම් ස්කන්ධ දෙකට එකම ත්වරණ අගයක් ඇත. m₁ = m₂ විට a = 0 බව පරීක්ෂා කරන්න.
          </div>
          <button className="btn w-full justify-center text-[11px]" onClick={() => (phase.current = 0)}>
            චලනය යළි අරඹන්න
          </button>
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="ත්වරණය" en="Acceleration" value={a.toFixed(2)} unit="m/s²" />
          <Stat label="ආතතිය" en="Tension" value={T.toFixed(1)} unit="N" tone="ember" />
          <Stat label="m₁ හි බර" en="Weight m₁g" value={(m1 * g).toFixed(1)} unit="N" tone="rose" />
          <Stat label="m₂ හි බර" en="Weight m₂g" value={(m2 * g).toFixed(1)} unit="N" tone="sky" />
        </div>
      }
    />
  );
}
