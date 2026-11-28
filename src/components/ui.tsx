import { useId, type ReactNode } from "react";
import { ChevronRight, Info, RotateCcw } from "lucide-react";
import { Bi, useLang } from "../lib/language";
import { fmt } from "../lib/theme";

export function Panel({
  title,
  en,
  icon,
  right,
  children,
  className = "",
}: {
  title?: ReactNode;
  en?: string;
  icon?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {(title || right) && (
        <header className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-white">
            {icon}
            <Bi si={title} en={en} enClass="en" className="leading-tight" />
          </div>
          {right}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Slider({
  label,
  en,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  digits = 0,
  hint,
}: {
  label: string;
  en?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
  digits?: number;
  hint?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="field-label">
        <Bi si={label} en={en} enClass="en block" className="leading-snug" />
        <span className="shrink-0 rounded-md border border-white/10 bg-ink-900 px-1.5 py-0.5 font-mono text-[11.5px] text-aqua-400">
          {fmt(value, digits)}
          {unit ? <span className="ml-0.5 text-[9.5px] text-slate-500">{unit}</span> : null}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5"
      />
      {hint ? <p className="mt-0.5 text-[10.5px] leading-relaxed text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function Segmented<T extends string>({
  label,
  en,
  value,
  options,
  onChange,
  cols,
}: {
  label?: string;
  en?: string;
  value: T;
  options: { value: T; label: string; en?: string }[];
  onChange: (v: T) => void;
  cols?: number;
}) {
  return (
    <div>
      {label ? (
        <div className="mb-1.5">
          <Bi si={label} en={en} enClass="en block" className="text-[12.5px] font-medium text-slate-300" />
        </div>
      ) : null}
      <div
        className="grid gap-1 rounded-lg border border-white/10 bg-ink-900/70 p-1"
        style={{ gridTemplateColumns: `repeat(${cols ?? options.length}, minmax(0, 1fr))` }}
      >
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-md px-1.5 py-1.5 text-[11.5px] font-medium transition ${
              value === o.value
                ? "bg-aqua-400/20 text-white shadow-[inset_0_0_0_1px_rgba(56,225,196,0.35)]"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <span className="block leading-tight">{o.label}</span>
            {o.en ? <span className="block text-[9px] uppercase tracking-wider opacity-55">{o.en}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({
  label,
  en,
  checked,
  onChange,
  accent = "aqua",
}: {
  label: string;
  en?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  accent?: "aqua" | "ember";
}) {
  const on = accent === "ember" ? "bg-ember/25 text-ember border-ember/50" : "bg-aqua-400/20 text-aqua-400 border-aqua-400/50";
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between gap-3 rounded-lg border px-2.5 py-2 text-left text-[11.5px] transition ${
        checked ? on : "border-white/10 bg-ink-900/60 text-slate-400 hover:border-white/20"
      }`}
      aria-pressed={checked}
    >
      <Bi si={label} en={en} enClass="en block" className="leading-tight" />
      <span
        className={`relative h-4 w-8 shrink-0 rounded-full transition ${
          checked ? "bg-current opacity-80" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-ink-950 transition-all ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export function Stat({
  label,
  en,
  value,
  unit,
  tone = "aqua",
}: {
  label: string;
  en?: string;
  value: ReactNode;
  unit?: string;
  tone?: "aqua" | "ember" | "rose" | "violet" | "sky" | "slate";
}) {
  const tones: Record<string, string> = {
    aqua: "text-aqua-400",
    ember: "text-ember",
    rose: "text-rose-400",
    violet: "text-violet-400",
    sky: "text-sky-400",
    slate: "text-slate-200",
  };
  return (
    <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 px-2.5 py-1.5">
      <div className="text-[10px] leading-tight text-slate-500">
        <Bi si={label} en={en} enClass="en mt-0.5 block" />
      </div>
      <div className={`mt-0.5 font-mono text-[13.5px] font-semibold ${tones[tone]}`}>
        {value}
        {unit ? <span className="ml-1 text-[9.5px] font-normal text-slate-500">{unit}</span> : null}
      </div>
    </div>
  );
}

export function EnergyBars({
  items,
  title = "ශක්ති බෙදීම",
  en = "Energy distribution",
}: {
  items: { label: string; en?: string; value: number; color: string }[];
  title?: string;
  en?: string;
}) {
  const total = Math.max(
    1e-6,
    items.reduce((s, i) => s + Math.abs(i.value), 0),
  );
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[11px] text-slate-400">
        <Bi si={title} en={en} enClass="en ml-1" />
      </div>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.label}>
            <div className="flex items-baseline justify-between text-[10.5px] text-slate-400">
              <Bi si={it.label} en={it.en} enClass="en ml-1" />
              <span className="font-mono text-[10.5px] text-slate-300">{fmt(it.value, 1)} J</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (Math.abs(it.value) / total) * 100)}%`,
                  background: it.color,
                  boxShadow: `0 0 10px ${it.color}66`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StudyButton({ onClick, label = "අධ්‍යයනය" }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} className="btn btn-primary px-2.5 py-1.5 text-[11px]">
      <Info className="h-3.5 w-3.5" />
      {label}
      <ChevronRight className="h-3 w-3 opacity-60" />
    </button>
  );
}

export function SimHeader({
  title,
  en,
  onStudy,
  hint = "රූපය මත ක්ලික් කළ විට අධ්‍යයන පැනලය විවෘත වේ",
}: {
  title: string;
  en: string;
  onStudy: () => void;
  hint?: string;
}) {
  const { showEn } = useLang();
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-2.5">
      <div className="min-w-0">
        <h3 className="font-display text-[15px] font-semibold leading-tight text-white">{title}</h3>
        {showEn ? <p className="en mt-0.5">{en}</p> : null}
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden text-[9.5px] text-slate-500 sm:inline">{hint}</span>
        <StudyButton onClick={onStudy} />
      </div>
    </div>
  );
}

export function ResetButton({ onClick, label = "යළි පිහිටුවන්න" }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} className="btn px-2 py-1 text-[10.5px] text-slate-400">
      <RotateCcw className="h-3 w-3" />
      {label}
    </button>
  );
}
