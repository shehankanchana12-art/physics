import { useState } from "react";
import { Slider, Stat } from "../components/ui";
import { arrow, axes, grid, label, theme } from "../lib/theme";
import { SimShell, hud, type SimProps } from "./common";

function spectrum(nm: number) {
  let r = 0;
  let g = 0;
  let b = 0;
  if (nm < 440) {
    r = (440 - nm) / 60;
    b = 1;
  } else if (nm < 490) {
    g = (nm - 440) / 50;
    b = 1;
  } else if (nm < 510) {
    g = 1;
    b = (510 - nm) / 20;
  } else if (nm < 580) {
    r = (nm - 510) / 70;
    g = 1;
  } else if (nm < 645) {
    r = 1;
    g = (645 - nm) / 65;
  } else {
    r = 1;
  }
  return { css: `rgb(${Math.round(r * 235)},${Math.round(g * 235)},${Math.round(b * 235)})`, r, g, b };
}

export default function Interference({ meta, onStudy }: SimProps) {
  const [lambdaNm, setLambdaNm] = useState(589);
  const [dMM, setDMM] = useState(0.30);
  const [aMM, setAMM] = useState(0.06);
  const [D, setD] = useState(1.6);

  const lambda = lambdaNm * 1e-9;
  const d = dMM * 1e-3;
  const a = aMM * 1e-3;
  const fringeMM = ((lambda * D) / d) * 1000;
  const maxOrder = Math.floor((d / lambda) * Math.sin(Math.atan(0.012 / D)));

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    grid(ctx, w, h, 34);
    const col = spectrum(lambdaNm);
    const gx = 58;
    const gw = w - gx - 26;
    const gy = h * 0.42;
    const gh = h * 0.44;
    const half = 9; // mm each side

    // intensity curve
    const intensity = (yMM: number) => {
      const th = Math.atan((yMM * 1e-3) / D);
      const delta = (Math.PI * d * Math.sin(th)) / lambda;
      const beta = (Math.PI * a * Math.sin(th)) / lambda;
      const env = beta === 0 ? 1 : Math.pow(Math.sin(beta) / beta, 2);
      return Math.cos(delta / 2) ** 2 * env;
    };

    ctx.save();
    ctx.strokeStyle = "rgba(148,178,205,0.16)";
    ctx.beginPath();
    ctx.moveTo(gx, gy - gh / 2 - 8);
    ctx.lineTo(gx, gy + gh / 2 + 8);
    ctx.stroke();
    ctx.restore();

    axes(ctx, gx, gy - gh / 2, gw, gh, "තිරයේ පිහිටීම y (mm)", "I / I₀");

    ctx.save();
    const grad = ctx.createLinearGradient(gx, 0, gx + gw, 0);
    grad.addColorStop(0, col.css);
    grad.addColorStop(1, col.css);
    ctx.shadowColor = col.css;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    for (let i = 0; i <= 500; i++) {
      const u = i / 500;
      const yMM = (u * 2 - 1) * half;
      const px = gx + u * gw;
      const py = gy + gh / 2 - intensity(yMM) * gh;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();

    // centre marker and fringe spacing
    const cx = gx + gw / 2;
    ctx.save();
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = "rgba(248,177,60,0.4)";
    ctx.beginPath();
    ctx.moveTo(cx, gy - gh / 2);
    ctx.lineTo(cx, gy + gh / 2);
    ctx.stroke();
    ctx.restore();
    label(ctx, "0", cx, gy + gh / 2 + 14, { size: 8, color: theme.muted });

    const spacingPx = (fringeMM / (2 * half)) * gw;
    if (spacingPx > 4) {
      const yA = gy + gh / 2 - 6;
      ctx.save();
      ctx.strokeStyle = theme.ember;
      ctx.beginPath();
      ctx.moveTo(cx, yA);
      ctx.lineTo(cx + spacingPx, yA);
      ctx.stroke();
      ctx.restore();
      label(ctx, "β", cx + spacingPx / 2, yA - 8, { size: 9, color: theme.ember });
    }

    // interference pattern strip
    const stripY = h - 54;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(gx, stripY, gw, 20);
    for (let px = 0; px < gw; px += 2) {
      const yMM = ((px / gw) * 2 - 1) * half;
      const I = intensity(yMM);
      ctx.fillStyle = `rgba(${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)},${0.08 + 0.92 * I})`;
      ctx.fillRect(gx + px, stripY, 2, 20);
    }
    ctx.restore();
    label(ctx, "තිරයේ ලැබෙන රටාව / FRINGE PATTERN", gx, stripY - 8, {
      size: 8.5,
      color: theme.muted,
      align: "left",
    });

    // double slit schematic
    const sy = 44;
    const slitX = gx + 46;
    ctx.save();
    ctx.strokeStyle = "rgba(148,178,205,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(slitX, sy - 26);
    ctx.lineTo(slitX, sy - 5);
    ctx.moveTo(slitX, sy + 5);
    ctx.lineTo(slitX, sy + 26);
    ctx.stroke();
    ctx.restore();
    label(ctx, "d", slitX - 12, sy, { size: 8.5, color: theme.ember, align: "right" });
    arrow(ctx, slitX - 6, sy - 5, slitX - 6, sy + 5, theme.ember, 1, 4);
    arrow(ctx, slitX - 6, sy + 5, slitX - 6, sy - 5, theme.ember, 1, 4);

    // rays
    ctx.save();
    ctx.strokeStyle = col.css;
    ctx.globalAlpha = 0.35;
    for (let k = -3; k <= 3; k++) {
      const yTarget = sy + k * 9;
      ctx.beginPath();
      ctx.moveTo(slitX + 2, sy - 5);
      ctx.lineTo(w - 24, yTarget + (h * 0.3 - sy));
      ctx.stroke();
    }
    ctx.restore();
    label(ctx, "S₁", slitX + 8, sy - 5, { size: 8, color: theme.muted, align: "left" });
    label(ctx, "S₂", slitX + 8, sy + 5, { size: 8, color: theme.muted, align: "left" });
    label(ctx, `D = ${D.toFixed(1)} m`, w - 20, 20, { size: 9, color: theme.muted, align: "right" });

    hud(ctx, 10, h - 96, [
      ["λ", `${lambdaNm} nm`],
      ["β", `${fringeMM.toFixed(2)} mm`],
      ["orders", `±${Math.max(0, maxOrder)}`],
    ], 112);
  };

  return (
    <SimShell
      meta={meta}
      onStudy={onStudy}
      draw={draw}
      height={430}
      badge="YOUNG'S SLITS"
      controls={
        <>
          <Slider label="තරංග ආයාමය" en="Wavelength, λ" value={lambdaNm} min={400} max={700} step={1} unit="nm" onChange={setLambdaNm} />
          <Slider label="සිදුරු අතර දුර" en="Slit separation, d" value={dMM} min={0.1} max={0.6} step={0.01} digits={2} unit="mm" onChange={setDMM} />
          <Slider label="සිදුරේ පළල" en="Slit width, a" value={aMM} min={0.02} max={0.2} step={0.01} digits={2} unit="mm" onChange={setAMM} />
          <Slider label="තිරයට දුර" en="Screen distance, D" value={D} min={0.5} max={3} step={0.1} digits={1} unit="m" onChange={setD} />
          <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-2.5 text-[10.5px] leading-relaxed text-slate-400">
            β = λD/d = <span className="font-mono text-aqua-400">{fringeMM.toFixed(2)} mm</span>. d වැඩි කළ විට රටාව
            තද වේ; λ වැඩි කළ විට පළල් වේ. සිදුරේ පළල විවර්තන ලියාව පාලනය කරයි.
          </div>
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="පරතරය β" en="Fringe spacing" value={fringeMM.toFixed(2)} unit="mm" />
          <Stat label="සංඛ්‍යාතය" en="Frequency" value={(2.998e8 / lambda).toExponential(2)} unit="Hz" tone="violet" />
          <Stat label="ෆෝටෝන ශක්තිය" en="Photon energy" value={((6.626e-34 * 2.998e8) / lambda / 1.602e-19).toFixed(2)} unit="eV" tone="ember" />
          <Stat label="දෘශ්‍ය පරාසය" en="Visible range" value={lambdaNm < 450 ? "නිල්" : lambdaNm < 495 ? "නිල/කොළ" : lambdaNm < 570 ? "කොළ/කහ" : lambdaNm < 590 ? "කහ" : lambdaNm < 620 ? "තැඹිලි" : "රතු"} tone="sky" />
        </div>
      }
    />
  );
}
