import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { emptyCircuit, type CircuitDoc } from '@/engine/types';
import type { LocaleText } from '@/content/types';

export type LabTool = 'select' | 'wire' | 'place' | 'probe';

export interface LabTask {
  /** goal expression from content */
  goal: unknown;
  /** task brief, bilingual (resolved at render time) */
  brief: LocaleText;
  hints: LocaleText[];
  /** challenge or lesson-task id (for rewards) */
  rewardId?: string;
  returnTo?: string;
  /** stable task key ("lessonId:step") for completion tracking */
  taskId?: string;
  /** circuit to load into the editor when the task starts */
  startCircuit?: CircuitDoc;
  /** part types allowed while this task is active (mirrors content TaskSpec) */
  allowed?: string[];
}

interface LabState {
  doc: CircuitDoc;
  tool: LabTool;
  selectedId: string | null;
  selectedWireId: string | null;
  placingType: string | null;
  running: boolean;
  task: LabTask | null;
  probeA: string | null;
  probeB: string | null;
  multimeterMode: 'voltage' | 'current' | 'resistance';
  multimeterOpen: boolean;
  multimeterUsed: boolean;
  hintLevel: number;
  // actions
  setTool: (t: LabTool) => void;
  select: (id: string | null) => void;
  selectWire: (id: string | null) => void;
  startPlacing: (type: string | null) => void;
  setRunning: (v: boolean) => void;
  setDoc: (d: CircuitDoc) => void;
  setTask: (t: LabTask | null) => void;
  setProbes: (a: string | null, b: string | null) => void;
  setMultimeterMode: (m: LabState['multimeterMode']) => void;
  toggleMultimeter: () => void;
  setMultimeterUsed: (v: boolean) => void;
  bumpHint: () => void;
  resetTaskUi: () => void;
}

export const useLab = create<LabState>()(
  persist(
    (set) => ({
      doc: emptyCircuit(),
      tool: 'select',
      selectedId: null,
      selectedWireId: null,
      placingType: null,
      running: false,
      task: null,
      probeA: null,
      probeB: null,
      multimeterMode: 'voltage',
      multimeterOpen: false,
      multimeterUsed: false,
      hintLevel: 0,
      setTool: (tool) => set({ tool }),
      select: (selectedId) => set({ selectedId, selectedWireId: null }),
      selectWire: (selectedWireId) => set({ selectedWireId, selectedId: null }),
      startPlacing: (placingType) =>
        set((s) => ({
          placingType,
          // only switching INTO placing forces the place tool; clearing a placing
          // mode returns to select — but must NOT clobber an explicitly chosen
          // tool like 'wire' (this was the bug that made the wire tool dead).
          tool: placingType ? 'place' : s.tool === 'place' ? 'select' : s.tool,
        })),
      setRunning: (running) => set({ running }),
      setDoc: (doc) => set({ doc }),
      setTask: (task) =>
        set((st) => ({
          task,
          hintLevel: 0,
          multimeterUsed: false,
          probeA: null,
          probeB: null,
          running: false,
          doc: task?.startCircuit ?? st.doc,
        })),
      setProbes: (probeA, probeB) => set({ probeA, probeB }),
      setMultimeterMode: (multimeterMode) => set({ multimeterMode }),
      toggleMultimeter: () => set((s) => ({ multimeterOpen: !s.multimeterOpen })),
      setMultimeterUsed: (multimeterUsed) => set({ multimeterUsed }),
      bumpHint: () => set((s) => ({ hintLevel: Math.min(3, s.hintLevel + 1) })),
      resetTaskUi: () => set({ hintLevel: 0, probeA: null, probeB: null, multimeterUsed: false }),
    }),
    {
      name: 'cq-lab',
      partialize: (s) => ({ doc: s.doc }),
    },
  ),
);
