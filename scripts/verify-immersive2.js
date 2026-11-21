(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const out = {};
  const sceneRect = () => {
    const s = document.querySelector('main svg[viewBox="0 0 640 560"]');
    if (!s) return null;
    const r = s.getBoundingClientRect();
    return { y: Math.round(r.y), bottom: Math.round(r.bottom), w: Math.round(r.width) };
  };

  // A. furniture stability across dialogue chunks
  const rects = [];
  const bubble = () => document.querySelector('main [role=button]');
  for (let i = 0; i < 12; i++) {
    const b = bubble();
    if (!b || !b.querySelector('.animate-ping')) break;
    b.click();
    await sleep(150);
    rects.push(sceneRect());
  }
  await sleep(300);
  rects.push(sceneRect());
  const stable = rects.every(r => r && r.bottom === rects[0].bottom && r.w === rects[0].w);
  out.furnitureStable = stable;
  out.sceneRects = [rects[0], rects[rects.length - 1]];

  // B. gate counter + progress-fill button on page 1
  const counter = document.querySelector('footer p[aria-live]')?.textContent?.trim();
  const fill = document.querySelector('footer button span[aria-hidden]');
  out.counter = counter ?? null;
  out.fillWidth = fill ? fill.style.width : null;
  const nextBtn = [...document.querySelectorAll('footer button')].pop();
  out.nextEnabled = !nextBtn.disabled;
  out.nextText = nextBtn.textContent.trim().slice(0, 20);

  // C. go to page 2 → immersive must be OFF there
  nextBtn.click();
  await sleep(900);
  out.p2 = {
    heading: document.querySelector('main h2')?.textContent.slice(0, 30),
    hasGradientLayer: !!document.querySelector('div.pointer-events-none.absolute.inset-0'),
    footerBg: getComputedStyle(document.querySelector('footer')).backgroundColor,
    mainZ: getComputedStyle(document.querySelector('main')).zIndex,
  };

  return JSON.stringify(out, null, 1);
})()
