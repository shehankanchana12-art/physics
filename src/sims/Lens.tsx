import { useState } from "react";
import { Slider, Segmented, Stat } from "../components/ui";
import { arrow, grid, label, theme } from "../lib/theme";
import { SimShell, hud, type SimProps } from "./common";

type Kind = "convex" | "concave" | "mirror";

export default function Lens({ meta, onStudy }: SimProps) {
  const [kind, setKind] = useState<Kind>("convex");
  const [f, setF] = useState(12);
  const [u, setU] = useState(28);
  const [ho, setHo] = useState(30);

  const isMirror = kind === "mirror";
  const effectiveF = kind === "concave" ? -f : f;
  // real-positive convention: 1/f = 1/u + 1/v
  const v = (u * effectiveF) / (u - effectiveF);
  const mag = -v / u;
  const real = v > 0;
  const P = (1 / (effectiveF / 100)).toFixed(2);

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    grid(ctx, w, h, 34);
    const axis = h * 0.5;
    const s = Math.min((w * 0.36) / 60, 3.4); // px per cm
    const cx = isMirror ? w * 0.66 : w * 0.52;
    const ox = cx - u * s;
    const objTop = axis - ho;

    // optical axis
    ctx.save();
    ctx.strokeStyle = "rgba(148,178,205,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(14, axis + 0.5);
    ctx.lineTo(w - 14, axis + 0.5);
    ctx.stroke();
    ctx.restore();

    const line = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      color: string,
      dashed = false,
      width = 1.3,
    ) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      if (dashed) ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    };

    const extendToEdge = (x1: number, y1: number, x2: number, y2: number, color: string, dashed = false) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      if (Math.abs(dx) < 1e-6) return;
      const tx = dx > 0 ? (w - 4 - x2) / dx : (4 - x2) / dx;
      line(x1, y1, x2 + dx * Math.max(0, tx), y2 + dy * Math.max(0, tx), color, dashed);
    };

    // element
    if (isMirror) {
      const R = 2 * Math.abs(effectiveF) * s;
      const ccx = cx - R;
      ctx.save();
      ctx.strokeStyle = "rgba(56,225,196,0.85)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(ccx, axis, R, -0.36, 0.36);
      ctx.stroke();
      ctx.restore();
      // hatching
      ctx.save();
      ctx.strokeStyle = "rgba(148,178,205,0.35)";
      ctx.lineWidth = 1;
      for (let k = -0.34; k <= 0.34; k += 0.06) {
        const bx = ccx + R * Math.cos(k);
        const by = axis + R * Math.sin(k);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + 7, by + 5);
        ctx.stroke();
      }
      ctx.restore();
      label(ctx, "වක්‍ර දර්පණය", cx, axis - 92, { size: 9, color: theme.aqua });
      // focal point in front
      ctx.save();
      ctx.fillStyle = theme.ember;
      ctx.beginPath();
      ctx.arc(cx - Math.abs(effectiveF) * s, axis, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      label(ctx, "F", cx - Math.abs(effectiveF) * s, axis + 14, { size: 9, color: theme.ember });
    } else {
      const half = 78;
      const bulge = kind === "convex" ? 16 : 10;
      ctx.save();
      ctx.fillStyle = "rgba(56,225,196,0.12)";
      ctx.strokeStyle = "rgba(56,225,196,0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, axis - half);
      ctx.quadraticCurveTo(cx + bulge, axis, cx, axis + half);
      ctx.quadraticCurveTo(cx - bulge, axis, cx, axis - half);
      ctx.fill();
      ctx.stroke();
      if (kind === "concave") {
        ctx.beginPath();
        ctx.moveTo(cx, axis - half);
        ctx.quadraticCurveTo(cx - bulge * 0.5, axis, cx, axis + half);
        ctx.stroke();
      }
      ctx.restore();
      // F and 2F markers
      [1, 2].forEach((k) => {
        [effectiveF * k, -effectiveF * k].forEach((dist, i) => {
          if (Math.abs(dist) * s > w / 2 - 30) return;
          const px = cx + dist * s;
          ctx.save();
          ctx.fillStyle = i === 0 ? theme.ember : "rgba(148,178,205,0.6)";
          ctx.beginPath();
          ctx.arc(px, axis, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          label(ctx, i === 0 ? (Math.abs(dist) === Math.abs(effectiveF) ? "F" : "2F") : "F′", px, axis + 14, {
            size: 9,
            color: i === 0 ? theme.ember : theme.muted,
          });
        });
      });
    }

    // object
    const arrowColor = theme.sky;
    ctx.save();
    ctx.strokeStyle = arrowColor;
    ctx.fillStyle = arrowColor;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(ox, axis);
    ctx.lineTo(ox, objTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox, objTop);
    ctx.lineTo(ox - 4, objTop + 8);
    ctx.lineTo(ox + 4, objTop + 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    label(ctx, "වස්තුව", ox, objTop - 12, { size: 9, color: arrowColor });

    const rayColor = "rgba(203,216,232,0.55)";
    const rayVirtual = "rgba(167,139,250,0.5)";

    if (isMirror) {
      const fPx = Math.abs(effectiveF) * s;
      const mTopY = objTop;
      // 1. parallel to axis -> through F
      line(ox, mTopY, cx, mTopY, rayColor);
      extendToEdge(cx, mTopY, cx - fPx, axis, rayColor);
      // 2. through C -> back on itself
      const ccx = cx - 2 * fPx;
      const slope = (axis - mTopY) / (ccx - ox);
      const hitY = mTopY + slope * (cx - ox);
      line(ox, mTopY, cx, hitY, rayColor);
      line(cx, hitY, cx - 3, hitY, rayColor);
      // 3. through F -> parallel
      if (u > Math.abs(effectiveF) + 1) {
        const slope3 = (axis - mTopY) / (cx - fPx - ox);
        const hit3 = mTopY + slope3 * (cx - ox);
        line(ox, mTopY, cx, hit3, rayColor);
        line(cx, hit3, w - 8, hit3, rayColor);
      }
      // image
      if (Math.abs(v) < 900) {
        const ix = cx - v * s;
        const iy = axis - mag * ho;
        if (real) {
          line(cx, mTopY, ix, iy, rayColor);
        }
        ctx.save();
        ctx.strokeStyle = real ? theme.ember : theme.violet;
        ctx.fillStyle = real ? theme.ember : theme.violet;
        ctx.lineWidth = 2.2;
        if (!real) ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(ix, axis);
        ctx.lineTo(ix, iy);
        ctx.stroke();
        ctx.restore();
        label(ctx, real ? "සැබෑ රූපය" : "කල්පිත රූපය", ix, iy + (iy < axis ? -12 : 16), {
          size: 9,
          color: real ? theme.ember : theme.violet,
        });
      }
    } else {
      const fPx = Math.abs(effectiveF) * s;
      const sign = Math.sign(effectiveF) || 1;
      // 1. parallel ray -> focal point on far side
      line(ox, objTop, cx, objTop, rayColor);
      if (kind === "convex") {
        extendToEdge(cx, objTop, cx + fPx, axis, rayColor);
      } else {
        // diverges as if from front focal point
        extendToEdge(cx, objTop, cx - fPx, axis, rayColor);
        line(cx, objTop, cx - fPx, axis, rayVirtual, true);
      }
      // 2. through optical centre
      const slope2 = (axis - objTop) / (cx - ox);
      line(ox, objTop, cx, objTop + slope2 * (cx - ox), rayColor);
      extendToEdge(ox, objTop, cx, axis, rayColor);
      // 3. through front focal point -> parallel
      if (kind === "convex" && u > f + 1) {
        const fx = cx - fPx;
        const slope3 = (axis - objTop) / (fx - ox);
        const yc = objTop + slope3 * (cx - ox);
        line(ox, objTop, cx, yc, rayColor);
        line(cx, yc, w - 8, yc, rayColor);
      }
      // image
      if (Number.isFinite(v) && Math.abs(v) < 400 && Math.abs(v * s) < w) {
        const ix = cx + v * s;
        const iy = axis - mag * ho;
        ctx.save();
        ctx.strokeStyle = real ? theme.ember : theme.violet;
        ctx.fillStyle = real ? theme.ember : theme.violet;
        ctx.lineWidth = 2.4;
        if (!real) ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(ix, axis);
        ctx.lineTo(ix, iy);
        ctx.stroke();
        if (!real) {
          // virtual rays backwards
          extendToEdge(ix, iy, cx, objTop, rayVirtual, true);
        }
        ctx.restore();
        label(ctx, real ? "සැබෑ රූපය" : "කල්පිත රුව", ix, iy + (iy < axis ? -12 : 16), {
          size: 9,
          color: real ? theme.ember : theme.violet,
        });
        ctx.save();
        ctx.fillStyle = real ? theme.ember : theme.violet;
        ctx.beginPath();
        ctx.arc(ix, iy, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      void sign;
    }

    // distance annotations
    ctx.save();
    ctx.strokeStyle = "rgba(96,165,250,0.3)";
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(ox, axis + 62);
    ctx.lineTo(cx, axis + 62);
    ctx.stroke();
    ctx.restore();
    label(ctx, `u = ${u} cm`, (ox + cx) / 2, axis + 54, { size: 9, color: theme.sky });

    hud(ctx, 10, 10, [
      ["f", `${effectiveF > 0 ? "" : "−"}${Math.abs(effectiveF)} cm`],
      ["u", `${u} cm`],
      ["v", `${Number.isFinite(v) ? v.toFixed(1) : "∞"} cm`],
      ["m", `${mag.toFixed(2)}`],
    ], 124);
  };

  return (
    <SimShell
      meta={meta}
      onStudy={onStudy}
      draw={draw}
      height={420}
      badge="RAY DIAGRAM"
      controls={
        <>
          <Segmented
            label="ප්‍රකාශ උපකරණය"
            en="Optical element"
            value={kind}
            onChange={setKind}
            options={[
              { value: "convex", label: "උත්තල", en: "convex" },
              { value: "concave", label: "අවතල", en: "concave" },
              { value: "mirror", label: "දර්පණය", en: "mirror" },
            ]}
          />
          <Slider label="නාභි දුර" en="Focal length, f" value={f} min={5} max={30} unit="cm" onChange={setF} />
          <Slider label="වස්තු දුර" en="Object distance, u" value={u} min={5} max={60} unit="cm" onChange={setU} />
          <Slider label="වස්තු උස" en="Object height" value={ho} min={14} max={54} unit="px" onChange={setHo} />
          <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-2.5 font-mono text-[10.5px] leading-relaxed text-slate-400">
            1/f = 1/u + 1/v
            <br />
            v = {Number.isFinite(v) ? v.toFixed(1) : "∞"} cm · m = {mag.toFixed(2)}
          </div>
          <p className="text-[10.5px] leading-relaxed text-slate-500">
            u = 2f විට රූපය ද 2f දුරින්, එකම ප්‍රමාණයෙන් හා ප්‍රතිලෝමව සෑදේ. u &lt; f විට කල්පිත, කෙළින් රූපයක් ලැබේ.
          </p>
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="රූප දුර" en="Image distance, v" value={Math.abs(v) > 400 ? "∞" : v.toFixed(1)} unit="cm" tone="ember" />
          <Stat label="විශාලනය" en="Magnification" value={mag.toFixed(2)} tone={real ? "aqua" : "violet"} />
          <Stat label="රූපයේ ස්වභාවය" en="Image type" value={real ? "සැබෑ · ප්‍රතිලෝම" : "කල්පිත · කෙළින්"} tone="sky" />
          <Stat label="බලය" en="Power, P" value={P} unit="D" />
        </div>
      }
    />
  );
}
