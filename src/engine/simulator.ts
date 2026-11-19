import { GMIN } from './devices';
import { compile, type CompiledNetlist } from './netlist';
import { analyzeDiagnostics } from './diagnostics';
import type {
  CircuitDoc,
  DeviceModel,
  PartDef,
  SimSnapshot,
  Solution,
} from './types';

export interface TaskState {
  usedMultimeter: boolean;
  probeReading: number | null;
  probeA: string | null;
  probeB: string | null;
}

export const freshTaskState = (): TaskState => ({
  usedMultimeter: false,
  probeReading: null,
  probeA: null,
  probeB: null,
});

const MAX_NR_ITER = 50;

/** optional iteration trace (debugging tool, disabled in production) */
export const nrDebug: { trace: ((iter: number, info: Record<string, number | string>) => void) | null } = {
  trace: null,
};

/**
 * Transient simulator driving the MNA solver.
 * - Newton–Raphson iteration for nonlinear devices (LED / diode / transistor)
 * - backward-Euler capacitors → one dt step per tick
 * - steady-state circuits re-solve only when something changes
 */
export class Simulator {
  private doc: CircuitDoc;
  private defs: Map<string, PartDef>;
  private nl: CompiledNetlist | null = null;
  private compileError: string | null = null;
  private x: Float64Array | null = null;
  private modelNodes: ((pinId: string) => number)[] = [];
  private _running = false;
  private time = 0;
  private dirty = true;
  private hasCaps = false;
  task: TaskState = freshTaskState();

  snapshot: SimSnapshot = {
    running: false,
    solved: false,
    netVoltage: {},
    pinVoltage: {},
    outputs: {},
    wireCurrents: {},
    diagnostics: [],
    floatingPins: [],
    time: 0,
  };

  constructor(doc: CircuitDoc, defs: Map<string, PartDef>) {
    this.doc = doc;
    this.defs = defs;
    this.recompile();
  }

  get running(): boolean {
    return this._running;
  }

  setDoc(doc: CircuitDoc): void {
    this.doc = doc;
    this.recompile();
  }

  getDoc(): CircuitDoc {
    return this.doc;
  }

  recompile(): void {
    const res = compile(this.doc, this.defs);
    this.compileError = res.error ?? null;
    this.nl = res.netlist ?? null;
    this.x = null;
    this.modelNodes = [];
    this.hasCaps = this.nl?.hasCapacitor ?? false;
    if (this.nl) {
      const nodeOfPin = this.nl.nodeOfPin;
      for (const m of this.nl.models) {
        const cid = m.componentId;
        this.modelNodes.push((pinId: string) => {
          const key = pinId.includes('.') ? pinId : `${cid}.${pinId}`;
          return nodeOfPin.get(key) ?? -1;
        });
      }
    }
    this.dirty = true;
    this.publish();
  }

  power(on: boolean): void {
    this._running = on;
    if (!on) {
      this.time = 0;
      // reset capacitors so a re-run charges from zero
      this.recompile();
    }
    this.publish();
  }

  setControl(componentId: string, key: 'closed' | 'taper' | 'light', value: number | boolean): void {
    if (!this.nl) return;
    for (const m of this.nl.models) {
      if (m.componentId !== componentId || m.isWire) continue;
      if (key === 'closed' && 'setClosed' in m) (m as { setClosed: (v: boolean) => void }).setClosed(Boolean(value));
      if (key === 'taper' && 'setTaper' in m) (m as { setTaper: (v: number) => void }).setTaper(Number(value));
      if (key === 'light' && 'setLight' in m) (m as { setLight: (v: number) => void }).setLight(Number(value));
    }
    this.dirty = true;
    if (this._running) {
      this.solveStep(1 / 60);
      this.publish();
    }
  }

  /** advance one animation step */
  tick(dt: number): void {
    if (!this._running) return;
    let solvedNow = false;
    if (this.dirty || this.hasCaps || !this.x) {
      this.solveStep(dt);
      solvedNow = true;
    }
    this.time += dt;
    if (solvedNow) this.publish();
    else this.snapshot.time = this.time;
  }

