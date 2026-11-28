import { useState } from "react";
import { Slider, Stat, EnergyBars } from "../components/ui";
import { arrow, grid, label, theme } from "../lib/theme";
import { SimShell, hud, type SimProps } from "./common";

export default function Shm({ meta, onStudy }: SimProps) {
  const [amp, setAmp] = useState(0.12);
  const [period, setPeriod] = useState(1.4);
  const m = 1;

  const omega = (2 * Math.PI) / period;
  const k = m * omega * omega;
  const vmax = omega * amp;
  const amax = omega * omega * amp;

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    grid(ctx, w, h, 34);
    const leftW = Math.min(250, w * 0.4);
    const x0 = leftW / 2 + 6;
    const ceil = 34;
    const eqY = h * 0.62;
    const pxPerM = Math.min(430, (h * 0.32) / 0.25);

    const x = amp * Math.cos(omega * t);
    const v = -amp * omega * Math.sin(omega * t);

    // ceiling
    ctx.strokeStyle = "rgba(148,178,205,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0 - 46, ceil);
    ctx.lineTo(x0 + 46, ceil);
    ctx.stroke();

    // equilibrium line
    ctx.save();
    ctx.setLineDash([4, 5]);
    ctx.strokeStyle = "rgba(148,178,205,0.28)";
    ctx.beginPath();
    ctx.moveTo(x0 - 60, eqY);
    ctx.lineTo(x0 + 60, eqY);
    ctx.stroke();
    ctx.restore();
    label(ctx, "x = 0", x0 + 68, eqY, { size: 8.5, color: theme.muted, align: "left" });

    // spring
    const massY = eqY + x * pxPerM;
    const top = ceil + 4;
    const coils = 14;
    ctx.save();
    ctx.strokeStyle = "rgba(56,225,196,0.85)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x0, top);
    for (let i = 1; i <= coils; i++) {
      const yy = top + ((massY - 16 - top) * i) / coils;
      ctx.lineTo(x0 + (i % 2 === 0 ? -10 : 10), yy);
    }
    ctx.lineTo(x0, massY - 16);
    ctx.stroke();
    ctx.restore();

    // mass
    ctx.save();
    ctx.fillStyle = "rgba(56,225,196,0.18)";
    ctx.strokeStyle = theme.aqua;
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x0 - 24, massY - 16, 48, 34, 6);
    else ctx.rect(x0 - 24, massY - 16, 48, 34);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    label(ctx, `${m} kg`, x0, massY + 2, { size: 9, color: theme.aqua });

    // amplitude markers
    [amp, -amp].forEach((a) => {
      const yy = eqY + a * pxPerM;
      ctx.save();
      ctx.strokeStyle = "rgba(248,177,60,0.5)";
      ctx.beginPath();
      ctx.moveTo(x0 - 40, yy);
      ctx.lineTo(x0 + 40, yy);
      ctx.stroke();
      ctx.restore();
    });
    arrow(ctx, x0 + 32, eqY, x0 + 32, eqY - amp * pxPerM, theme.ember, 1.6, 6);
    label(ctx, "A", x0 + 42, eqY - (amp * pxPerM) / 2, { size: 9.5, color: theme.ember, align: "left" });

    // displacement vector
    arrow(ctx, x0 - 36, massY, x0 - 36, eqY, theme.violet, 2, 7);
    label(ctx, "x", x0 - 44, (massY + eqY) / 2, { size: 9, color: theme.violet, align: "right" });

    // ---- graphs ----
    const gx = leftW + 24;
    const gw = w - gx - 14;
    const gh = (h - 58) / 3;
    const window = 2 * period;
    const cursor = (t % window) / window;

    const graphs: {
      title: string;
      color: string;
      fn: (tt: number) => number;
      scale: number;
    }[] = [
      { title: "විස්ථාපනය x", color: theme.aqua, fn: (tt) => Math.cos(omega * tt), scale: amp },
      { title: "ප්‍රවේගය v", color: theme.violet, fn: (tt) => -Math.sin(omega * tt), scale: vmax },
      { title: "ත්වරණය a", color: theme.rose, fn: (tt) => -Math.cos(omega * tt), scale: amax },
    ];

    graphs.forEach((g, gi) => {
      const top = 12 + gi * gh;
      const cy = top + gh / 2;
      const half = gh / 2 - 16;
      ctx.save();
      ctx.strokeStyle = "rgba(148,178,205,0.16)";
      ctx.beginPath();
      ctx.moveTo(gx, cy);
      ctx.lineTo(gx + gw - 46, cy);
      ctx.stroke();
      ctx.restore();

      // waveform
      ctx.save();
      ctx.strokeStyle = g.color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i <= 200; i++) {
        const u = i / 200;
        const tt = u * window;
        const px = gx + u * (gw - 46);
        const py = cy - g.fn(tt) * half;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();

      // cursor
      const cxp = gx + cursor * (gw - 46);
      ctx.save();
      ctx.strokeStyle = "rgba(248,177,60,0.7)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cxp, cy - half);
      ctx.lineTo(cxp, cy + half);
      ctx.stroke();
      ctx.restore();
      const val = g.fn((t % window));
      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.arc(cxp, cy - val * half, 3.4, 0, Math.PI * 2);
      ctx.fill();

      label(ctx, g.title, gx, top + 4, { size: 9, color: g.color, align: "left" });
      label(ctx, `+${g.scale.toFixed(2)}`, gx + gw - 42, cy - half, { size: 7.5, color: theme.muted, align: "left" });
      label(ctx, `−${g.scale.toFixed(2)}`, gx + gw - 42, cy + half, { size: 7.5, color: theme.muted, align: "left" });
      label(ctx, "t", gx + gw - 38, cy + 10, { size: 8, color: theme.muted, align: "left" });
    });

    hud(ctx, 10, h - 62, [
      ["x", `${(x * 100).toFixed(1)} cm`],
      ["v", `${v.toFixed(2)} m/s`],
    ], 118);
  };

  const ke = 0.5 * m * Math.pow(vmax * Math.cos(0), 2);
  return (
    <SimShell
      meta={meta}
      onStudy={onStudy}
      draw={draw}
      height={430}
      badge="SHM"
      controls={
        <>
          <Slider label="විස්තාරය" en="Amplitude, A" value={amp} min={0.02} max={0.25} step={0.005} digits={3} unit="m" onChange={setAmp} />
          <Slider label="කාලාවර්තය" en="Period, T" value={period} min={0.5} max={3} step={0.1} digits={1} unit="s" onChange={setPeriod} />
          <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-2.5 text-[10.5px] leading-relaxed text-slate-400">
            T = 2π√(m/k). මෙම අනුකරණයේ m = 1 kg නියතයි; T වෙනස් කිරීමෙන් k ද වෙනස් වේ (k = 4π²m/T² ={" "}
            {k.toFixed(1)} N m⁻¹).
          </div>
          <EnergyBars
            items={[
              { label: "උපරිම චාලක ශක්තිය", en: "max KE", value: 0.5 * m * vmax * vmax, color: theme.aqua },
              { label: "උපරිම විභව ශක්තිය", en: "max PE", value: 0.5 * k * amp * amp, color: theme.ember },
            ]}
          />
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="කෝණික සංඛ්‍යාතය" en="Angular frequency, ω" value={omega.toFixed(2)} unit="rad/s" />
          <Stat label="උපරිම ප්‍රවේගය" en="v max" value={vmax.toFixed(2)} unit="m/s" tone="violet" />
          <Stat label="උපරිම ත්වරණය" en="a max" value={amax.toFixed(2)} unit="m/s²" tone="rose" />
          <Stat label="ස්ප්‍රිංග නියතය" en="Spring constant, k" value={k.toFixed(1)} unit="N/m" tone="ember" />
        </div>
      }
    />
  );
}
