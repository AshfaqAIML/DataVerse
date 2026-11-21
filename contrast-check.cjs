/* WCAG 1.4.3 spot check: compute real rendered contrast ratios for the
   text/fill pairs that matter most, in both themes. */
const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto("http://localhost:3000/#/lesson/a-01", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1200);
  for (const scheme of ["light", "dark"]) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.waitForTimeout(300);
    const r = await page.evaluate(() => {
      const lum = (rgb) => {
        const [r, g, b] = rgb.map((v) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const parse = (c) => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const ratio = (fg, bg) => {
        const l1 = lum(parse(fg)), l2 = lum(parse(bg));
        return ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2);
      };
      const body = getComputedStyle(document.body);
      const canvas = body.backgroundColor;
      const probe = (sel, prop = "color", bg = canvas) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        return { sel, ratio: ratio(getComputedStyle(el)[prop], bg) };
      };
      return [
        probe("p.dv-lesson-text"),
        probe(".dv-kicker"),
        probe(".t-caption"),
        probe("aside .text-ink-3"),
        probe("footer"),
        probe("button.text-primary-foreground", "color", getComputedStyle(document.querySelector("button.bg-primary") ?? document.body).backgroundColor),
      ].filter(Boolean);
    });
    console.log(scheme.toUpperCase(), JSON.stringify(r));
  }
  await browser.close();
})();
