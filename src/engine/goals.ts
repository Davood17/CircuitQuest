import type { CircuitDoc, GoalExpr, SimSnapshot } from './types';

export interface GoalContext {
  doc: CircuitDoc;
  snapshot: SimSnapshot | null;
  /** task-mode metadata (multimeter usage etc.) */
  taskState?: { usedMultimeter?: boolean; probeReading?: number | null };
}

export interface GoalResult {
  pass: boolean;
  /** i18n key of the first failed leaf, e.g. "goal.ledOn" */
  failKey?: string;
  failValues?: Record<string, string | number>;
}

const num = (v: number | boolean | string | undefined): number =>
  typeof v === 'number' ? v : Number(v) || 0;

function leaf(goal: GoalExpr, ctx: GoalContext): GoalResult {
  const { snapshot } = ctx;
  const outOf = (id?: string) => snapshot?.outputs[id ?? ''] ?? undefined;
  switch (goal.check) {
    case 'ledOn': {
      const o = outOf(goal.id);
      if (!o) return { pass: false, failKey: 'goal.ledOn', failValues: { id: goal.id ?? '' } };
      const on = num(o.brightness) > 0.04 && o.overcurrent !== true;
      return on
        ? { pass: true }
        : { pass: false, failKey: 'goal.ledOn', failValues: { id: goal.id ?? '' } };
    }
    case 'ledOff': {
      const o = outOf(goal.id);
      const off = !o || num(o.brightness) < 0.02;
      return off ? { pass: true } : { pass: false, failKey: 'goal.ledOff', failValues: { id: goal.id ?? '' } };
    }
    case 'ledPresent':
    case 'componentPresent': {
      const found = ctx.doc.components.some((c) => c.id === goal.id || (goal.type && c.type === goal.type));
      return found
        ? { pass: true }
        : { pass: false, failKey: 'goal.componentPresent', failValues: { type: goal.type ?? goal.id ?? '' } };
    }
    case 'componentTypeCount': {
      const n = ctx.doc.components.filter((c) => c.type === goal.type).length;
      return n >= (goal.count ?? 1)
        ? { pass: true }
        : { pass: false, failKey: 'goal.componentTypeCount', failValues: { type: goal.type ?? '', count: goal.count ?? 1 } };
    }
    case 'batteryPresent': {
      const found = ctx.doc.components.some((c) => c.type === 'battery');
      return found
        ? { pass: true }
        : { pass: false, failKey: 'goal.batteryPresent' };
    }
    case 'currentWithin': {
      const o = outOf(goal.id);
      if (!o) return { pass: false, failKey: 'goal.currentWithin', failValues: { id: goal.id ?? '' } };
      const mA = Math.abs(num(o.current)) * 1000;
      const ok = mA >= (goal.min ?? 0) && mA <= (goal.max ?? Infinity);
      return ok
        ? { pass: true }
        : {
            pass: false,
            failKey: 'goal.currentWithin',
            failValues: { id: goal.id ?? '', mA: mA.toFixed(1), min: goal.min ?? 0, max: goal.max ?? '∞' },
          };
    }
    case 'voltageAcross': {
      const o = outOf(goal.id);
      if (!o) return { pass: false, failKey: 'goal.voltageAcross', failValues: { id: goal.id ?? '' } };
      const v = Math.abs(num(o.voltage));
      const ok = v >= (goal.min ?? 0) && v <= (goal.max ?? Infinity);
      return ok
        ? { pass: true }
        : { pass: false, failKey: 'goal.voltageAcross', failValues: { id: goal.id ?? '', v: v.toFixed(2) } };
    }
    case 'notShorted': {
      const shorted = snapshot?.diagnostics.some((d) => d.code === 'diag.short');
      return !shorted ? { pass: true } : { pass: false, failKey: 'goal.notShorted' };
    }
    case 'noBlockingDiagnostics': {
      const blocking = snapshot?.diagnostics.some((d) => d.severity === 'error' || d.severity === 'warning');
      return !blocking ? { pass: true } : { pass: false, failKey: 'goal.noBlockingDiagnostics' };
    }
    case 'switchPresent': {
      const found = ctx.doc.components.some((c) => c.type === 'switch');
      return found ? { pass: true } : { pass: false, failKey: 'goal.switchPresent' };
    }
    case 'switchClosed': {
      const switches = ctx.doc.components.filter((c) => c.type === 'switch');
      const allClosed = switches.length > 0 && switches.every((s) => snapshot?.outputs[s.id]?.closed === true);
      return allClosed ? { pass: true } : { pass: false, failKey: 'goal.switchClosed' };
    }
    case 'buttonPresent': {
      const found = ctx.doc.components.some((c) => c.type === 'button');
      return found ? { pass: true } : { pass: false, failKey: 'goal.buttonPresent' };
    }
    case 'buzzerOn': {
      const pass = goal.id
        ? snapshot?.outputs[goal.id]?.sounding === true
        : Object.values(snapshot?.outputs ?? {}).some((o) => o.sounding === true);
      return pass ? { pass: true } : { pass: false, failKey: 'goal.buzzerOn' };
    }
    case 'motorSpinning': {
      const pass = goal.id
        ? num(snapshot?.outputs[goal.id]?.speed) > 0.02
        : Object.values(snapshot?.outputs ?? {}).some((o) => num(o.speed) > 0.02);
      return pass ? { pass: true } : { pass: false, failKey: 'goal.motorSpinning' };
    }
    case 'capVoltageAbove': {
      const o = outOf(goal.id);
      const v = num(o?.voltage);
      return v >= (goal.min ?? 0)
        ? { pass: true }
        : { pass: false, failKey: 'goal.capVoltageAbove', failValues: { id: goal.id ?? '', v: v.toFixed(2) } };
    }
    case 'wiperInRange': {
      const o = outOf(goal.id);
      const v = num(o?.wiperVoltage);
      const ok = v >= (goal.min ?? 0) && v <= (goal.max ?? Infinity);
      return ok ? { pass: true } : { pass: false, failKey: 'goal.wiperInRange', failValues: { id: goal.id ?? '' } };
    }
    case 'usedMultimeter': {
      return ctx.taskState?.usedMultimeter
        ? { pass: true }
        : { pass: false, failKey: 'goal.usedMultimeter' };
    }
    case 'probeReadingWithin': {
      const r = ctx.taskState?.probeReading;
      const ok = r !== null && r !== undefined && Math.abs(r) >= (goal.min ?? 0) && Math.abs(r) <= (goal.max ?? Infinity);
      return ok
        ? { pass: true }
        : { pass: false, failKey: 'goal.probeReadingWithin', failValues: { min: goal.min ?? 0, max: goal.max ?? '∞' } };
    }
    default:
      return { pass: false, failKey: 'goal.unknown' };
  }
}

