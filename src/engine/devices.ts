import type { MNASystem, PartParams, Solution } from './types';

// re-export so existing `import { Solution } from './devices'` keeps working
export type { Solution };

export const GMIN = 1e-9; // conductance floor (floating-net stability)

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export type NodeFn = (pinId: string) => number;

/** forward voltages per LED color */
export const LED_VF: Record<string, number> = {
  red: 1.8,
  yellow: 2.0,
  green: 2.1,
  blue: 3.0,
  white: 3.0,
};
export const LED_RON = 10; // Ω — educational piecewise-linear dynamic resistance

// plain silicon diode (educational constants)
const DIODE_VF = 0.7; // V
const DIODE_RON = 10; // Ω
export const LED_IMAX = 0.02; // 20 mA safe current

export interface DeviceModel {
  readonly componentId: string;
  readonly isWire?: boolean;
  readonly terminals: string[];
  readonly outputs: Record<string, number | boolean | string>;
  stamp(sys: MNASystem, node: NodeFn, dt: number): void;
  /** returns true when the device switched operating region → re-solve immediately */
  update(sol: Solution, node: NodeFn, dt: number): boolean;
}

type Out = Record<string, number | boolean | string>;

/** piecewise-linear diode primitive shared by LED / diode / transistor BE junction */
class PwlDiode {
  private on = false;
  constructor(
    private a: string,
    private c: string,
    private vf: number,
    private ron: number,
  ) {}
  get conducting(): boolean {
    return this.on;
  }
  stamp(sys: MNASystem, node: NodeFn): void {
    if (this.on) {
      const g = 1 / this.ron;
      sys.stampG(node(this.a), node(this.c), g);
      sys.stampI(node(this.a), node(this.c), -g * this.vf);
    } else {
      sys.stampG(node(this.a), node(this.c), GMIN);
    }
  }
  update(sol: Solution, node: NodeFn, out: Out): boolean {
    const v = sol.v(node(this.a)) - sol.v(node(this.c));
    let switched = false;
    if (this.on) {
      if ((v - this.vf) / this.ron < -1e-9) {
        this.on = false;
        switched = true;
      }
    } else if (v > this.vf) {
      this.on = true;
      switched = true;
    }
    out.voltage = v;
    out.current = this.on ? Math.max(0, (v - this.vf) / this.ron) : v * GMIN;
    out.conducting = this.on;
    return switched;
  }
}

// ------------------------------------------------------------------ battery

/** battery = ideal V source + 0.5 Ω internal resistance via one internal node */
export class BatteryModel implements DeviceModel {
  readonly outputs: Out = {};
  readonly terminals = ['pos', 'neg'];
  private tNode = -1;
  private branch = -1;
  readonly rint = 0.5;
  private volts: number;

  constructor(
    readonly componentId: string,
    params: PartParams,
  ) {
    // explicit 0 V must stay 0 V (zeroed sources in resistance-measurement mode)
    const raw = params.voltage;
    this.volts = raw === undefined || raw === null ? 3 : Number(raw);
    this.outputs.voltage = this.volts;
  }
  /** compiler assigns the internal node + branch index before any stamping */
  assign(tNode: number, branch: number): void {
    this.tNode = tNode;
    this.branch = branch;
  }
  stamp(sys: MNASystem, node: NodeFn): void {
    if (this.tNode < 0 || this.branch < 0) throw new Error('battery not assigned');
    sys.stampG(node('pos'), this.tNode, 1 / this.rint);
    sys.stampV(this.tNode, node('neg'), this.volts, this.branch);
  }
  update(sol: Solution, node: NodeFn): boolean {
    const vterm = sol.v(node('pos')) - sol.v(node('neg'));
    this.outputs.terminalVoltage = vterm;
    // SPICE branch current is +→− through the source; discharge = −that
    this.outputs.dischargeCurrent = this.branch >= 0 ? -sol.branch(this.branch) : 0;
    return false;
  }
}

// ----------------------------------------------------------------- resistor

