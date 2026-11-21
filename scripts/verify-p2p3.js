(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const hasMore = () => !!document.querySelector('main [role=button] .animate-ping');
  const find = (t) => [...document.querySelectorAll('main button')].find(b => b.textContent.includes(t));
  const nextBtn = () => [...document.querySelectorAll('footer button')].filter(b => !b.disabled).pop();
  const cur = () => document.querySelector('main h2')?.textContent || '';
  const wrap = () => document.querySelector('main > div > div.-mx-3');
  const log = [];

  // --- page 1: tap through speech, then next
  for (let i = 0; i < 16; i++) {
    const b = document.querySelector('main [role=button]');
    if (!b || !hasMore()) break;
    b.click();
    await sleep(130);
  }
  await sleep(400);
  nextBtn()?.click();
  await sleep(900);
  log.push('p2: ' + cur().slice(0, 12));

  // --- page 2: measure wrapper + counter, tap speech, do mission (green + speed 2)
  const w = wrap();
  const rw = w.getBoundingClientRect();
  const first = w.firstElementChild.getBoundingClientRect();
  log.push('p2 wrap ' + Math.round(rw.top) + '-' + Math.round(rw.bottom) + ' content bottom ' + Math.round(first.bottom));
  for (let i = 0; i < 16; i++) {
    const b = document.querySelector('main [role=button]');
    if (!b || !hasMore()) break;
    b.click();
    await sleep(130);
  }
  await sleep(300);
  const btnState = () => {
    const btn = [...document.querySelectorAll('footer button')].pop();
    return { counter: document.querySelector('footer p')?.textContent.trim() || 'none', fill: btn.querySelector('span[aria-hidden]')?.style.width || 'none', disabled: btn.disabled };
  };
  log.push('p2 after speech: ' + JSON.stringify(btnState()));
  document.querySelector('button[aria-label="نور سبز"]')?.click();
  await sleep(200);
  [...document.querySelectorAll('main button')].filter(b => b.textContent.trim() === '۲')[0]?.click();
  await sleep(600);
  log.push('p2 after mission: ' + JSON.stringify(btnState()));
  nextBtn()?.click();
  await sleep(900);
  log.push('p3: ' + cur().slice(0, 12));

  return 'LOG:\n' + log.join('\n');
})()
