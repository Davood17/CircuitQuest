(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const hasMore = () => !!document.querySelector('main [role=button] .animate-ping');
  for (let i = 0; i < 16; i++) {
    const b = document.querySelector('main [role=button]');
    if (!b || !hasMore()) break;
    b.click();
    await sleep(120);
  }
  await sleep(400);
  const n = [...document.querySelectorAll('footer button')].filter(b => !b.disabled).pop();
  if (n) { n.click(); await sleep(900); }
  return 'on: ' + document.querySelector('main h2')?.textContent.slice(0, 25);
})()
