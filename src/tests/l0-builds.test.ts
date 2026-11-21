import { describe, expect, it } from 'vitest';
import { LEVEL0_LESSONS } from '@/content/levels/level0';
import type { Screen } from '@/content/types';
import type { CircuitDoc } from '@/engine/types';
import { evalGoal } from '@/engine/goals';
import { Simulator } from '@/engine/simulator';
import { PART_MAP } from '@/parts/registry';

/** wire helper (content-style, no import cycle worries in tests) */
const W = (id: string, a: string, ap: string, b: string, bp: string): CircuitDoc['wires'][number] => ({
  id,
  a: { componentId: a, pinId: ap },
  b: { componentId: b, pinId: bp },
});

const clone = (d: CircuitDoc): CircuitDoc => ({
  components: d.components.map((c) => ({ ...c, params: { ...c.params } })),
  wires: d.wires.map((x) => ({ ...x, a: { ...x.a }, b: { ...x.b } })),
});

/** find the build screen of an l0 lesson */
function buildOf(lid: string) {
  const lesson = LEVEL0_LESSONS.find((l) => l.id === lid);
  const scr = lesson?.screens.find((s) => s.type === 'build');
  if (!scr || scr.type !== 'build') throw new Error(`no build screen in ${lid}`);
  return { lesson: lesson!, scr };
}

/** simulate a doc with optional control closures; returns goal ctx */
function simulate(doc: CircuitDoc, closeIds: string[] = []) {
  const sim = new Simulator(doc, PART_MAP);
  sim.power(true);
  for (const id of closeIds) sim.setControl(id, 'closed', true);
  for (let i = 0; i < 20; i++) sim.tick(1 / 60);
  return { doc, snapshot: sim.snapshot };
}

/** standard LED loop wiring used by several solutions */
const loopWires = (prefix = 's'): CircuitDoc['wires'] => [
  W(`${prefix}1`, 'b1', 'pos', 'r1', 'a'),
  W(`${prefix}2`, 'r1', 'b', 'led1', 'anode'),
  W(`${prefix}3`, 'led1', 'cathode', 'b1', 'neg'),
];

