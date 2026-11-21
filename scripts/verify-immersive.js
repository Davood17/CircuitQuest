(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  await sleep(300);
  const out = {};

  // 1. gradient backdrop layer
  const layer = document.querySelector('div.pointer-events-none.absolute.inset-0');
  out.layer = layer ? {
    grad: getComputedStyle(layer).backgroundImage.slice(0, 80),
    w: layer.getBoundingClientRect().width,
    h: layer.getBoundingClientRect().height,
    z: getComputedStyle(layer).zIndex,
  } : null;

  // 2. header / footer translucency
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');
  out.header = header ? { bg: getComputedStyle(header).backgroundColor, blur: getComputedStyle(header).backdropFilter } : null;
  out.footer = footer ? { bg: getComputedStyle(footer).backgroundColor, pos: getComputedStyle(footer).position, top: footer.getBoundingClientRect().top } : null;

  // 3. scene svg geometry + card-look removal
  const svg = document.querySelector('main svg[viewBox="0 0 640 560"]');
  if (svg) {
    const r = svg.getBoundingClientRect();
    const cs = getComputedStyle(svg);
    out.svg = {
      x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
      bottom: Math.round(r.bottom),
      border: cs.borderTopWidth, radius: cs.borderRadius, bg: cs.backgroundColor,
      hasSkyRect: !!document.querySelector('main svg rect[fill="url(#cq-command-sky)"]'),
    };
  }

  // 4. speech bubble sits on the wall (its top must be below header, above the drawing)
  const bubble = document.querySelector('main [role=button]');
  if (bubble) {
    const r = bubble.getBoundingClientRect();
    out.bubble = { top: Math.round(r.top), bottom: Math.round(r.bottom) };
  }

  // 5. main is above the backdrop layer
  const main = document.querySelector('main');
  out.main = main ? { pos: getComputedStyle(main).position, z: getComputedStyle(main).zIndex } : null;

  // 6. svg drawing top vs bubble bottom (the gap region shows the page gradient)
  if (out.svg && out.bubble) out.gapPx = out.svg.y > out.bubble.bottom ? out.svg.y - out.bubble.bottom : 0;

  return JSON.stringify(out, null, 1);
})()
