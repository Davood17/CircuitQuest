import { describe, expect, it } from 'vitest';
import { Simulator } from '@/engine/simulator';
import { makeComponent, PART_MAP } from '@/parts/registry';
import type { CircuitDoc, ComponentInstance } from '@/engine/types';

const DT = 1 / 60;

function build(
  comps: ReturnType<typeof makeComponent>[],
  wires: [string, string, string, string][],
): CircuitDoc {
  // spread parts out so pins never coincide — topology comes from wires only
  const placed = comps.map((c, i) => ({
    ...c,
    x: (i % 4) * 260,
    y: Math.floor(i / 4) * 160,
  }));
  const byId = new Map(placed.map((c) => [c.id, c]));
  return {
    components: placed as ComponentInstance[],
    wires: wires.map(([ca, pa, cb, pb], i) => ({
      id: `w${i}`,
      a: { componentId: ca, pinId: pa },
      b: { componentId: cb, pinId: pb },
    })).filter((w) => byId.has(w.a.componentId) && byId.has(w.b.componentId)),
  };
}

function settle(sim: Simulator, ticks = 5) {
  sim.power(true);
  for (let i = 0; i < ticks; i++) sim.tick(DT);
  return sim.snapshot;
}

describe('engine golden tests', () => {
  it('voltage divider: 9V across 1k/2k gives 6V at midpoint', () => {
    const doc = build(
      [
        makeComponent('battery', { id: 'b1', params: { voltage: 9 } }),
        makeComponent('resistor', { id: 'r1', params: { resistance: 1000 } }),
        makeComponent('resistor', { id: 'r2', params: { resistance: 2000 } }),
      ],
      [
        ['b1', 'pos', 'r1', 'a'],
        ['r1', 'b', 'r2', 'a'],
        ['r2', 'b', 'b1', 'neg'],
      ],
    );
    const snap = settle(new Simulator(doc, PART_MAP));
    const vmid = snap.pinVoltage['r2.a'];
    expect(vmid).toBeCloseTo(6, 1);
    expect(snap.outputs['r1'].current).toBeCloseTo(0.003, 4);
  });

  it('LED + resistor: I ≈ (Vs − Vf)/R and LED runs in safe range', () => {
    const doc = build(
      [
        makeComponent('battery', { id: 'b1', params: { voltage: 9 } }),
        makeComponent('resistor', { id: 'r1', params: { resistance: 470 } }),
        makeComponent('led', { id: 'led1' }),
      ],
      [
        ['b1', 'pos', 'r1', 'a'],
        ['r1', 'b', 'led1', 'anode'],
        ['led1', 'cathode', 'b1', 'neg'],
      ],
    );
    const sim = new Simulator(doc, PART_MAP);
    const snap = settle(sim);
    const i = Number(snap.outputs['led1'].current);
    const expected = (9 - 0.5 * i - 1.8) / 470;
    expect(i).toBeGreaterThan(0.012);
    expect(i).toBeLessThan(0.02);
    expect(i).toBeCloseTo(expected, 3);
    expect(snap.outputs['led1'].brightness).toBeGreaterThan(0.5);
    expect(snap.diagnostics.some((d) => d.code === 'diag.led-running')).toBe(true);
  });

  it('open switch blocks current → open-circuit diagnostic', () => {
    const doc = build(
      [
        makeComponent('battery', { id: 'b1', params: { voltage: 9 } }),
        makeComponent('switch', { id: 'sw1' }), // default open
        makeComponent('resistor', { id: 'r1', params: { resistance: 470 } }),
        makeComponent('led', { id: 'led1' }),
      ],
      [
        ['b1', 'pos', 'sw1', 'a'],
        ['sw1', 'b', 'r1', 'a'],
        ['r1', 'b', 'led1', 'anode'],
        ['led1', 'cathode', 'b1', 'neg'],
      ],
    );
    const snap = settle(new Simulator(doc, PART_MAP));
    expect(Number(snap.outputs['led1'].current)).toBeLessThan(1e-6);
    expect(snap.diagnostics.some((d) => d.code === 'diag.open-circuit')).toBe(true);
  });

  it('closing the switch lights the LED', () => {
    const doc = build(
      [
        makeComponent('battery', { id: 'b1', params: { voltage: 9 } }),
        makeComponent('switch', { id: 'sw1' }),
        makeComponent('resistor', { id: 'r1', params: { resistance: 470 } }),
        makeComponent('led', { id: 'led1' }),
      ],
      [
        ['b1', 'pos', 'sw1', 'a'],
        ['sw1', 'b', 'r1', 'a'],
        ['r1', 'b', 'led1', 'anode'],
        ['led1', 'cathode', 'b1', 'neg'],
      ],
    );
    const sim = new Simulator(doc, PART_MAP);
    sim.power(true);
    sim.tick(DT);
    expect(Number(sim.snapshot.outputs['led1'].brightness)).toBeLessThan(0.05);
    sim.setControl('sw1', 'closed', true);
    expect(Number(sim.snapshot.outputs['led1'].brightness)).toBeGreaterThan(0.5);
  });

  it('short circuit: bare wire across the battery → large current + warning', () => {
    const doc = build(
      [
        makeComponent('battery', { id: 'b1', params: { voltage: 9 } }),
        makeComponent('resistor', { id: 'r1', params: { resistance: 220 } }),
      ],
      [
        ['b1', 'pos', 'b1', 'neg'], // direct short wire
        ['b1', 'pos', 'r1', 'a'],
        ['r1', 'b', 'b1', 'neg'],
      ],
    );
    const snap = settle(new Simulator(doc, PART_MAP));
    const i = Math.abs(Number(snap.outputs['b1'].dischargeCurrent));
    expect(i).toBeGreaterThan(5);
    expect(snap.diagnostics.some((d) => d.code === 'diag.short')).toBe(true);
  });

  it('reversed LED blocks current and is flagged', () => {
    const doc = build(
      [
        makeComponent('battery', { id: 'b1', params: { voltage: 9 } }),
        makeComponent('resistor', { id: 'r1', params: { resistance: 470 } }),
        makeComponent('led', { id: 'led1' }),
      ],
      [
        ['b1', 'pos', 'r1', 'a'],
        ['r1', 'b', 'led1', 'cathode'], // reversed!
        ['led1', 'anode', 'b1', 'neg'],
      ],
    );
    const snap = settle(new Simulator(doc, PART_MAP));
    expect(Number(snap.outputs['led1'].current)).toBeLessThan(1e-6);
    expect(snap.outputs['led1'].reversed).toBe(true);
    expect(snap.diagnostics.some((d) => d.code === 'diag.led-reversed')).toBe(true);
  });

  it('LED without resistor → overcurrent warning', () => {
    const doc = build(
      [
        makeComponent('battery', { id: 'b1', params: { voltage: 3 } }),
        makeComponent('led', { id: 'led1' }),
      ],
      [
        ['b1', 'pos', 'led1', 'anode'],
        ['led1', 'cathode', 'b1', 'neg'],
      ],
    );
    const snap = settle(new Simulator(doc, PART_MAP));
    const i = Number(snap.outputs['led1'].current);
    expect(i).toBeGreaterThan(0.05);
    expect(snap.diagnostics.some((d) => d.code === 'diag.led-overcurrent')).toBe(true);
  });

  it('capacitor charges along exp curve: V(τ) ≈ 63% of source', () => {
    const doc = build(
      [
        makeComponent('battery', { id: 'b1', params: { voltage: 9 } }),
        makeComponent('resistor', { id: 'r1', params: { resistance: 10_000 } }),
        makeComponent('capacitor', { id: 'c1', params: { capacitance: 100 } }),
      ],
      [
        ['b1', 'pos', 'r1', 'a'],
        ['r1', 'b', 'c1', 'pos'],
        ['c1', 'neg', 'b1', 'neg'],
      ],
    );
    const sim = new Simulator(doc, PART_MAP);
    sim.power(true);
    const tau = 10_000 * 100e-6; // ≈ 1 s
    const ticks = Math.round(tau / DT);
    for (let i = 0; i < ticks; i++) sim.tick(DT);
    const v = Number(sim.snapshot.outputs['c1'].voltage);
    expect(v).toBeGreaterThan(5.2); // 63% of 9V ≈ 5.69
    expect(v).toBeLessThan(6.2);
  });

  it('series resistors split voltage; parallel resistors share voltage', () => {
    const series = build(
      [
        makeComponent('battery', { id: 'b1', params: { voltage: 9 } }),
        makeComponent('resistor', { id: 'r1', params: { resistance: 1000 } }),
        makeComponent('resistor', { id: 'r2', params: { resistance: 1000 } }),
      ],
      [
        ['b1', 'pos', 'r1', 'a'],
        ['r1', 'b', 'r2', 'a'],
        ['r2', 'b', 'b1', 'neg'],
      ],
    );
    const s1 = settle(new Simulator(series, PART_MAP));
    expect(Number(s1.outputs['r1'].voltage)).toBeCloseTo(4.5, 1);
    expect(Number(s1.outputs['r2'].voltage)).toBeCloseTo(4.5, 1);

    const par = build(
      [
        makeComponent('battery', { id: 'b1', params: { voltage: 9 } }),
        makeComponent('resistor', { id: 'r1', params: { resistance: 1000 } }),
        makeComponent('resistor', { id: 'r2', params: { resistance: 1000 } }),
      ],
      [
        ['b1', 'pos', 'r1', 'a'],
        ['b1', 'pos', 'r2', 'a'],
        ['r1', 'b', 'b1', 'neg'],
        ['r2', 'b', 'b1', 'neg'],
      ],
    );
    const s2 = settle(new Simulator(par, PART_MAP));
    expect(Number(s2.outputs['r1'].voltage)).toBeCloseTo(9, 0);
    expect(Number(s2.outputs['r1'].current)).toBeCloseTo(0.009, 3);
    expect(Math.abs(Number(s2.outputs['b1'].dischargeCurrent))).toBeCloseTo(0.018, 3);
  });

  it('potentiometer wiper sweeps 0→9V', () => {
    const doc = build(
      [
        makeComponent('battery', { id: 'b1', params: { voltage: 9 } }),
        makeComponent('potentiometer', { id: 'pot1', params: { resistance: 10_000 } }),
      ],
      [
        ['b1', 'pos', 'pot1', 'a'],
        ['pot1', 'b', 'b1', 'neg'],
      ],
    );
    const sim = new Simulator(doc, PART_MAP);
    sim.power(true);
    sim.tick(DT);
    sim.setControl('pot1', 'taper', 0.1); // wiper 10% from the 'a' (9V) end
    expect(Number(sim.snapshot.outputs['pot1'].wiperVoltage)).toBeCloseTo(8.1, 0);
    sim.setControl('pot1', 'taper', 0.9);
    expect(Number(sim.snapshot.outputs['pot1'].wiperVoltage)).toBeCloseTo(0.9, 0);
  });

  it('transistor saturates and acts as a switch', () => {
    const doc = build(
      [
        makeComponent('battery', { id: 'b1', params: { voltage: 9 } }),
        makeComponent('resistor', { id: 'rb', params: { resistance: 10_000 } }),
        makeComponent('resistor', { id: 'rc', params: { resistance: 470 } }),
        makeComponent('transistor', { id: 'q1' }),
      ],
      [
        ['b1', 'pos', 'rb', 'a'],
        ['rb', 'b', 'q1', 'base'],
        ['q1', 'emitter', 'b1', 'neg'],
        ['b1', 'pos', 'rc', 'a'],
        ['rc', 'b', 'q1', 'collector'],
      ],
    );
    const snap = settle(new Simulator(doc, PART_MAP), 10);
    expect(snap.outputs['q1'].mode).toBe('sat');
    const ic = Number(snap.outputs['q1'].ic);
    expect(ic).toBeGreaterThan(0.015); // ≈ 9/470 ≈ 19 mA
    expect(Number(snap.outputs['rc'].current)).toBeGreaterThan(0.015);
  });

  it('battery terminal voltage sags under load (internal resistance)', () => {
    const doc = build(
      [
        makeComponent('battery', { id: 'b1', params: { voltage: 9 } }),
        makeComponent('resistor', { id: 'r1', params: { resistance: 100 } }),
      ],
      [
        ['b1', 'pos', 'r1', 'a'],
        ['r1', 'b', 'b1', 'neg'],
      ],
    );
    const snap = settle(new Simulator(doc, PART_MAP));
    const i = Math.abs(Number(snap.outputs['b1'].dischargeCurrent));
    expect(Number(snap.outputs['b1'].terminalVoltage)).toBeCloseTo(9 - i * 0.5, 2);
  });

  it('ammeter measures in-series current', () => {
    const doc = build(
      [
        makeComponent('battery', { id: 'b1', params: { voltage: 9 } }),
        makeComponent('ammeter', { id: 'a1' }),
        makeComponent('resistor', { id: 'r1', params: { resistance: 1000 } }),
      ],
      [
        ['b1', 'pos', 'a1', 'a'],
        ['a1', 'b', 'r1', 'a'],
        ['r1', 'b', 'b1', 'neg'],
      ],
    );
    const snap = settle(new Simulator(doc, PART_MAP));
    expect(Math.abs(Number(snap.outputs['a1'].current))).toBeCloseTo(0.009, 3);
  });

  it('coincident pins connect without a wire (touching legs)', () => {
    const doc = build(
      [
        makeComponent('battery', { id: 'b1', params: { voltage: 3 }, x: 0, y: 0 }),
        makeComponent('resistor', { id: 'r1', params: { resistance: 220 }, x: 200, y: 0 }),
      ],
      [],
    );
    // place r1.a exactly on b1.pos (44, 0)
    const r1 = doc.components.find((c) => c.id === 'r1')!;
    r1.x = 44 + 42; // r1.a at (44,0) coincides with b1.pos
    // connect r1.b to b1.neg via wire for a complete loop
    doc.wires.push({ id: 'w0', a: { componentId: 'r1', pinId: 'b' }, b: { componentId: 'b1', pinId: 'neg' } });
    const snap = settle(new Simulator(doc, PART_MAP));
    // current flows through the touching pins: ~3 / (220.5) ≈ 13.6 mA
    expect(Math.abs(Number(snap.outputs['r1'].current))).toBeGreaterThan(0.01);
  });

  it('multimeter resistance: measures ≈ 1k when the battery path is open', () => {
    const doc = build(
      [
        makeComponent('battery', { id: 'b1', params: { voltage: 9 } }),
        makeComponent('switch', { id: 'sw1' }), // open → battery path broken
        makeComponent('resistor', { id: 'r1', params: { resistance: 1000 } }),
      ],
      [
        ['b1', 'pos', 'sw1', 'a'],
        ['sw1', 'b', 'r1', 'a'],
        ['r1', 'b', 'b1', 'neg'],
      ],
    );
    const sim = new Simulator(doc, PART_MAP);
    const r = sim.measureResistance('r1.a', 'r1.b');
    expect(r).not.toBeNull();
    expect(r!).toBeGreaterThan(900);
    expect(r!).toBeLessThan(1100);
  });

  it('LDR changes resistance with light slider', () => {
    const doc = build(
      [
        makeComponent('battery', { id: 'b1', params: { voltage: 9 } }),
        makeComponent('ldr', { id: 'l1' }),
        makeComponent('resistor', { id: 'r1', params: { resistance: 10_000 } }),
      ],
      [
        ['b1', 'pos', 'l1', 'a'],
        ['l1', 'b', 'r1', 'a'],
        ['r1', 'b', 'b1', 'neg'],
      ],
    );
    const sim = new Simulator(doc, PART_MAP);
    sim.power(true);
    sim.tick(DT);
    sim.setControl('l1', 'light', 1); // bright → 1k
    const brightI = Math.abs(Number(sim.snapshot.outputs['r1'].current));
    sim.setControl('l1', 'light', 0); // dark → 200k
    const darkI = Math.abs(Number(sim.snapshot.outputs['r1'].current));
    expect(brightI).toBeGreaterThan(darkI * 5);
  });
});
