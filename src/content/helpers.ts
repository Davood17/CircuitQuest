import type { ComponentInstance, CircuitDoc, GoalExpr } from '@/engine/types';
import { PART_MAP } from '@/parts/registry';
import type { LocaleText } from './types';

/** content-side component builder with auto layout on a 4-column grid */
export function c(
  type: string,
  id: string,
  opts: { params?: Record<string, string | number | boolean>; x?: number; y?: number; rotation?: number } = {},
): ComponentInstance {
  const def = PART_MAP.get(type);
  if (!def) throw new Error(`unknown part type: ${type}`);
  const params: Record<string, string | number | boolean> = {};
  for (const p of def.params) params[p.key] = p.default;
  return {
    id,
    type,
    x: opts.x ?? 0,
    y: opts.y ?? 0,
    rotation: opts.rotation ?? 0,
    params: { ...params, ...(opts.params ?? {}) },
  };
}

export function w(
  id: string,
  aComp: string,
  aPin: string,
  bComp: string,
  bPin: string,
): CircuitDoc['wires'][number] {
  return { id, a: { componentId: aComp, pinId: aPin }, b: { componentId: bComp, pinId: bPin } };
}

export const doc = (components: ComponentInstance[], wires: CircuitDoc['wires']): CircuitDoc => ({
  components,
  wires,
});

/** goal builder re-export for content files */
export { g } from '@/engine/goals';
export type { GoalExpr };

export const L = (en: string, fa?: string): LocaleText => ({ en, fa });
