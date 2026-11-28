import { useRef, useState } from "react";
import { Slider, Stat } from "../components/ui";
import { axes, grid, label, roundRect, theme } from "../lib/theme";
import { SimShell, hud, type SimProps } from "./common";

const C_ICE = 2100;
const LF = 3.34e5;
const C_WATER = 4200;
const LV = 2.26e6;
const C_STEAM = 2010;

export default function Phase({ meta, onStudy }: SimProps) {
  const [power, setPower] = useState(900);
  const [massG, setMassG] = useState(120);
  const elapsed = useRef(0);

  const m = massG / 1000;
  const segs = [
    { q: m * C_ICE * 20, dT: 20, from: -20, to: 0, name: "අයිස් උණුසුම් වීම", en: "ice warms", color: theme.sky },
    { q: m * LF, dT: 0, from: 0, to: 0, name: "දියවීම", en: "melting", color: theme.ember },
    { q: m * C_WATER * 100, dT: 100, from: 0, to: 100, name: "ජලය උණුසුම් වීම", en: "water warms", color: theme.aqua },
    { q: m * LV, dT: 0, from: 100, to: 100, name: "වාෂ්පීකරණය", en: "boiling", color: theme.rose },
    { q: m * C_STEAM * 20, dT: 20, from: 100, to: 120, name: "වාෂ්ප උණුසුම් වීම", en: "steam warms", color: theme.violet },
  ];
  const totalQ = segs.reduce((s, x) => s + x.q, 0);
  const totalT = totalQ / power;

  const stateAt = (heat: number) => {
    let acc = 0;
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      if (heat <= acc + s.q || i === segs.length - 1) {
        const u = Math.max(0, Math.min(1, (heat - acc) / Math.max(1, s.q)));
        return { temp: s.from + (s.to - s.from) * u, seg: i, u, name: s.name, en: s.en, color: s.color };
      }
      acc += s.q;
    }
    return { temp: 120, seg: 4, u: 1, name: segs[4].name, en: segs[4].en, color: segs[4].color };
  };

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, _t: number, dt: number) => {
    grid(ctx, w, h, 34);
    elapsed.current += dt * 5.2;
    if (elapsed.current > totalT) elapsed.current = 0;
    const time = elapsed.current;
    const heat = time * power;
    const st = stateAt(heat);

    const gx = 66;
    const gy = h - 66;
    const gw = w - gx - 34;
    const gh = h - 112;

    const xOf = (tt: number) => gx + (tt / totalT) * gw;
    const yOf = (temp: number) => gy - ((temp + 22) / 146) * gh;

    // gridlines / axis
    axes(ctx, gx, gy - gh, gw, gh, "කාලය t (s)", "T (°C)");
    [0, 100].forEach((tv) => {
      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = "rgba(248,177,60,0.22)";
      ctx.beginPath();
      ctx.moveTo(gx, yOf(tv));
      ctx.lineTo(gx + gw, yOf(tv));
      ctx.stroke();
      ctx.restore();
      label(ctx, `${tv}°C`, gx - 10, yOf(tv), { size: 8.5, color: theme.ember, align: "right" });
    });
    label(ctx, "−20°C", gx - 10, yOf(-20), { size: 8.5, color: theme.muted, align: "right" });

    // curve
    let acc = 0;
    ctx.save();
    ctx.lineWidth = 2.6;
    ctx.lineJoin = "round";
    segs.forEach((s) => {
      const t1 = acc / power;
      const t2 = (acc + s.q) / power;
      ctx.strokeStyle = s.color;
      ctx.beginPath();
      ctx.moveTo(xOf(t1), yOf(s.from));
      ctx.lineTo(xOf(t2), yOf(s.to));
      ctx.stroke();
      // plateau label
      if (s.dT === 0) {
        label(ctx, s.name, (xOf(t1) + xOf(t2)) / 2, yOf(s.from) - 16, {
          size: 9,
          color: s.color,
        });
        label(ctx, `Q = mL`, (xOf(t1) + xOf(t2)) / 2, yOf(s.from) + 15, {
          size: 8,
          color: theme.muted,
        });
      }
      acc += s.q;
    });
    ctx.restore();

    // axe arrowheads
    ctx.save();
    ctx.strokeStyle = "rgba(148,178,205,0.45)";
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + gw + 6, gy);
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx, gy - gh - 6);
    ctx.stroke();
    ctx.restore();

    // playhead
    const px = xOf(time);
    const py = yOf(st.temp);
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(px, gy);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = st.color;
    ctx.shadowColor = st.color;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // phase card
    const cardX = 12;
    const cardY = 12;
    ctx.save();
    ctx.fillStyle = "rgba(5,12,22,0.8)";
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    roundRect(ctx, cardX, cardY, 186, 58, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    label(ctx, "වර්තමාන අවස්ථාව", cardX + 10, cardY + 15, { size: 8.5, color: theme.muted, align: "left" });
    label(ctx, st.name, cardX + 10, cardY + 32, { size: 11, color: st.color, align: "left" });
    label(ctx, `${st.temp.toFixed(1)} °C`, cardX + 176, cardY + 46, { size: 13, color: theme.text, align: "right" });

    // energy stacked bar
    const ebarY = h - 26;
    let eAcc = 0;
    const barW = gw;
    segs.forEach((s) => {
      const fw = (s.q / totalQ) * barW;
      const filled = Math.max(0, Math.min(1, (heat - eAcc) / s.q));
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(gx + (eAcc / totalQ) * barW, ebarY, fw - 1, 10);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = 0.55;
      ctx.fillRect(gx + (eAcc / totalQ) * barW, ebarY, (fw - 1) * filled, 10);
      ctx.globalAlpha = 1;
      eAcc += s.q;
    });
    label(ctx, "සපයන ලද තාපය", gx, ebarY - 6, { size: 8, color: theme.muted, align: "left" });

    hud(ctx, w - 158, 10, [
      ["P", `${power} W`],
      ["m", `${massG} g`],
      ["Q_in", `${(heat / 1000).toFixed(1)} kJ`],
      ["t", `${time.toFixed(0)} s`],
    ], 146);
  };

  return (
    <SimShell
      meta={meta}
      onStudy={onStudy}
      draw={draw}
      height={440}
      badge="LATENT HEAT"
      controls={
        <>
          <Slider label="තාපන බලය" en="Heating power, P" value={power} min={200} max={2400} step={50} unit="W" onChange={setPower} />
          <Slider label="අයිස් ස්කන්ධය" en="Mass of ice, m" value={massG} min={40} max={400} step={10} unit="g" onChange={setMassG} />
          <button className="btn w-full justify-center text-[11px]" onClick={() => (elapsed.current = 0)}>
            වක්‍රය යළි අරඹන්න
          </button>
          <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-2.5 font-mono text-[10.5px] leading-relaxed text-slate-400">
            Q₁ = mc_ice Δθ · Q₂ = mL_f
            <br />
            Q₃ = mc_w Δθ · Q₄ = mL_v
            <br />
            <span className="text-ember">සමතලා = අවස්ථා විපර්යාසය</span>
          </div>
          <p className="text-[10.5px] leading-relaxed text-slate-500">
            බලය වැඩි කළ විට සමතලා කොටස් කෙටි වේ; නමුත් උෂ්ණත්වය එකම අගයේ පවතී. සිසිලනයේදී (තාපය ඉවත් කරන විට)
            එකම වක්‍රය ප්‍රතිවිරුද්ධ දිශාවට ලැබේ.
          </p>
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="දියවීමේ තාපය" en="Heat to melt" value={(m * LF / 1000).toFixed(1)} unit="kJ" tone="ember" />
          <Stat label="වාෂ්ප කිරීමේ තාපය" en="Heat to boil" value={(m * LV / 1000).toFixed(1)} unit="kJ" tone="rose" />
          <Stat label="මුළු තාපය" en="Total heat" value={(totalQ / 1000).toFixed(1)} unit="kJ" />
          <Stat label="මුළු කාලය" en="Total time" value={totalT.toFixed(0)} unit="s" tone="violet" />
        </div>
      }
    />
  );
}
