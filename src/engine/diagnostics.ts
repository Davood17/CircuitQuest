import type { CircuitDoc, Diagnostic } from './types';

interface AnalyzeInput {
  doc: CircuitDoc;
  outputs: Record<string, Record<string, number | boolean | string>>;
  floatingCount: number;
  solved: boolean;
  running: boolean;
  compileError: string | null;
}

const SHORT_THRESHOLD = 1.5; // A through a battery → short circuit
const ZERO_CURRENT = 1e-6;

/**
 * The "explain, don't punish" layer: every anomaly becomes a localized,
 * educational message instead of a dead end.
 */
export function analyzeDiagnostics(input: AnalyzeInput): Diagnostic[] {
  const { doc, outputs, floatingCount, solved, running, compileError } = input;
  const out: Diagnostic[] = [];
  if (doc.components.length === 0) {
    out.push({ code: 'diag.empty', severity: 'info', componentIds: [] });
    return out;
  }
  if (compileError === 'unknown-part') {
    out.push({ code: 'diag.unknown-part', severity: 'error', componentIds: [] });
    return out;
  }
  if (compileError) {
    out.push({ code: 'diag.compile', severity: 'error', componentIds: [] });
    return out;
  }

  const batteries = doc.components.filter((c) => c.type === 'battery');
  const hasBattery = batteries.length > 0;

  if (running && solved) {
    let anyShort = false;
    let batteryCurrent = 0;
    for (const b of batteries) {
      const o = outputs[b.id];
      if (!o) continue;
      const i = Math.abs(Number(o.dischargeCurrent) || 0);
      batteryCurrent = Math.max(batteryCurrent, i);
      if (i > SHORT_THRESHOLD) {
        anyShort = true;
        out.push({
          code: 'diag.short',
          severity: 'error',
          componentIds: [b.id],
          values: { current: Number((i * 1000).toFixed(0)) },
        });
      }
    }

    // LED checks
    let ledRunning = false;
    for (const c of doc.components) {
      if (c.type !== 'led') continue;
      const o = outputs[c.id];
      if (!o) continue;
      const i = Number(o.current) || 0;
      const brightness = Number(o.brightness) || 0;
      if (o.overcurrent === true) {
        out.push({
          code: 'diag.led-overcurrent',
          severity: 'warning',
          componentIds: [c.id],
          values: { mA: Number((i * 1000).toFixed(0)) },
        });
      }
      if (o.reversed === true) {
        out.push({
          code: 'diag.led-reversed',
          severity: batteryCurrent > ZERO_CURRENT ? 'info' : 'warning',
          componentIds: [c.id],
        });
      }
      if (!anyShort && i >= 0.001 && i <= 0.025) ledRunning = true;
    }
    if (ledRunning) {
      out.push({ code: 'diag.led-running', severity: 'success', componentIds: [] });
    }

    // capacitor polarity
    for (const c of doc.components) {
      if (c.type !== 'capacitor') continue;
      const o = outputs[c.id];
      if (o && o.reversed === true) {
        out.push({
          code: 'diag.cap-reversed',
          severity: 'warning',
          componentIds: [c.id],
        });
      }
    }

    // open circuit: battery present, (almost) no current, no short
    if (hasBattery && !anyShort && batteryCurrent < ZERO_CURRENT) {
      out.push({ code: 'diag.open-circuit', severity: 'warning', componentIds: batteries.map((b) => b.id) });
    }
  }

  // unconnected terminals (no wire, no touching partner) — shown while building
  if (doc.components.length > 1 && floatingCount > 0) {
    out.push({ code: 'diag.floating', severity: 'info', componentIds: [] });
  }

  if (running && !solved && doc.components.length > 0 && !compileError) {
    out.push({ code: 'diag.solver', severity: 'error', componentIds: [] });
  }

  const order = { error: 0, warning: 1, success: 2, info: 3 } as const;
  out.sort((a, b) => order[a.severity] - order[b.severity]);
  return out;
}
