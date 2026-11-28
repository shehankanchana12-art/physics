import { useState } from "react";
import { Slider, Segmented, Stat } from "../components/ui";
import { arrow, grid, label, roundRect, theme } from "../lib/theme";
import { SimShell, hud, type SimProps } from "./common";

type Mode = "series" | "parallel";

export default function Circuit({ meta, onStudy }: SimProps) {
  const [emf, setEmf] = useState(12);
  const [rInt, setRInt] = useState(1);
  const [r1, setR1] = useState(6);
  const [r2, setR2] = useState(12);
  const [mode, setMode] = useState<Mode>("series");
  const [meter, setMeter] = useState<"A" | "V">("A");

  const rext = mode === "series" ? r1 + r2 : (r1 * r2) / (r1 + r2);
  const I = emf / (rext + rInt);
  const vTerm = emf - I * rInt;
  const i1 = mode === "series" ? I : (vTerm / r1);
  const i2 = mode === "series" ? I : vTerm / r2;
  const p1 = i1 * i1 * r1;
  const p2 = i2 * i2 * r2;
  const pInt = I * I * rInt;
  const efficiency = (vTerm / emf) * 100;

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    grid(ctx, w, h, 34);
    const xL = 70;
    const xR = w - 60;
    const yT = 84;
    const yB = h - 92;
    const midY = (yT + yB) / 2;

    const dashOffset = -(t * Math.min(60, I * 16 + 6)) % 24;

    const wire = (x1: number, y1: number, x2: number, y2: number) => {
      ctx.save();
      ctx.strokeStyle = "rgba(203,216,232,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      if (I > 0.02) {
        ctx.strokeStyle = "rgba(56,225,196,0.95)";
        ctx.lineWidth = 2.2;
        ctx.setLineDash([3, 21]);
        ctx.lineDashOffset = dashOffset;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();
    };

    const resistor = (x: number, y: number, rw: number, rh: number, name: string, val: number, vertical = false) => {
      ctx.save();
      ctx.fillStyle = "rgba(248,177,60,0.16)";
      ctx.strokeStyle = theme.ember;
      ctx.lineWidth = 1.6;
      roundRect(ctx, x - rw / 2, y - rh / 2, rw, rh, 4);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      label(ctx, val.toFixed(0) + " Ω", x, y, { size: 9.5, color: theme.ember, weight: "600" });
      label(ctx, name, x + (vertical ? rw : 0), y + (vertical ? 0 : rh / 2 + 12), {
        size: 8,
        color: theme.muted,
      });
    };

    // main loop
    wire(xL, yT, xL, yB);
    wire(xL, yB, xR, yB);
    wire(xR, yB, xR, yT);
    wire(xL, yT, xR, yT);

    // battery on left
    const by = midY;
    ctx.save();
    ctx.fillStyle = theme.bg;
    ctx.fillRect(xL - 9, by - 26, 18, 52);
    ctx.strokeStyle = "rgba(248,177,60,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xL - 12, by - 14);
    ctx.lineTo(xL + 12, by - 14);
    ctx.moveTo(xL - 7, by - 5);
    ctx.lineTo(xL + 7, by - 5);
    ctx.moveTo(xL - 12, by + 4);
    ctx.lineTo(xL + 12, by + 4);
    ctx.moveTo(xL - 7, by + 13);
    ctx.lineTo(xL + 7, by + 13);
    ctx.stroke();
    ctx.restore();
    label(ctx, `ε = ${emf} V`, xL - 22, by - 40, { size: 9, color: theme.ember, align: "right" });
    label(ctx, `r = ${rInt.toFixed(1)} Ω`, xL - 22, by + 48, { size: 8.5, color: theme.muted, align: "right" });

    // ammeter on top wire
    const ax = xL + (xR - xL) * 0.22;
    ctx.save();
    ctx.fillStyle = "rgba(8,18,32,1)";
    ctx.strokeStyle = "rgba(56,225,196,0.8)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(ax, yT, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    label(ctx, "A", ax, yT, { size: 11, color: theme.aqua, weight: "700" });

    if (mode === "series") {
      resistor(xL + (xR - xL) * 0.5, yT, 62, 26, "R₁", r1);
      resistor(xL + (xR - xL) * 0.76, yB, 62, 26, "R₂", r2);
    } else {
      const xA = xL + (xR - xL) * 0.44;
      const xB = xL + (xR - xL) * 0.82;
      wire(xA, yT, xA, yB);
      wire(xB, yT, xB, yB);
      wire(xA, midY, xB, midY);
      resistor((xA + xB) / 2, yT, 58, 24, "R₁", r1);
      resistor((xA + xB) / 2, midY, 58, 24, "R₂", r2);
      label(ctx, "සමාන්තර", (xA + xB) / 2, midY + 34, { size: 8.5, color: theme.violet });
      // hide the duplicated top wire resistor by redrawing nodes
      [xA, xB].forEach((nx) => {
        ctx.save();
        ctx.fillStyle = theme.aqua;
        ctx.beginPath();
        ctx.arc(nx, yT, 3.4, 0, Math.PI * 2);
        ctx.arc(nx, midY, 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    // voltmeter across battery
    const vx = xL + 40;
    ctx.save();
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = "rgba(167,139,250,0.5)";
    ctx.beginPath();
    ctx.moveTo(vx, yB);
    ctx.lineTo(vx, yB - 46);
    ctx.moveTo(vx, yB - 46);
    ctx.lineTo(vx + 40, yB - 46);
    ctx.moveTo(xL, yT);
    ctx.lineTo(xL - 30, yT);
    ctx.lineTo(xL - 30, yB - 46);
    ctx.lineTo(vx, yB - 46);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = "rgba(8,18,32,1)";
    ctx.strokeStyle = "rgba(167,139,250,0.9)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(vx - 22, yB - 46, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    label(ctx, "V", vx - 22, yB - 46, { size: 10, color: theme.violet, weight: "700" });
    label(ctx, `${meter === "V" ? vTerm.toFixed(2) + " V" : I.toFixed(2) + " A"}`, vx + 10, yB - 62, {
      size: 9,
      color: theme.violet,
      align: "left",
    });

    // terminal pd marker
    arrow(ctx, xR + 22, yB, xR + 22, yT, theme.sky, 1.2, 5);
    label(ctx, `V = ${vTerm.toFixed(2)} V`, xR + 28, midY, { size: 8.5, color: theme.sky, align: "left" });

    hud(ctx, 10, 10, [
      ["I", `${I.toFixed(2)} A`],
      ["V_term", `${vTerm.toFixed(2)} V`],
      ["R_ext", `${rext.toFixed(2)} Ω`],
      ["P_load", `${(p1 + p2).toFixed(1)} W`],
    ], 142);
    void meter;
  };

  return (
    <SimShell
      meta={meta}
      onStudy={onStudy}
      draw={draw}
      height={420}
      badge="DC CIRCUIT"
      controls={
        <>
          <Segmented
            label="සම්බන්ධතාව"
            en="Connection"
            value={mode}
            onChange={setMode}
            options={[
              { value: "series", label: "ශ්‍රේණි", en: "series" },
              { value: "parallel", label: "සමාන්තර", en: "parallel" },
            ]}
          />
          <Slider label="emf (ε)" en="EMF" value={emf} min={1.5} max={24} step={0.5} digits={1} unit="V" onChange={setEmf} />
          <Slider label="අභ්‍යන්තර ප්‍රතිරෝධය r" en="Internal resistance" value={rInt} min={0} max={6} step={0.1} digits={1} unit="Ω" onChange={setRInt} />
          <Slider label="ප්‍රතිරෝධකය R₁" en="Resistor R₁" value={r1} min={1} max={50} step={1} unit="Ω" onChange={setR1} />
          <Slider label="ප්‍රතිරෝධකය R₂" en="Resistor R₂" value={r2} min={1} max={50} step={1} unit="Ω" onChange={setR2} />
          <Segmented label="මීටර කියවීම" en="Meter" value={meter} onChange={setMeter} options={[{ value: "A", label: "A" }, { value: "V", label: "V" }]} cols={2} />
          <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-2.5 font-mono text-[10.5px] leading-relaxed text-slate-400">
            I = ε/(R+r) = {I.toFixed(2)} A
            <br />
            V = ε − Ir = {vTerm.toFixed(2)} V
          </div>
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="ධාරාව" en="Current" value={I.toFixed(2)} unit="A" />
          <Stat label="අග්‍ර වෝල්ටීයතාව" en="Terminal pd" value={vTerm.toFixed(2)} unit="V" tone="ember" />
          <Stat label="භාර බලය" en="Power in load" value={(p1 + p2).toFixed(1)} unit="W" tone="violet" />
          <Stat label="කාර්යක්ෂමතාව" en="Efficiency" value={efficiency.toFixed(0)} unit="%" tone="sky" />
        </div>
      }
    />
  );
}
