import { useState } from "react";
import { Slider, Segmented, Stat } from "../components/ui";
import { arrow, grid, label, roundRect, theme } from "../lib/theme";
import { SimShell, hud, type SimProps } from "./common";

type Mode = "wire" | "solenoid";

export default function Magnetic({ meta, onStudy }: SimProps) {
  const [mode, setMode] = useState<Mode>("wire");
  const [current, setCurrent] = useState(5);
  const [distCm, setDistCm] = useState(4);
  const [turnsCm, setTurnsCm] = useState(20);

  const mu0 = 4 * Math.PI * 1e-7;
  const Bwire = (mu0 * current) / (2 * Math.PI * (distCm / 100));
  const Bsol = mu0 * turnsCm * 100 * current;

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    grid(ctx, w, h, 34);

    if (mode === "wire") {
      const cx = w / 2;
      const cy = h / 2 + 6;

      // field circles
      for (let i = 1; i <= 6; i++) {
        const rr = i * Math.min(w, h) * 0.062;
        ctx.save();
        ctx.strokeStyle = `rgba(56,225,196,${0.5 - i * 0.06})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.stroke();
        // direction arrowheads (anticlockwise for current out of page)
        const a = t * 0.9 + (i * Math.PI) / 3;
        [0, Math.PI].forEach((off) => {
          const px = cx + rr * Math.cos(a + off);
          const py = cy + rr * Math.sin(a + off);
          const tx = -Math.sin(a + off);
          const ty = Math.cos(a + off);
          arrow(ctx, px - tx * 6, py - ty * 6, px + tx * 6, py + ty * 6, theme.aqua, 1.2, 5);
        });
        ctx.restore();
      }

      // conductor (into page)
      ctx.save();
      ctx.fillStyle = "rgba(248,177,60,0.95)";
      ctx.shadowColor = theme.ember;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(cx, cy, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = "#04121a";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy - 6);
      ctx.lineTo(cx + 6, cy + 6);
      ctx.moveTo(cx + 6, cy - 6);
      ctx.lineTo(cx - 6, cy + 6);
      ctx.stroke();
      ctx.restore();
      label(ctx, `I = ${current} A (පිටතට)`, cx, cy - 28, { size: 9, color: theme.ember });

      // measurement radius
      const rr = Math.min(distCm * 14, Math.min(w, h) * 0.4);
      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = "rgba(167,139,250,0.7)";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + rr, cy);
      ctx.stroke();
      ctx.restore();
      arrow(ctx, cx, cy, cx + rr, cy, theme.violet, 1.4, 6);
      label(ctx, `r = ${distCm} cm`, cx + rr / 2, cy - 12, { size: 9, color: theme.violet });

      hud(ctx, 10, 10, [
        ["I", `${current} A`],
        ["r", `${distCm} cm`],
        ["B", `${(Bwire * 1e6).toFixed(1)} µT`],
      ]);
      label(ctx, "දකුණු අත් ඇඟිලි රීතිය — ඇඟිලි B දිශාව", cx, h - 18, {
        size: 9,
        color: theme.muted,
      });
    } else {
      const cx = w / 2;
      const cy = h / 2;
      const coilW = Math.min(w * 0.6, 340);
      const coilH = Math.min(h * 0.42, 150);
      const turns = 8;

      // solenoid body
      ctx.save();
      ctx.fillStyle = "rgba(56,225,196,0.04)";
      roundRect(ctx, cx - coilW / 2, cy - coilH / 2, coilW, coilH, 24);
      ctx.fill();
      ctx.restore();

      // coils
      for (let i = 0; i < turns; i++) {
        const x = cx - coilW / 2 + 16 + (i * (coilW - 32)) / (turns - 1);
        ctx.save();
        ctx.strokeStyle = "rgba(248,177,60,0.75)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, cy, 13, coilH / 2 + 6, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // internal field lines
      const a = 1 + Math.sin(t * 2) * 0.08;
      for (let i = -2; i <= 2; i++) {
        const y = cy + i * (coilH / 5);
        arrow(ctx, cx - coilW / 2 + 8, y, cx + coilW / 2 - 8, y, "rgba(56,225,196,0.75)", 1.8, 8);
      }
      // external return lines
      [-1, 1].forEach((sgn) => {
        ctx.save();
        ctx.strokeStyle = "rgba(56,225,196,0.3)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx + coilW / 2 - 4, cy + sgn * (coilH / 2 + 8));
        ctx.bezierCurveTo(
          cx + coilW / 2 + 90,
          cy + sgn * (coilH / 2 + 80),
          cx - coilW / 2 - 90,
          cy + sgn * (coilH / 2 + 80),
          cx - coilW / 2 + 4,
          cy + sgn * (coilH / 2 + 8),
        );
        ctx.stroke();
        ctx.restore();
      });

      // poles
      label(ctx, "S", cx - coilW / 2 - 20, cy, { size: 20, color: theme.sky, weight: "700" });
      label(ctx, "N", cx + coilW / 2 + 20, cy, { size: 20, color: theme.rose, weight: "700" });

      // current direction
      arrow(ctx, cx, cy - coilH / 2 - 30, cx + 30, cy - coilH / 2 - 30, theme.ember, 2, 7);
      label(ctx, `I = ${current} A, n = ${turnsCm} turns/cm`, cx + 40, cy - coilH / 2 - 30, {
        size: 9,
        color: theme.ember,
        align: "left",
      });

      hud(ctx, 10, 10, [
        ["n", `${turnsCm} /cm`],
        ["I", `${current} A`],
        ["B", `${(Bsol * 1000).toFixed(2)} mT`],
      ]);
      void a;
      label(ctx, "සොලෙනොයිඩය තුළ B = μ₀nI (ඒකාකාර)", cx, h - 18, { size: 9, color: theme.muted });
    }
  };

  return (
    <SimShell
      meta={meta}
      onStudy={onStudy}
      draw={draw}
      height={420}
      badge="MAGNETIC FIELD"
      controls={
        <>
          <Segmented
            label="සැකැස්ම"
            en="Configuration"
            value={mode}
            onChange={setMode}
            options={[
              { value: "wire", label: "සෘජු රැහැන", en: "straight wire" },
              { value: "solenoid", label: "සොලෙනොයිඩය", en: "solenoid" },
            ]}
          />
          <Slider label="ධාරාව" en="Current, I" value={current} min={0.5} max={12} step={0.5} digits={1} unit="A" onChange={setCurrent} />
          {mode === "wire" ? (
            <Slider label="සිට දුර" en="Distance, r" value={distCm} min={1} max={15} unit="cm" onChange={setDistCm} />
          ) : (
            <Slider label="ඒකක දිගට වෙළුම්" en="Turns per unit length, n" value={turnsCm} min={5} max={60} unit="/cm" onChange={setTurnsCm} />
          )}
          <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-2.5 font-mono text-[10.5px] leading-relaxed text-slate-400">
            {mode === "wire" ? "B = μ₀I / (2πr)" : "B = μ₀nI"}
            <br />
            B = {((mode === "wire" ? Bwire : Bsol) * 1e6).toFixed(1)} µT
          </div>
          <p className="text-[10.5px] leading-relaxed text-slate-500">
            μ₀ = 4π × 10⁻⁷ T m A⁻¹. දුර දෙගුණ කළ විට රැහැනක B අඩක් වේ; සොලෙනොයිඩයක B දුර මත රඳා නොපවතී.
          </p>
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="චුම්බක තීව්‍රතාව" en="Flux density, B" value={((mode === "wire" ? Bwire : Bsol) * 1e6).toFixed(1)} unit="µT" />
          <Stat label="ධාරාව" en="Current" value={current} unit="A" tone="ember" />
          {mode === "wire" ? (
            <Stat label="දුර" en="Distance" value={distCm} unit="cm" tone="sky" />
          ) : (
            <Stat label="ඒකක දිගට වෙළුම්" en="n" value={turnsCm * 100} unit="m⁻¹" tone="sky" />
          )}
          <Stat label="මාධ්‍යය" en="Medium" value="වාතය (µr ≈ 1)" tone="violet" />
        </div>
      }
    />
  );
}
