import { useState } from "react";
import { Segmented, Toggle, Stat } from "../components/ui";
import { grid, label, roundRect, theme } from "../lib/theme";
import { SimShell, type SimProps } from "./common";

type Gate = "AND" | "OR" | "NOT" | "NAND" | "NOR" | "XOR";

const gateFn = (g: Gate, a: number, b: number) => {
  switch (g) {
    case "AND":
      return a & b;
    case "OR":
      return a | b;
    case "NOT":
      return a ? 0 : 1;
    case "NAND":
      return (a & b) ? 0 : 1;
    case "NOR":
      return (a | b) ? 0 : 1;
    case "XOR":
      return a ^ b;
  }
};

export default function Logic({ meta, onStudy }: SimProps) {
  const [gate, setGate] = useState<Gate>("AND");
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const out = gateFn(gate, a, b);
  const binary = gate === "NOT";

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    grid(ctx, w, h, 34);
    const cx = w * 0.5;
    const cy = h * 0.48;
    const gw = 92;
    const gh = 84;
    const inX = cx - gw / 2 - 78;
    const outX = cx + gw / 2;

    const pulse = 0.55 + 0.45 * Math.sin(t * 4);

    const inputWire = (y: number, val: number, name: string) => {
      ctx.save();
      ctx.strokeStyle = val ? theme.aqua : "rgba(148,178,205,0.4)";
      ctx.lineWidth = val ? 2.6 : 1.6;
      ctx.shadowColor = val ? theme.aqua : "transparent";
      ctx.shadowBlur = val ? 10 : 0;
      ctx.beginPath();
      ctx.moveTo(inX, y);
      ctx.lineTo(cx - gw / 2 - 2, y);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.fillStyle = val ? "rgba(56,225,196,0.9)" : "rgba(125,147,173,0.35)";
      roundRect(ctx, inX - 32, y - 14, 32, 28, 6);
      ctx.fill();
      ctx.restore();
      label(ctx, `${name} = ${val}`, inX - 16, y - 24, { size: 9, color: val ? theme.aqua : theme.muted });
    };

    // inputs
    inputWire(cy - 20, a, "A");
    if (!binary) inputWire(cy + 20, b, "B");

    // gate body
    ctx.save();
    ctx.fillStyle = "rgba(56,225,196,0.09)";
    ctx.strokeStyle = theme.aqua;
    ctx.lineWidth = 2.4;
    const left = cx - gw / 2;
    const top = cy - gh / 2;
    ctx.beginPath();
    if (gate === "AND" || gate === "NAND") {
      ctx.moveTo(left, top);
      ctx.lineTo(cx, top);
      ctx.arc(cx, cy, gh / 2, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(left, top + gh);
      ctx.closePath();
    } else if (gate === "NOT") {
      ctx.moveTo(left, top);
      ctx.lineTo(left, top + gh);
      ctx.lineTo(cx + gw / 2, cy);
      ctx.closePath();
    } else {
      // OR / NOR / XOR shield
      ctx.moveTo(left, top);
      ctx.quadraticCurveTo(cx + 6, top, cx + gw / 2, cy);
      ctx.quadraticCurveTo(cx + 6, top + gh, left, top + gh);
      ctx.quadraticCurveTo(cx - 20, cy, left, top);
      ctx.closePath();
    }
    ctx.fill();
    ctx.stroke();
    if (gate === "XOR") {
      ctx.beginPath();
      ctx.moveTo(left - 12, top);
      ctx.quadraticCurveTo(cx - 32, cy, left - 12, top + gh);
      ctx.stroke();
    }
    ctx.restore();
    label(ctx, gate, cx + 6, cy, { size: 13, color: theme.white, weight: "700" });

    // inversion bubble
    if (gate === "NAND" || gate === "NOR" || gate === "NOT") {
      ctx.save();
      ctx.fillStyle = theme.bg;
      ctx.strokeStyle = theme.aqua;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx + gw / 2 + 12, cy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    const startOut = cx + gw / 2 + (gate === "NAND" || gate === "NOR" || gate === "NOT" ? 22 : 0);
    const ledX = Math.min(w - 74, startOut + 130);
    ctx.save();
    ctx.strokeStyle = out ? theme.aqua : "rgba(148,178,205,0.4)";
    ctx.lineWidth = out ? 2.6 : 1.6;
    ctx.shadowColor = out ? theme.aqua : "transparent";
    ctx.shadowBlur = out ? 12 : 0;
    ctx.beginPath();
    ctx.moveTo(startOut, cy);
    ctx.lineTo(ledX - 18, cy);
    ctx.stroke();
    ctx.restore();
    label(ctx, `Y = ${out}`, (startOut + ledX) / 2, cy - 18, {
      size: 10,
      color: out ? theme.aqua : theme.muted,
    });

    // LED
    ctx.save();
    if (out) {
      ctx.shadowColor = theme.ember;
      ctx.shadowBlur = 34 * pulse;
      ctx.fillStyle = "rgba(248,177,60,0.95)";
    } else {
      ctx.fillStyle = "rgba(125,147,173,0.25)";
    }
    ctx.beginPath();
    ctx.arc(ledX, cy, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    label(ctx, out ? "ON" : "OFF", ledX, cy + 34, {
      size: 9,
      color: out ? theme.ember : theme.muted,
    });

    // input/output markers
    label(ctx, "ආදාන / INPUTS", inX - 16, cy - 64, { size: 8.5, color: theme.muted });
    label(ctx, "ප්‍රතිදානය / OUTPUT", ledX, cy - 42, { size: 8.5, color: theme.muted });

    // truth table
    const tx = 18;
    const ty = h - 92;
    const rows = binary ? 3 : 5;
    ctx.save();
    ctx.fillStyle = "rgba(5,12,22,0.6)";
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    roundRect(ctx, tx, ty, 150, 12 + rows * 17, 7);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    label(ctx, binary ? "A   Y" : "A  B   Y", tx + 46, ty + 12, { size: 8.5, color: theme.muted });
    for (let i = 0; i < rows; i++) {
      if (binary) {
        const av = i === 1 ? 1 : 0;
        const yv = gateFn(gate, av, 0);
        label(ctx, `${av}      ${yv}`, tx + 46, ty + 27 + i * 17, {
          size: 9,
          color: av === a ? theme.aqua : theme.text,
        });
      } else {
        const av = i >> 1;
        const bv = i & 1;
        const yv = gateFn(gate, av, bv);
        const active = av === a && bv === b;
        label(ctx, `${av}   ${bv}     ${yv}`, tx + 46, ty + 27 + i * 17, {
          size: 9,
          color: active ? theme.ember : theme.text,
        });
      }
    }
  };

  return (
    <SimShell
      meta={meta}
      onStudy={onStudy}
      draw={draw}
      height={420}
      badge="LOGIC"
      controls={
        <>
          <Segmented
            label="තර්ක ද්වාරය"
            en="Logic gate"
            value={gate}
            onChange={setGate}
            cols={3}
            options={[
              { value: "AND", label: "AND" },
              { value: "OR", label: "OR" },
              { value: "NOT", label: "NOT" },
              { value: "NAND", label: "NAND" },
              { value: "NOR", label: "NOR" },
              { value: "XOR", label: "XOR" },
            ]}
          />
          <Toggle label="ආදානය A = 1" en="Input A" checked={a === 1} onChange={(v) => setA(v ? 1 : 0)} />
          <div className={binary ? "pointer-events-none opacity-40" : ""}>
            <Toggle label="ආදානය B = 1" en="Input B" checked={b === 1} onChange={(v) => setB(v ? 1 : 0)} />
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-2.5 text-[10.5px] leading-relaxed text-slate-400">
            NAND සහ NOR සාර්වත්‍ර ද්වාර වේ — ඒවායින් අනෙකුත් සියලු ද්වාර ගොඩනගා ගත හැක.
          </div>
          <Stat label="ප්‍රතිදානය" en="Output Y" value={out} tone={out ? "aqua" : "slate"} />
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="ද්වාරය" en="Gate" value={gate} />
          <Stat label="ප්‍රකාශනය" en="Boolean expression" value={binary ? "Y = A′" : gate === "XOR" ? "Y = A ⊕ B" : `Y = ${gate === "AND" || gate === "NAND" ? "A·B" : "A+B"}${gate === "NAND" || gate === "NOR" ? "′" : ""}`} tone="ember" />
          <Stat label="ප්‍රතිදානය" en="Output" value={out} tone={out ? "aqua" : "slate"} />
          <Stat label="සාර්වත්‍ර ද?" en="Universal?" value={gate === "NAND" || gate === "NOR" ? "ඔව්" : "නැත"} tone="violet" />
        </div>
      }
    />
  );
}
