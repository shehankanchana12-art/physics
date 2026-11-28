import { useState } from "react";
import { Slider, Segmented, Toggle, Stat } from "../components/ui";
import { arrow, grid, label, roundRect, theme } from "../lib/theme";
import { SimShell, hud, type SimProps } from "./common";

type Mode = "charges" | "capacitor";

export default function EField({ meta, onStudy }: SimProps) {
  const [mode, setMode] = useState<Mode>("charges");
  const [q1, setQ1] = useState(3);
  const [q2, setQ2] = useState(-2);
  const [sepCm, setSepCm] = useState(10);
  const [voltage, setVoltage] = useState(200);
  const [gapMm, setGapMm] = useState(4);
  const [dielectric, setDielectric] = useState(false);

  const k = 8.99e9;
  const sep = sepCm / 100;
  const force = (k * Math.abs(q1 * q2) * 1e-12) / (sep * sep);
  const plateArea = 0.02;
  const epsR = dielectric ? 3.5 : 1;
  const C = (8.85e-12 * epsR * plateArea) / (gapMm / 1000);
  const Efield = voltage / (gapMm / 1000);
  const midField = (k * Math.abs(q1 - q2) * 1e-12) / Math.pow(sep / 2, 2);

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    grid(ctx, w, h, 34);

    if (mode === "charges") {
      const cx = w / 2;
      const cy = h / 2;
      const sepPx = Math.min(sepCm * 12, w * 0.36);
      const p1 = { x: cx - sepPx / 2, y: cy };
      const p2 = { x: cx + sepPx / 2, y: cy };

      // field at pixel point
      const field = (x: number, y: number) => {
        const e = { x: 0, y: 0 };
        [
          { p: p1, q: q1 },
          { p: p2, q: q2 },
        ].forEach(({ p, q }) => {
          const dx = x - p.x;
          const dy = y - p.y;
          const r2 = dx * dx + dy * dy + 40;
          const r = Math.sqrt(r2);
          e.x += (q * dx) / (r2 * r);
          e.y += (q * dy) / (r2 * r);
        });
        return e;
      };

      const trace = (x0: number, y0: number, dir: number) => {
        let x = x0;
        let y = y0;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let i = 0; i < 260; i++) {
          const e = field(x, y);
          const m = Math.hypot(e.x, e.y);
          if (m < 1e-9) break;
          x += (e.x / m) * 4 * dir;
          y += (e.y / m) * 4 * dir;
          if (x < 2 || x > w - 2 || y < 2 || y > h - 2) break;
          if (Math.hypot(x - p1.x, y - p1.y) < 9 || Math.hypot(x - p2.x, y - p2.y) < 9) break;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      const charges = [
        { p: p1, q: q1 },
        { p: p2, q: q2 },
      ];
      ctx.save();
      ctx.strokeStyle = "rgba(56,225,196,0.4)";
      ctx.lineWidth = 1.1;
      charges.forEach(({ p, q }) => {
        const n = 14;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          trace(p.x + Math.cos(a) * 10, p.y + Math.sin(a) * 10, q > 0 ? 1 : -1);
        }
      });
      ctx.restore();

      // equipotential hint circles
      ctx.save();
      ctx.setLineDash([2, 5]);
      ctx.strokeStyle = "rgba(167,139,250,0.22)";
      [46, 74].forEach((rad) =>
        charges.forEach(({ p }) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
          ctx.stroke();
        }),
      );
      ctx.restore();

      const drawCharge = (p: { x: number; y: number }, q: number) => {
        const col = q >= 0 ? theme.rose : theme.sky;
        ctx.save();
        ctx.fillStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = 22;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        label(ctx, q > 0 ? "+" : "−", p.x, p.y, { size: 20, color: "#04121a", weight: "700" });
        label(ctx, `${Math.abs(q).toFixed(0)} µC`, p.x, p.y + 30, { size: 8.5, color: col });
      };
      drawCharge(p1, q1);
      drawCharge(p2, q2);

      // force arrows
      const dir = q1 * q2 > 0 ? -1 : 1;
      arrow(ctx, p1.x, p1.y - 46, p1.x + dir * 34, p1.y - 46, theme.ember, 1.6, 6);
      arrow(ctx, p2.x, p2.y + 46, p2.x - dir * 34, p2.y + 46, theme.ember, 1.6, 6);
      label(ctx, q1 * q2 > 0 ? "විකර්ෂණය" : "ආකර්ෂණය", w / 2, h - 18, { size: 9.5, color: theme.ember });

      hud(ctx, 10, 10, [
        ["d", `${sepCm} cm`],
        ["F", `${force.toExponential(1)} N`],
        ["E mid", `${(Efield / 1000).toFixed(1)} kV/m`],
      ]);
    } else {
      const cx = w / 2;
      const cy = h / 2;
      const gapPx = Math.min(14 + gapMm * 9, h * 0.42);
      const plateH = Math.min(h * 0.55, 230);
      const leftX = cx - gapPx / 2;
      const rightX = cx + gapPx / 2;

      ctx.save();
      ctx.fillStyle = dielectric ? "rgba(167,139,250,0.09)" : "rgba(56,225,196,0.03)";
      if (dielectric) {
        ctx.fillRect(leftX, cy - plateH / 2, gapPx, plateH);
        ctx.strokeStyle = "rgba(167,139,250,0.35)";
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(leftX, cy - plateH / 2, gapPx, plateH);
        label(ctx, "පාරවිද්‍යුතය εr = 3.5", cx, cy + plateH / 2 + 18, {
          size: 8.5,
          color: theme.violet,
        });
      }
      ctx.restore();

      // plates
      ctx.save();
      ctx.fillStyle = theme.rose;
      ctx.fillRect(leftX - 7, cy - plateH / 2, 7, plateH);
      ctx.fillStyle = theme.sky;
      ctx.fillRect(rightX, cy - plateH / 2, 7, plateH);
      ctx.restore();
      label(ctx, "+ + + +", leftX - 12, cy - plateH / 2 - 12, { size: 9, color: theme.rose, align: "right" });
      label(ctx, "− − − −", rightX + 12, cy - plateH / 2 - 12, { size: 9, color: theme.sky, align: "left" });

      // uniform field
      for (let y = cy - plateH / 2 + 16; y < cy + plateH / 2 - 8; y += 24) {
        arrow(ctx, leftX + 4, y, rightX - 4, y, "rgba(56,225,196,0.45)", 1.1, 5);
      }
      label(ctx, `E = ${(Efield / 1000).toFixed(0)} kV m⁻¹`, cx, cy - plateH / 2 - 20, {
        size: 9.5,
        color: theme.aqua,
      });

      // battery + dimension
      ctx.save();
      ctx.strokeStyle = "rgba(248,177,60,0.55)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(leftX - 3, cy + plateH / 2 + 34);
      ctx.lineTo(leftX - 3, cy + plateH / 2 + 42);
      ctx.lineTo(rightX + 3, cy + plateH / 2 + 42);
      ctx.lineTo(rightX + 3, cy + plateH / 2 + 34);
      ctx.stroke();
      ctx.restore();
      label(ctx, `V = ${voltage} V`, cx, cy + plateH / 2 + 56, { size: 9, color: theme.ember });
      label(ctx, `d = ${gapMm} mm`, cx, cy + plateH / 2 - 30, { size: 8.5, color: theme.muted });

      hud(ctx, 10, 10, [
        ["C", `${(C * 1e12).toFixed(0)} pF`],
        ["E", `${(Efield / 1000).toFixed(0)} kV/m`],
        ["Q", `${(C * voltage * 1e9).toFixed(1)} nC`],
      ]);
    }
  };

  return (
    <SimShell
      meta={meta}
      onStudy={onStudy}
      draw={draw}
      height={420}
      badge="ELECTROSTATICS"
      controls={
        <>
          <Segmented
            label="අනුකරණ ආකාරය"
            en="Mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: "charges", label: "ආරෝපණ", en: "charges" },
              { value: "capacitor", label: "ධාරිත්‍රකය", en: "capacitor" },
            ]}
          />
          {mode === "charges" ? (
            <>
              <Slider label="ආරෝපණය q₁" en="Charge q₁" value={q1} min={-5} max={5} step={0.5} digits={1} unit="µC" onChange={setQ1} />
              <Slider label="ආරෝපණය q₂" en="Charge q₂" value={q2} min={-5} max={5} step={0.5} digits={1} unit="µC" onChange={setQ2} />
              <Slider label="ආරෝපණ අතර දුර" en="Separation, d" value={sepCm} min={3} max={22} unit="cm" onChange={setSepCm} />
              <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-2.5 font-mono text-[10.5px] leading-relaxed text-slate-400">
                F = kq₁q₂/r²
                <br />
                F = {force.toExponential(2)} N
              </div>
              <p className="text-[10.5px] leading-relaxed text-slate-500">
                ක්ෂේත්‍ර රේඛා ධන ආරෝපණයෙන් පිටවී ඍණ ආරෝපණයට ඇතුළු වේ. ඒවා කිසිදා ඡේදනය නොවේ.
              </p>
            </>
          ) : (
            <>
              <Slider label="තහඩු අතර වෝල්ටීයතාව" en="Plate voltage, V" value={voltage} min={20} max={600} step={10} unit="V" onChange={setVoltage} />
              <Slider label="තහඩු අතර දුර" en="Plate separation, d" value={gapMm} min={1} max={12} step={0.5} digits={1} unit="mm" onChange={setGapMm} />
              <Toggle label="පාරවිද්‍යුතය ඇතුළත් කරන්න" en="Insert dielectric (εr = 3.5)" checked={dielectric} onChange={setDielectric} />
              <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-2.5 font-mono text-[10.5px] leading-relaxed text-slate-400">
                C = ε₀εrA/d
                <br />
                E = V/d = {(Efield / 1000).toFixed(1)} kV m⁻¹
              </div>
            </>
          )}
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {mode === "charges" ? (
            <>
              <Stat label="බලය" en="Coulomb force" value={force.toExponential(1)} unit="N" tone="ember" />
              <Stat label="ක්ෂේත්‍රය (මධ්‍යයේ)" en="Field at midpoint" value={(midField / 1000).toFixed(1)} unit="kV/m" />
              <Stat label="විද්‍යුත් විභව ශක්තිය" en="Potential energy" value={((k * q1 * q2 * 1e-12) / sep).toExponential(1)} unit="J" tone="violet" />
              <Stat label="ආරෝපණ අතර දුර" en="Separation" value={sepCm} unit="cm" tone="sky" />
            </>
          ) : (
            <>
              <Stat label="ධාරිතාව" en="Capacitance" value={(C * 1e12).toFixed(0)} unit="pF" />
              <Stat label="ගබඩා ආරෝපණය" en="Stored charge" value={(C * voltage * 1e9).toFixed(1)} unit="nC" tone="ember" />
              <Stat label="ගබඩා ශක්තිය" en="Stored energy" value={(0.5 * C * voltage * voltage * 1e6).toFixed(2)} unit="µJ" tone="violet" />
              <Stat label="ක්ෂේත්‍ර තීව්‍රතාව" en="Field strength" value={(Efield / 1000).toFixed(0)} unit="kV/m" tone="sky" />
            </>
          )}
        </div>
      }
    />
  );
}
