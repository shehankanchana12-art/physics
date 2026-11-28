import { useState } from "react";
import { Slider, Segmented, Stat } from "../components/ui";
import { arrow, axes, grid, label, roundRect, theme } from "../lib/theme";
import { SimShell, hud, type SimProps } from "./common";

const METALS = {
  sodium: { name: "සෝඩියම්", en: "sodium", phi: 2.28 },
  zinc: { name: "සින්ක්", en: "zinc", phi: 4.30 },
  copper: { name: "තඹ", en: "copper", phi: 4.70 },
} as const;

type Metal = keyof typeof METALS;

const h = 4.135667e-15;
const c = 2.998e8;

export default function Photoelectric({ meta, onStudy }: SimProps) {
  const [metal, setMetal] = useState<Metal>("sodium");
  const [lambdaNm, setLambdaNm] = useState(420);
  const [intensity, setIntensity] = useState(60);

  const phi = METALS[metal].phi;
  const lambda = lambdaNm * 1e-9;
  const freq = c / lambda;
  const eEnergy = h * freq; // eV
  const keMax = Math.max(0, eEnergy - phi);
  const emitting = eEnergy > phi;
  const f0 = phi / h;
  const vs = keMax;
  const current = emitting ? (intensity / 100) * 6.2 : 0;

  const draw = (ctx: CanvasRenderingContext2D, w: number, hh: number, t: number) => {
    grid(ctx, w, hh, 34);
    const plateX = w * 0.33;
    const anodeX = w * 0.66;
    const cy = hh * 0.42;
    const plateH = 130;

    // photons from lamp
    const lampX = 34;
    ctx.save();
    ctx.fillStyle = "rgba(248,177,60,0.15)";
    ctx.strokeStyle = "rgba(248,177,60,0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(lampX, cy, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    label(ctx, "ආලෝක මූලාශ්‍රය", lampX, cy + 30, { size: 8, color: theme.ember });

    const photons = Math.round(2 + (intensity / 100) * 7);
    for (let i = 0; i < photons; i++) {
      const u = ((t * 0.55 + i / photons) % 1);
      const px = lampX + 24 + u * (plateX - lampX - 30);
      ctx.save();
      ctx.strokeStyle = `rgba(248,177,60,${0.35 + 0.5 * (1 - u)})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(px - 7, cy + Math.sin(px * 0.12) * 4);
      ctx.lineTo(px + 4, cy + Math.sin(px * 0.12) * 4);
      ctx.stroke();
      ctx.restore();
    }
    label(ctx, `I = ${intensity}%`, lampX, cy - 32, { size: 8.5, color: theme.ember });

    // cathode plate
    ctx.save();
    ctx.fillStyle = emitting ? "rgba(56,225,196,0.22)" : "rgba(125,147,173,0.16)";
    ctx.strokeStyle = emitting ? theme.aqua : "rgba(148,178,205,0.5)";
    ctx.lineWidth = 2;
    roundRect(ctx, plateX - 8, cy - plateH / 2, 16, plateH, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    label(ctx, `ලෝහය: ${METALS[metal].name}`, plateX - 12, cy + plateH / 2 + 18, {
      size: 8.5,
      color: theme.aqua,
      align: "right",
    });

    // anode
    ctx.save();
    ctx.fillStyle = "rgba(96,165,250,0.18)";
    ctx.strokeStyle = "rgba(96,165,250,0.75)";
    ctx.lineWidth = 2;
    roundRect(ctx, anodeX - 7, cy - plateH / 2, 14, plateH, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    label(ctx, "ඇනෝඩය", anodeX + 10, cy + plateH / 2 + 18, { size: 8.5, color: theme.sky, align: "left" });

    // electrons
    if (emitting) {
      const n = Math.round(2 + (intensity / 100) * 8);
      for (let i = 0; i < n; i++) {
        const u = (t * (0.32 + keMax * 0.12) + i / n) % 1;
        const px = plateX + 10 + u * (anodeX - plateX - 20);
        const py = cy + (((i % 5) - 2) * 26) * (0.5 + u * 0.6);
        ctx.save();
        ctx.fillStyle = theme.aqua;
        ctx.shadowColor = theme.aqua;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      arrow(ctx, plateX + 16, cy - plateH / 2 - 14, anodeX - 12, cy - plateH / 2 - 14, theme.aqua, 1.5, 6);
      label(ctx, "ඉලෙක්ට්‍රෝන ප්‍රවාහය", (plateX + anodeX) / 2, cy - plateH / 2 - 26, {
        size: 8.5,
        color: theme.aqua,
      });
    } else {
      label(ctx, "සීමා සංඛ්‍යාතයට වඩා අඩුයි — ඉලෙක්ට්‍රෝන නිකුත් නොවේ", (plateX + anodeX) / 2, cy, {
        size: 10,
        color: theme.rose,
      });
    }

    // circuit
    ctx.save();
    ctx.strokeStyle = "rgba(203,216,232,0.45)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(plateX, cy + plateH / 2);
    ctx.lineTo(plateX, hh - 96);
    ctx.lineTo(anodeX, hh - 96);
    ctx.lineTo(anodeX, cy + plateH / 2);
    ctx.stroke();
    ctx.restore();
    // microammeter
    ctx.save();
    ctx.fillStyle = "rgba(8,18,32,1)";
    ctx.strokeStyle = "rgba(167,139,250,0.8)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc((plateX + anodeX) / 2, hh - 96, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    label(ctx, "µA", (plateX + anodeX) / 2, hh - 96, { size: 9, color: theme.violet });
    label(ctx, `${current.toFixed(2)} µA`, (plateX + anodeX) / 2, hh - 72, {
      size: 9,
      color: theme.violet,
    });

    // KE vs f graph
    const gx = w * 0.6;
    const gy = hh - 40;
    const gw = w - gx - 24;
    const gh = 120;
    const fMax = 2.4e15;
    axes(ctx, gx, gy - gh, gw, gh, "f (Hz)", "KE_max (eV)");
    ctx.save();
    ctx.strokeStyle = "rgba(148,178,205,0.14)";
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + gw, gy - gh);
    ctx.stroke();
    ctx.restore();
    const toX = (f: number) => gx + (f / fMax) * gw;
    const toY = (ke: number) => gy - (ke / 3.5) * gh;
    const f0x = Math.min(fMax, f0);
    ctx.save();
    ctx.strokeStyle = theme.ember;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(toX(f0x), toY(0));
    ctx.lineTo(toX(fMax), toY((fMax - f0) * 4.135667e-15));
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = theme.ember;
    ctx.beginPath();
    ctx.arc(toX(Math.min(freq, fMax)), toY(Math.min(keMax, 3.5)), 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    label(ctx, `f₀ = ${(f0 / 1e14).toFixed(2)}×10¹⁴`, toX(f0x) + 4, gy + 12, {
      size: 7.5,
      color: theme.ember,
      align: "left",
    });
    label(ctx, "සීමා සංඛ්‍යාතය", toX(f0x) + 4, gy + 23, { size: 7.5, color: theme.muted, align: "left" });

    hud(ctx, 10, 10, [
      ["λ", `${lambdaNm} nm`],
      ["E_ph", `${eEnergy.toFixed(2)} eV`],
      ["φ", `${phi.toFixed(2)} eV`],
      ["KE_max", `${keMax.toFixed(2)} eV`],
    ], 138);
  };

  return (
    <SimShell
      meta={meta}
      onStudy={onStudy}
      draw={draw}
      height={430}
      badge="PHOTOELECTRIC"
      controls={
        <>
          <Segmented
            label="ලෝහය"
            en="Metal (work function)"
            value={metal}
            onChange={setMetal}
            options={[
              { value: "sodium", label: "සෝඩියම්", en: "2.28 eV" },
              { value: "zinc", label: "සින්ක්", en: "4.30 eV" },
              { value: "copper", label: "තඹ", en: "4.70 eV" },
            ]}
          />
          <Slider label="තරංග ආයාමය" en="Wavelength, λ" value={lambdaNm} min={200} max={700} step={5} unit="nm" onChange={setLambdaNm} />
          <Slider label="ආලෝක තීව්‍රතාව" en="Intensity" value={intensity} min={0} max={100} step={5} unit="%" onChange={setIntensity} />
          <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-2.5 font-mono text-[10.5px] leading-relaxed text-slate-400">
            hf = φ + KE_max
            <br />
            {(eEnergy).toFixed(2)} = {phi.toFixed(2)} + {keMax.toFixed(2)} eV
            <br />
            V_s = {vs.toFixed(2)} V
          </div>
          <p className="text-[10.5px] leading-relaxed text-slate-500">
            λ අඩු කර (f වැඩි කර) KE_max වැඩි වේ. තීව්‍රතාව වැඩි කළ විට ධාරාව පමණක් වැඩි වේ.
          </p>
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="ෆෝටෝන ශක්තිය" en="Photon energy" value={eEnergy.toFixed(2)} unit="eV" />
          <Stat label="උපරිම චාලක ශක්තිය" en="KE max" value={keMax.toFixed(2)} unit="eV" tone="ember" />
          <Stat label="නවතන විභවය" en="Stopping potential" value={vs.toFixed(2)} unit="V" tone="violet" />
          <Stat label="සීමා තරංග ආයාමය" en="Threshold λ" value={(c / f0 * 1e9).toFixed(0)} unit="nm" tone="sky" />
        </div>
      }
    />
  );
}