describe('l0 end-of-lesson builds are achievable', () => {
  it('l0-2 wake the lamp — finish the road', () => {
    const { scr } = buildOf('l0-2');
    const doc = clone(scr.task.startCircuit!);
    doc.wires.push(W('s2', 'r1', 'b', 'led1', 'anode'), W('s3', 'led1', 'cathode', 'b1', 'neg'));
    expect(evalGoal(scr.task.goal, simulate(doc)).pass).toBe(true);
  });

  it('l0-3 rescue — remove the short, build the safe loop', () => {
    const { scr } = buildOf('l0-3');
    const doc = clone(scr.task.startCircuit!);
    doc.wires = doc.wires.filter((x) => x.id !== 'w0'); // delete the dangerous wire
    doc.wires.push(...loopWires());
    expect(evalGoal(scr.task.goal, simulate(doc)).pass).toBe(true);
  });

  it('l0-4 complete the circle — return wire + close switch', () => {
    const { scr } = buildOf('l0-4');
    const doc = clone(scr.task.startCircuit!);
    doc.wires.push(W('s4', 'led1', 'cathode', 'b1', 'neg'));
    expect(evalGoal(scr.task.goal, simulate(doc, ['sw1'])).pass).toBe(true);
  });

  it('l0-5 build the bridge — add a switch into the gap', () => {
    const { scr } = buildOf('l0-5');
    const doc = clone(scr.task.startCircuit!);
    doc.components.push({
      id: 'sw1', type: 'switch', x: 480, y: 300, rotation: 0, params: { closed: false },
    } as never);
    doc.wires.push(W('s3', 'led1', 'cathode', 'sw1', 'a'), W('s4', 'sw1', 'b', 'b1', 'neg'));
    expect(evalGoal(scr.task.goal, simulate(doc, ['sw1'])).pass).toBe(true);
  });

  it('l0-6 detective circuit — gate loop with switch', () => {
    const { scr } = buildOf('l0-6');
    const doc = clone(scr.task.startCircuit!);
    doc.wires.push(
      W('s1', 'b1', 'pos', 'sw1', 'a'),
      W('s2', 'sw1', 'b', 'r1', 'a'),
      W('s3', 'r1', 'b', 'led1', 'anode'),
      W('s4', 'led1', 'cathode', 'b1', 'neg'),
    );
    expect(evalGoal(scr.task.goal, simulate(doc, ['sw1'])).pass).toBe(true);
  });

  it('l0-7 power boost — battery 1.5 V → 9 V', () => {
    const { scr } = buildOf('l0-7');
    const doc = clone(scr.task.startCircuit!);
    for (const c of doc.components) if (c.id === 'b1') c.params.voltage = 9;
    expect(evalGoal(scr.task.goal, simulate(doc)).pass).toBe(true);
    // sanity: with the untouched 1.5 V start circuit the goal must FAIL (task is meaningful)
    expect(evalGoal(scr.task.goal, simulate(clone(scr.task.startCircuit!))).pass).toBe(false);
  });

  it('l0-8 count the runners — insert the ammeter', () => {
    const { scr } = buildOf('l0-8');
    const doc = clone(scr.task.startCircuit!);
    doc.wires.push(W('s3', 'r1', 'b', 'am1', 'a'), W('s4', 'am1', 'b', 'led1', 'anode'));
    expect(evalGoal(scr.task.goal, simulate(doc)).pass).toBe(true);
  });

  it('l0-9 hire the bodyguard — resistor protects the LED', () => {
    const { scr } = buildOf('l0-9');
    const doc = clone(scr.task.startCircuit!);
    doc.wires = doc.wires.filter((x) => x.id !== 'w1'); // remove the direct flood wire
    doc.wires.push(...loopWires());
    expect(evalGoal(scr.task.goal, simulate(doc)).pass).toBe(true);
  });

  it('l0-10 start & finish stations — full trip wiring', () => {
    const { scr } = buildOf('l0-10');
    const doc = clone(scr.task.startCircuit!);
    doc.wires.push(...loopWires());
    expect(evalGoal(scr.task.goal, simulate(doc)).pass).toBe(true);
  });

  it('l0-11 electron highway — loop with a pressed button', () => {
    const { scr } = buildOf('l0-11');
    const doc = clone(scr.task.startCircuit!);
    doc.wires.push(
      W('s1', 'b1', 'pos', 'bt1', 'a'),
      W('s2', 'bt1', 'b', 'r1', 'a'),
      W('s3', 'r1', 'b', 'led1', 'anode'),
      W('s4', 'led1', 'cathode', 'b1', 'neg'),
    );
    expect(evalGoal(scr.task.goal, simulate(doc, ['bt1'])).pass).toBe(true);
  });

  it('l0-12 backwards LED — rewire it the right way', () => {
    const { scr } = buildOf('l0-12');
    const doc = clone(scr.task.startCircuit!);
    // the two LED wires are on the wrong legs: move them to the correct pins
    doc.wires = doc.wires.map((x) =>
      x.id === 'w2' ? { ...x, b: { componentId: 'led1', pinId: 'anode' } }
      : x.id === 'w3' ? { ...x, a: { componentId: 'led1', pinId: 'cathode' } }
      : x);
    expect(evalGoal(scr.task.goal, simulate(doc)).pass).toBe(true);
    // sanity: the untouched backwards start circuit must FAIL (task is meaningful)
    expect(evalGoal(scr.task.goal, simulate(clone(scr.task.startCircuit!))).pass).toBe(false);
  });

  it('l0-13 commander of light — loop with closed switch', () => {
    const { scr } = buildOf('l0-13');
    const doc = clone(scr.task.startCircuit!);
    doc.wires.push(
      W('s1', 'b1', 'pos', 'sw1', 'a'),
      W('s2', 'sw1', 'b', 'r1', 'a'),
      W('s3', 'r1', 'b', 'led1', 'anode'),
      W('s4', 'led1', 'cathode', 'b1', 'neg'),
    );
    expect(evalGoal(scr.task.goal, simulate(doc, ['sw1'])).pass).toBe(true);
  });

  it('l0-14 build from the map — the full treasure loop', () => {
    const { scr } = buildOf('l0-14');
    const doc = clone(scr.task.startCircuit!);
    doc.wires.push(
      W('s1', 'b1', 'pos', 'sw1', 'a'),
      W('s2', 'sw1', 'b', 'r1', 'a'),
      W('s3', 'r1', 'b', 'led1', 'anode'),
      W('s4', 'led1', 'cathode', 'b1', 'neg'),
    );
    expect(evalGoal(scr.task.goal, simulate(doc, ['sw1'])).pass).toBe(true);
  });

  it('every l0 lesson except l0-1 has exactly one build screen right before its quiz screen', () => {
    for (const lesson of LEVEL0_LESSONS) {
      if (lesson.id === 'l0-1') continue; // redesigned: hands-on toy-hospital challenge, no lab build
      const idx = lesson.screens.findIndex((s) => s.type === 'build');
      expect(idx, lesson.id).toBeGreaterThan(-1);
      expect(lesson.screens[idx + 1]?.type, lesson.id).toBe('quiz');
    }
  });
});
