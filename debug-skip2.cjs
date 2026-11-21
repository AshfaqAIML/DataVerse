const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto("http://localhost:3000/#/lesson/a-01", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.keyboard.press("Tab");
  const st = await page.evaluate(() => {
    const el = document.activeElement;
    const cs = getComputedStyle(el);
    return {
      isFocus: el.matches(":focus"),
      isFocusVisible: el.matches(":focus-visible"),
      opacity: cs.opacity,
      transition: cs.transitionDuration,
      rules: Array.from(document.styleSheets).flatMap((sh) => {
        try { return Array.from(sh.cssRules); } catch { return []; }
      }).filter((r) => r.cssText?.includes?.("dv-skip-link")).map((r) => r.cssText.slice(0, 120)),
    };
  });
  console.log(JSON.stringify(st, null, 1));
  await page.waitForTimeout(400);
  const later = await page.evaluate(() => getComputedStyle(document.activeElement).opacity);
  console.log("opacity after 400ms:", later);
  await browser.close();
})();