export class ResistorModel implements DeviceModel {
  readonly outputs: Out = {};
  readonly terminals = ['a', 'b'];
  private g: number;
  constructor(
    readonly componentId: string,
    params: PartParams,
  ) {
    const r = Math.max(0.1, Number(params.resistance) || 220);
    this.g = 1 / r;
    this.outputs.resistance = r;
  }
  stamp(sys: MNASystem, node: NodeFn): void {
    sys.stampG(node('a'), node('b'), this.g);
  }
  update(sol: Solution, node: NodeFn): boolean {
    const v = sol.v(node('a')) - sol.v(node('b'));
    this.outputs.voltage = v;
    this.outputs.current = v * this.g;
    return false;
  }
}

// ---------------------------------------------------------------------- LED

export class LedModel implements DeviceModel {
  readonly outputs: Out = {};
  readonly terminals = ['anode', 'cathode'];
  private diode: PwlDiode;
  readonly vf: number;
  readonly imax = LED_IMAX;
  constructor(
    readonly componentId: string,
    params: PartParams,
  ) {
    const color = String(params.color || 'red');
    this.vf = LED_VF[color] ?? 1.8;
    this.outputs.color = color;
    this.outputs.brightness = 0;
    this.outputs.reversed = false;
    this.diode = new PwlDiode('anode', 'cathode', this.vf, LED_RON);
  }
  stamp(sys: MNASystem, node: NodeFn): void {
    this.diode.stamp(sys, node);
  }
  update(sol: Solution, node: NodeFn): boolean {
    const switched = this.diode.update(sol, node, this.outputs);
    const i = Number(this.outputs.current);
    this.outputs.brightness = clamp(i / this.imax, 0, 1.2);
    this.outputs.reversed = Number(this.outputs.voltage) < -0.3;
    this.outputs.overcurrent = i > this.imax * 1.2;
    return switched;
  }
}

// --------------------------------------------------------------------- diode

export class DiodeModel implements DeviceModel {
  readonly outputs: Out = {};
  readonly terminals = ['anode', 'cathode'];
  private diode: PwlDiode;
  constructor(
    readonly componentId: string,
    _params: PartParams,
  ) {
    this.diode = new PwlDiode('anode', 'cathode', DIODE_VF, DIODE_RON);
  }
  stamp(sys: MNASystem, node: NodeFn): void {
    this.diode.stamp(sys, node);
  }
  update(sol: Solution, node: NodeFn): boolean {
    return this.diode.update(sol, node, this.outputs);
  }
}

// ---------------------------------------------------------- switch & button

abstract class ContactModel implements DeviceModel {
  readonly outputs: Out = {};
  readonly terminals = ['a', 'b'];
  abstract get closed(): boolean;
  constructor(readonly componentId: string) {}
  stamp(sys: MNASystem, node: NodeFn): void {
    sys.stampG(node('a'), node('b'), this.closed ? 1e3 : GMIN);
  }
  update(sol: Solution, node: NodeFn): boolean {
    const v = sol.v(node('a')) - sol.v(node('b'));
    this.outputs.voltage = v;
    this.outputs.current = v * (this.closed ? 1e3 : GMIN);
    this.outputs.closed = this.closed;
    return false;
  }
}

export class SwitchModel extends ContactModel {
  constructor(
    readonly componentId: string,
    params: PartParams,
  ) {
    super(componentId);
    this.outputs.closed = Boolean(params.closed);
  }
  get closed(): boolean {
    return this.outputs.closed === true;
  }
  setClosed(v: boolean): void {
    this.outputs.closed = v;
  }
}

export class ButtonModel extends ContactModel {
  constructor(readonly componentId: string, _params: PartParams) {
    super(componentId);
    this.outputs.closed = false;
  }
  get closed(): boolean {
    return this.outputs.closed === true;
  }
  press(): void {
    this.outputs.closed = true;
  }
  release(): void {
    this.outputs.closed = false;
  }
  /** pressed state via simulator.setControl — same channel the lab canvas uses */
  setClosed(v: boolean): void {
    this.outputs.closed = v;
  }
}

// ---------------------------------------------------------------- capacitor

