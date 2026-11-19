'use client';

/**
 * Data for the illustrated "device pages" (Task 16) — one page per device,
 * modeled after the user's 5 reference images (realistic photos cropped
 * from upload/ref-pages into public/ref/**).
 * Photos are language-neutral; all text is bilingual via LocaleText.
 */

import { L } from '@/content/helpers';
import type { LocaleText } from '@/lib/i18n';

export type DevicePageId = 'phone' | 'console' | 'robot' | 'car' | 'bell';

export interface PagePartDef {
  id: string;
  emoji: string;
  photo: string;
  name: LocaleText;
  desc: LocaleText;
}

export interface DevicePageDef {
  id: DevicePageId;
  emoji: string;
  name: LocaleText;
  /** public asset paths */
  full: string;
  internal: string;
  exploded: string;
  parts: PagePartDef[];
}

const ref = (dev: string, file: string) => `/ref/${dev}/${file}.png`;
const part = (dev: string, id: string) => `/ref/${dev}/parts/${id}.png`;

export const DEVICE_PAGES: DevicePageDef[] = [
  {
    id: 'phone',
    emoji: '📱',
    name: L('Smartphone', 'گوشی هوشمند'),
    full: ref('phone', 'full'),
    internal: ref('phone', 'internal'),
    exploded: ref('phone', 'exploded'),
    parts: [
      { id: 'case', emoji: '📱', photo: ref('phone', 'full'), name: L('Body & frame', 'بدنه و قاب'), desc: L('The skeleton — all the other parts live inside it.', 'اسکلتِ گوشی؛ همهٔ قطعه‌های دیگر داخلش جا می‌شوند.') },
      { id: 'battery', emoji: '🔋', photo: part('phone', 'battery'), name: L('Battery', 'باتری'), desc: L('Gives the phone all the energy it needs.', 'انرژی مورد نیاز گوشی را تأمین می‌کند.') },
      { id: 'board', emoji: '🧠', photo: part('phone', 'board'), name: L('Main board', 'برد اصلی'), desc: L('The phone brain — it controls everything.', 'مغزِ گوشی؛ همه‌چیز را کنترل می‌کند.') },
      { id: 'camera', emoji: '📷', photo: part('phone', 'camera'), name: L('Camera', 'دوربین'), desc: L('Captures photos and videos.', 'تصویرها و ویدیوها را ثبت می‌کند.') },
      { id: 'screen', emoji: '🖼️', photo: part('phone', 'screen'), name: L('Display', 'صفحهٔ نمایش'), desc: L('Shows the user everything.', 'همه‌چیز را به کاربر نشان می‌دهد.') },
      { id: 'cpu', emoji: '⚙️', photo: part('phone', 'cpu'), name: L('Processor', 'پردازنده'), desc: L('Processes all the commands, super fast!', 'همهٔ فرمان‌ها را خیلی سریع پردازش می‌کند.') },
      { id: 'port', emoji: '🔌', photo: part('phone', 'port'), name: L('Charging port', 'پورت شارژ'), desc: L('For charging the phone and moving data.', 'برای شارژ شدن و جابه‌جایی داده‌هاست.') },
      { id: 'speaker', emoji: '🔊', photo: part('phone', 'speaker'), name: L('Speaker', 'اسپیکر'), desc: L('Plays the phone sounds.', 'صدای گوشی را پخش می‌کند.') },
    ],
  },
  {
    id: 'console',
    emoji: '🎮',
    name: L('Game console', 'کنسول بازی'),
    full: ref('console', 'full'),
    internal: ref('console', 'internal'),
    exploded: ref('console', 'exploded'),
    parts: [
      { id: 'battery', emoji: '🔋', photo: part('console', 'battery'), name: L('Battery', 'باتری'), desc: L('Gives the console all the energy it needs.', 'انرژی مورد نیاز کنسول را تأمین می‌کند.') },
      { id: 'board', emoji: '🧠', photo: part('console', 'board'), name: L('Control board', 'برد کنترل'), desc: L('Processes the game commands.', 'فرمان‌های بازی را پردازش می‌کند.') },
      { id: 'fan', emoji: '🌀', photo: part('console', 'fan'), name: L('Cooling fan', 'فن خنک‌کننده'), desc: L('Keeps the console cool so it never gets too hot.', 'کنسول را خنک نگه می‌دارد تا گرم نشود.') },
      { id: 'screen', emoji: '🖼️', photo: part('console', 'screen'), name: L('Display', 'صفحهٔ نمایش'), desc: L('Shows the game picture.', 'تصویر بازی را نشان می‌دهد.') },
      { id: 'joystick', emoji: '🕹️', photo: part('console', 'joystick'), name: L('Joystick', 'جوی‌استیک'), desc: L('Controls the direction of movement.', 'حرکت و جهت را کنترل می‌کند.') },
      { id: 'buttons', emoji: '🎮', photo: part('console', 'buttons'), name: L('Buttons', 'دکمه‌ها'), desc: L('They run the game commands.', 'فرمان‌های بازی را اجرا می‌کنند.') },
    ],
  },
  {
    id: 'robot',
    emoji: '🤖',
    name: L('Robot', 'ربات'),
    full: ref('robot', 'full'),
    internal: ref('robot', 'internal'),
    exploded: ref('robot', 'exploded'),
    parts: [
      { id: 'battery', emoji: '🔋', photo: part('robot', 'battery'), name: L('Battery', 'باتری'), desc: L('Gives the robot all the energy it needs.', 'انرژی مورد نیاز ربات را تأمین می‌کند.') },
      { id: 'board', emoji: '🧠', photo: part('robot', 'board'), name: L('Control board', 'برد کنترل'), desc: L('The robot brain — it sends the orders.', 'مغز ربات؛ فرمان‌ها را می‌فرستد.') },
      { id: 'motor', emoji: '⚙️', photo: part('robot', 'motor'), name: L('Motor', 'موتور'), desc: L('Makes the robot move.', 'باعث حرکت ربات می‌شود.') },
      { id: 'sensor', emoji: '👁️', photo: part('robot', 'sensor'), name: L('Sensor', 'سنسور'), desc: L('Helps the robot feel the world around it.', 'به ربات کمک می‌کند محیط اطرافش را حس کند.') },
      { id: 'led', emoji: '💡', photo: part('robot', 'led'), name: L('LED', 'LED'), desc: L('Makes light when current flows through it.', 'با عبور جریان، نور تولید می‌کند.') },
      { id: 'wires', emoji: '🔌', photo: part('robot', 'wires'), name: L('Wires', 'سیم‌ها'), desc: L('They make the path for the current.', 'مسیر حرکت جریان را فراهم می‌کنند.') },
      { id: 'speaker', emoji: '🔊', photo: part('robot', 'speaker'), name: L('Speaker', 'بلندگو'), desc: L('Plays the robot sounds.', 'صداهای ربات را پخش می‌کند.') },
    ],
  },
  {
    id: 'car',
    emoji: '🚗',
    name: L('Car', 'ماشین'),
    full: ref('car', 'full'),
    internal: ref('car', 'internal'),
    exploded: ref('car', 'exploded'),
    parts: [
      { id: 'battery', emoji: '🔋', photo: part('car', 'battery'), name: L('Battery', 'باتری'), desc: L('Gives the car all the energy it needs.', 'انرژی مورد نیاز ماشین را تأمین می‌کند.') },
      { id: 'motor', emoji: '⚙️', photo: part('car', 'motor'), name: L('Motor', 'موتور'), desc: L('Makes the car move.', 'باعث حرکت ماشین می‌شود.') },
      { id: 'control', emoji: '🧠', photo: part('car', 'control'), name: L('Control circuit', 'مدار کنترل'), desc: L('It gives orders to all the parts.', 'به همهٔ قطعه‌ها فرمان می‌دهد.') },
      { id: 'wires', emoji: '🔌', photo: part('car', 'wires'), name: L('Wires', 'سیم‌ها'), desc: L('They connect the parts to each other.', 'قطعه‌های مختلف را به هم وصل می‌کنند.') },
      { id: 'lights', emoji: '💡', photo: part('car', 'lights'), name: L('Lights', 'چراغ‌ها'), desc: L('They light up for better view and safety.', 'برای دیدِ بهتر و ایمنی روشن می‌شوند.') },
      { id: 'wheels', emoji: '🛞', photo: part('car', 'wheels'), name: L('Wheels', 'چرخ‌ها'), desc: L('They let the car move around.', 'به ماشین اجازهٔ حرکت دادن می‌دهند.') },
    ],
  },
  {
    id: 'bell',
    emoji: '🔔',
    name: L('Electric bell', 'زنگ الکتریکی'),
    full: ref('bell', 'full'),
    internal: ref('bell', 'internal'),
    exploded: ref('bell', 'exploded'),
    parts: [
      { id: 'button', emoji: '🔘', photo: part('bell', 'button'), name: L('Bell button', 'دکمهٔ زنگ'), desc: L('When pressed, it sends the order to the circuit.', 'وقتی فشار داده شود، فرمان را به مدار می‌فرستد.') },
      { id: 'board', emoji: '🧠', photo: part('bell', 'board'), name: L('Control board', 'برد کنترل'), desc: L('It processes the order and sends it to the parts.', 'فرمان را پردازش می‌کند و به قطعه‌ها می‌فرستد.'), },
      { id: 'speaker', emoji: '🔊', photo: part('bell', 'speaker'), name: L('Sounder', 'بلندگو'), desc: L('It makes the bell sound.', 'صدای زنگ را تولید می‌کند.') },
      { id: 'battery', emoji: '🔋', photo: part('bell', 'battery'), name: L('Battery', 'باتری'), desc: L('Gives the bell all the energy it needs.', 'انرژی مورد نیاز زنگ را تأمین می‌کند.') },
      { id: 'wires', emoji: '🔌', photo: part('bell', 'wires'), name: L('Wires', 'سیم‌ها'), desc: L('They connect the parts to each other.', 'اجزای مختلف را به هم متصل می‌کنند.') },
      { id: 'case', emoji: '📦', photo: part('bell', 'case'), name: L('Case', 'قاب بدنه'), desc: L('It protects the parts inside.', 'از قطعه‌های داخلی محافظت می‌کند.') },
      { id: 'screws', emoji: '🔩', photo: part('bell', 'screws'), name: L('Screws', 'پیچ‌ها'), desc: L('They hold the case tight.', 'قاب را محکم نگه می‌دارند.') },
    ],
  },
];
