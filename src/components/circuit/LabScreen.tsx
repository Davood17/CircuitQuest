'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CircuitView, pinPositionsOf } from './CircuitView';
import { Simulator } from '@/engine/simulator';
import { evalGoal, type GoalResult } from '@/engine/goals';
import type { CircuitDoc, ComponentInstance, SimSnapshot } from '@/engine/types';
import { PART_DEFS, PART_MAP, CATEGORY_ORDER, freshId, makeComponent } from '@/parts/registry';
import { PartIcon } from '@/parts/visuals';
import { useLab } from '@/stores/lab';
import { useProgress } from '@/stores/progress';
import { useSettings } from '@/stores/settings';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import {
  Play, Square, MousePointer2, Spline, Trash2, RotateCw, Copy, Gauge,
  Lightbulb, PartyPopper, ZoomIn, ZoomOut, Scan,
} from 'lucide-react';

const WORLD = { w: 800, h: 480 };

export function LabScreen({ onTaskComplete }: { onTaskComplete?: () => void }) {
  const { t, tx } = useI18n();
  const motion = useSettings((s) => s.motion);
  const sound = useSettings((s) => s.sound);
  const recordSimRun = useProgress((s) => s.recordSimRun);
  const solveChallenge = useProgress((s) => s.solveChallenge);

  const doc = useLab((s) => s.doc);
  const tool = useLab((s) => s.tool);
  const placingType = useLab((s) => s.placingType);
  const running = useLab((s) => s.running);
  const task = useLab((s) => s.task);
  const selectedId = useLab((s) => s.selectedId);
  const selectedWireId = useLab((s) => s.selectedWireId);
  const multimeterOpen = useLab((s) => s.multimeterOpen);
  const multimeterUsed = useLab((s) => s.multimeterUsed);
  const setMultimeterUsed = useLab((s) => s.setMultimeterUsed);
  const multimeterMode = useLab((s) => s.multimeterMode);
  const probeA = useLab((s) => s.probeA);
  const probeB = useLab((s) => s.probeB);
  const hintLevel = useLab((s) => s.hintLevel);

  const setTool = useLab((s) => s.setTool);
  const select = useLab((s) => s.select);
  const selectWire = useLab((s) => s.selectWire);
  const startPlacing = useLab((s) => s.startPlacing);
  const setRunning = useLab((s) => s.setRunning);
  const setDoc = useLab((s) => s.setDoc);
  const setProbes = useLab((s) => s.setProbes);
  const setMultimeterMode = useLab((s) => s.setMultimeterMode);
  const toggleMultimeter = useLab((s) => s.toggleMultimeter);
  const bumpHint = useLab((s) => s.bumpHint);

  const [snapshot, setSnapshot] = useState<SimSnapshot | null>(null);
  const [category, setCategory] = useState<string>('power');
  const [goalResult, setGoalResult] = useState<GoalResult | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const celebrateRef = useRef(false);
  const [zoom, setZoom] = useState(1);
  const [dragGhost, setDragGhost] = useState<{ x: number; y: number } | null>(null);
  const [reading, setReading] = useState<string | null>(null);

  const simRef = useRef<Simulator | null>(null);
  const rafRef = useRef(0);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const wireDraftRef = useRef<{ fromComp: string; fromPin: string } | null>(null);
  const [wireDraft, setWireDraft] = useState<{ from: { x: number; y: number }; to: { x: number; y: number }; valid: boolean } | null>(null);
  const panRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  /** live multimeter readout (called from handlers & the rAF loop, never during render) */
  const computeReading = (): string | null => {
    const sim = simRef.current;
    if (!sim || !multimeterOpen) return null;
    const lab = useLab.getState();
    const mode = lab.multimeterMode;
    const pa = lab.probeA;
    const pb = lab.probeB;
    if (mode === 'voltage' && pa && pb) {
      const v = sim.measureVoltage(pa, pb);
      return v === null ? null : `${Math.abs(v).toFixed(2)} V`;
    }
    if (mode === 'resistance' && pa && pb) {
      const r = sim.measureResistance(pa, pb);
      if (r === null) return null;
      if (r > 5e7) return t('lab.ohmNoReading');
      return r >= 1000 ? `${(r / 1000).toFixed(2)} kΩ` : `${r.toFixed(0)} Ω`;
    }
    return null;
  };


  // ---- simulator lifecycle
  useEffect(() => {
    const sim = new Simulator(useLab.getState().doc, PART_MAP);
    simRef.current = sim;
    if (useLab.getState().running) sim.power(true);
  }, []);

  useEffect(() => {
    const sim = simRef.current;
    if (!sim) return;
    sim.power(running); // keep solver power in sync with the store
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      sim.tick(dt);
      const snap = sim.snapshot;
      setSnapshot(snap);
      if (typeof window !== 'undefined') (window as unknown as Record<string, unknown>).__snap = snap;
      setReading(computeReading());
      // live goal check (subscription callback — external store sync)
      const lab = useLab.getState();
      const task = lab.task;
      if (task) {
        let probeReading: number | null = null;
        if (lab.multimeterMode === 'voltage' && lab.probeA && lab.probeB) {
          probeReading = sim.measureVoltage(lab.probeA, lab.probeB);
        }
        const result = evalGoal(task.goal as never, {
          doc: lab.doc,
          snapshot: snap,
          taskState: { usedMultimeter: lab.multimeterUsed, probeReading },
        });
        setGoalResult(result);
        if (result.pass && !celebrateRef.current) {
          celebrateRef.current = true;
          setCelebrate(true);
          if (task.rewardId) solveChallenge(task.rewardId, lab.hintLevel);
          if (sound) {
            beep(880, 0.12);
            window.setTimeout(() => beep(1174, 0.18), 140);
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    if (running) rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, sound]);

  // doc changes → recompile
  useEffect(() => {
    simRef.current?.setDoc(doc);
  }, [doc]);

  useEffect(() => {
    if (!sound || !snapshot) return;
    const anySounding = Object.values(snapshot.outputs).some((o) => o.sounding === true);
    if (anySounding) {
      startBuzzer();
      return () => stopBuzzer();
    }
    stopBuzzer();
    return;
  }, [snapshot?.outputs, sound]);

  // ---- coordinate helpers
  const toWorld = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return { x: 0, y: 0 };
      const p = pt.matrixTransform(ctm.inverse());
      return { x: p.x, y: p.y };
    },
    [],
  );

  // ---- editing actions
  const updateDoc = useCallback(
    (fn: (d: CircuitDoc) => CircuitDoc) => setDoc(fn(useLab.getState().doc)),
    [setDoc],
  );

  const placeAt = (x: number, y: number) => {
    if (!placingType) return;
    const inst = makeComponent(placingType, { x: Math.round(x), y: Math.round(y) });
    updateDoc((d) => ({ ...d, components: [...d.components, inst] }));
    select(inst.id);
    startPlacing(null);
  };

  const rotateSelected = () => {
    if (!selectedId) return;
    updateDoc((d) => ({
      ...d,
      components: d.components.map((c) =>
        c.id === selectedId ? { ...c, rotation: (c.rotation + 90) % 360 } : c,
      ),
    }));
  };

  const duplicateSelected = () => {
    if (!selectedId) return;
    const src = doc.components.find((c) => c.id === selectedId);
    if (!src) return;
    const copy: ComponentInstance = { ...src, id: freshId(src.type), x: src.x + 60, y: src.y + 60 };
    updateDoc((d) => ({ ...d, components: [...d.components, copy] }));
    select(copy.id);
  };

  const deleteSelected = () => {
    if (selectedWireId) {
      updateDoc((d) => ({ ...d, wires: d.wires.filter((w) => w.id !== selectedWireId) }));
      selectWire(null);
      return;
    }
    if (!selectedId) return;
    updateDoc((d) => ({
      components: d.components.filter((c) => c.id !== selectedId),
      wires: d.wires.filter((w) => w.a.componentId !== selectedId && w.b.componentId !== selectedId),
    }));
    select(null);
  };

  const toggleRun = () => {
    const sim = simRef.current;
    if (!running) {
      recordSimRun();
      sim?.power(true);
      setRunning(true);
    } else {
      sim?.power(false);
      setRunning(false);
      celebrateRef.current = false;
      setCelebrate(false);
      setGoalResult(null);
    }
  };

  // ---- pointer handlers
  const onCanvasPointerDown = (e: React.PointerEvent) => {
    const p = toWorld(e.clientX, e.clientY);
    if (tool === 'place' && placingType) {
      placeAt(p.x, p.y);
      return;
    }
    if (tool === 'wire') {
      // tapping empty space cancels an unfinished wire draft
      if (wireDraftRef.current) {
        wireDraftRef.current = null;
        setWireDraft(null);
      }
      return; // wiring is handled by the pins
    }
    // pan on empty canvas
    if (e.target === e.currentTarget || (e.target as Element).getAttribute('fill') === 'transparent') {
      panRef.current = { x: e.clientX, y: e.clientY, ox: pan.x, oy: pan.y };
    }
    select(null);
    selectWire(null);
  };

  const onCanvasPointerMove = (e: React.PointerEvent) => {
    const p = toWorld(e.clientX, e.clientY);
    if (tool === 'place' && placingType) setDragGhost(p);
    if (panRef.current) {
      const scale = 1; // world units ≈ px (viewBox scaled) — use delta directly
      setPan({
        x: panRef.current.ox + (e.clientX - panRef.current.x) * scale * 1.4,
        y: panRef.current.oy + (e.clientY - panRef.current.y) * scale * 1.4,
      });
    }
    if (dragRef.current) {
      const { id, dx, dy } = dragRef.current;
      const nx = Math.round((p.x - dx) / 5) * 5;
      const ny = Math.round((p.y - dy) / 5) * 5;
      updateDoc((d) => ({
        ...d,
        components: d.components.map((c) => (c.id === id ? { ...c, x: nx, y: ny } : c)),
      }));
    }
    if (wireDraftRef.current) {
      const target = nearestPin(p);
      const from = pinWorldPosOf(wireDraftRef.current.fromComp, wireDraftRef.current.fromPin);
      setWireDraft({ from, to: target?.pos ?? p, valid: Boolean(target) });
    }
  };

  const onCanvasPointerUp = () => {
    panRef.current = null;
    dragRef.current = null;
  };

  const pinWorldPosOf = (componentId: string, pinId: string) => {
    const inst = doc.components.find((c) => c.id === componentId);
    if (!inst) return { x: 0, y: 0 };
    return pinPositionsOf(inst).get(pinId) ?? { x: 0, y: 0 };
  };

  const nearestPin = (p: { x: number; y: number }) => {
    let best: { comp: string; pin: string; pos: { x: number; y: number } } | null = null;
    let bestDist = 24;
    for (const inst of doc.components) {
      for (const [pinId, pos] of pinPositionsOf(inst)) {
        const d = Math.hypot(pos.x - p.x, pos.y - p.y);
        if (d < bestDist) {
          bestDist = d;
          best = { comp: inst.id, pin: pinId, pos };
        }
      }
    }
    return best;
  };

  const onComponentPointerDown = (e: React.PointerEvent, inst: ComponentInstance) => {
    if (tool === 'place' && placingType) return; // let the canvas place the new part
    e.stopPropagation();
    if (tool === 'wire') return;
    const p = toWorld(e.clientX, e.clientY);
    select(inst.id);
    dragRef.current = { id: inst.id, dx: p.x - inst.x, dy: p.y - inst.y };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPinPointerDown = (e: React.PointerEvent, componentId: string, pinId: string) => {
    if (tool === 'place' && placingType) return; // placing takes priority
    e.stopPropagation();
    if (multimeterOpen && multimeterMode === 'voltage') {
      tapProbe(`${componentId}.${pinId}`);
      return;
    }
    if (tool !== 'wire') return;
    if (!wireDraftRef.current) {
      wireDraftRef.current = { fromComp: componentId, fromPin: pinId };
      const from = pinWorldPosOf(componentId, pinId);
      setWireDraft({ from, to: from, valid: false });
      // capture the pointer so drag-to-wire keeps firing move/up even when the
      // finger leaves the tiny pin hit-area (implicit capture on touch anyway)
      try {
        (e.target as Element).setPointerCapture?.(e.pointerId);
      } catch {
        /* pointer not active — tap-tap flow still works */
      }
    } else {
      commitWire(wireDraftRef.current, { comp: componentId, pin: pinId });
    }
  };

  const onPinPointerUp = (e: React.PointerEvent, componentId: string, pinId: string) => {
    if (tool === 'place' && placingType) return;
    e.stopPropagation();
    if (tool === 'wire' && wireDraftRef.current) {
      const from = wireDraftRef.current;
      if (!(from.fromComp === componentId && from.fromPin === pinId)) {
        commitWire(from, { comp: componentId, pin: pinId });
        return;
      }
      // released on the START pin: with pointer capture this also covers
      // drag-to-wire (touch + mouse) — land on the nearest pin under the pointer
      const target = nearestPin(toWorld(e.clientX, e.clientY));
      if (target && !(target.comp === from.fromComp && target.pin === from.fromPin)) {
        commitWire(from, { comp: target.comp, pin: target.pin });
      }
    }
  };

  const commitWire = (
    from: { fromComp: string; fromPin: string },
    to: { comp: string; pin: string },
  ) => {
    if (from.fromComp === to.comp && from.fromPin === to.pin) {
      wireDraftRef.current = null;
      setWireDraft(null);
      return;
    }
    const wire = {
      id: freshId('w'),
      a: { componentId: from.fromComp, pinId: from.fromPin },
      b: { componentId: to.comp, pinId: to.pin },
    };
    updateDoc((d) => ({ ...d, wires: [...d.wires, wire] }));
    wireDraftRef.current = null;
    setWireDraft(null);
    if (sound) beep(660, 0.05);
  };

  const tapProbe = (pinKey: string) => {
    setMultimeterUsed(true);
    if (!probeA || (probeA && probeB)) setProbes(pinKey, null);
    else setProbes(probeA, pinKey);
    setReading(computeReading());
  };

  const onControlTap = (componentId: string, type: string) => {
    if (type === 'switch') {
      const inst = doc.components.find((c) => c.id === componentId);
      const closed = inst?.params.closed === true;
      updateDoc((d) => ({
        ...d,
        components: d.components.map((c) => (c.id === componentId ? { ...c, params: { ...c.params, closed: !closed } } : c)),
      }));
      simRef.current?.setControl(componentId, 'closed', !closed);
    }
  };

  const onControlPress = (componentId: string, pressed: boolean) => {
    simRef.current?.setControl(componentId, 'closed', pressed);
  };

  const onPotDrag = (componentId: string, taper: number) => {
    updateDoc((d) => ({
      ...d,
      components: d.components.map((c) => (c.id === componentId ? { ...c, params: { ...c.params, taper } } : c)),
    }));
    simRef.current?.setControl(componentId, 'taper', taper);
  };

  const onProbeTap = (pinKey: string) => {
    if (multimeterOpen && multimeterMode === 'voltage') tapProbe(pinKey);
  };


  const selected = doc.components.find((c) => c.id === selectedId) ?? null;
  const selectedDef = selected ? PART_MAP.get(selected.type) : null;
  const diagnostics = snapshot?.diagnostics ?? [];
  const topDiags = diagnostics.filter((d) => d.severity !== 'success').slice(0, 2);
  const successDiag = diagnostics.find((d) => d.severity === 'success');

  const partsForCategory = PART_DEFS.filter((p) => p.category === category);
  const paletteTypes = task?.allowed ? PART_DEFS.filter((p) => task.allowed?.includes(p.type)) : PART_DEFS;

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] bg-slate-100">
      {/* top controls */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-b">
        <Button
          onClick={toggleRun}
          className={`h-11 px-5 font-bold text-base ${running ? 'bg-rose-600 hover:bg-rose-700' : 'bg-teal-600 hover:bg-teal-700'}`}
          aria-label={running ? t('lab.stop') : t('lab.run')}
        >
          {running ? <Square className="w-5 h-5 me-1.5" /> : <Play className="w-5 h-5 me-1.5" />}
          {running ? t('lab.stop') : t('lab.run')}
        </Button>
        <Button
          variant={multimeterOpen ? 'default' : 'outline'}
          onClick={toggleMultimeter}
          className="h-11"
          aria-label={t('lab.multimeter')}
        >
          <Gauge className="w-5 h-5" />
        </Button>
        <div className="ms-auto flex gap-1">
          <Button variant="ghost" size="icon" aria-label={t('lab.zoomIn')} onClick={() => setZoom((z) => Math.min(2.2, z + 0.2))}>
            <ZoomIn className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={t('lab.zoomOut')} onClick={() => setZoom((z) => Math.max(0.7, z - 0.2))}>
            <ZoomOut className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('lab.zoomReset')}
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
          >
            <Scan className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* task banner */}
      {task && (
        <div className={`px-3 py-2 text-sm font-semibold ${goalResult?.pass ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-900'} flex items-center gap-2`}>
          {goalResult?.pass ? <PartyPopper className="w-5 h-5 shrink-0" /> : <Lightbulb className="w-5 h-5 shrink-0" />}
          <span className="flex-1">{goalResult?.pass ? t('lab.challengeComplete') : tx(task.brief)}</span>
          {!goalResult?.pass && (
            <Button size="sm" variant="outline" className="h-8" onClick={bumpHint}>
              {t('lesson.hint')} {Math.min(hintLevel + 1, 3)}/3
            </Button>
          )}
        </div>
      )}
      {task && !goalResult?.pass && hintLevel > 0 && (
        <div className="px-3 py-1.5 bg-amber-50 text-amber-900 text-xs border-b border-amber-200">
          💡 {task.hints.slice(0, hintLevel).map((h) => tx(h)).join(' → ')}
        </div>
      )}

      {/* canvas */}
      <div className="relative flex-1 min-h-0 cq-canvas-grid bg-slate-50 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox="0 0 800 480"
          preserveAspectRatio="xMidYMid meet"
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            touchAction: 'none',
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          }}
          onPointerDown={onCanvasPointerDown}
          onPointerMove={onCanvasPointerMove}
          onPointerUp={onCanvasPointerUp}
        >
          <CircuitView
            doc={doc}
            snapshot={snapshot}
            running={running}
            showFlow={motion}
            interactive
            selectedId={selectedId}
            selectedWireId={selectedWireId}
            floatingPins={snapshot?.floatingPins ?? []}
            onComponentPointerDown={onComponentPointerDown}
            onPinPointerDown={onPinPointerDown}
            onPinPointerUp={onPinPointerUp}
            onWirePointerDown={(e, wireId) => {
              e.stopPropagation();
              selectWire(wireId);
            }}
            onControlTap={onControlTap}
            onControlPress={onControlPress}
            onPotDrag={onPotDrag}
            probeA={multimeterOpen ? probeA : null}
            probeB={multimeterOpen ? probeB : null}
            onProbeTap={onProbeTap}
            wireDraft={wireDraft}
          />
          {doc.components.length === 0 && !task && (
            <text x={400} y={230} textAnchor="middle" fontSize={17} fill="#94a3b8">
              {t('lab.emptyCanvas')}
            </text>
          )}
        </svg>

        {/* floating diagnostics */}
        <div className="absolute bottom-2 start-2 end-2 flex flex-col gap-1.5 pointer-events-none">
          {celebrate && goalResult?.pass && (
            <DiagCard tone="success" text={t('lesson.taskDone')} />
          )}
          {topDiags.map((d) => (
            <DiagCard key={d.code} diag={d} />
          ))}
          {!celebrate && successDiag && topDiags.length === 0 && <DiagCard tone="success" text={t(successDiag.code, successDiag.values as never)} />}
        </div>

        {/* multimeter panel */}
        {multimeterOpen && (
          <div className="absolute top-2 end-2 w-56 rounded-xl bg-white shadow-lg border p-3 text-sm">
            <div className="font-bold mb-2 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-teal-700" /> {t('lab.multimeter')}
            </div>
            <div className="grid grid-cols-3 gap-1 mb-2">
              {(['voltage', 'current', 'resistance'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMultimeterMode(m)}
                  className={`rounded-lg py-1.5 text-xs font-bold ${multimeterMode === m ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  {m === 'voltage' ? 'V' : m === 'current' ? 'A' : 'Ω'}
                </button>
              ))}
            </div>
            {multimeterMode === 'voltage' && (
              <p className="text-xs text-slate-500 mb-1">{t('lab.tapTwoPoints')}</p>
            )}
            {multimeterMode === 'current' && <p className="text-xs text-slate-500 mb-1">{t('lab.ammeterHint')}</p>}
            {multimeterMode === 'resistance' && <p className="text-xs text-slate-500 mb-1">{t('lab.ohmHint')}</p>}
            <div className="rounded-lg bg-slate-900 text-emerald-400 font-mono text-lg text-center py-2 tabular-nums">
              {reading ?? '— — —'}
            </div>
          </div>
        )}
      </div>

      {/* properties sheet */}
      {selected && selectedDef && (
        <div className="bg-white border-t px-3 py-2 flex items-center gap-2 overflow-x-auto cq-scroll">
          <span className="font-bold text-sm shrink-0">{t(selectedDef.nameKey)}</span>
          {selectedDef.params
            .filter((p) => !p.liveControl)
            .map((p) => (
              <div key={p.key} className="flex gap-1 shrink-0">
                {(p.options ?? []).map((o) => (
                  <button
                    key={String(o.value)}
                    onClick={() => {
                      updateDoc((d) => ({
                        ...d,
                        components: d.components.map((c) =>
                          c.id === selected.id ? { ...c, params: { ...c.params, [p.key]: o.value } } : c,
                        ),
                      }));
                      if (selected.type === 'battery') simRef.current?.setDoc(useLab.getState().doc);
                    }}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold border ${
                      selected.params[p.key] === o.value
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white border-slate-300 text-slate-600'
                    }`}
                  >
                    {o.label} {p.unit}
                  </button>
                ))}
              </div>
            ))}
          <div className="ms-auto flex gap-1 shrink-0">
            <Button variant="outline" size="sm" className="h-9" onClick={rotateSelected}>
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-9" onClick={duplicateSelected}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="destructive" size="sm" className="h-9" onClick={deleteSelected} disabled={!selectedId && !selectedWireId}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      {selectedWireId && (
        <div className="bg-white border-t px-3 py-2 flex items-center gap-2">
          <span className="font-bold text-sm">{t('lab.wire')}</span>
          <Button variant="destructive" size="sm" className="ms-auto h-9" onClick={deleteSelected}>
            <Trash2 className="w-4 h-4 me-1" /> {t('lab.delete')}
          </Button>
        </div>
      )}

      {/* tool row */}
      <div className="bg-white border-t px-3 py-1.5 flex items-center gap-2">
        <button
          onClick={() => {
            setTool('select');
            startPlacing(null);
          }}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${tool === 'select' && !placingType ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}
        >
          <MousePointer2 className="w-4 h-4" /> {t('lab.select')}
        </button>
        <button
          onClick={() => {
            setTool('wire');
            startPlacing(null);
          }}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${tool === 'wire' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}
        >
          <Spline className="w-4 h-4" /> {t('lab.wire')}
        </button>
        {tool === 'wire' && <span className="text-xs text-slate-500">{t('lab.tapPinToStart')}</span>}
        <button
          onClick={() => {
            if (confirm(t('lab.clear'))) {
              setDoc({ components: [], wires: [] });
              select(null);
              selectWire(null);
            }
          }}
          className="ms-auto rounded-full px-3 py-1.5 text-sm font-bold bg-rose-50 text-rose-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* palette */}
      <div className="bg-white border-t">
        <div className="flex gap-1 px-3 pt-2 overflow-x-auto cq-scroll">
          {(task?.allowed
            ? [...new Set(paletteTypes.map((p) => p.category))]
            : [...CATEGORY_ORDER]
          ).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${category === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {t(`cat.${cat}`)}
            </button>
          ))}
        </div>
        <div className="flex gap-2 px-3 py-2 overflow-x-auto cq-scroll">
          {partsForCategory
            .filter((p) => !task?.allowed || task.allowed.includes(p.type))
            .map((p) => (
              <button
                key={p.type}
                onClick={() => startPlacing(p.type)}
                className={`shrink-0 rounded-xl border-2 p-1.5 w-[74px] flex flex-col items-center ${placingType === p.type ? 'border-teal-600 bg-teal-50' : 'border-slate-200 bg-white'}`}
                aria-label={t(p.nameKey)}
              >
                <PartIcon type={p.type} size={40} />
                <span className="text-[10px] font-bold text-slate-600 leading-tight text-center">{t(p.nameKey)}</span>
              </button>
            ))}
        </div>
      </div>

      {/* celebration overlay */}
      {celebrate && goalResult?.pass && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setCelebrate(false)}>
          <div className="cq-pop bg-white rounded-3xl p-8 text-center shadow-2xl max-w-xs mx-4">
            <div className="text-6xl mb-3">🎉</div>
            <h3 className="text-xl font-extrabold text-teal-700 mb-1">{t('lesson.taskDone')}</h3>
            {task?.rewardId && hintLevel === 0 && (
              <p className="text-sm text-amber-600 font-bold">{t('lesson.xpEarned', { xp: 50 })}</p>
            )}
            {onTaskComplete && (
              <Button className="mt-4 w-full h-12 bg-teal-600 hover:bg-teal-700 font-bold" onClick={onTaskComplete}>
                {t('lesson.backToLesson')}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DiagCard({
  diag,
  tone,
  text,
}: {
  diag?: { code: string; severity: string; values?: Record<string, string | number> };
  tone?: 'success';
  text?: string;
}) {
  const { t } = useI18n();
  const severity = tone === 'success' ? 'success' : diag?.severity;
  const style =
    severity === 'success'
      ? 'bg-emerald-600/95 text-white'
      : severity === 'error'
        ? 'bg-rose-600/95 text-white'
        : severity === 'warning'
          ? 'bg-amber-500/95 text-amber-950'
          : 'bg-slate-700/90 text-white';
  const icon = severity === 'success' ? '✅' : severity === 'error' ? '⚠️' : '💡';
  const message = text ?? t(diag!.code, diag?.values as never);
  return (
    <div className={`rounded-xl px-3 py-2 text-sm font-semibold shadow-lg max-w-md ${style}`}>
      <span className="me-1.5">{icon}</span>
      {message}
    </div>
  );
}

// -------------------------------------------------------------- tiny audio

let audioCtx: AudioContext | null = null;
let buzzerOsc: OscillatorNode | null = null;
let buzzerGain: GainNode | null = null;

function beep(freq: number, duration: number) {
  try {
    audioCtx ??= new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {
    /* audio unavailable */
  }
}

function startBuzzer() {
  try {
    audioCtx ??= new AudioContext();
    if (buzzerOsc) return;
    buzzerOsc = audioCtx.createOscillator();
    buzzerGain = audioCtx.createGain();
    buzzerOsc.type = 'square';
    buzzerOsc.frequency.value = 440;
    buzzerGain.gain.value = 0.03;
    buzzerOsc.connect(buzzerGain).connect(audioCtx.destination);
    buzzerOsc.start();
  } catch {
    /* ignore */
  }
}

function stopBuzzer() {
  try {
    buzzerOsc?.stop();
  } catch {
    /* ignore */
  }
  buzzerOsc = null;
  buzzerGain = null;
}

export { beep };
