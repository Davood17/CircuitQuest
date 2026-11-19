import { MNASystem } from './core/mna';
import {
  BatteryModel,
  GMIN,
  WireModel,
  type DeviceModel,
} from './devices';
import type { CircuitDoc, PartDef, PartParams } from './types';

export const pinKey = (componentId: string, pinId: string) => `${componentId}.${pinId}`;

// ---------------------------------------------------------------- union-find

class DSU {
  private parent = new Map<string, string>();
  find(a: string): string {
    let root = this.parent.get(a);
    if (root === undefined) {
      this.parent.set(a, a);
      return a;
    }
    while (root !== a) {
      a = root;
      root = this.parent.get(a)!;
      if (root === undefined) {
        this.parent.set(a, a);
        return a;
      }
    }
    return root;
  }
  union(a: string, b: string): void {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }
  groups(): Map<string, string[]> {
    const m = new Map<string, string[]>();
    for (const key of this.parent.keys()) {
      const r = this.find(key);
      const list = m.get(r);
      if (list) list.push(key);
      else m.set(r, [key]);
    }
    return m;
  }
}

// ------------------------------------------------------------------ compiled

export interface CompiledNetlist {
  sys: MNASystem;
  models: DeviceModel[];
  batteries: BatteryModel[];
  /** "componentId.pinId" → node index (-1 = ground) */
  nodeOfPin: Map<string, number>;
  /** node index → member pin keys */
  netMembers: Map<number, string[]>;
  groundPinKey: string | null;
  hasCapacitor: boolean;
  /** pins with no wire and no coincident partner — truly unconnected */
  isolatedPins: string[];
}

export interface CompileOptions {
  /** replace battery sources with 0 V (short) for resistance measurement */
  zeroSources?: boolean;
}

export interface CompileResult {
  netlist?: CompiledNetlist;
  error?: 'empty' | 'unknown-part';
  unknownTypes?: string[];
}

/**
 * Compiles an editor circuit document into an MNA system:
 * 1. union-find over pins (wires + coincident pins merge into nets)
 * 2. ground = first battery's negative pin (fallback: most-connected pin)
 * 3. allocate nodes, device-internal nodes and source branches
 * 4. freeze layout, then stamp via device models each solver iteration
 */
