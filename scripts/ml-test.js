(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const b = [...document.querySelectorAll("main button")].find(x => x.textContent.includes("موتور"));
  b.click();
  await sleep(300);
  return "multi-line ok: " + (b.textContent.includes("✅") ? "yes" : "no");
})()