import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Atom,
  BookOpen,
  Check,
  ChevronRight,
  FlaskConical,
  HelpCircle,
  Sigma,
  Target,
  X,
} from "lucide-react";
import type { SimMeta } from "../data/syllabus";
import { Bi, useLang } from "../lib/language";

export function StudyDrawer({
  meta,
  unitName,
  open,
  onClose,
}: {
  meta: SimMeta | null;
  unitName: string;
  open: boolean;
  onClose: () => void;
}) {
  const { showEn } = useLang();
  const [picked, setPicked] = useState<(number | null)[]>([]);

  useEffect(() => {
    setPicked([]);
  }, [meta?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!meta) return null;

  const study = meta.study;
  const sections = [
    { id: "intro", label: "හැඳින්වීම සහ නිර්වචන", en: "Introduction & definitions", icon: BookOpen },
    { id: "eq", label: "සූත්‍ර හා සිද්ධාන්ත", en: "Key equations & principles", icon: Sigma },
    { id: "practical", label: "ප්‍රායෝගික පරීක්ෂණ කරුණු", en: "Practical / lab notes", icon: FlaskConical },
    { id: "traps", label: "විභාග ඉලක්කගත කරුණු", en: "MCQ & essay traps", icon: AlertTriangle },
    { id: "mcq", label: "කෙටි පුහුණු ප්‍රශ්න", en: "Quick practice MCQs", icon: HelpCircle },
  ];

  const jump = (id: string) => {
    document.getElementById(`study-${meta.id}-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[470px] flex-col border-l border-white/10 bg-ink-900/98 shadow-[-30px_0_80px_-30px_rgba(0,0,0,0.9)] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <header className="border-b border-white/[0.08] bg-gradient-to-b from-aqua-400/[0.07] to-transparent px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-aqua-400/80">
                <Atom className="h-3 w-3" /> A/L අධ්‍යයන පැනලය
              </div>
              <h2 className="mt-2 font-display text-xl leading-tight text-white">{meta.si}</h2>
              {showEn ? <p className="en mt-1">{meta.en}</p> : null}
              <p className="mt-2 text-[11px] text-slate-400">
                {unitName} · ඒකකය තුළ අධ්‍යයන සටහන්
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 p-1.5 text-slate-400 transition hover:border-rose-400/40 hover:text-rose-300"
              aria-label="close study panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => jump(s.id)}
                className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[9.5px] text-slate-400 transition hover:border-aqua-400/40 hover:text-aqua-400"
              >
                {s.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <Section id={`study-${meta.id}-intro`} icon={BookOpen} title="හැඳින්වීම සහ නිර්වචන" en="Introduction & definitions">
            <p className="rounded-lg border border-aqua-400/15 bg-aqua-400/[0.05] p-3 text-[12.5px] leading-[1.95] text-slate-300">
              {study.intro}
            </p>
            <div className="mt-3 space-y-2">
              {study.definitions.map((d) => (
                <div key={d.en} className="rounded-lg border border-white/[0.07] bg-ink-850/70 p-2.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <h4 className="text-[12.5px] font-semibold text-white">{d.si}</h4>
                    <span className="en">{d.en}</span>
                  </div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-slate-400">{d.body}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id={`study-${meta.id}-eq`} icon={Sigma} title="සූත්‍ර හා සිද්ධාන්ත" en="Key equations & principles">
            <div className="space-y-2">
              {study.equations.map((eq) => (
                <div key={eq.expr} className="rounded-lg border border-ember/15 bg-ember/[0.04] p-2.5">
                  <div className="font-mono text-[13px] leading-relaxed text-ember">{eq.expr}</div>
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-2 text-[10.5px] text-slate-400">
                    <span>{eq.si}</span>
                    {eq.en && showEn ? <span className="en">{eq.en}</span> : null}
                  </div>
                  {eq.note ? <p className="mt-1 text-[10px] text-slate-500">{eq.note}</p> : null}
                </div>
              ))}
            </div>
          </Section>

          <Section id={`study-${meta.id}-practical`} icon={FlaskConical} title="ප්‍රායෝගික පරීක්ෂණ කරුණු" en="A/L practical, precautions & error sources">
            <ul className="space-y-2">
              {study.practical.map((p, i) => (
                <li key={i} className="flex gap-2.5 rounded-lg border border-white/[0.06] bg-ink-850/60 p-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-sky-400/15 font-mono text-[10px] text-sky-300">
                    {i + 1}
                  </span>
                  <span className="text-[11.5px] leading-relaxed text-slate-300">{p}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section id={`study-${meta.id}-traps`} icon={Target} title="විභාග ඉලක්කගත කරුණු" en="A/L MCQ & structured essay traps">
            <ul className="space-y-2">
              {study.traps.map((p, i) => (
                <li key={i} className="flex gap-2.5 rounded-lg border border-rose-400/15 bg-rose-400/[0.04] p-2.5">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
                  <span className="text-[11.5px] leading-relaxed text-slate-300">{p}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section id={`study-${meta.id}-mcq`} icon={HelpCircle} title="කෙටි පුහුණු ප්‍රශ්න" en="Quick practice MCQs">
            <div className="space-y-3">
              {study.mcq.map((q, qi) => {
                const choice = picked[qi] ?? null;
                return (
                  <div key={qi} className="rounded-xl border border-white/[0.08] bg-ink-850/80 p-3">
                    <p className="text-[12px] leading-relaxed text-slate-200">
                      <span className="mr-1.5 font-mono text-[10px] text-aqua-400">Q{qi + 1}.</span>
                      {q.q}
                    </p>
                    <div className="mt-2.5 space-y-1.5">
                      {q.options.map((opt, oi) => {
                        const isPicked = choice === oi;
                        const isCorrect = q.answer === oi;
                        const revealed = choice !== null;
                        return (
                          <button
                            key={oi}
                            onClick={() => {
                              const next = [...picked];
                              next[qi] = oi;
                              setPicked(next);
                            }}
                            className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[11.5px] transition ${
                              revealed && isCorrect
                                ? "border-aqua-400/50 bg-aqua-400/10 text-white"
                                : revealed && isPicked
                                  ? "border-rose-400/50 bg-rose-400/10 text-rose-200"
                                  : "border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/25"
                            }`}
                          >
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-current/40 font-mono text-[9px] opacity-80">
                              {String.fromCharCode(65 + oi)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {revealed && isCorrect ? <Check className="h-3.5 w-3.5 text-aqua-400" /> : null}
                          </button>
                        );
                      })}
                    </div>
                    {choice !== null ? (
                      <div
                        className={`mt-2 rounded-lg border p-2 text-[10.5px] leading-relaxed ${
                          choice === q.answer
                            ? "border-aqua-400/25 bg-aqua-400/[0.06] text-slate-300"
                            : "border-rose-400/25 bg-rose-400/[0.06] text-slate-300"
                        }`}
                      >
                        <span className={choice === q.answer ? "text-aqua-400" : "text-rose-300"}>
                          {choice === q.answer ? "නිවැරදියි! " : "වැරදියි. "}
                        </span>
                        {q.explain}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Section>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-[10.5px] leading-relaxed text-slate-500">
            <Bi
              si="මෙම සටහන් NIE උසස් පෙළ භෞතික විද්‍යා සිලබස්, ගුරු සම්පත් පොත් සහ ප්‍රායෝගික මාර්ගෝපදේශවලට අනුකූලව සකස් කර ඇත. විභාගයට පෙර ගුරුතුමාගේ සටහන් සමඟ සසඳා බලන්න."
              en="Aligned with the NIE A/L Physics syllabus, teachers' resource books and practical guides."
              enClass="en mt-1 block"
            />
          </div>
        </div>
      </aside>
    </>
  );
}

function Section({
  id,
  icon: Icon,
  title,
  en,
  children,
}: {
  id: string;
  icon: typeof BookOpen;
  title: string;
  en: string;
  children: React.ReactNode;
}) {
  const { showEn } = useLang();
  return (
    <section id={id} className="scroll-mt-4">
      <div className="mb-2 flex items-center gap-2 border-b border-white/[0.07] pb-1.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-aqua-400/10 text-aqua-400">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div>
          <h3 className="text-[12.5px] font-semibold leading-tight text-white">{title}</h3>
          {showEn ? <p className="en text-[9px]">{en}</p> : null}
        </div>
        <ChevronRight className="ml-auto h-3.5 w-3.5 text-slate-600" />
      </div>
      {children}
    </section>
  );
}
