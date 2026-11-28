import { useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Slider, Stat } from "../components/ui";
import { arrow, grid, label, theme } from "../lib/theme";
import { SimShell, VectorButton, hud, canvasBars, type SimProps } from "./common";

export default function Incline({ meta, onStudy }: SimProps) {
  const [angle, setAngle] = useState(28);
  const [mu, setMu] = useState(0.18);
  const [mass, setMass] = useState(2);
  const [vectors, setVectors] = useState(true);
  const phase = useRef(0);

  const g = 9.8;
  const rad = (angle * Math.PI) / 180;
  const accel = g * (Math.sin(rad) - mu * Math.cos(rad));
  const sliding = accel > 0.02;
  const L = 6; // slope length (m)
  const normal = mass * g * Math.cos(rad);
  const friction = mu * normal;
  const along = mass * g * Math.sin(rad);

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, _t: number, dt: number) => {
    grid(ctx, w, h, 34);

    const baseX = 52;
    const baseY = h - 46;
    const topH = Math.min(h - 90, (w - 150) * Math.tan(rad));
    const topX = baseX + topH / Math.tan(rad);

    // ramp
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(topX, baseY);
    ctx.lineTo(topX, baseY - topH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(baseX, baseY, topX, baseY - topH);
    grad.addColorStop(0, "rgba(30,52,74,0.85)");
    grad.addColorStop(1, "rgba(18,32,50,0.9)");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "rgba(148,178,205,0.35)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    // ground
    ctx.strokeStyle = "rgba(56,225,196,0.3)";
    ctx.beginPath();
    ctx.moveTo(baseX - 34, baseY + 0.5);
    ctx.lineTo(w - 12, baseY + 0.5);
    ctx.stroke();

    // angle arc
    ctx.save();
    ctx.strokeStyle = "rgba(248,177,60,0.8)";
    ctx.beginPath();
    ctx.arc(topX, baseY, 42, Math.PI, Math.PI + rad);
    ctx.stroke();
    ctx.restore();
    label(ctx, `${angle}°`, topX - 58, baseY - 13, { color: theme.ember, size: 10 });

    // block travel
    const slopePx = Math.hypot(topX - baseX, topH);
    if (sliding) {
      phase.current += dt * 0.55;
      if (phase.current > 1) phase.current = 0;
    }
    const sNorm = sliding ? Math.min(0.94, 0.06 + phase.current * 0.9) : 0.18;
    const bx = topX - (topX - baseX) * sNorm;
    const by = baseY - topH + topH * sNorm;
    const nx = Math.sin(rad);
    const ny = -Math.cos(rad);
    const size = 26;

    // block
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(rad);
    ctx.fillStyle = sliding ? "rgba(56,225,196,0.9)" : "rgba(125,147,173,0.9)";
    ctx.shadowColor = sliding ? theme.aqua : "transparent";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-size / 2, -size + 1, size, size, 4);
    else ctx.rect(-size / 2, -size + 1, size, size);
    ctx.fill();
    ctx.restore();
    label(ctx, `${mass} kg`, bx, by - size / 2, { size: 9, color: "#04121a" });

    // vectors
    if (vectors) {
      const ox = bx + nx * 12;
      const oy = by + ny * 12;
      const F = 105;
      // weight
      arrow(ctx, ox, oy, ox, oy + F, theme.rose, 2, 8);
      label(ctx, "mg", ox, oy + F + 11, { color: theme.rose, size: 9 });
      // normal
      arrow(ctx, ox, oy, ox + nx * F * Math.cos(rad) * 1.05, oy + ny * F * Math.cos(rad) * 1.05, theme.sky, 2, 8);
      label(ctx, "N", ox + nx * 62, oy + ny * 62 - 8, { color: theme.sky, size: 9 });
      // component along slope mg sin
      const dx = -Math.cos(rad);
      const dy = Math.sin(rad);
      arrow(ctx, ox, oy, ox + dx * F * Math.sin(rad), oy + dy * F * Math.sin(rad), theme.ember, 2, 7);
      label(ctx, "mg sinθ", ox + dx * 62, oy + dy * 62 + 12, { color: theme.ember, size: 9 });
      // component into slope mg cos
      arrow(ctx, ox, oy, ox - nx * F * Math.cos(rad), oy - ny * F * Math.cos(rad), theme.violet, 1.7, 7);
      label(ctx, "mg cosθ", ox - nx * 54 + 4, oy - ny * 54 + 10, { color: theme.violet, size: 8.5 });
      // friction, opposing downward motion (up the slope)
      if (sliding) {
        arrow(ctx, bx - nx * 10, by - ny * 10, bx - nx * 10 + Math.cos(rad) * 40, by - ny * 10 - Math.sin(rad) * 40, theme.lime, 2, 7);
        label(ctx, `f = μN`, bx + Math.cos(rad) * 62, by - Math.sin(rad) * 62, { color: theme.lime, size: 8.5 });
      }
    }

    // slope length ruler
    ctx.save();
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = "rgba(148,178,205,0.25)";
    ctx.beginPath();
    ctx.moveTo(baseX, baseY + 16);
    ctx.lineTo(topX, baseY + 16);
    ctx.stroke();
    ctx.restore();

    hud(ctx, 10, 10, [
      ["a", `${Math.max(0, accel).toFixed(2)} m/s²`],
      ["mg sinθ", `${along.toFixed(1)} N`],
      ["μN", `${friction.toFixed(1)} N`],
      ["N", `${normal.toFixed(1)} N`],
    ]);

    const s = sNorm * L;
    const v = Math.sqrt(Math.max(0, 2 * accel * s));
    const height = (L - s) * Math.sin(rad);
    const ke = 0.5 * mass * v * v;
    const pe = mass * g * height;
    const diss = friction * s;
    canvasBars(ctx, w - 140, h - 82, 124, [
      { label: "KE", value: ke, color: theme.aqua },
      { label: "PE", value: pe, color: theme.ember },
      { label: "friction", value: diss, color: theme.rose },
    ]);
  };

  return (
    <SimShell
      meta={meta}
      onStudy={onStudy}
      draw={draw}
      height={410}
      badge="FREE-BODY"
      controls={
        <>
          <VectorButton on={vectors} onToggle={() => setVectors((v) => !v)} />
          <Slider label="ආනතියේ කෝණය" en="Angle of inclination, θ" value={angle} min={5} max={50} unit="°" onChange={setAngle} />
          <Slider label="ඝර්ෂණ සංගුණකය" en="Coefficient of friction, μ" value={mu} min={0} max={0.9} step={0.01} digits={2} onChange={setMu} />
          <Slider label="ස්කන්ධය" en="Mass, m" value={mass} min={1} max={10} unit="kg" onChange={setMass} />
          <button className="btn w-full justify-center text-[11px]" onClick={() => (phase.current = 0)}>
            <RotateCcw className="h-3 w-3" /> චලනය යළි අරඹන්න
          </button>
          <div
            className={`rounded-lg border px-2.5 py-2 text-[10.5px] leading-relaxed ${
              sliding ? "border-aqua-400/25 bg-aqua-400/5 text-slate-300" : "border-rose-400/25 bg-rose-400/5 text-rose-200"
            }`}
          >
            {sliding
              ? "වස්තුව ලිස්සා යයි: mg sinθ > μN. a = g(sinθ − μcosθ)."
              : "වස්තුව නිශ්ලව පවතී: mg sinθ ≤ μN. ස්ථිතික ඝර්ෂණය අවශ්‍ය බලයට සමානව ක්‍රියා කරයි."}
          </div>
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="ත්වරණය" en="Acceleration" value={Math.max(0, accel).toFixed(2)} unit="m/s²" />
          <Stat label="තලයට සමාන්තර බලය" en="mg sinθ" value={along.toFixed(1)} unit="N" tone="ember" />
          <Stat label="ඝර්ෂණ බලය" en="Friction" value={friction.toFixed(1)} unit="N" tone="rose" />
          <Stat label="සාමාන්‍ය ප්‍රතික්‍රියාව" en="Normal reaction" value={normal.toFixed(1)} unit="N" tone="sky" />
        </div>
      }
    />
  );
}
