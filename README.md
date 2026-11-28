# භෞතික විද්‍යා ප්‍රයෝගිකා · Sinhala A/L Physics Lab

An interactive, Sinhala-medium physics simulation lab for Sri Lankan G.C.E. Advanced Level students, aligned with the NIE A/L Physics syllabus, teachers' resource books and practical guides.

## Features

- **10 syllabus units** — Measurement, Mechanics, Oscillations/Waves/Optics, Thermal Physics, Gravitation, Electrostatic Field, Magnetic Field, Current Electricity, Electronics, Matter & Radiation.
- **19 canvas simulations** — projectile motion, inclined plane with friction, pulleys, circular motion, SHM, stationary waves, interference/diffraction, lens & mirror ray diagrams, vernier caliper, molecular motion, phase-change curve, satellite orbits, electric fields & capacitors, magnetic fields, Faraday/Lenz induction, DC circuits, logic gates, photoelectric effect and radioactive decay.
- **Resolve / explode vectors** buttons on the mechanics labs show force components, while canvas HUDs show live energy bars and readouts.
- **Bilingual toggle** (සිංහල + English) reveals standard English physics terms, symbols and SI units throughout.
- **Study drawer** for every topic: introduction & definitions, key equations, A/L practical precautions, MCQ/essay traps, and interactive practice MCQs with explanations.
- Fonts: `Noto Sans Sinhala` + `Abhaya Libre`; icons: Lucide; charts are custom canvas plots.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · HTML5 Canvas · Lucide Icons

## Run

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build && npm run preview
```

## Deploy (GitHub Pages)

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes `dist/` to GitHub Pages. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

The production build is served from `https://<user>.github.io/physics/`, so `vite.config.ts` sets `base: "/physics/"` for production and `/` for development. If the repository is ever renamed, update that base path.

Live site: <https://shehankanchana12-art.github.io/physics/>

## Structure

```
src/
  App.tsx                 unit navigation, tabs, study drawer wiring
  data/syllabus.ts        units, sims and Sinhala study content
  components/             Canvas engine, UI primitives, study drawer
  sims/                   one component per simulation + shared shell
  lib/                    theme/palette, canvas drawing helpers, bilingual context
```
