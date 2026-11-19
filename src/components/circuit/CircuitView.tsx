'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Simulator } from '@/engine/simulator';
import type { CircuitDoc, SimSnapshot } from '@/engine/types';
import { PART_MAP } from '@/parts/registry';
import { PartVisual, type PartState } from '@/parts/visuals';

// ---------------------------------------------------------------- geometry

import type { ComponentInstance, PinDef } from '@/engine/types';

export function pinWorldPos(inst: ComponentInstance, pin: PinDef): { x: number; y: number } {
  const rad = ((inst.rotation % 360) * Math.PI) / 180;
  const cos = Math.round(Math.cos(rad));
  const sin = Math.round(Math.sin(rad));
  return {
    x: inst.x + pin.x * cos - pin.y * sin,
    y: inst.y + pin.x * sin + pin.y * cos,
  };
}

export function pinPositionsOf(inst: ComponentInstance): Map<string, { x: number; y: number }> {
  const def = PART_MAP.get(inst.type);
  const map = new Map<string, { x: number; y: number }>();
  def?.pins.forEach((p) => map.set(p.id, pinWorldPos(inst, p)));
  return map;
}

/** smooth wire path between two points (elbow-friendly bezier) */
export function wirePath(a: { x: number; y: number }, b: { x: number; y: number }): string {
  const dx = Math.abs(b.x - a.x);
  const dy = Math.abs(b.y - a.y);
  if (dx < 2 || dy < 2) return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  const horizontalFirst = dx >= dy;
  if (horizontalFirst) {
    const mx = (a.x + b.x) / 2;
    return `M ${a.x} ${a.y} L ${mx} ${a.y} L ${mx} ${b.y} L ${b.x} ${b.y}`;
  }
  const my = (a.y + b.y) / 2;
  return `M ${a.x} ${a.y} L ${a.x} ${my} L ${b.x} ${my} L ${b.x} ${b.y}`;
}

// ------------------------------------------------------------- circuit view

export interface CircuitViewProps {
  doc: CircuitDoc;
  snapshot: SimSnapshot | null;
  running: boolean;
  showFlow?: boolean;
  interactive?: boolean;
  selectedId?: string | null;
  selectedWireId?: string | null;
  highlightedIds?: string[];
  floatingPins?: string[];
  onComponentPointerDown?: (e: React.PointerEvent, inst: ComponentInstance) => void;
  onPinPointerDown?: (e: React.PointerEvent, componentId: string, pinId: string) => void;
  onPinPointerUp?: (e: React.PointerEvent, componentId: string, pinId: string) => void;
  onPinPointerEnter?: (componentId: string, pinId: string) => void;
  onWirePointerDown?: (e: React.PointerEvent, wireId: string) => void;
  onCanvasPointerDown?: (e: React.PointerEvent) => void;
  onCanvasPointerMove?: (e: React.PointerEvent) => void;
  onCanvasPointerUp?: (e: React.PointerEvent) => void;
  onControlTap?: (componentId: string, type: string) => void;
  onControlPress?: (componentId: string, pressed: boolean) => void;
  onPotDrag?: (componentId: string, taper: number) => void;
  probeTargets?: boolean;
  probeA?: string | null;
  probeB?: string | null;
  onProbeTap?: (pinKey: string) => void;
  wireDraft?: { from: { x: number; y: number }; to: { x: number; y: number }; valid: boolean } | null;
  className?: string;
  compact?: boolean;
}