/** backward-Euler companion model: real exponential charge/discharge curves */
export class CapacitorModel implements DeviceModel {
  readonly outputs: Out = {};
  readonly terminals = ['pos', 'neg'];
  private c: number; // farads
  private vPrev = 0;
  readonly electrolytic: boolean;
  constructor(
    readonly componentId: string,
    params: PartParams,
  ) {
    this.c = Math.max(1e-8, (Number(params.capacitance) || 100) * 1e-6); // µF → F
    this.electrolytic = params.polarity !== 'none';
    this.outputs.capacitance = this.c * 1e6;
    this.outputs.polarity = this.electrolytic ? 'polarized' : 'none';
  }
  stamp(sys: MNASystem, node: NodeFn, dt: number): void {
    const g = this.c / dt;
    sys.stampG(node('pos'), node('neg'), g);
    sys.stampI(node('pos'), node('neg'), -g * this.vPrev);
  }
  update(sol: Solution, node: NodeFn): boolean {
    const v = sol.v(node('pos')) - sol.v(node('neg'));
    this.outputs.voltage = v;
    this.outputs.chargePct = clamp(Math.abs(v) / 9, 0, 1);
    this.outputs.reversed = this.electrolytic && v < -0.3;
    this.vPrev = v;
    return false; // transient: simulator re-solves every tick when caps exist
  }
}

// ------------------------------------------------------------ potentiometer

export class PotModel implements DeviceModel {
  readonly outputs: Out = {};
  readonly terminals = ['a', 'w', 'b'];
  private r: number;
  private t: number;
  constructor(
    readonly componentId: string,
    params: PartParams,
  ) {
    this.r = Math.max(100, Number(params.resistance) || 10_000);
    this.t = clamp(Number(params.taper ?? 0.5), 0, 1);
    this.outputs.resistance = this.r;
    this.outputs.taper = this.t;
  }
  setTaper(t: number): void {
    this.t = clamp(t, 0, 1);
    this.outputs.taper = this.t;
  }
  stamp(sys: MNASystem, node: NodeFn): void {
    const t = clamp(this.t, 0.01, 0.99);
    sys.stampG(node('a'), node('w'), 1 / Math.max(1, this.r * t));
    sys.stampG(node('w'), node('b'), 1 / Math.max(1, this.r * (1 - t)));
  }
  update(sol: Solution, node: NodeFn): boolean {
    this.outputs.wiperVoltage = sol.v(node('w'));
    const va = sol.v(node('a'));
    const vb = sol.v(node('b'));
    this.outputs.endVoltage = va - vb;
    return false;
  }
}

// ---------------------------------------------------------------------- LDR

/** light-dependent resistor: 1 kΩ (bright) ↔ 200 kΩ (dark), light ∈ [0,1] */
export class LdrModel implements DeviceModel {
  readonly outputs: Out = {};
  readonly terminals = ['a', 'b'];
  private light = 0.7;
  constructor(readonly componentId: string, _params: PartParams) {
    this.outputs.light = this.light;
    this.outputs.resistance = 1000 + (1 - this.light) * 199_000;
  }
  setLight(v: number): void {
    this.light = clamp(v, 0, 1);
    this.outputs.light = this.light;
    this.outputs.resistance = 1000 + (1 - this.light) * 199_000;
  }
  stamp(sys: MNASystem, node: NodeFn): void {
    sys.stampG(node('a'), node('b'), 1 / (1000 + (1 - this.light) * 199_000));
  }
  update(sol: Solution, node: NodeFn): boolean {
    const v = sol.v(node('a')) - sol.v(node('b'));
    this.outputs.voltage = v;
    this.outputs.current = v / (1000 + (1 - this.light) * 199_000);
    return false;
  }
}

// --------------------------------------------------------- buzzer & motor

export class BuzzerModel implements DeviceModel {
  readonly outputs: Out = {};
  readonly terminals = ['a', 'b'];
  private g = 1 / 50;
  constructor(readonly componentId: string, _params: PartParams) {}
  stamp(sys: MNASystem, node: NodeFn): void {
    sys.stampG(node('a'), node('b'), this.g);
  }
  update(sol: Solution, node: NodeFn): boolean {
    const v = sol.v(node('a')) - sol.v(node('b'));
    const i = v * this.g;
    this.outputs.voltage = v;
    this.outputs.current = i;
    this.outputs.sounding = Math.abs(i) > 0.005;
    return false;
  }
}

export class MotorModel implements DeviceModel {
  readonly outputs: Out = {};
  readonly terminals = ['a', 'b'];
  private g = 1 / 15;
  constructor(readonly componentId: string, _params: PartParams) {}
  stamp(sys: MNASystem, node: NodeFn): void {
    sys.stampG(node('a'), node('b'), this.g);
  }
  update(sol: Solution, node: NodeFn): boolean {
    const v = sol.v(node('a')) - sol.v(node('b'));
    const i = v * this.g;
    const speed = clamp(Math.abs(i) / 0.15, 0, 1);
    this.outputs.voltage = v;
    this.outputs.current = i;
    this.outputs.speed = speed;
    this.outputs.rpm = Math.round(speed * 3000);
    return false;
  }
}

