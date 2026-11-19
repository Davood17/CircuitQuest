import type { LocaleText } from '@/lib/i18n';
import { L } from '@/content/helpers';

/**
 * The six discoverable parts inside the 3D robot — shared by the R3F scene
 * (labels/hit-targets) and the overlay wrapper (footer info card).
 * Kept three-free so the wrapper stays light and the scene chunk stays lazy.
 */

export type V3 = [number, number, number];

export interface RobotPartDef {
  id: string;
  emoji: string;
  name: LocaleText;
  desc: LocaleText;
  base: V3; // tucked position (closed robot)
  open: V3; // exploded position
}

export const ROBOT_PARTS: RobotPartDef[] = [
  {
    id: 'board', emoji: '🧠', name: L('Control board', 'برد کنترل'),
    desc: L('Controls all the robot\u2019s commands.', 'فرمان\u200cهای ربات را کنترل می\u200cکند.'),
    base: [0, 0.08, 0.16], open: [0, 0.62, 0.95],
  },
  {
    id: 'battery', emoji: '🔋', name: L('Battery', 'باتری'),
    desc: L('Gives the robot all its energy.', 'انرژی ربات را تأمین می\u200cکند.'),
    base: [-0.3, -0.36, 0.2], open: [-0.95, 0.12, 1.35],
  },
  {
    id: 'motor', emoji: '⚙️', name: L('Motor', 'موتور'),
    desc: L('Makes the robot move.', 'باعث حرکت ربات می\u200cشود.'),
    base: [0.37, -0.34, 0.18], open: [0.95, 0.08, 1.3],
  },
  {
    id: 'led', emoji: '💡', name: L('LED', 'ال\u200cای\u200cدی'),
    desc: L('Makes light when current flows.', 'با عبور جریان، نور تولید می\u200cکند.'),
    base: [0.46, 0.26, 0.3], open: [0.6, 0.75, 1.1],
  },
  {
    id: 'sensor', emoji: '👁️', name: L('Sensor', 'سنسور'),
    desc: L('Helps the robot sense the world around it.', 'به ربات کمک می\u200cکند محیط اطرافش را حس کند.'),
    base: [0, 0.4, 0.4], open: [0, 1.18, 0.9],
  },
  {
    id: 'wires', emoji: '🔌', name: L('Wires', 'سیم\u200cها'),
    desc: L('Make a path for the current to flow.', 'مسیر حرکت جریان را فراهم می\u200cکنند.'),
    base: [0, -0.3, 0.26], open: [0, -0.28, 1.65],
  },
];
