import { Simulator, nrDebug } from '/home/z/my-project/src/engine/simulator.ts';
import { makeComponent, PART_MAP } from '/home/z/my-project/src/parts/registry.ts';

const DT = 1/60;
const mk = (t, id, p, x, y) => makeComponent(t, { id, params: p, x, y });
const doc = {
  components: [
    mk('battery', 'b1', { voltage: 9 }, 700, 0),
    mk('resistor', 'rb', { resistance: 10000 }, 0, 0),
    mk('resistor', 'rc', { resistance: 470 }, 260, 0),
    mk('transistor', 'q1', {}, 520, 0),
  ],
  wires: [
    { id: 'w0', a: { componentId: 'b1', pinId: 'pos' }, b: { componentId: 'rb', pinId: 'a' } },
    { id: 'w1', a: { componentId: 'rb', pinId: 'b' }, b: { componentId: 'q1', pinId: 'base' } },
    { id: 'w2', a: { componentId: 'q1', pinId: 'emitter' }, b: { componentId: 'b1', pinId: 'neg' } },
    { id: 'w3', a: { componentId: 'b1', pinId: 'pos' }, b: { componentId: 'rc', pinId: 'a' } },
    { id: 'w4', a: { componentId: 'rc', pinId: 'b' }, b: { componentId: 'q1', pinId: 'collector' } },
  ],
};
let n = 0;
nrDebug.trace = (iter, info) => { if (n < 1) console.log(`iter ${iter}:`, JSON.stringify(info)); };
const sim = new Simulator(doc, PART_MAP);
sim.power(true);
sim.tick(DT);
nrDebug.trace = null;
console.log('--- after 1 tick ---');
console.log('pinVoltage:', JSON.stringify(Object.fromEntries(Object.entries(sim.snapshot.pinVoltage).map(([k,v])=>[k, Number(v.toFixed(3))])), null, 0));
console.log('q1:', JSON.stringify(sim.snapshot.outputs['q1']));
console.log('rb:', JSON.stringify(sim.snapshot.outputs['rb']));
console.log('rc:', JSON.stringify(sim.snapshot.outputs['rc']));
console.log('b1:', JSON.stringify(sim.snapshot.outputs['b1']));
