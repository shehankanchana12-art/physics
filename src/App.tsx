import { useEffect, useMemo, useState } from "react";
import {
  Atom,
  AudioWaveform,
  BookMarked,
  CircuitBoard,
  Cpu,
  Dumbbell,
  GraduationCap,
  Languages,
  Magnet,
  Menu,
  Orbit,
  Ruler,
  Sparkles,
  Thermometer,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { LanguageProvider, useLang } from "./lib/language";
import { units, findUnit } from "./data/syllabus";
import { simRegistry } from "./sims";
import { StudyDrawer } from "./components/StudyDrawer";

const unitIcons: Record<string, typeof Ruler> = {
  measurement: Ruler,
  mechanics: Dumbbell,
  waves: AudioWaveform,
  thermal: Thermometer,
  gravitation: Orbit,
  electrostatics: Zap,
  magnetism: Magnet,
  current: CircuitBoard,
  electronics: Cpu,
  matter: Atom,
};

function Lab() {
  const { showEn, toggle } = useLang();
  const [unitId, setUnitId] = useState(units[1].id);
  const [simId, setSimId] = useState(units[1].sims[0].id);
  const [studyOpen, setStudyOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const unit = findUnit(unitId) ?? units[0];
  const sim = unit.sims.find((s) => s.id === simId) ?? unit.sims[0];
  const Sim = simRegistry[sim.id];
  const totalSims = useMemo(() => units.reduce((n, u) => n + u.sims.length, 0), []);

  useEffect(() => {
    setSimId(unit.sims[0].id);
  }, [unitId]);

  const openStudy = () => setStudyOpen(true);

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[272px] shrink-0 border-r border-white/[0.07] bg-ink-900/95 backdrop-blur-xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:bg-ink-900/40 ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-2 border-b border-white/[0.07] px-5 py-5">
            <div>
              <div className="flex items-center gap-2 text-[9.5px] uppercase tracking-[0.24em] text-aqua-400/80">
                <GraduationCap className="h-3.5 w-3.5" /> G.C.E. A/L · NIE
              </div>
              <h1 className="mt-2 font-display text-[22px] font-bold leading-tight text-white">
                භෞතික විද්‍යා
                <span className="block text-aqua-400">ප්‍රයෝගිකා</span>
              </h1>
              {showEn ? <p className="en mt-1.5 text-[8.5px]">Sinhala Physics Simulation Lab</p> : null}
            </div>
            <button className="rounded-lg border border-white/10 p-1 text-slate-400 lg:hidden" onClick={() => setNavOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="mb-2 px-2 text-[9.5px] uppercase tracking-[0.2em] text-slate-500">ඒකක / Units</div>
            <div className="space-y-1">
              {units.map((u) => {
                const Icon = unitIcons[u.id] ?? Sparkles;
                const active = u.id === unitId;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      setUnitId(u.id);
                      setNavOpen(false);
                    }}
                    className={`group flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition ${
                      active
                        ? "border-aqua-400/30 bg-aqua-400/[0.09] shadow-[inset_0_0_20px_-10px_rgba(56,225,196,0.8)]"
                        : "border-transparent hover:border-white/10 hover:bg-white/[0.03]"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                        active ? "bg-aqua-400/20 text-aqua-400" : "bg-white/[0.04] text-slate-400"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[12px] font-medium ${active ? "text-white" : "text-slate-300"}`}>
                        {u.si}
                      </span>
                      {showEn ? <span className="en block truncate text-[8.5px]">{u.en}</span> : null}
                    </span>
                    <span className={`font-mono text-[9px] ${active ? "text-aqua-400/80" : "text-slate-600"}`}>{u.num}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-white/[0.07] px-4 py-4">
            <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-2.5">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <BookMarked className="h-3 w-3 text-ember" /> අධ්‍යයන ද්‍රව්‍ය
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                ඒකක {units.length}ක් · සිමියුලේෂන් {totalSims}ක් · සෑම ඒකකයකටම විභාග සටහන්, සූත්‍ර හා MCQ.
              </p>
              <button onClick={openStudy} className="btn btn-ember mt-2 w-full justify-center px-2 py-1.5 text-[10.5px]">
                <Wand2 className="h-3 w-3" /> අධ්‍යයන පැනලය
              </button>
            </div>
            <p className="mt-3 text-center text-[9px] leading-relaxed text-slate-600">
              © 2026 · සිංහල මාධ්‍ය භෞතික විද්‍යා ප්‍රයෝගිකා
            </p>
          </div>
        </div>
      </aside>

      {navOpen ? (
        <div className="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm lg:hidden" onClick={() => setNavOpen(false)} />
      ) : null}

      {/* Main */}
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-ink-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-3 py-2.5 lg:px-7">
            <button className="rounded-lg border border-white/10 p-1.5 text-slate-300 lg:hidden" onClick={() => setNavOpen(true)}>
              <Menu className="h-4 w-4" />
            </button>
            <div className="hidden min-w-0 items-center gap-2 text-[11px] text-slate-400 sm:flex">
              <span className="font-mono text-aqua-400/80">A/L PHYSICS</span>
              <span className="text-slate-600">/</span>
              <span className="truncate">{unit.si}</span>
              <span className="text-slate-600">/</span>
              <span className="truncate text-slate-200">{sim.si}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={toggle}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10.5px] font-medium transition ${
                  showEn
                    ? "border-aqua-400/35 bg-aqua-400/10 text-aqua-400"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200"
                }`}
                aria-pressed={showEn}
                title="English terms & units toggle"
              >
                <Languages className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">සිංහල + English</span>
                <span className="sm:hidden">EN</span>
                <span className={`ml-0.5 rounded px-1 font-mono text-[8.5px] ${showEn ? "bg-aqua-400/20" : "bg-white/10"}`}>
                  {showEn ? "ON" : "OFF"}
                </span>
              </button>
              <button onClick={openStudy} className="btn btn-primary px-2.5 py-1.5 text-[10.5px]">
                <BookMarked className="h-3.5 w-3.5" /> <span className="hidden sm:inline">අධ්‍යයනය</span>
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] px-3 pb-14 pt-4 lg:px-7">
          {/* Hero */}
          <section className="panel relative overflow-hidden p-4 sm:p-5">
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-aqua-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-ember/10 blur-3xl" />
            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[9.5px] uppercase tracking-[0.28em] text-aqua-400/70">
                  <span className="h-1 w-1 rounded-full bg-aqua-400" /> Sri Lankan G.C.E. Advanced Level
                </div>
                <h2 className="mt-1.5 font-display text-2xl leading-tight text-white sm:text-[28px]">
                  භෞතික විද්‍යා අන්තර්ක්‍රියාකාරී පර්යේෂණාගාරය
                </h2>
                <p className="mt-1 max-w-2xl text-[11.5px] leading-relaxed text-slate-400">
                  NIE සිලබස් අනුකූල ඒකක {units.length}ක්, සජීවී සිමියුලේෂන් {totalSims}ක් සහ සෑම මාතෘකාවකටම සිංහල
                  අධ්‍යයන සටහන්.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <span className="chip border-aqua-400/20 text-aqua-300">
                  <Sparkles className="h-3 w-3" /> සජීවී ගණනය
                </span>
                <span className="chip border-ember/20 text-ember">
                  <Languages className="h-3 w-3" /> ද්විභාෂා පද
                </span>
                <span className="chip border-white/10">A/L ප්‍රායෝගික</span>
              </div>
            </div>
          </section>

          {/* Unit header */}
          <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-aqua-400/25 bg-aqua-400/10 px-1.5 py-0.5 font-mono text-[10px] text-aqua-400">
                  ඒකකය {unit.num}
                </span>
                <span className="en">{unit.en}</span>
              </div>
              <h2 className="mt-1 font-display text-[26px] leading-tight text-white">{unit.si}</h2>
              <p className="mt-1 max-w-3xl text-[11.5px] leading-relaxed text-slate-400">{unit.intro}</p>
            </div>
            <button onClick={openStudy} className="btn btn-ember px-3 py-2 text-[11px]">
              <BookMarked className="h-3.5 w-3.5" />
              මෙම මාතෘකාවේ අධ්‍යයන සටහන්
            </button>
          </div>

          {/* Sim tabs */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {unit.sims.map((s, i) => {
              const active = s.id === sim.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSimId(s.id)}
                  className={`group min-w-[168px] shrink-0 rounded-xl border px-3 py-2 text-left transition ${
                    active
                      ? "border-aqua-400/40 bg-aqua-400/[0.08] shadow-[0_0_30px_-16px_rgba(56,225,196,0.9)]"
                      : "border-white/[0.07] bg-ink-850/50 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-mono text-[9px] ${active ? "text-aqua-400" : "text-slate-600"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-aqua-400" : "bg-slate-700"}`} />
                  </div>
                  <div className={`mt-1 text-[11.5px] font-medium leading-snug ${active ? "text-white" : "text-slate-300"}`}>
                    {s.si}
                  </div>
                  {showEn ? <div className="en mt-0.5 truncate">{s.en}</div> : null}
                </button>
              );
            })}
          </div>

          {/* Simulator */}
          <div className="mt-4 animate-fade-up">
            {Sim ? (
              <Sim meta={sim} onStudy={openStudy} />
            ) : (
              <div className="panel p-8 text-center text-slate-400">සිමියුලේෂන් එක ලබා ගත නොහැක.</div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
            <span>
              {unit.si} · {sim.si} — {unit.num}
            </span>
            <span>රූපය/මාතෘකාව මත ක්ලික් කර සිංහල අධ්‍යයන සටහන් විවෘත කරන්න</span>
          </div>
        </div>
      </main>

      <StudyDrawer meta={sim} unitName={unit.si} open={studyOpen} onClose={() => setStudyOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Lab />
    </LanguageProvider>
  );
}
