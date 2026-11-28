import { useRef, useState } from "react";
import { Slider, Stat } from "../components/ui";
import { axes, grid, label, theme } from "../lib/theme";
import { SimShell, hud, type SimProps } from "./common";

const N0 = 120;

export default function Decay({ meta, onStudy }: SimProps) {
  const [halfLife, setHalfLife] = useState(6);
  const [seed, setSeed] = useState(0);
  const [liveN, setLiveN] = useState(N0);
  const lastSync = useRef(0);

  const nuclei = useRef<boolean[]>(Array.from({ length: N0 }, (_, i) => i % 3 !== 0));
  const elapsed = useRef(0);
  const hist = useRef<{ t: number; n: number }[]>([]);

  const lambda = Math.LN2 / halfLife;
  const activity = lambda * liveN;

  const reset = () => {
    nuclei.current = Array.from({ length: N0 }, (_, i) => i % 3 !== 0);
    elapsed.current = 0;
    hist.current = [];
    setSeed((s) => s + 1);
  };

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, _t: number, dt: number) => {
    grid(ctx, w, h, 34);
    elapsed.current += dt * 2.4;
    const now = elapsed.current;

    // stochastic decay
    const p = 1 - Math.pow(0.5, dt * 2.4 / halfLife);
    nuclei.current = nuclei.current.map((al) => (al ? Math.random() > p : false));
    const n = nuclei.current.filter(Boolean).length;
    if (now - lastSync.current > 0.22) {
      lastSync.current = now;
      setLiveN(n);
    }

    if (hist.current.length === 0 || now - hist.current[hist.current.length - 1].t > 0.12) {
      hist.current.push({ t: now, n });
      if (hist.current.length > 900) hist.current.shift();
    }

    // nucleus grid
    const cols = 12;
    const cell = Math.min(24, (w * 0.42) / cols);
    const gridX = 26;
    const gridY = 34;
    for (let i = 0; i < N0; i++) {
      const cx = gridX + (i % cols) * cell;
      const cy = gridY + Math.floor(i / cols) * cell;
      const on = nuclei.current[i];
      ctx.save();
      if (on) {
        ctx.fillStyle = "rgba(56,225,196,0.9)";
        ctx.shadowColor = theme.aqua;
        ctx.shadowBlur = 7;
      } else {
        ctx.fillStyle = "rgba(125,147,173,0.16)";
      }
      ctx.beginPath();
      ctx.arc(cx + cell / 2 - 3, cy + cell / 2 - 3, Math.max(2.6, cell * 0.18), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    label(ctx, `ඉතිරි න්‍යෂ්ටි: ${n} / ${N0}`, gridX, gridY - 12, {
      size: 9,
      color: theme.aqua,
      align: "left",
    });

    // graph
    const gx = w * 0.5;
    const gy = h - 54;
    const gw = w - gx - 26;
    const gh = h - 118;
    const tMax = halfLife * 6;
    axes(ctx, gx, gy - gh, gw, gh, "t (s)", "N");

    // half-life ticks
    for (let k = 1; k <= 5; k++) {
      const tt = k * halfLife;
      if (tt > tMax) break;
      const px = gx + (tt / tMax) * gw;
      ctx.save();
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = "rgba(148,178,205,0.18)";
      ctx.beginPath();
      ctx.moveTo(px, gy);
      ctx.lineTo(px, gy - gh);
      ctx.stroke();
      ctx.restore();
      label(ctx, `${k}t½`, px, gy + 12, { size: 7.5, color: theme.muted });
    }

    // theoretical curve
    ctx.save();
    ctx.strokeStyle = theme.ember;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const tt = (i / 200) * tMax;
      const nn = N0 * Math.exp(-lambda * tt);
      const px = gx + (tt / tMax) * gw;
      const py = gy - (nn / N0) * gh;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();

    // live data
    ctx.save();
    ctx.strokeStyle = theme.aqua;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    hist.current.forEach((hp, i) => {
      const px = gx + (Math.min(hp.t, tMax) / tMax) * gw;
      const py = gy - (hp.n / N0) * gh;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.restore();

    // current marker
    const mx = gx + (Math.min(now, tMax) / tMax) * gw;
    const my = gy - (n / N0) * gh;
    ctx.save();
    ctx.fillStyle = theme.aqua;
    ctx.shadowColor = theme.aqua;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(mx, my, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    label(ctx, "න්‍යෂ්ටික ක්ෂය වීම / NUCLEAR DECAY", gx, 18, {
      size: 8.5,
      color: theme.muted,
      align: "left",
    });

    // auto restart after 6 half-lives
    if (now > tMax * 1.15) reset();

    hud(ctx, w - 152, 10, [
      ["t", `${Math.min(now, tMax).toFixed(1)} s`],
      ["N", `${n}`],
      ["t½", `${halfLife} s`],
      ["λ", `${lambda.toFixed(3)} s⁻¹`],
    ], 140);
    void seed;
  };

  return (
    <SimShell
      meta={meta}
      onStudy={onStudy}
      draw={draw}
      height={420}
      badge="HALF-LIFE"
      controls={
        <>
          <Slider label="අර්ධ ආයුෂ" en="Half-life, t½" value={halfLife} min={1} max={20} step={1} unit="s" onChange={setHalfLife} />
          <button className="btn w-full justify-center text-[11px]" onClick={reset}>
            නියැදිය අලුතින් ලබා ගන්න
          </button>
          <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-2.5 font-mono text-[10.5px] leading-relaxed text-slate-400">
            N = N₀ e^(−λt)
            <br />
            λ = ln2 / t½ = {lambda.toFixed(3)} s⁻¹
            <br />
            A = λN = {activity.toFixed(1)} Bq
          </div>
          <p className="text-[10.5px] leading-relaxed text-slate-500">
            ක්ෂය වීම අහඹු ය — නමුත් විශාල න්‍යෂ්ටි සංඛ්‍යාවක් සඳහා ප්‍රස්තාරය සුමට ඝාතීය වක්‍රයක් වේ. අර්ධ ආයුෂ
            වෙනස් කර ප්‍රස්තාරයේ හැඩය බලන්න.
          </p>
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="ඉතිරි න්‍යෂ්ටි" en="Remaining nuclei" value={liveN} tone="aqua" />
          <Stat label="සක්‍රීයතාව" en="Activity" value={activity.toFixed(1)} unit="Bq" tone="ember" />
          <Stat label="ක්ෂය නියතාංකය" en="Decay constant" value={lambda.toFixed(3)} unit="s⁻¹" tone="violet" />
          <Stat label="අර්ධ ආයුෂ" en="Half-life" value={halfLife} unit="s" tone="sky" />
        </div>
      }
    />
  );
}
