import { useRef, useState } from "react";
import { Slider, Segmented, Stat } from "../components/ui";
import { arrow, grid, label, theme } from "../lib/theme";
import { SimShell, VectorButton, hud, canvasBars, type SimProps } from "./common";

export default function Projectile({ meta, onStudy }: SimProps) {
  const [u, setU] = useState(28);
  const [angle, setAngle] = useState(45);
  const [planet, setPlanet] = useState<"earth" | "moon" | "mars">("earth");
  const [vectors, setVectors] = useState(true);
  const phase = useRef(0);

  const g = planet === "earth" ? 9.8 : planet === "moon" ? 1.62 : 3.72;
  const rad = (angle * Math.PI) / 180;
  const vx = u * Math.cos(rad);
  const vy0 = u * Math.sin(rad);
  const T = (2 * vy0) / g;
  const R = (u * u * Math.sin(2 * rad)) / g;
  const H = (vy0 * vy0) / (2 * g);

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, _t: number, dt: number) => {
    grid(ctx, w, h, 34);
    phase.current = (phase.current + dt * 0.85) % T;
    const t = phase.current;

    const x0 = 46;
    const ground = h - 40;
    const scale = Math.min((w - 92) / Math.max(R, 2), (ground - 42) / Math.max(H, 2));

    // ground + launch pad
    ctx.fillStyle = "rgba(56,225,196,0.05)";
    ctx.fillRect(0, ground, w, h - ground);
    ctx.strokeStyle = "rgba(56,225,196,0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, ground + 0.5);
    ctx.lineTo(w, ground + 0.5);
    ctx.stroke();

    // predicted path
    ctx.save();
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = "rgba(56,225,196,0.35)";
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const tt = (T * i) / 80;
      const px = x0 + vx * tt * scale;
      const py = ground - (vy0 * tt - 0.5 * g * tt * tt) * scale;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();

    // range / height annotations
    label(ctx, `R = ${R.toFixed(1)} m`, x0 + (w - 92) / 2, ground + 22, { size: 9.5, color: theme.muted });
    ctx.save();
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = "rgba(248,177,60,0.35)";
    ctx.beginPath();
    ctx.moveTo(x0 + R * scale, ground);
    ctx.lineTo(x0 + R * scale, ground - H * scale);
    ctx.stroke();
    ctx.restore();
    label(ctx, `H = ${H.toFixed(1)} m`, x0 + R * scale + 6, ground - H * scale - 8, {
      size: 9,
      color: theme.ember,
      align: "left",
    });

    // current position
    const px = x0 + vx * t * scale;
    const py = ground - (vy0 * t - 0.5 * g * t * t) * scale;
    const vxNow = vx;
    const vyNow = vy0 - g * t;

    // trail
    ctx.save();
    ctx.strokeStyle = "rgba(56,225,196,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const steps = 46;
    for (let i = 0; i <= steps; i++) {
      const tt = Math.max(0, t - (i / steps) * 0.9);
      const qx = x0 + vx * tt * scale;
      const qy = ground - (vy0 * tt - 0.5 * g * tt * tt) * scale;
      if (i === 0) ctx.moveTo(qx, qy);
      else ctx.lineTo(qx, qy);
    }
    ctx.stroke();
    ctx.restore();

    // velocity vectors
    if (vectors) {
      const vs = 4.2;
      arrow(ctx, px, py, px + vxNow * vs, py, theme.aqua, 2, 7);
      arrow(ctx, px, py, px, py - vyNow * vs, theme.violet, 2, 7);
      arrow(ctx, px, py, px + vxNow * vs, py - vyNow * vs, theme.ember, 2.2, 8);
      label(ctx, "vx", px + vxNow * vs + 8, py + 10, { size: 9, color: theme.aqua, align: "left" });
      label(ctx, "vy", px + 7, py - vyNow * vs, { size: 9, color: theme.violet, align: "left" });
      label(ctx, "v", px + vxNow * vs + 10, py - vyNow * vs - 8, {
        size: 9.5,
        color: theme.ember,
        align: "left",
      });
    }

    // ball
    ctx.save();
    ctx.shadowColor = theme.aqua;
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#eafffb";
    ctx.beginPath();
    ctx.arc(px, py, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // angle arc at launch
    ctx.save();
    ctx.strokeStyle = "rgba(248,177,60,0.75)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x0, ground, 26, -rad, 0);
    ctx.stroke();
    ctx.restore();
    label(ctx, `${angle}°`, x0 + 34, ground - 12, { size: 9.5, color: theme.ember, align: "left" });

    arrow(ctx, x0, ground, x0 + (u * 0.9) * Math.cos(rad) * 1.1, ground - u * 0.9 * Math.sin(rad) * 1.1, theme.rose, 1.5, 6);
    label(ctx, `u = ${u} m s⁻¹`, x0 + 10, ground - 26, { size: 9, color: theme.rose, align: "left" });

    const speed = Math.hypot(vxNow, vyNow);
    const ke = 0.5 * speed * speed;
    const pe = g * (py < ground ? (ground - py) / scale : 0);
    hud(ctx, 10, 10, [
      ["t", `${t.toFixed(2)} s`],
      ["x", `${(vx * t).toFixed(1)} m`],
      ["y", `${Math.max(0, vy0 * t - 0.5 * g * t * t).toFixed(1)} m`],
      ["|v|", `${speed.toFixed(1)} m/s`],
    ]);
    canvasBars(ctx, w - 138, h - 74, 124, [
      { label: "KE", value: ke, color: theme.aqua },
      { label: "PE", value: pe, color: theme.ember },
    ]);
  };

  return (
    <SimShell
      meta={meta}
      onStudy={onStudy}
      draw={draw}
      badge="2D KINEMATICS"
      height={410}
      controls={
        <>
          <VectorButton on={vectors} onToggle={() => setVectors((v) => !v)} />
          <Slider label="ආරම්භක ප්‍රවේගය" en="Initial speed, u" value={u} min={10} max={60} unit="m/s" onChange={setU} />
          <Slider label="දියත් කෝණය" en="Launch angle, θ" value={angle} min={5} max={85} unit="°" onChange={setAngle} />
          <Segmented
            label="ගුරුත්ව ත්වරණය"
            en="Gravitational acceleration"
            value={planet}
            onChange={setPlanet}
            options={[
              { value: "earth", label: "පෘථිවිය", en: "9.8" },
              { value: "moon", label: "චන්ද්‍රයා", en: "1.62" },
              { value: "mars", label: "අඟහරු", en: "3.72" },
            ]}
          />
          <p className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-2 text-[10.5px] leading-relaxed text-slate-400">
            දෛශික ON කළ විට ප්‍රවේගයේ තිරස් (vx) සහ සිරස් (vy) සංරචක වෙන් වී පෙනේ. උපරිම උසේදී vy = 0 වුවත් vx
            වෙනස් නොවන බව නිරීක්ෂණය කරන්න.
          </p>
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="පරාසය" en="Range" value={R.toFixed(1)} unit="m" />
          <Stat label="උපරිම උස" en="Max height" value={H.toFixed(1)} unit="m" tone="ember" />
          <Stat label="පියාසර කාලය" en="Time of flight" value={T.toFixed(2)} unit="s" tone="violet" />
          <Stat label="ත්වරණය" en="Acceleration" value={g.toFixed(2)} unit="m/s²" tone="sky" />
        </div>
      }
    />
  );
}
