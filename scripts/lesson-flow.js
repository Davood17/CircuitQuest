(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const $btns = () => [...document.querySelectorAll('main button')];
  const byText = (t, scope) => (scope || $btns()).find(b => b.textContent.trim().includes(t));
  const hasMore = () => !!document.querySelector('main [role=button] .animate-ping');
  const tapSpeech = async () => {
    for (let i = 0; i < 16; i++) {
      const b = document.querySelector('main [role=button]');
      if (!b || !hasMore()) break;
      b.click();
      await sleep(130);
    }
  };
  const footerNext = () => [...document.querySelectorAll('footer button')].filter(b => !b.disabled).pop();
  const cur = () => document.querySelector('main h2')?.textContent || '';
  const log = [];

  // ---- page 3: toy hospital challenge
  if (cur().includes('تشریح')) {
    for (const p of ['باتری', 'مغز الکترونیکی', 'موتور', 'سیم‌ها']) {
      byText(p)?.click();
      await sleep(220);
    }
    byText('برق رو وصل کن')?.click();
    await sleep(700);
    byText('چپ', $btns().filter(b => b.textContent.includes('⏪') || b.textContent.includes('⏩')))?.click();
    await sleep(550);
    byText('راست', $btns().filter(b => b.textContent.includes('⏩') || b.textContent.includes('⏪')))?.click();
    await sleep(800);
    await tapSpeech();
    await sleep(500);
    const n = footerNext();
    if (n) { n.click(); await sleep(900); }
    log.push('p3 done -> ' + cur().slice(0, 15));
  }

  // ---- page 4: quiz
  if (cur().includes('آزمون')) {
    await tapSpeech();
    await sleep(400);
    const answers = [0, 1, 2];
    for (const a of answers) {
      const os = $btns().filter(b => /^[ABC]/.test(b.textContent.trim()));
      if (!os.length) { log.push('no options!'); break; }
      os[a]?.click();
      await sleep(300);
      byText('بررسی')?.click();
      await sleep(1000);
      // after correct: next-question or finish button (teal, in quiz area)
      const cont = $btns().find(b => b.className.includes('bg-teal-600') && (b.textContent.includes('بعدی') || b.textContent.includes('پایان')));
      if (cont) { cont.click(); await sleep(1000); }
    }
    await sleep(600);
    // quiz finished panel: the teal next inside main
    const panelNext = $btns().find(b => b.className.includes('bg-teal-600') && b.textContent.includes('بعدی'));
    if (panelNext) { panelNext.click(); await sleep(800); }
    await sleep(600);
    const n = footerNext();
    if (n && !n.disabled) { n.click(); await sleep(1000); }
    log.push('quiz done -> ' + cur().slice(0, 15));
  }

  return 'LOG: ' + log.join(' || ') + ' || FINAL: ' + cur().slice(0, 40);
})()
