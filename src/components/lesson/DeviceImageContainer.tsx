'use client';

/**
 * DeviceImageContainer — the ONE shared image box for the whole discovery
 * system (Task 17). Every device/component photo — home cards, hero views
 * (full / internal / exploded), sidebar thumbnails, part cards, discovery
 * thumbnails and any future device — must render through this component.
 *
 * Guarantees, for every image and every aspect ratio:
 *   • the object is always COMPLETE (object-contain — never cover/crop)
 *   • it is centered horizontally AND vertically in its box
 *   • the box has a fixed aspect-ratio, so layout is stable before load
 *     and identical across devices for the same tier of image
 *   • the image can never overflow, stretch, distort, or leak into a
 *     sibling card (absolute fit inside an overflow-hidden frame)
 *   • consistent padding keeps objects off the frame edges
 *   • fully responsive — sizes come from the parent's width, never from
 *     device-specific pixel coordinates
 *
 * Rendering rules by purpose (chosen here, not per page):
 *   main device views  → ratio 4/3  + pad sm  (complete device first)
 *   component cards    → ratio 1/1  + pad sm  (complete component first)
 *   thumbnails         → ratio 1/1  + pad none/xs
 * Background space may remain — a complete object beats a filled box.
 */

import type { CSSProperties } from 'react';

/** consistent breathing room between the object and its frame */
export type DeviceImagePad = 'none' | 'xs' | 'sm' | 'md';

const PAD: Record<DeviceImagePad, string> = {
  none: 'p-0',
  xs: 'p-1 sm:p-1.5',
  sm: 'p-1.5 sm:p-2.5',
  md: 'p-2.5 sm:p-3.5',
};

/** standard ratios so every tier of image looks the same across devices */
export const IMG_RATIO = {
  square: '1 / 1',
  view: '4 / 3',
} as const;

export function DeviceImageContainer({
  src,
  alt,
  ratio = IMG_RATIO.square,
  pad = 'xs',
  rounded = 'rounded-xl',
  className = '',
  imgClassName = '',
  eager = false,
  style,
}: {
  src: string;
  alt: string;
  /** CSS aspect-ratio of the reserved box, e.g. '1 / 1' or '4 / 3' */
  ratio?: string;
  pad?: DeviceImagePad;
  rounded?: string;
  /** extras for the frame: background, border, size… */
  className?: string;
  /** extras for the <img> itself (rare) */
  imgClassName?: string;
  /** above-the-fold images only */
  eager?: boolean;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`relative block overflow-hidden ${rounded} ${className}`}
      style={{ aspectRatio: ratio, ...style }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={`absolute inset-0 h-full w-full object-contain select-none ${PAD[pad]} ${imgClassName}`}
      />
    </span>
  );
}