  private solveStep(dt: number): void {
    const nl = this.nl;
    if (!nl) return;
    const sol: Solution = {
      v: (node) => (node >= 0 && node < nl.sys.numNodes && this.x ? this.x[node] : 0),
      branch: (k) => (this.x ? this.x[nl.sys.numNodes + k] : 0),
    };
    let solution: Float64Array | null = null;
    for (let iter = 0; iter < MAX_NR_ITER; iter++) {
      nl.sys.reset();
      for (let i = 0; i < nl.sys.numNodes; i++) nl.sys.stampG(i, -1, GMIN);
      for (let i = 0; i < nl.models.length; i++) {
        nl.models[i].stamp(nl.sys, this.modelNodes[i], dt);
      }
      solution = nl.sys.solve();
      if (!solution) {
        this.x = null;
        break;
      }
      this.x = solution;
      let switched = false;
      const who: string[] = [];
      for (let i = 0; i < nl.models.length; i++) {
        if (nl.models[i].update(sol, this.modelNodes[i], dt)) {
          switched = true;
          who.push(nl.models[i].componentId);
        }
      }
      if (nrDebug.trace) {
        const qi = nl.models.findIndex((m) => m.componentId === 'q1');
        const q1o = qi >= 0 ? nl.models[qi].outputs : {};
        nrDebug.trace(iter, {
          vce: String(q1o.vce),
          ib: String(q1o.ib),
          mode: String(q1o.mode),
          switched: who.join(','),
        });
      }
      if (!switched) break;
    }
    this.dirty = false;
  }

  /** voltmeter reading between two pin keys (requires running) */
  measureVoltage(pinA: string, pinB: string): number | null {
    if (!this.x || !this.nl) return null;
    const a = this.nl.nodeOfPin.get(pinA);
    const b = this.nl.nodeOfPin.get(pinB);
    const va = a !== undefined && a >= 0 ? this.x[a] : 0;
    const vb = b !== undefined && b >= 0 ? this.x[b] : 0;
    return va - vb;
  }

  /** ohmmeter: zero sources, inject 1 mA between probes, R = ΔV / I */
  measureResistance(pinA: string, pinB: string): number | null {
    const res = compile(this.doc, this.defs, { zeroSources: true });
    const nl = res.netlist;
    if (!nl) return null;
    const a = nl.nodeOfPin.get(pinA);
    const b = nl.nodeOfPin.get(pinB);
    if (a === undefined || b === undefined) return null;
    // huge dt → capacitors behave as open circuits
    nl.sys.reset();
    for (let i = 0; i < nl.sys.numNodes; i++) nl.sys.stampG(i, -1, GMIN);
    for (const m of nl.models) m.stamp(nl.sys, (pinId) => {
      const key = pinId.includes('.') ? pinId : `${m.componentId}.${pinId}`;
      return nl.nodeOfPin.get(key) ?? -1;
    }, 1e6);
    nl.sys.stampI(b, a, 1e-3); // inject 1 mA into a, extract at b
    const x = nl.sys.solve();
    if (!x) return null;
    const va = a >= 0 ? x[a] : 0;
    const vb = b >= 0 ? x[b] : 0;
    return Math.abs(va - vb) / 1e-3;
  }

  private publish(): void {
    const nl = this.nl;
    const outputs: SimSnapshot['outputs'] = {};
    const wireCurrents: SimSnapshot['wireCurrents'] = {};
    const pinVoltage: SimSnapshot['pinVoltage'] = {};
    const netVoltage: SimSnapshot['netVoltage'] = {};
    if (nl && this.x) {
      for (let i = 0; i < nl.sys.numNodes; i++) netVoltage[i] = this.x[i];
      for (const [key, node] of nl.nodeOfPin) {
        pinVoltage[key] = node >= 0 ? this.x[node] : 0;
      }
      for (const m of nl.models) {
        if (m.isWire) {
          const i = Number(m.outputs.current) || 0;
          wireCurrents[m.componentId] = i;
        } else {
          outputs[m.componentId] = { ...m.outputs };
        }
      }
    } else if (nl) {
      for (const m of nl.models) {
        if (!m.isWire) outputs[m.componentId] = { ...m.outputs };
      }
    }
    const floatingPins: string[] = [];
    if (nl && this.doc.components.length > 1) {
      floatingPins.push(...nl.isolatedPins);
    }
    this.snapshot = {
      running: this._running,
      solved: Boolean(this.x),
      netVoltage,
      pinVoltage,
      outputs,
      wireCurrents,
      diagnostics: analyzeDiagnostics({
        doc: this.doc,
        outputs,
        floatingCount: floatingPins.length,
        solved: Boolean(this.x),
        running: this._running,
        compileError: this.compileError,
      }),
      floatingPins,
      time: this.time,
    };
  }
}

export type { DeviceModel };
