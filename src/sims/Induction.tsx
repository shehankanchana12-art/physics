import { useRef, useState } from "react";
import { Slider, Stat } from "../components/ui";
import { arrow, axes, grid, label, roundRect, theme } from "../lib/theme";
import { SimShell, hud, type SimProps } from "./common";

export default function Induction({ meta, onStudy }: SimProps) {
  const [speed, setSpeed] = useState(1);
  const [turns, setTurns] = useState(220);
  const [strength, setStrength] = useState(0.6);
  const [showLaw, setShowLaw] = useState(true);

  const prev = useRef({ flux: 0, time: 0 });
  const hist = useRef<{ t: number; emf: number }[]>([]);
  const emfRef = useRef(0);

  const area = 0.0022;
  const sigma = 0.055;

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number) => {
    grid(ctx, w, h, 34);
    const cx = w * 0.58;
    const cy = h * 0.38;
    const magX = cx + Math.sin(t * speed * 1.1) * 130;

    // magnet position → flux through coil (Gaussian profile)
    const dx = (magX - cx) / 100;
    const flux = strength * turns * area * Math.exp(-(dx * dx) / (sigma * 100 * 0.06));
    const dFlux = (flux - prev.current.flux) / Math.max(1e-3, dt);
    prev.current.flux = flux;
    const targetEmf = -dFlux;
    emfRef.current += (targetEmf - emfRef.current) * Math.min(1, dt * 22);
    const emf = emfRef.current;

    hist.current.push({ t, emf });
    if (hist.current.length > 260) hist.current.shift();

    // coil
    const coilH = 120;
    for (let i = 0; i < 7; i++) {
      const x = cx - 22 + i * 8;
      ctx.save();
      ctx.strokeStyle = "rgba(56,225,196,0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, cy, 30, coilH / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    label(ctx, `N = ${turns} වෙළුම්`, cx, cy - coilH / 2 - 22, { size: 9, color: theme.aqua });

    // magnet
    const mw = 74;
    const mh = 30;
    ctx.save();
    ctx.fillStyle = "rgba(251,113,133,0.9)";
    ctx.fillRect(magX - mw / 2, cy - mh / 2, mw / 2, mh);
    ctx.fillStyle = "rgba(96,165,250,0.9)";
    ctx.fillRect(magX, cy - mh / 2, mw / 2, mh);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.strokeRect(magX - mw / 2, cy - mh / 2, mw, mh);
    ctx.restore();
    label(ctx, "N", magX - mw / 4, cy, { size: 11, color: "#04121a", weight: "700" });
    label(ctx, "S", magX + mw / 4, cy, { size: 11, color: "#04121a", weight: "700" });

    // motion arrow
    const dir = Math.cos(t * speed * 1.1) >= 0 ? 1 : -1;
    arrow(ctx, magX, cy + 40, magX + dir * 30, cy + 40, theme.ember, 1.6, 6);
    label(ctx, "v", magX + dir * 38, cy + 40, { size: 9, color: theme.ember });

    // field lines from magnet toward coil
    ctx.save();
    ctx.strokeStyle = "rgba(248,177,60,0.2)";
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(magX + mw / 2, cy + i * 10);
      ctx.quadraticCurveTo((magX + cx) / 2, cy + i * 26, cx, cy + i * 16);
      ctx.stroke();
    }
    ctx.restore();

    // wires to galvanometer
    const gx = cx + 150;
    const gy = h - 58;
    ctx.save();
    ctx.strokeStyle = "rgba(203,216,232,0.5)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx + 8, cy + coilH / 2 - 4);
    ctx.lineTo(cx + 8, gy + 14);
    ctx.lineTo(gx - 26, gy + 14);
    ctx.moveTo(cx - 30, cy + coilH / 2 - 4);
    ctx.quadraticCurveTo(cx - 30, gy + 28, gx - 60, gy + 14);
    ctx.stroke();
    ctx.restore();

    // galvanometer
    ctx.save();
    ctx.fillStyle = "rgba(8,18,32,0.95)";
    ctx.strokeStyle = "rgba(148,178,205,0.4)";
    roundRect(ctx, gx - 26, gy - 26, 64, 46, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    const maxE = Math.max(0.4, Math.abs(emfRef.current));
    const needle = Math.max(-1, Math.min(1, emf / 0.55));
    ctx.save();
    ctx.strokeStyle = "rgba(248,177,60,0.8)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(gx + 6, gy + 16);
    const na = -Math.PI / 2 + needle * 0.9;
    ctx.lineTo(gx + 6 + Math.cos(na) * 26, gy + 16 + Math.sin(na) * 26);
    ctx.stroke();
    ctx.strokeStyle = "rgba(148,178,205,0.3)";
    ctx.beginPath();
    ctx.arc(gx + 6, gy + 16, 24, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.restore();
    label(ctx, "G", gx + 6, gy + 30, { size: 8, color: theme.muted });
    void maxE;

    // graph of emf
    const px = 34;
    const py = h * 0.56;
    const pw = w - 68;
    const ph = h * 0.34;
    axes(ctx, px, py, pw, ph, "t →", "ε");
    axes(ctx, px + 6, py, pw - 12, ph / 2);
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    ctx.moveTo(px, py + ph / 2);
    ctx.lineTo(px + pw, py + ph / 2);
    ctx.stroke();
    ctx.restore();

    const span = 2.6;
    const now = t;
    const pts = hist.current.filter((p) => p.t > now - span);
    const maxAbs = Math.max(0.35, ...pts.map((p) => Math.abs(p.emf)));
    ctx.save();
    ctx.strokeStyle = theme.violet;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    pts.forEach((p, i) => {
      const xx = px + ((p.t - (now - span)) / span) * pw;
      const yy = py + ph / 2 - (p.emf / maxAbs) * (ph / 2 - 6);
      if (i === 0) ctx.moveTo(xx, yy);
      else ctx.lineTo(xx, yy);
    });
    ctx.stroke();
    ctx.restore();
    label(ctx, "ප්‍රේරිත emf ε (V)", px + 4, py - 8, { size: 8.5, color: theme.violet, align: "left" });
    label(ctx, `±${maxAbs.toFixed(2)} V`, px + pw, py - 8, { size: 8, color: theme.muted, align: "right" });

    hud(ctx, 10, 10, [
      ["ε", `${emf.toFixed(3)} V`],
      ["Φ", `${(flux * 1000).toFixed(1)} mWb`],
      ["N", `${turns}`],
      ["v", `${(speed * 1.1).toFixed(1)} u`],
    ]);

    if (showLaw) {
      label(ctx, "ε = −N dΦ/dt", w - 16, 18, { size: 11, color: theme.ember, align: "right" });
      label(ctx, "ලෙන්ස්: ප්‍රේරිත ධාරාව වෙනසට විරුද්ධයි", w - 16, 34, {
        size: 8.5,
        color: theme.muted,
        align: "right",
      });
    }
  };

  return (
    <SimShell
      meta={meta}
      onStudy={onStudy}
      draw={draw}
      height={450}
      badge="FARADAY / LENZ"
      controls={
        <>
          <Slider label="චුම්බක චලන වේගය" en="Magnet speed" value={speed} min={0.2} max={3} step={0.1} digits={1} unit="×" onChange={setSpeed} />
          <Slider label="කොයිල වෙළුම් ගණන" en="Number of turns, N" value={turns} min={50} max={600} step={10} unit="" onChange={setTurns} />
          <Slider label="චුම්බක ශක්තිය" en="Magnet strength, B" value={strength} min={0.1} max={1.2} step={0.05} digits={2} unit="T" onChange={setStrength} />
          <button
            onClick={() => setShowLaw((s) => !s)}
            className={`btn w-full justify-center text-[11px] ${showLaw ? "btn-ember" : ""}`}
          >
            නියම පෙන්වන්න / Hide law
          </button>
          <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-2.5 text-[10.5px] leading-relaxed text-slate-400">
            චුම්බකය වේගයෙන් චලනය වන විට emf වැඩි වේ; නිශ්චලව තිබියදී emf = 0. වෙළුම් හෝ B වැඩි කිරීමෙන්ද emf වැඩි වේ.
          </div>
          <button
            className="btn w-full justify-center text-[11px]"
            onClick={() => {
              hist.current = [];
              prev.current = { flux: 0, time: 0 };
            }}
          >
            ප්‍රස්තාරය මකන්න
          </button>
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="තත්කාලික emf" en="Instantaneous emf" value={Math.abs(emfRef.current).toFixed(3)} unit="V" tone="violet" />
          <Stat label="වෙළුම් ගණන" en="Turns" value={turns} tone="sky" />
          <Stat label="චුම්බක ගමන" en="Peak flux" value={(strength * turns * area * 1000).toFixed(1)} unit="mWb" tone="ember" />
          <Stat label="නියමය" en="Law" value="ε = −N dΦ/dt" tone="aqua" />
        </div>
      }
    />
  );
}
