import { Simulator, nrDebug } from '/home/z/my-project/src/engine/simulator.ts';
import { makeComponent, PART_MAP } from '/home/z/my-project/src/parts/registry.ts';

const DT = 1/60;
const mk = (t, id, p) => makeComponent(t, { id, params: p });
const doc = {
  components: [
    mk('battery', 'b1', { voltage: 9 }),
    mk('resistor', 'rb', { resistance: 10000 }),
    mk('resistor', 'rc', { resistance: 470 }),
    mk('transistor', 'q1', {}),
  ],
  wires: [
    { id: 'w0', a: { componentId: 'b1', pinId: 'pos' }, b: { componentId: 'rb', pinId: 'a' } },
    { id: 'w1', a: { componentId: 'rb', pinId: 'b' }, b: { componentId: 'q1', pinId: 'base' } },
    { id: 'w2', a: { componentId: 'q1', pinId: 'emitter' }, b: { componentId: 'b1', pinId: 'neg' } },
    { id: 'w3', a: { componentId: 'b1', pinId: 'pos' }, b: { componentId: 'rc', pinId: 'a' } },
    { id: 'w4', a: { componentId: 'rc', pinId: 'b' }, b: { componentId: 'q1', pinId: 'collector' } },
  ],
};
nrDebug.trace = (iter, info) => console.log(`iter ${iter}:`, JSON.stringify(info));
const sim = new Simulator(doc, PART_MAP);
sim.power(true);
sim.tick(DT);
nrDebug.trace = null;
console.log('final q1:', JSON.stringify(sim.snapshot.outputs['q1']));