export function CircuitView(props: CircuitViewProps) {
  const {
    doc,
    snapshot,
    running,
    showFlow = true,
    selectedId,
    selectedWireId,
    highlightedIds = [],
    floatingPins = [],
    onComponentPointerDown,
    onPinPointerDown,
    onPinPointerUp,
    onWirePointerDown,
    onCanvasPointerDown,
    onCanvasPointerMove,
    onCanvasPointerUp,
    onControlTap,
    onControlPress,
    onPotDrag,
    probeA,
    probeB,
    onProbeTap,
    wireDraft,
    className,
  } = props;

  const outputs = snapshot?.outputs ?? {};
  const wireCurrents = snapshot?.wireCurrents ?? {};

  const pinPosById = useMemo(() => {
    const map = new Map<string, Map<string, { x: number; y: number }>>();
    doc.components.forEach((c) => map.set(c.id, pinPositionsOf(c)));
    return map;
  }, [doc.components]);

  const pinKeyPos = (componentId: string, pinId: string) =>
    pinPosById.get(componentId)?.get(pinId) ?? { x: 0, y: 0 };

  return (
    <svg
      className={className}
      viewBox="0 0 800 480"
      style={{ touchAction: 'none', width: '100%', height: '100%', display: 'block' }}
      onPointerDown={onCanvasPointerDown}
      onPointerMove={onCanvasPointerMove}
      onPointerUp={onCanvasPointerUp}
      role="img"
      aria-label="circuit canvas"
    >
      {/* wires */}
      <g>
        {doc.wires.map((wire) => {
          const a = pinKeyPos(wire.a.componentId, wire.a.pinId);
          const b = pinKeyPos(wire.b.componentId, wire.b.pinId);
          const d = wirePath(a, b);
          const current = wireCurrents[wire.id] ?? 0;
          const selected = selectedWireId === wire.id;
          const flow = running && showFlow && Math.abs(current) > 5e-5;
          return (
            <g key={wire.id}>
              <path
                d={d}
                fill="none"
                stroke={selected ? '#0d9488' : '#94a3b8'}
                strokeWidth={selected ? 6 : 4.5}
                strokeLinecap="round"
                style={{ cursor: onWirePointerDown ? 'pointer' : undefined }}
                onPointerDown={(e) => onWirePointerDown?.(e, wire.id)}
              />
              {flow && (
                <path
                  className="cq-flow-dash"
                  d={d}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  strokeLinecap="round"
                  style={{
                    animationDuration: `${Math.max(0.25, 1.6 - Math.min(1.2, Math.abs(current) * 800))}s`,
                    animationDirection: current < 0 ? 'reverse' : 'normal',
                  }}
                  pointerEvents="none"
                />
              )}
            </g>
          );
        })}
      </g>

      {/* wire draft preview */}
      {wireDraft && (
        <path
          d={wirePath(wireDraft.from, wireDraft.to)}
          fill="none"
          stroke={wireDraft.valid ? '#22c55e' : '#ef4444'}
          strokeWidth={4}
          strokeDasharray="8 8"
          strokeLinecap="round"
          pointerEvents="none"
        />
      )}

      {/* components */}
      {doc.components.map((inst) => {
        const def = PART_MAP.get(inst.type);
        if (!def) return null;
        const out = outputs[inst.id] ?? {};
        const state: PartState = { ...out, running };
        const selected = selectedId === inst.id;
        const highlighted = highlightedIds.includes(inst.id);
        return (
          <g
            key={inst.id}
            transform={`translate(${inst.x} ${inst.y}) rotate(${inst.rotation})`}
            style={{ cursor: onComponentPointerDown ? 'grab' : undefined }}
          >
            {(selected || highlighted) && (
              <rect
                x={-def.size.w / 2 - 10}
                y={-def.size.h / 2 - 10}
                width={def.size.w + 20}
                height={def.size.h + 20}
                rx={12}
                fill="none"
                stroke={highlighted ? '#f59e0b' : '#0d9488'}
                strokeWidth={3}
                strokeDasharray={highlighted ? '7 5' : undefined}
              />
            )}
            <g onPointerDown={(e) => onComponentPointerDown?.(e, inst)}>
              <rect x={-def.size.w / 2} y={-def.size.h / 2} width={def.size.w} height={def.size.h} fill="transparent" />
              <PartVisual type={inst.type} params={inst.params} state={state} />
            </g>
            {/* interactive overlays */}
            {inst.type === 'switch' && running && (
              <rect
                x={-def.size.w / 2}
                y={-def.size.h / 2}
                width={def.size.w}
                height={def.size.h}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onControlTap?.(inst.id, 'switch');
                }}
              />
            )}
            {inst.type === 'button' && running && (
              <rect
                x={-def.size.w / 2}
                y={-def.size.h / 2}
                width={def.size.w}
                height={def.size.h}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onControlPress?.(inst.id, true);
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();
                  onControlPress?.(inst.id, false);
                }}
                onPointerLeave={() => onControlPress?.(inst.id, false)}
              />
            )}
            {inst.type === 'potentiometer' && running && (
              <PotDragHandle
                onDrag={(t) => onPotDrag?.(inst.id, t)}
                centerX={0}
                y={-20}
              />
            )}
            {/* pins */}
            {def.pins.map((pin) => {
              const key = `${inst.id}.${pin.id}`;
              const isProbe = probeA === key || probeB === key;
              const floating = floatingPins.includes(key);
              return (
                <g key={pin.id}>
                  {floating && running && (
                    <circle cx={pin.x} cy={pin.y} r={9} fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 3" />
                  )}
                  {isProbe && <circle cx={pin.x} cy={pin.y} r={11} fill="none" stroke="#7c3aed" strokeWidth={3.5} />}
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r={13}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onPointerDown={(e) => onPinPointerDown?.(e, inst.id, pin.id)}
                    onPointerUp={(e) => onPinPointerUp?.(e, inst.id, pin.id)}
                    onClick={(e) => {
                      if (onProbeTap) {
                        e.stopPropagation();
                        onProbeTap(key);
                      }
                    }}
                  />
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

/** invisible slider strip above the potentiometer for run-mode control */
function PotDragHandle({ onDrag, centerX, y }: { onDrag: (t: number) => void; centerX: number; y: number }) {
  const ref = useRef<SVGGElement>(null);
  const dragging = useRef(false);
  const localX = (e: React.PointerEvent): number => {
    const svg = ref.current?.ownerSVGElement;
    if (!svg) return 0;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return 0;
    const p = pt.matrixTransform(ctm.inverse());
    return p.x;
  };
  return (
    <g
      ref={ref}
      style={{ cursor: 'ew-resize' }}
      onPointerDown={(e) => {
        e.stopPropagation();
        dragging.current = true;
        (e.target as Element).setPointerCapture(e.pointerId);
        onDrag(clamp01((localX(e) - centerX) / 60 + 0.5));
      }}
      onPointerMove={(e) => {
        if (dragging.current) onDrag(clamp01((localX(e) - centerX) / 60 + 0.5));
      }}
      onPointerUp={() => (dragging.current = false)}
    >
      <rect x={centerX - 30} y={y - 10} width={60} height={20} fill="transparent" />
    </g>
  );
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// ------------------------------------------------------------------ mini lab

import type { DemoSpec } from '@/content/types';
import { Slider } from '@/components/ui/slider';
import { useSettings } from '@/stores/settings';
import { useI18n } from '@/lib/i18n';

/** live-simulated read-only circuit with slider controls (lesson demos) */
export function MiniLab({ spec }: { spec: DemoSpec }) {
  const motion = useSettings((s) => s.motion);
  const { tx } = useI18n();
  const [overrides, setOverrides] = useState<Record<string, Record<string, number>>>({});
  const doc = useMemo<CircuitDoc>(
    () => ({
      components: spec.circuit.components.map((c) =>
        overrides[c.id] ? { ...c, params: { ...c.params, ...overrides[c.id] } } : c,
      ),
      wires: spec.circuit.wires,
    }),
    [spec, overrides],
  );
  const [snapshot, setSnapshot] = useState<SimSnapshot | null>(null);
  const raf = useRef(0);

  useEffect(() => {
    const sim = new Simulator(doc, PART_MAP);
    sim.power(true);
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      sim.tick(dt);
      setSnapshot(sim.snapshot);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [doc, motion]);

  const setParam = (componentId: string, param: string, value: number) => {
    setOverrides((prev) => ({
      ...prev,
      [componentId]: { ...prev[componentId], [param]: value },
    }));
  };

  return (
    <div className="rounded-2xl border bg-white overflow-hidden">
      <div className="cq-canvas-grid h-64">
        <CircuitView doc={doc} snapshot={snapshot} running showFlow={motion} />
      </div>
      {spec.controls.length > 0 && (
        <div className="p-4 space-y-4 border-t bg-slate-50">
          {spec.controls.map((ctrl) => {
            const inst = doc.components.find((c) => c.id === ctrl.componentId);
            const value = Number(inst?.params[ctrl.param] ?? 0);
            return (
              <div key={`${ctrl.componentId}.${ctrl.param}`}>
                <div className="flex justify-between text-sm font-semibold text-slate-600 mb-1">
                  <span>{tx(ctrl.label)}</span>
                  <span className="tabular-nums text-teal-700">
                    {ctrl.param === 'taper'
                      ? `${Math.round(value * 100)}%`
                      : ctrl.param === 'resistance'
                        ? `${value} Ω`
                        : value}
                    {ctrl.param === 'voltage' ? ' V' : ''}
                  </span>
                </div>
                <Slider
                  value={[value]}
                  min={ctrl.min ?? 0}
                  max={ctrl.max ?? 100}
                  step={ctrl.step ?? 1}
                  onValueChange={(v) => setParam(ctrl.componentId, ctrl.param, v[0])}
                />
              </div>
            );
          })}
          {spec.caption && <p className="text-xs text-slate-500 pt-1">{tx(spec.caption)}</p>}
        </div>
      )}
    </div>
  );
}
