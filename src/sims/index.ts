import type { ComponentType } from "react";
import type { SimProps } from "./common";
import Vernier from "./Vernier";
import Projectile from "./Projectile";
import Incline from "./Incline";
import Pulley from "./Pulley";
import Circular from "./Circular";
import Shm from "./Shm";
import Stationary from "./Stationary";
import Interference from "./Interference";
import Lens from "./Lens";
import Kinetic from "./Kinetic";
import Phase from "./Phase";
import Orbit from "./Orbit";
import EField from "./EField";
import Magnetic from "./Magnetic";
import Induction from "./Induction";
import Circuit from "./Circuit";
import Logic from "./Logic";
import Photoelectric from "./Photoelectric";
import Decay from "./Decay";

export const simRegistry: Record<string, ComponentType<SimProps>> = {
  vernier: Vernier,
  projectile: Projectile,
  incline: Incline,
  pulley: Pulley,
  circular: Circular,
  shm: Shm,
  stationary: Stationary,
  interference: Interference,
  lens: Lens,
  kinetic: Kinetic,
  phase: Phase,
  orbit: Orbit,
  efield: EField,
  magnetic: Magnetic,
  induction: Induction,
  circuit: Circuit,
  logic: Logic,
  photoelectric: Photoelectric,
  decay: Decay,
};
