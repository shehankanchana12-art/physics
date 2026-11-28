import { useState } from "react";
import { Slider, Segmented, Stat } from "../components/ui";
import { arrow, grid, label, theme } from "../lib/theme";
import { SimShell, hud, type SimProps } from "./common";

type Mode = "string" | "open" | "closed";

export default function Stationary({ meta, onStudy }: SimProps) {
  const [mode, setMode] = useState<Mode>("string");
  const [harmonic, setHarmonic] = useState(1);
  const [length, setLength] = useState(1.2);

  const v = mode === "string" ? 180 : 340;
  const n = harmonic;
  let lambda: number;
  let f: number;
  let f1: number;
  if (mode === "closed") {
    const h = 2 * n - 1;
    lambda = (4 * length) / h;
    f1 = v / (4 * length);
    f = h * f1;
  } else {
    lambda = (2 * length) / n;
    f1 = v / (2 * length);
    f = n * f1;
  }

  const nodeCount = mode === "string" ? n + 1 : n;
  const antiCount = mode === "string" ? n : n + 1;

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    grid(ctx, w, h, 34);
    const x1 = 62;
    const x2 = w - 62;
    const L = x2 - x1;
    const cy = h * 0.5;
    const amp = 52;
    const om = 2 * Math.PI * 1.6;

    // tube for pipes
    if (mode !== "string") {
      const tubeH = 26;
      ctx.save();
      ctx.strokeStyle = "rgba(148,178,205,0.35)";
      ctx.fillStyle = "rgba(96,165,250,0.04)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.rect(x1, cy - tubeH, L, tubeH * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      if (mode === "closed") {
        ctx.save();
        ctx.fillStyle = "rgba(148,178,205,0.5)";
        ctx.fillRect(x1 - 5, cy - tubeH - 4, 6, tubeH * 2 + 8);
        ctx.restore();
        label(ctx, "වැසූ කෙළවර", x1, cy + tubeH + 18, { size: 8.5, color: theme.muted });
      }
      label(ctx, "විවෘත කෙළවර", x2, cy + tubeH + 18, { size: 8.5, color: theme.muted });
    }

    // profile
    const profile = (u: number) => {
      if (mode === "string") return Math.sin(n * Math.PI * u);
      if (mode === "open") return Math.cos(n * Math.PI * u);
      return Math.sin(((2 * n - 1) * Math.PI * u) / 2);
    };

    // envelope
    ctx.save();
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = "rgba(56,225,196,0.22)";
    for (const sgn of [1, -1]) {
      ctx.beginPath();
      for (let i = 0; i <= 240; i++) {
        const u = i / 240;
        const px = x1 + u * L;
        const py = cy - sgn * amp * profile(u);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();

    // oscillating wave
    const phase = Math.cos(om * t);
    ctx.save();
    ctx.strokeStyle = theme.aqua;
    ctx.lineWidth = 2.4;
    ctx.shadowColor = "rgba(56,225,196,0.5)";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    for (let i = 0; i <= 260; i++) {
      const u = i / 260;
      const px = x1 + u * L;
      const py = cy - amp * profile(u) * phase;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();

    // nodes
    const nodes: number[] = [];
    if (mode === "string") for (let j = 0; j <= n; j++) nodes.push(j / n);
    if (mode === "open") for (let j = 0; j < n; j++) nodes.push((2 * j + 1) / (2 * n));
    if (mode === "closed")
      for (let j = 0; j <= n; j++) {
        const u = (2 * j) / (2 * n - 1);
        if (u <= 1.0001) nodes.push(u);
      }
    nodes.forEach((u) => {
      const x = x1 + u * L;
      ctx.save();
      ctx.fillStyle = theme.rose;
      ctx.shadowColor = theme.rose;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(x, cy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // antinodes
    const antinodes: number[] = [];
    if (mode === "string") for (let j = 0; j < n; j++) antinodes.push((j + 0.5) / n);
    if (mode === "open") for (let j = 0; j <= n; j++) antinodes.push(j / n);
    if (mode === "closed") for (let j = 0; j < n; j++) antinodes.push((2 * j + 1) / (2 * (2 * n - 1)));
    antinodes.forEach((u) => {
      const x = x1 + u * L;
      arrow(ctx, x, cy - 66, x, cy - 58, theme.ember, 1.4, 5);
      arrow(ctx, x, cy + 66, x, cy + 58, theme.ember, 1.4, 5);
    });
    label(ctx, "ප්‍රතිනෝඩ (antinode)", x2, cy - 74, { size: 8.5, color: theme.ember, align: "right" });
    label(ctx, "නෝඩ (node)", x1, cy - 74, { size: 8.5, color: theme.rose, align: "left" });

    // wavelength ruler
    const yR = cy + 90;
    ctx.save();
    ctx.strokeStyle = "rgba(167,139,250,0.6)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x1, yR);
    ctx.lineTo(x1 + lambda * (L / length), yR);
    ctx.stroke();
    ctx.restore();
    arrow(ctx, x1, yR, x1 + lambda * (L / length), yR, theme.violet, 1.2, 6);
    arrow(ctx, x1 + lambda * (L / length), yR, x1, yR, theme.violet, 1.2, 6);
    label(ctx, `λ = ${lambda.toFixed(2)} m`, Math.min(x1 + (lambda * L) / length + 8, w - 20), yR - 8, {
      size: 9,
      color: theme.violet,
      align: "left",
    });

    hud(ctx, 10, 10, [
      ["mode", mode === "string" ? "string" : mode === "open" ? "open pipe" : "closed pipe"],
      ["n", `${n}`],
      ["λ", `${lambda.toFixed(2)} m`],
      ["f", `${f.toFixed(1)} Hz`],
    ]);
  };

  return (
    <SimShell
      meta={meta}
      onStudy={onStudy}
      draw={draw}
      height={400}
      badge="STANDING WAVE"
      controls={
        <>
          <Segmented
            label="මාධ්‍යය"
            en="Medium"
            value={mode}
            onChange={(m) => {
              setMode(m);
              setHarmonic(1);
            }}
            options={[
              { value: "string", label: "තන්තුව", en: "string" },
              { value: "open", label: "විවෘත නළය", en: "open pipe" },
              { value: "closed", label: "වැසූ නළය", en: "closed pipe" },
            ]}
          />
          <Slider
            label={mode === "closed" ? "හාර්මොනික අංකය n" : "හාර්මොනික අංකය n"}
            en="Harmonic number"
            value={harmonic}
            min={1}
            max={5}
            onChange={setHarmonic}
            hint={mode === "closed" ? "සැබෑ සංඛ්‍යාතය = (2n−1) f₁" : "සංඛ්‍යාතය = n f₁"}
          />
          <Slider label="දිග l" en="Length, l" value={length} min={0.6} max={2} step={0.05} digits={2} unit="m" onChange={setLength} />
          <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-2.5 font-mono text-[10.5px] leading-relaxed text-slate-400">
            {mode === "closed" ? (
              <>
                f = (2n−1)v / 4l
                <br />v = {v} m s⁻¹
              </>
            ) : (
              <>
                f = nv / 2l
                <br />v = {v} m s⁻¹
              </>
            )}
          </div>
          <p className="text-[10.5px] leading-relaxed text-slate-500">
            නෝඩ අතර දුර සැම විටම λ/2 වේ. වැසූ නළයක ඇත්තේ ඔත්තේ හාර්මොනික පමණක් බව පරීක්ෂා කරන්න.
          </p>
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="මූලික සංඛ්‍යාතය" en="Fundamental f₁" value={f1.toFixed(1)} unit="Hz" />
          <Stat label="මෙම අවස්ථාවේ f" en="Current frequency" value={f.toFixed(1)} unit="Hz" tone="ember" />
          <Stat label="තරංග ආයාමය" en="Wavelength, λ" value={lambda.toFixed(2)} unit="m" tone="violet" />
          <Stat label="නෝඩ / ප්‍රතිනෝඩ" en="Nodes / antinodes" value={`${nodeCount} / ${antiCount}`} tone="sky" />
        </div>
      }
    />
  );
}