export function compile(
  doc: CircuitDoc,
  defs: Map<string, PartDef>,
  opts: CompileOptions = {},
): CompileResult {
  if (doc.components.length === 0) return { error: 'empty' };

  const unknownTypes: string[] = [];
  const comps = doc.components.filter((c) => {
    if (!defs.has(c.type)) {
      unknownTypes.push(c.type);
      return false;
    }
    return true;
  });
  if (comps.length === 0) return { error: 'unknown-part', unknownTypes };

  const dsu = new DSU();
  const posOf = new Map<string, { x: number; y: number }>();
  const terminalsOf = new Map<string, string[]>(); // componentId → pin ids

  const rotation = (r: number) => ((r % 360) + 360) % 360;
  for (const c of comps) {
    const def = defs.get(c.type)!;
    const pins: string[] = [];
    const rad = (rotation(c.rotation) * Math.PI) / 180;
    const cos = Math.round(Math.cos(rad));
    const sin = Math.round(Math.sin(rad));
    for (const p of def.pins) {
      const wx = c.x + p.x * cos - p.y * sin;
      const wy = c.y + p.x * sin + p.y * cos;
      const key = pinKey(c.id, p.id);
      posOf.set(key, { x: wx, y: wy });
      dsu.find(key);
      pins.push(p.id);
    }
    terminalsOf.set(c.id, pins);
  }

  // wires stay as 1 mΩ edges (NOT merged into nets) so every wire carries
  // a well-defined current for the flow animation; coincident pins still merge.
  // Wires are created after node allocation below.
  const byPos = new Map<string, string>();
  for (const [key, pos] of posOf) {
    const k = `${Math.round(pos.x * 2)},${Math.round(pos.y * 2)}`;
    const other = byPos.get(k);
    if (other) dsu.union(key, other);
    else byPos.set(k, key);
  }

  // ---- ground selection
  const firstBattery = comps.find((c) => c.type === 'battery');
  let groundPinKey: string | null = null;
  if (firstBattery) groundPinKey = pinKey(firstBattery.id, 'neg');
  if (!groundPinKey) {
    // fallback: most-connected pin
    const count = new Map<string, number>();
    for (const key of posOf.keys()) {
      const r = dsu.find(key);
      count.set(r, (count.get(r) ?? 0) + 1);
    }
    let best = -1;
    for (const [key, pos] of posOf) {
      const r = dsu.find(key);
      const size = count.get(r) ?? 0;
      if (size > best) {
        best = size;
        groundPinKey = key;
      }
      void pos;
    }
  }
  const groundRoot = groundPinKey ? dsu.find(groundPinKey) : null;

  // ---- node allocation
  const rootGroups = dsu.groups();
  const nodeOfRoot = new Map<string, number>();
  const netMembers = new Map<number, string[]>();
  let nodeCount = 0;
  for (const [root, members] of rootGroups) {
    if (root === groundRoot) continue;
    const idx = nodeCount++;
    nodeOfRoot.set(root, idx);
    netMembers.set(idx, members);
  }

  // capacity: nets + 1 internal node per battery; branches: 1 per battery
  const batteryCount = comps.filter((c) => c.type === 'battery').length;
  const sys = new MNASystem(nodeCount + batteryCount, batteryCount);
  for (let i = 0; i < nodeCount; i++) sys.allocNode();
  for (let i = 0; i < batteryCount; i++) sys.allocNode(); // internal nodes
  const branchIds: number[] = [];
  for (let i = 0; i < batteryCount; i++) branchIds.push(sys.addBranch());
  sys.freeze();

  // GMIN floor on every node keeps floating circuits solvable & detectable
  for (let i = 0; i < sys.numNodes; i++) sys.stampG(i, -1, GMIN);

  const nodeOfPin = new Map<string, number>();
  for (const [key] of posOf) {
    const root = dsu.find(key);
    nodeOfPin.set(key, root === groundRoot ? -1 : (nodeOfRoot.get(root) ?? -1));
  }
  const node = (componentId: string, pinId: string) =>
    nodeOfPin.get(pinKey(componentId, pinId)) ?? -1;

  // ---- models
  const models: DeviceModel[] = [];
  const batteries: BatteryModel[] = [];
  let batteryIdx = 0;
  for (const c of comps) {
    const def = defs.get(c.type)!;
    const params: PartParams = { ...c.params };
    if (c.type === 'battery' && opts.zeroSources) params.voltage = 0;
    const model = def.createModel(c.id, params);
    if (model instanceof BatteryModel) {
      const tNode = nodeCount + batteryIdx; // internal nodes allocated right after nets
      model.assign(tNode, branchIds[batteryIdx]);
      batteries.push(model);
      batteryIdx += 1;
    }
    models.push(model);
  }

  // wire pseudo-devices: each wire is a 1 mΩ edge between its two pin nodes
  for (const w of doc.wires) {
    const ka = pinKey(w.a.componentId, w.a.pinId);
    const kb = pinKey(w.b.componentId, w.b.pinId);
    if (!posOf.has(ka) || !posOf.has(kb)) continue;
    const na = nodeOfPin.get(ka) ?? -1;
    const nb = nodeOfPin.get(kb) ?? -1;
    if (na === nb) continue; // coincident pins — same node already
    models.push(new WireModel(w.id, na, nb));
  }

  // a pin is isolated when nothing merges it with others: no coincident partner
  // (DSU group of size 1) and no wire attached
  const wiredPins = new Set<string>();
  for (const w of doc.wires) {
    wiredPins.add(pinKey(w.a.componentId, w.a.pinId));
    wiredPins.add(pinKey(w.b.componentId, w.b.pinId));
  }
  const groupSizes = new Map<string, number>();
  for (const key of posOf.keys()) {
    const r = dsu.find(key);
    groupSizes.set(r, (groupSizes.get(r) ?? 0) + 1);
  }
  const isolatedPins = [...posOf.keys()].filter((key) => {
    if (wiredPins.has(key)) return false;
    return (groupSizes.get(dsu.find(key)) ?? 0) <= 1;
  });

  return {
    netlist: {
      sys,
      models,
      batteries,
      nodeOfPin,
      netMembers,
      groundPinKey,
      hasCapacitor: comps.some((c) => c.type === 'capacitor'),
      isolatedPins,
    },
    unknownTypes: unknownTypes.length ? unknownTypes : undefined,
  };
}
