/**
 * CircuitQuest — Circuit Simulation Engine
 * Pure TypeScript. NO React, NO DOM, NO browser APIs.
 * Educational MNA-based solver (simplified SPICE).
 */

// ---------- Editor-level data ----------

export interface PinRef {
  componentId: string;
  pinId: string;
}

export interface WireData {
  id: string;
  a: PinRef;
  b: PinRef;
}

export interface ComponentInstance {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number; // 0 | 90 | 180 | 270
  params: Record<string, string | number | boolean>;
}

export interface CircuitDoc {
  components: ComponentInstance[];
  wires: WireData[];
}

export const emptyCircuit = (): CircuitDoc => ({ components: [], wires: [] });

// ---------- Part definition (registry-level, UI-agnostic) ----------

export interface PinDef {
  id: string;
  x: number; // relative to part origin, un-rotated
  y: number;
  label?: string;
}

export type PartCategory = 'power' | 'basic' | 'input' | 'output' | 'sensors' | 'tools';

export interface ParamOption {
  value: string | number;
  label: string;
}

export interface ParamSpec {
  key: string;
  label: string;
  type: 'number' | 'enum' | 'boolean' | 'range';
  default: string | number | boolean;
  options?: ParamOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  /** shown read-only (taught, not editable) */
  fixed?: boolean;
  /** live-controlled in Run mode (e.g. pot slider, LDR light) */
  liveControl?: boolean;
}

export interface PartSize {
  w: number;
  h: number;
}

export type PartParams = Record<string, string | number | boolean>;

/** solution accessor handed to device models */
export interface Solution {
  /** node voltage; node -1 (ground) returns 0 */
  v(node: number): number;
  /** voltage-source branch current (SPICE convention: +→− through the source) */
  branch(k: number): number;
}

/**
 * Electrical device model — implemented per part type in engine/devices.ts
 */
export interface DeviceModel {
  readonly componentId: string;
  /** wire pseudo-devices use this to render flow */
  readonly isWire?: boolean;
  /** pin ids, in terminal order */
  readonly terminals: string[];
  /** stamp linearized contribution into the MNA system at current operating state */
  stamp(sys: MNASystem, node: (pinId: string) => number, dt: number): void;
  /**
   * read solution, update internal state.
   * returns true when the device switched operating region → solver must re-iterate.
   */
  update(sol: Solution, node: (pinId: string) => number, dt: number): boolean;
  /** externally driven controls (switch closed, button pressed, pot position...) */
  readonly outputs: Record<string, number | boolean | string>;
}

export type ModelFactory = (componentId: string, params: PartParams) => DeviceModel;

export interface PartDef {
  type: string;
  category: PartCategory;
  nameKey: string;
  eduKey: string;
  difficulty: 1 | 2 | 3;
  pins: PinDef[];
  params: ParamSpec[];
  size: PartSize;
  createModel: ModelFactory;
  /** default z-index layering (wires under parts) */
  layer?: number;
}

// ---------- MNA system ----------

export interface MNASystem {
  numNodes: number; // allocated node count (exclusive of ground)
  numBranches: number;
  /** compile phase: allocate one node index */
  allocNode(): number;
  /** compile phase: lock layout before stamping */
  freeze(): void;
  addBranch(): number;
  stampG(a: number, c: number, g: number): void;
  /** current source: i (amperes) flows a→c *through the source* */
  stampI(a: number, c: number, i: number): void;
  /**
   * voltage-controlled current source (VCCS):
   * current gm·(V(c+)−V(c−)) flows out+→out− — stamps linearly into G
   */
  stampVCCS(outPlus: number, outMinus: number, ctrlPlus: number, ctrlMinus: number, gm: number): void;
  /** ideal voltage source: V(plus) - V(minus) = volts; branch index from addBranch() */
  stampV(plus: number, minus: number, volts: number, branch: number): void;
  /** Gaussian elimination with partial pivoting; null when singular */
  solve(): Float64Array | null;
  reset(): void;
}

// ---------- Simulation results ----------

export type DiagnosticSeverity = 'info' | 'warning' | 'error' | 'success';

export interface Diagnostic {
  code: string;
  severity: DiagnosticSeverity;
  /** component ids involved (for canvas highlighting) */
  componentIds: string[];
  /** interpolation values for the localized message */
  values?: Record<string, string | number>;
}

export interface SimSnapshot {
  running: boolean;
  solved: boolean;
  /** node index → voltage (ground = 0) */
  netVoltage: Record<number, number>;
  /** "componentId.pinId" → volts */
  pinVoltage: Record<string, number>;
  /** componentId → device outputs (also contains wire pseudo-components) */
  outputs: Record<string, Record<string, number | boolean | string>>;
  /** wireId → current (A, positive a→b) */
  wireCurrents: Record<string, number>;
  diagnostics: Diagnostic[];
  /** pins alone on their net (unconnected terminals) */
  floatingPins: string[];
  /** seconds of simulated time (for transient demos) */
  time: number;
}

// ---------- Goal DSL (content-facing, JSON-serializable) ----------

export type GoalCheck =
  | 'ledOn'
  | 'ledOff'
  | 'ledPresent'
  | 'currentWithin'
  | 'voltageAcross'
  | 'batteryPresent'
  | 'notShorted'
  | 'noBlockingDiagnostics'
  | 'componentPresent'
  | 'componentTypeCount'
  | 'switchPresent'
  | 'switchClosed'
  | 'buttonPresent'
  | 'buzzerOn'
  | 'motorSpinning'
  | 'capVoltageAbove'
  | 'wiperInRange'
  | 'usedMultimeter'
  | 'probeReadingWithin';

export interface GoalExpr {
  op?: 'and' | 'or';
  check?: GoalCheck;
  id?: string;
  type?: string;
  count?: number;
  min?: number;
  max?: number;
  param?: string;
  args?: GoalExpr[];
}
