import {
  BatteryModel,
  BuzzerModel,
  ButtonModel,
  CapacitorModel,
  DiodeModel,
  LedModel,
  LdrModel,
  MotorModel,
  AmmeterModel,
  PotModel,
  ResistorModel,
  SwitchModel,
  TransistorModel,
} from '@/engine/devices';
import type { PartDef, PartParams } from '@/engine/types';

const numEnum = (key: string, label: string, values: number[], unit: string, def?: number) => ({
  key,
  label,
  type: 'enum' as const,
  default: def ?? values[Math.floor(values.length / 2)],
  unit,
  options: values.map((v) => ({ value: v, label: String(v) })),
});

export const PART_DEFS: PartDef[] = [
  {
    type: 'battery',
    category: 'power',
    nameKey: 'part.battery.name',
    eduKey: 'part.battery.edu',
    difficulty: 1,
    pins: [
      { id: 'pos', x: 44, y: 0, label: '+' },
      { id: 'neg', x: -44, y: 0, label: '−' },
    ],
    params: [numEnum('voltage', 'Voltage', [1.5, 3, 4.5, 9], 'V', 3)],
    size: { w: 96, h: 44 },
    createModel: (id: string, p: PartParams) => new BatteryModel(id, p),
  },
  {
    type: 'resistor',
    category: 'basic',
    nameKey: 'part.resistor.name',
    eduKey: 'part.resistor.edu',
    difficulty: 1,
    pins: [
      { id: 'a', x: -42, y: 0 },
      { id: 'b', x: 42, y: 0 },
    ],
    params: [numEnum('resistance', 'Resistance', [100, 220, 330, 1000, 10_000], 'Ω', 220)],
    size: { w: 84, h: 28 },
    createModel: (id: string, p: PartParams) => new ResistorModel(id, p),
  },
  {
    type: 'led',
    category: 'output',
    nameKey: 'part.led.name',
    eduKey: 'part.led.edu',
    difficulty: 1,
    pins: [
      { id: 'anode', x: -32, y: 0, label: 'A' },
      { id: 'cathode', x: 32, y: 0, label: 'K' },
    ],
    params: [
      {
        key: 'color',
        label: 'Color',
        type: 'enum',
        default: 'red',
        options: [
          { value: 'red', label: 'Red' },
          { value: 'yellow', label: 'Yellow' },
          { value: 'green', label: 'Green' },
          { value: 'blue', label: 'Blue' },
        ],
      },
    ],
    size: { w: 64, h: 40 },
    createModel: (id: string, p: PartParams) => new LedModel(id, p),
  },
  {
    type: 'switch',
    category: 'input',
    nameKey: 'part.switch.name',
    eduKey: 'part.switch.edu',
    difficulty: 1,
    pins: [
      { id: 'a', x: -38, y: 0 },
      { id: 'b', x: 38, y: 0 },
    ],
    params: [{ key: 'closed', label: 'Closed', type: 'boolean', default: false }],
    size: { w: 76, h: 36 },
    createModel: (id: string, p: PartParams) => new SwitchModel(id, p),
  },
  {
    type: 'button',
    category: 'input',
    nameKey: 'part.button.name',
    eduKey: 'part.button.edu',
    difficulty: 1,
    pins: [
      { id: 'a', x: -34, y: 0 },
      { id: 'b', x: 34, y: 0 },
    ],
    params: [],
    size: { w: 68, h: 36 },
    createModel: (id: string) => new ButtonModel(id, {}),
  },
  {
    type: 'ammeter',
    category: 'tools',
    nameKey: 'part.ammeter.name',
    eduKey: 'part.ammeter.edu',
    difficulty: 2,
    pins: [
      { id: 'a', x: -32, y: 0 },
      { id: 'b', x: 32, y: 0 },
    ],
    params: [],
    size: { w: 64, h: 44 },
    createModel: (id: string) => new AmmeterModel(id, {}),
  },
  {
    type: 'potentiometer',
    category: 'input',
    nameKey: 'part.potentiometer.name',
    eduKey: 'part.potentiometer.edu',
    difficulty: 2,
    pins: [
      { id: 'a', x: -38, y: 0 },
      { id: 'w', x: 0, y: 16 },
      { id: 'b', x: 38, y: 0 },
    ],
    params: [
      numEnum('resistance', 'Resistance', [1000, 10_000, 50_000], 'Ω', 10_000),
      {
        key: 'taper',
        label: 'Position',
        type: 'range',
        default: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        liveControl: true,
      },
    ],
    size: { w: 84, h: 52 },
    createModel: (id: string, p: PartParams) => new PotModel(id, p),
  },
  {
    type: 'capacitor',
    category: 'basic',
    nameKey: 'part.capacitor.name',
    eduKey: 'part.capacitor.edu',
    difficulty: 2,
    pins: [
      { id: 'pos', x: -30, y: 0, label: '+' },
      { id: 'neg', x: 30, y: 0, label: '−' },
    ],
    params: [
      numEnum('capacitance', 'Capacitance', [10, 47, 100, 470, 1000], 'µF', 100),
      {
        key: 'polarity',
        label: 'Type',
        type: 'enum',
        default: 'electrolytic',
        options: [
          { value: 'electrolytic', label: 'Electrolytic (+/−)' },
          { value: 'none', label: 'Ceramic' },
        ],
      },
    ],
    size: { w: 60, h: 44 },
    createModel: (id: string, p: PartParams) => new CapacitorModel(id, p),
  },
  {
    type: 'diode',
    category: 'basic',
    nameKey: 'part.diode.name',
    eduKey: 'part.diode.edu',
    difficulty: 2,
    pins: [
      { id: 'anode', x: -32, y: 0 },
      { id: 'cathode', x: 32, y: 0 },
    ],
    params: [],
    size: { w: 64, h: 28 },
    createModel: (id: string) => new DiodeModel(id, {}),
  },
  {
    type: 'ldr',
    category: 'sensors',
    nameKey: 'part.ldr.name',
    eduKey: 'part.ldr.edu',
    difficulty: 2,
    pins: [
      { id: 'a', x: -32, y: 0 },
      { id: 'b', x: 32, y: 0 },
    ],
    params: [
      {
        key: 'light',
        label: 'Light',
        type: 'range',
        default: 0.7,
        min: 0,
        max: 1,
        step: 0.01,
        liveControl: true,
      },
    ],
    size: { w: 64, h: 40 },
    createModel: (id: string) => new LdrModel(id, {}),
  },
  {
    type: 'buzzer',
    category: 'output',
    nameKey: 'part.buzzer.name',
    eduKey: 'part.buzzer.edu',
    difficulty: 2,
    pins: [
      { id: 'a', x: -30, y: 0, label: '+' },
      { id: 'b', x: 30, y: 0, label: '−' },
    ],
    params: [],
    size: { w: 60, h: 44 },
    createModel: (id: string) => new BuzzerModel(id, {}),
  },
  {
    type: 'motor',
    category: 'output',
    nameKey: 'part.motor.name',
    eduKey: 'part.motor.edu',
    difficulty: 2,
    pins: [
      { id: 'a', x: -32, y: 0 },
      { id: 'b', x: 32, y: 0 },
    ],
    params: [],
    size: { w: 64, h: 48 },
    createModel: (id: string) => new MotorModel(id, {}),
  },
  {
    type: 'transistor',
    category: 'basic',
    nameKey: 'part.transistor.name',
    eduKey: 'part.transistor.edu',
    difficulty: 3,
    pins: [
      { id: 'base', x: -40, y: 0, label: 'B' },
      { id: 'collector', x: 26, y: -26, label: 'C' },
      { id: 'emitter', x: 26, y: 26, label: 'E' },
    ],
    params: [],
    size: { w: 76, h: 64 },
    createModel: (id: string) => new TransistorModel(id, {}),
  },
];

export const PART_MAP: Map<string, PartDef> = new Map(PART_DEFS.map((d) => [d.type, d]));

export const CATEGORY_ORDER = ['power', 'basic', 'input', 'output', 'sensors', 'tools'] as const;

/** fresh component instance factory (used by editor palette & content) */
let idCounter = 0;
export const freshId = (prefix = 'c') => `${prefix}${Date.now().toString(36)}${(idCounter++).toString(36)}`;

export function makeComponent(
  type: string,
  overrides: Partial<{ id: string; x: number; y: number; rotation: number; params: PartParams }> = {},
) {
  const def = PART_MAP.get(type);
  if (!def) throw new Error(`unknown part type: ${type}`);
  const params: PartParams = {};
  for (const p of def.params) params[p.key] = p.default;
  return {
    id: overrides.id ?? freshId(type),
    type,
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    rotation: overrides.rotation ?? 0,
    params: { ...params, ...(overrides.params ?? {}) },
  };
}
