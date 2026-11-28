import { useRef, useState } from "react";
import { Slider, Stat } from "../components/ui";
import { grid, label, roundRect, theme } from "../lib/theme";
import { SimShell, hud, type SimProps } from "./common";

type P = { x: number; y: number; vx: number; vy: number };

export default function Kinetic({ meta, onStudy }: SimProps) {
  const [temp, setTemp] = useState(300);
  const particles = useRef<P[]>(
    Array.from({ length: 110 }, () => {
      const a = Math.random() * Math.PI * 2;
      const sp = 0.55 + Math.random() * 0.85;
      return {
        x: Math.random(),
        y: Math.random(),
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
      };
    }),
  );

  const molarMass = 0.032; // O₂
  const cRms = Math.sqrt((3 * 8.314 * temp) / molarMass);
  const meanKE = 1.5 * 1.380649e-23 * temp;
  const pressure = (temp * 110) / 300;

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, _t: number, dt: number) => {
    grid(ctx, w, h, 34);
    const bx = 46;
    const by = 24;
    const bw = w - bx - 18;
    const bh = h - 172;
    const speedScale = 0.34 * Math.sqrt(temp / 300);

    // box
    ctx.save();
    ctx.fillStyle = "rgba(56,225,196,0.035)";
    roundRect(ctx, bx, by, bw, bh, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(56,225,196,0.45)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // particles
    const counts = new Array(10).fill(0);
    particles.current.forEach((p) => {
      p.x += p.vx * speedScale * dt;
      p.y += p.vy * speedScale * dt;
      if (p.x < 0.012) {
        p.x = 0.012;
        p.vx = Math.abs(p.vx);
      }
      if (p.x > 0.988) {
        p.x = 0.988;
        p.vx = -Math.abs(p.vx);
      }
      if (p.y < 0.02) {
        p.y = 0.02;
        p.vy = Math.abs(p.vy);
      }
      if (p.y > 0.98) {
        p.y = 0.98;
        p.vy = -Math.abs(p.vy);
      }
      const px = bx + p.x * bw;
      const py = by + p.y * bh;
      const sp = Math.hypot(p.vx, p.vy);
      counts[Math.min(9, Math.floor((sp / 1.45) * 10))] += 1;
      const hot = Math.min(1, sp / 1.45);
      const r = Math.round(56 + hot * 199);
      const g = Math.round(225 - hot * 80);
      const b = Math.round(196 - hot * 170);
      ctx.save();
      ctx.fillStyle = `rgba(${r},${g},${b},0.92)`;
      ctx.shadowColor = `rgba(${r},${g},${b},0.65)`;
      ctx.shadowBlur = 7;
      ctx.beginPath();
      ctx.arc(px, py, 2.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // temperature glow at left wall
    const hit = 110 * speedScale * dt;
    void hit;
    label(ctx, "T = " + temp + " K", bx + 8, by + 16, { size: 9.5, color: theme.aqua, align: "left" });

    // histogram
    const hx = bx;
    const hy = h - 128;
    const hw = w - bx - 18;
    const hh = 74;
    ctx.save();
    ctx.strokeStyle = "rgba(148,178,205,0.25)";
    ctx.beginPath();
    ctx.moveTo(hx, hy + hh);
    ctx.lineTo(hx + hw, hy + hh);
    ctx.stroke();
    ctx.restore();
    const maxC = Math.max(...counts, 1);
    counts.forEach((c, i) => {
      const bwid = hw / 10 - 3;
      const height = (c / maxC) * hh;
      ctx.fillStyle = `rgba(56,225,196,${0.25 + (i / 10) * 0.55})`;
      roundRect(ctx, hx + i * (hw / 10) + 1.5, hy + hh - height, bwid, height, 3);
      ctx.fill();
    });
    label(ctx, "අණුක වේග ව්‍යාප්තිය / MOLECULAR SPEED DISTRIBUTION", hx, hy - 8, {
      size: 8.5,
      color: theme.muted,
      align: "left",
    });
    label(ctx, "0", hx, hy + hh + 12, { size: 8, color: theme.muted, align: "left" });
    label(ctx, "→ c", hx + hw, hy + hh + 12, { size: 8, color: theme.muted, align: "right" });

    hud(ctx, w - 150, 10, [
      ["T", `${temp} K`],
      ["c_rms", `${cRms.toFixed(0)} m/s`],
      ["⟨KE⟩", `${(meanKE * 1e21).toFixed(1)} zJ`],
    ], 138);
  };

  return (
    <SimShell
      meta={meta}
      onStudy={onStudy}
      draw={draw}
      height={440}
      badge="KINETIC THEORY"
      controls={
        <>
          <Slider label="උෂ්ණත්වය" en="Temperature, T" value={temp} min={50} max={1200} step={10} unit="K" onChange={setTemp} />
          <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-2.5 font-mono text-[10.5px] leading-relaxed text-slate-400">
            c_rms = √(3RT/M)
            <br />
            M = 32 g mol⁻¹ (O₂)
            <br />
            c_rms = {cRms.toFixed(0)} m s⁻¹
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-2.5 text-[10.5px] leading-relaxed text-slate-400">
            උෂ්ණත්වය වැඩි කළ විට බිත්ති සමඟ ගැටීම් වේගවත් වන අතර වේග ව්‍යාප්තිය දකුණට ලිස්සා යයි.
            අණු සියල්ලට එකම වේගයක් නොමැති බව නිරීක්ෂණය කරන්න.
          </div>
          <Stat label="සාපේක්ෂ පීඩනය" en="Relative pressure (∝ nT)" value={(pressure / 100).toFixed(2)} unit="×p₀" tone="ember" />
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="මූල මධ්‍ය වර්ග ප්‍රවේගය" en="c rms" value={cRms.toFixed(0)} unit="m/s" />
          <Stat label="සාමාන්‍ය චාලක ශක්තිය" en="Mean KE per molecule" value={(meanKE * 1e21).toFixed(1)} unit="×10⁻²¹ J" tone="ember" />
          <Stat label="අණු සංඛ්‍යාව" en="Molecules" value={particles.current.length} tone="violet" />
          <Stat label="තාප චාලක උෂ්ණත්වය" en="Thermal speed ∝ √T" value={Math.sqrt(temp / 300).toFixed(2)} unit="×" tone="sky" />
        </div>
      }
    />
  );
}
