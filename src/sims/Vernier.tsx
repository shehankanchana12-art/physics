import { useState } from "react";
import { Slider, Segmented, Stat } from "../components/ui";
import { grid, label, roundRect, theme } from "../lib/theme";
import { SimShell, type SimProps } from "./common";

export default function Vernier({ meta, onStudy }: SimProps) {
  const [gap, setGap] = useState(12.34);
  const [lc, setLc] = useState<"0.1" | "0.05" | "0.02">("0.05");
  const [zero, setZero] = useState<"0" | "pos" | "neg">("0");

  const least = Number(lc);
  const divisions = Math.round(1 / least);
  const zeroErr = zero === "pos" ? least : zero === "neg" ? -least : 0;
  const reading = Math.max(0, gap + zeroErr);

  let msr = Math.floor(reading + 1e-9);
  let idx = Math.round((reading - msr) / least);
  while (idx >= divisions) {
    idx -= divisions;
    msr += 1;
  }
  const shown = msr + idx * least;
  const corrected = shown - zeroErr;

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    grid(ctx, w, h, 34);
    const maxMM = 32;
    const x0 = 46;
    const mm = (w - x0 - 26) / maxMM;
    const barY = h * 0.44;

    // caliper beam
    ctx.save();
    ctx.fillStyle = "rgba(22,38,63,0.95)";
    roundRect(ctx, x0 - 18, barY - 14, w - x0 + 6, 30, 5);
    ctx.fill();
    ctx.strokeStyle = "rgba(148,178,205,0.3)";
    ctx.stroke();
    ctx.restore();

    // main scale ticks
    ctx.save();
    for (let i = 0; i <= maxMM; i++) {
      const x = x0 + i * mm;
      const major = i % 5 === 0;
      ctx.strokeStyle = major ? "rgba(203,216,232,0.85)" : "rgba(148,178,205,0.5)";
      ctx.lineWidth = major ? 1.3 : 0.9;
      ctx.beginPath();
      ctx.moveTo(x, barY - 14);
      ctx.lineTo(x, barY - 14 + (major ? 13 : 8));
      ctx.stroke();
      if (major) {
        label(ctx, `${i}`, x, barY - 22, { size: 8.5, color: theme.muted });
      }
    }
    ctx.restore();
    label(ctx, "ප්‍රධාන පරිමාණය / MAIN SCALE (mm)", x0, barY + 32, {
      size: 8.5,
      color: theme.muted,
      align: "left",
    });

    // fixed jaw
    const jawTop = barY - 84;
    ctx.save();
    ctx.strokeStyle = "rgba(56,225,196,0.85)";
    ctx.fillStyle = "rgba(56,225,196,0.14)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0 - 18, jawTop + 30);
    ctx.lineTo(x0 - 18, barY + 12);
    ctx.lineTo(x0 + 4, barY + 12);
    ctx.lineTo(x0 + 4, jawTop + 30);
    ctx.stroke();
    ctx.fill();
    ctx.restore();

    // sliding jaw at true gap
    const sx = x0 + gap * mm;
    ctx.save();
    ctx.strokeStyle = "rgba(248,177,60,0.9)";
    ctx.fillStyle = "rgba(248,177,60,0.16)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx + 2, jawTop + 30);
    ctx.lineTo(sx + 2, barY + 12);
    ctx.lineTo(sx + 24, barY + 12);
    ctx.lineTo(sx + 24, jawTop + 30);
    ctx.stroke();
    ctx.fill();
    ctx.restore();
    label(ctx, "චලන ජෝරුව", sx + 13, jawTop + 22, { size: 8.5, color: theme.ember });

    // measured object
    ctx.save();
    ctx.fillStyle = "rgba(96,165,250,0.35)";
    ctx.strokeStyle = "rgba(96,165,250,0.9)";
    roundRect(ctx, x0 + 4, jawTop + 46, Math.max(2, gap * mm - 2), 34, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    label(ctx, `වස්තුව ${gap.toFixed(2)} mm`, x0 + 4 + (gap * mm) / 2, jawTop + 63, {
      size: 8.5,
      color: theme.sky,
    });

    // vernier scale block
    const vy = barY + 16;
    const vpitch = ((divisions - 1) / divisions) * mm;
    ctx.save();
    ctx.fillStyle = "rgba(10,20,34,0.98)";
    roundRect(ctx, sx - 2, vy - 2, vpitch * (divisions - 1) + 16, 42, 5);
    ctx.fill();
    ctx.strokeStyle = "rgba(248,177,60,0.45)";
    ctx.stroke();
    for (let i = 0; i < divisions; i++) {
      const x = sx + i * vpitch;
      const hit = i === idx;
      ctx.strokeStyle = hit ? theme.ember : "rgba(203,216,232,0.62)";
      ctx.lineWidth = hit ? 2.2 : 1;
      ctx.beginPath();
      ctx.moveTo(x, vy + 2);
      ctx.lineTo(x, vy + (hit ? 26 : 18));
      ctx.stroke();
      if (i % 5 === 0 || hit) {
        label(ctx, `${i}`, x, vy + 34, { size: 8, color: hit ? theme.ember : theme.muted });
      }
    }
    ctx.restore();
    label(ctx, "වර්නියර් පරිමාණය / VERNIER", sx + 4, vy + 54, {
      size: 8.5,
      color: theme.ember,
      align: "left",
    });

    // coinciding tick highlight line
    if (idx > 0) {
      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = "rgba(248,177,60,0.5)";
      ctx.beginPath();
      ctx.moveTo(sx + idx * vpitch, barY - 14);
      ctx.lineTo(sx + idx * vpitch, vy + 26);
      ctx.stroke();
      ctx.restore();
    }

    // readout card
    const cardX = Math.min(w - 190, Math.max(10, sx + vpitch * divisions + 24));
    ctx.save();
    ctx.fillStyle = "rgba(5,12,22,0.85)";
    ctx.strokeStyle = "rgba(56,225,196,0.25)";
    roundRect(ctx, cardX, 12, 178, 78, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    label(ctx, "කියවීම / READING", cardX + 10, 28, { size: 8.5, color: theme.muted, align: "left" });
    label(ctx, `MSR = ${msr} mm`, cardX + 10, 45, { size: 9.5, color: theme.text, align: "left" });
    label(ctx, `VSD = ${idx} × ${least} mm`, cardX + 10, 59, { size: 9.5, color: theme.text, align: "left" });
    label(ctx, `= ${shown.toFixed(2)} mm`, cardX + 10, 77, { size: 12, color: theme.aqua, align: "left" });
  };

  return (
    <SimShell
      meta={meta}
      onStudy={onStudy}
      draw={draw}
      height={360}
      badge="LEAST COUNT"
      controls={
        <>
          <Slider
            label="වස්තුවේ සැබෑ මිනුම"
            en="True dimension"
            value={gap}
            min={0}
            max={30}
            step={0.01}
            digits={2}
            unit="mm"
            onChange={setGap}
          />
          <Slider label="මිනුම් අවම අගය (LC)" en="Least count" value={Number(lc)} min={0.02} max={0.1} step={0.01} digits={2} unit="mm" onChange={(v) => setLc(v <= 0.03 ? "0.02" : v <= 0.07 ? "0.05" : "0.1")} />
          <Segmented
            label="ශුන්‍ය දෝෂය"
            en="Zero error"
            value={zero}
            onChange={setZero}
            options={[
              { value: "neg", label: "−LC", en: "negative" },
              { value: "0", label: "0", en: "none" },
              { value: "pos", label: "+LC", en: "positive" },
            ]}
          />
          <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-2.5 font-mono text-[10.5px] leading-relaxed text-slate-400">
            R = MSR + (VSD × LC) − zero error
            <br />
            R = {msr} + ({idx} × {least}) − ({zeroErr.toFixed(2)}) = <span className="text-aqua-400">{corrected.toFixed(2)} mm</span>
          </div>
          <p className="text-[10.5px] leading-relaxed text-slate-500">
            අවම අගය වෙනස් කර වර්නියර් බෙදුම් ගණනත්, එකිනෙක ගැලපෙන ඉරි පිහිටීමත් නිරීක්ෂණය කරන්න.
          </p>
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="මිනුම් අවම අගය" en="Least count" value={least.toFixed(2)} unit="mm" />
          <Stat label="වර්නියර් බෙදුම්" en="Vernier divisions" value={divisions} tone="sky" />
          <Stat label="උපකරණ කියවීම" en="Instrument reading" value={shown.toFixed(2)} unit="mm" tone="ember" />
          <Stat label="නිවැරදි කළ මිනුම" en="Corrected reading" value={corrected.toFixed(2)} unit="mm" tone="violet" />
        </div>
      }
    />
  );
}