export function evalGoal(goal: GoalExpr, ctx: GoalContext): GoalResult {
  if (goal.op === 'and' || goal.op === 'or') {
    const results = (goal.args ?? []).map((g) => evalGoal(g, ctx));
    if (goal.op === 'and') {
      const failed = results.find((r) => !r.pass);
      return failed ?? { pass: true };
    }
    const anyPass = results.some((r) => r.pass);
    return anyPass ? { pass: true } : (results[0] ?? { pass: false, failKey: 'goal.unknown' });
  }
  return leaf(goal, ctx);
}

// ---------- content-side builder helpers (keeps lesson data compact) ----------

export const g = {
  and: (...args: GoalExpr[]): GoalExpr => ({ op: 'and', args }),
  or: (...args: GoalExpr[]): GoalExpr => ({ op: 'or', args }),
  ledOn: (id: string): GoalExpr => ({ check: 'ledOn', id }),
  ledOff: (id: string): GoalExpr => ({ check: 'ledOff', id }),
  ledCurrentSafe: (id: string): GoalExpr => ({ check: 'currentWithin', id, min: 2, max: 25 }),
  currentWithin: (id: string, min: number, max: number): GoalExpr => ({
    check: 'currentWithin',
    id,
    min,
    max,
  }),
  battery: (): GoalExpr => ({ check: 'batteryPresent' }),
  present: (type: string, count = 1): GoalExpr => ({ check: 'componentTypeCount', type, count }),
  has: (id: string): GoalExpr => ({ check: 'componentPresent', id }),
  noShort: (): GoalExpr => ({ check: 'notShorted' }),
  clean: (): GoalExpr => ({ check: 'noBlockingDiagnostics' }),
  switchPresent: (): GoalExpr => ({ check: 'switchPresent' }),
  buttonPresent: (): GoalExpr => ({ check: 'buttonPresent' }),
  usedMultimeter: (): GoalExpr => ({ check: 'usedMultimeter' }),
  switchClosed: (): GoalExpr => ({ check: 'switchClosed' }),
  buzzerOn: (id?: string): GoalExpr => ({ check: 'buzzerOn', id }),
  motorSpins: (id?: string): GoalExpr => ({ check: 'motorSpinning', id }),
  capAbove: (id: string, min: number): GoalExpr => ({ check: 'capVoltageAbove', id, min }),
  wiperInRange: (id: string, min: number, max: number): GoalExpr => ({
    check: 'wiperInRange',
    id,
    min,
    max,
  }),
  probeWithin: (min: number, max: number): GoalExpr => ({ check: 'probeReadingWithin', min, max }),
  voltageAcross: (id: string, min: number, max: number): GoalExpr => ({
    check: 'voltageAcross',
    id,
    min,
    max,
  }),
};