// ------------------------------------------------------- transistor (NPN)

const BETA = 100;
const VBE_ON = 0.7;
const RBE = 25;
const VCE_SAT = 0.2;
const RCE_SAT = 5;

/**
 * Educational NPN transistor:
 * - B–E junction: piecewise-linear diode (0.7 V / 25 Ω)
 * - C–E: VCCS  Ic = β·Ib  stamped as gm = β/RBE controlled by V(B,E) —
 *   linear in G, so the collector current is ALWAYS consistent with the
 *   solved vbe (no stale-state oscillation)
 * - saturation: CE replaced by 5 Ω resistor (VCE ≈ 0.2 V), with hysteresis
 */
export class TransistorModel implements DeviceModel {
  readonly outputs: Out = {};
  readonly terminals = ['base', 'collector', 'emitter'];
  private be = new PwlDiode('base', 'emitter', VBE_ON, RBE);
  private saturated = false;
  constructor(readonly componentId: string, _params: PartParams) {
    this.outputs.mode = 'off';
    this.outputs.beta = BETA;
  }
  private get beOn(): boolean {
    return this.be.conducting;
  }
  stamp(sys: MNASystem, node: NodeFn): void {
    this.be.stamp(sys, node);
    const b = node('base');
    const c = node('collector');
    const e = node('emitter');
    if (this.saturated) {
      sys.stampG(c, e, 1 / RCE_SAT);
    } else if (this.beOn) {
      // I(C→E) = gm·(Vb−Ve) − gm·VBE_ON  (= β·Ib)
      sys.stampVCCS(c, e, b, e, BETA / RBE);
      sys.stampI(c, e, -(BETA / RBE) * VBE_ON);
    }
  }
  update(sol: Solution, node: NodeFn): boolean {
    const beOut: Out = {};
    let switched = this.be.update(sol, node, beOut);
    const vbe = Number(beOut.voltage);
    const conducting = beOut.conducting === true;
    const vce = sol.v(node('collector')) - sol.v(node('emitter'));
    if (this.saturated) {
      if (!conducting || vce > 0.35) {
        this.saturated = false;
        switched = true;
      }
    } else if (conducting && vce < VCE_SAT) {
      this.saturated = true;
      switched = true;
    }
    const ib = conducting ? Math.max(0, (vbe - VBE_ON) / RBE) : 0;
    this.outputs.ib = ib;
    this.outputs.ic = this.saturated ? Math.max(0, vce / RCE_SAT) : BETA * ib;
    this.outputs.vce = vce;
    this.outputs.mode = this.saturated ? 'sat' : ib > 0 ? 'active' : 'off';
    return switched;
  }
}

// ------------------------------------------------------------------ ammeter

export class AmmeterModel implements DeviceModel {
  readonly outputs: Out = {};
  readonly terminals = ['a', 'b'];
  private g = 1e3; // 1 mΩ
  constructor(readonly componentId: string, _params: PartParams) {}
  stamp(sys: MNASystem, node: NodeFn): void {
    sys.stampG(node('a'), node('b'), this.g);
  }
  update(sol: Solution, node: NodeFn): boolean {
    const v = sol.v(node('a')) - sol.v(node('b'));
    this.outputs.voltage = v;
    this.outputs.current = v * this.g;
    return false;
  }
}

// ------------------------------------------------------- wire pseudo-device

/** every wire is a 1 mΩ edge → each wire has a well-defined current for flow animation */
export class WireModel implements DeviceModel {
  readonly outputs: Out = {};
  readonly isWire = true;
  readonly terminals = ['a', 'b'];
  private g = 1e3;
  constructor(
    readonly componentId: string,
    private nodeA: number,
    private nodeB: number,
  ) {}
  stamp(sys: MNASystem): void {
    sys.stampG(this.nodeA, this.nodeB, this.g);
  }
  update(sol: Solution): boolean {
    this.outputs.current = (sol.v(this.nodeA) - sol.v(this.nodeB)) * this.g;
    return false;
  }
}
