import { useState } from "react";
import { Slider, Stat } from "../components/ui";
import { arrow, grid, label, theme } from "../lib/theme";
import { SimShell, hud, type SimProps } from "./common";

const R_E = 6.371e6;
const M_E = 5.972e24;
const G = 6.674e-11;

export default function Orbit({ meta, onStudy }: SimProps) {
  const [altKm, setAltKm] = useState(420);

  const r = R_E + altKm * 1000;
  const v = Math.sqrt((G * M_E) / r);
  const T = 2 * Math.PI * Math.sqrt(r ** 3 / (G * M_E));
  const gAt = (G * M_E) / (r * r);
  const vEsc = Math.sqrt((2 * G * M_E) / r);
  const geo = Math.abs(altKm - 35786) < 400;

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    grid(ctx, w, h, 34);
    const cx = w / 2;
    const cy = h / 2 + 6;
    const earthR = 34;
    const orbitR = Math.min(earthR * (r / R_E), Math.min(w, h) * 0.43);

    // stars
    ctx.save();
    for (let i = 0; i < 60; i++) {
      const sx = ((i * 137.5) % w) + 4;
      const sy = ((i * 89.3) % h) + 3;
      ctx.fillStyle = `rgba(203,216,232,${0.05 + (i % 5) * 0.03})`;
      ctx.fillRect(sx, sy, 1.2, 1.2);
    }
    ctx.restore();

    // earth
    const eg = ctx.createRadialGradient(cx - 12, cy - 12, 3, cx, cy, earthR);
    eg.addColorStop(0, "#2a7f9c");
    eg.addColorStop(0.65, "#155676");
    eg.addColorStop(1, "#062133");
    ctx.save();
    ctx.fillStyle = eg;
    ctx.shadowColor = "rgba(56,225,196,0.5)";
    ctx.shadowBlur = 26;
    ctx.beginPath();
    ctx.arc(cx, cy, earthR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = "rgba(56,225,196,0.22)";
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, earthR, Math.abs(earthR * Math.sin(i * 0.4)) + 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    label(ctx, "පෘථිවිය", cx, cy + earthR + 14, { size: 8.5, color: theme.muted });

    // orbit
    ctx.save();
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = "rgba(56,225,196,0.3)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // satellite
    const ang = -t * 0.55;
    const sx = cx + orbitR * Math.cos(ang);
    const sy = cy + orbitR * Math.sin(ang);
    ctx.save();
    ctx.strokeStyle = "rgba(96,165,250,0.25)";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(sx, sy);
    ctx.stroke();
    ctx.restore();

    // trail
    ctx.save();
    for (let i = 1; i < 22; i++) {
      const aa = ang - i * 0.055;
      ctx.fillStyle = `rgba(248,177,60,${0.45 * (1 - i / 22)})`;
      ctx.beginPath();
      ctx.arc(cx + orbitR * Math.cos(aa), cy + orbitR * Math.sin(aa), 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // satellite body
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(ang + Math.PI / 2);
    ctx.fillStyle = "#eef6ff";
    ctx.fillRect(-4, -7, 8, 14);
    ctx.fillStyle = theme.sky;
    ctx.fillRect(-15, -4, 9, 8);
    ctx.fillRect(6, -4, 9, 8);
    ctx.restore();

    // velocity arrow (tangent)
    const tx = -Math.sin(ang);
    const ty = Math.cos(ang);
    arrow(ctx, sx, sy, sx + tx * 54, sy + ty * 54, theme.aqua, 2, 8);
    label(ctx, "v", sx + tx * 62, sy + ty * 62, { color: theme.aqua, size: 9.5 });
    // gravity arrow (inward)
    arrow(ctx, sx, sy, sx - Math.cos(ang) * 40, sy - Math.sin(ang) * 40, theme.rose, 1.8, 7);
    label(ctx, "F_g", sx - Math.cos(ang) * 50, sy - Math.sin(ang) * 50, { color: theme.rose, size: 9 });

    // radius label
    label(ctx, `r = ${(r / 1000).toFixed(0)} km`, (cx + sx) / 2 + 4, (cy + sy) / 2 - 12, {
      size: 8.5,
      color: theme.muted,
    });

    hud(ctx, 10, 10, [
      ["h", `${altKm} km`],
      ["v", `${(v / 1000).toFixed(2)} km/s`],
      ["T", `${(T / 3600).toFixed(2)} h`],
      ["g", `${gAt.toFixed(2)} m/s²`],
    ]);

    if (geo) {
      label(ctx, "භූ ස්ථාවර කක්ෂය (24 h)", w / 2, h - 18, { size: 9.5, color: theme.ember });
    }
  };

  return (
    <SimShell
      meta={meta}
      onStudy={onStudy}
      draw={draw}
      height={420}
      badge="ORBIT"
      controls={
        <>
          <Slider
            label="මුහුදු මට්ටමේ සිට උස"
            en="Altitude, h"
            value={altKm}
            min={200}
            max={40000}
            step={100}
            unit="km"
            onChange={setAltKm}
          />
          <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-2.5 font-mono text-[10.5px] leading-relaxed text-slate-400">
            v = √(GM/r) = {(v / 1000).toFixed(2)} km s⁻¹
            <br />
            T = 2π√(r³/GM) = {(T / 3600).toFixed(2)} h
            <br />
            r = {(r / 1000).toFixed(0)} km
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-2.5 text-[10.5px] leading-relaxed text-slate-400">
            {geo
              ? "ඔබ භූ ස්ථාවර කක්ෂයට ආසන්නයි! T = 24 h වන අතර චන්ද්‍රිකාව පෘථිවිය සමඟ භ්‍රමණය වේ."
              : "උස වැඩි කළ විට කක්ෂීය වේගය අඩු වන නමුත් කාලාවර්තය වැඩි වේ. භූ ස්ථාවර කක්ෂය ≈ 35 786 km."}
          </div>
          <Stat label="කක්ෂීය ශක්තිය" en="Total orbital energy" value={(-(G * M_E * 1000) / (2 * r) / 1e9).toFixed(2)} unit="MJ/kg" tone="violet" />
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="කක්ෂීය වේගය" en="Orbital speed" value={(v / 1000).toFixed(2)} unit="km/s" />
          <Stat label="කාලාවර්තය" en="Period" value={(T / 3600).toFixed(2)} unit="h" tone="ember" />
          <Stat label="එම උසේ g" en="g at altitude" value={gAt.toFixed(2)} unit="m/s²" tone="sky" />
          <Stat label="එම උසේ ගැලීම් වේගය" en="Escape speed there" value={(vEsc / 1000).toFixed(2)} unit="km/s" tone="rose" />
        </div>
      }
    />
  );
}
