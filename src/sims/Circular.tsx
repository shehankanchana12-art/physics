import { useState } from "react";
import { Slider, Stat } from "../components/ui";
import { arrow, grid, label, theme } from "../lib/theme";
import { SimShell, VectorButton, hud, type SimProps } from "./common";

export default function Circular({ meta, onStudy }: SimProps) {
  const [radius, setRadius] = useState(2.2);
  const [speed, setSpeed] = useState(4);
  const [mass, setMass] = useState(1.5);
  const [vectors, setVectors] = useState(true);

  const omega = speed / radius;
  const period = (2 * Math.PI) / omega;
  const force = (mass * speed * speed) / radius;
  const accel = (speed * speed) / radius;

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, _dt: number) => {
    grid(ctx, w, h, 34);
    const cx = w / 2 + 10;
    const cy = h / 2 + 6;
    const R = Math.min(w, h) * 0.29 + radius * 7;

    // orbit
    ctx.save();
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = "rgba(148,178,205,0.28)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // radius spoke
    const ang = t * omega;
    const px = cx + R * Math.cos(ang);
    const py = cy + R * Math.sin(ang);
    ctx.save();
    ctx.strokeStyle = "rgba(56,225,196,0.28)";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.restore();

    // trail
    ctx.save();
    for (let i = 0; i < 26; i++) {
      const aa = ang - i * 0.075;
      const alpha = (1 - i / 26) * 0.55;
      ctx.fillStyle = `rgba(56,225,196,${alpha})`;
      ctx.beginPath();
      ctx.arc(cx + R * Math.cos(aa), cy + R * Math.sin(aa), 2.6 - i * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // centre
    ctx.save();
    ctx.strokeStyle = "rgba(248,177,60,0.6)";
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(248,177,60,0.25)";
    ctx.fill();
    ctx.restore();

    // velocity tangent
    const tx = -Math.sin(ang);
    const ty = Math.cos(ang);
    arrow(ctx, px, py, px + tx * 62, py + ty * 62, theme.aqua, 2.2, 8);
    label(ctx, "v", px + tx * 70, py + ty * 70, { color: theme.aqua, size: 10 });

    // inward force
    arrow(ctx, px, py, px - Math.cos(ang) * 58, py - Math.sin(ang) * 58, theme.rose, 2.2, 8);
    label(ctx, "F꜀", px - Math.cos(ang) * 68, py - Math.sin(ang) * 68, { color: theme.rose, size: 10 });

    if (vectors) {
      // radial/tangential decomposition frame
      ctx.save();
      ctx.strokeStyle = "rgba(167,139,250,0.85)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - Math.cos(ang) * 100, py - Math.sin(ang) * 100);
      ctx.moveTo(px, py);
      ctx.lineTo(px + tx * 100, py + ty * 100);
      ctx.stroke();
      ctx.restore();
      label(ctx, "radial −r̂", px - Math.cos(ang) * 112, py - Math.sin(ang) * 112 - 9, {
        size: 8.5,
        color: theme.violet,
      });
      label(ctx, "tangential t̂", px + tx * 112, py + ty * 112 + 9, { size: 8.5, color: theme.violet });
      label(ctx, "වේගයෙහි විශාලත්වය නියතයි; දිශාව පමණක් වෙනස් වේ", w / 2, h - 16, {
        size: 9.5,
        color: theme.muted,
      });
    }

    // angle arc
    ctx.save();
    ctx.strokeStyle = "rgba(248,177,60,0.5)";
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, ((ang % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI));
    ctx.stroke();
    ctx.restore();

    hud(ctx, 10, 10, [
      ["r", `${radius.toFixed(1)} m`],
      ["v", `${speed.toFixed(1)} m/s`],
      ["ω", `${omega.toFixed(2)} rad/s`],
      ["T", `${period.toFixed(2)} s`],
    ]);

    label(ctx, `m = ${mass.toFixed(1)} kg`, w - 14, 20, { size: 9.5, color: theme.muted, align: "right" });
  };

  return (
    <SimShell
      meta={meta}
      onStudy={onStudy}
      draw={draw}
      height={420}
      badge="CENTRIPETAL"
      controls={
        <>
          <VectorButton on={vectors} onToggle={() => setVectors((v) => !v)} label="දෛශික/බල විශ්ලේෂණය" en="Show force vectors" />
          <Slider label="වෘත්ත අරය" en="Radius, r" value={radius} min={1} max={5} step={0.1} digits={1} unit="m" onChange={setRadius} />
          <Slider label="ප්‍රවේගය" en="Speed, v" value={speed} min={1} max={10} step={0.1} digits={1} unit="m/s" onChange={setSpeed} />
          <Slider label="ස්කන්ධය" en="Mass, m" value={mass} min={0.5} max={5} step={0.1} digits={1} unit="kg" onChange={setMass} />
          <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-2.5 text-[10.5px] leading-relaxed text-slate-400">
            F꜀ = mv²/r යනු වෙනම බලයක් නොවේ — ආතතිය, ඝර්ෂණය හෝ ගුරුත්වය වැනි බලයක ප්‍රතිඵලයයි. අරය අඩු කළ විට
            අවශ්‍ය බලය වැඩි වේ.
          </div>
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="කේන්ද්‍රාපගාමී බලය" en="Centripetal force" value={force.toFixed(1)} unit="N" tone="rose" />
          <Stat label="කේන්ද්‍රාපගාමී ත්වරණය" en="Centripetal acceleration" value={accel.toFixed(1)} unit="m/s²" tone="ember" />
          <Stat label="කෝණික ප්‍රවේගය" en="Angular velocity" value={omega.toFixed(2)} unit="rad/s" />
          <Stat label="කාලාවර්තය" en="Period" value={period.toFixed(2)} unit="s" tone="violet" />
        </div>
      }
    />
  );
}
