const { chromium } = require("playwright");
const shots = [
  // [name, hash, width, height, fullPage, actions]
  ["home-390", "#/", 390, 844, false],
  ["lesson-390-top", "#/lesson/a-01", 390, 844, false],
  ["lesson-390-mid", "#/lesson/a-01", 390, 844, false, async (p) => { await p.evaluate(() => window.scrollTo(0, 1400)); await p.waitForTimeout(400); }],
  ["math-lesson-390", "#/math/lesson/a-01", 390, 844, false, async (p) => { await p.evaluate(() => window.scrollTo(0, 900)); await p.waitForTimeout(400); }],
  ["visual-vectors-390", "#/visual/vectors", 390, 844, false, async (p) => { await p.evaluate(() => window.scrollTo(0, 500)); await p.waitForTimeout(400); }],
  ["lab-390", "#/lab/python", 390, 844, false],
  ["assessment-390", "#/assessment/cmwp4piiy002wkdsj0rdv5hsl", 390, 844, false],
  ["lesson-1100", "#/lesson/a-01", 1100, 800, false],
  ["lesson-1536", "#/lesson/a-01", 1536, 900, false],
  ["home-1920", "#/", 1920, 1000, false],
  ["dashboard-390", "#/dashboard", 390, 844, false],
  ["explore-390", "#/explore", 390, 844, false],
];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  for (const [name, hash, w, h, full, action] of shots) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("http://localhost:3000/" + hash, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(1500);
    if (action) await action(page);
    await page.screenshot({ path: `scratch/viewport/${name}.png`, fullPage: full });
    console.log("shot", name);
  }
  await browser.close();
})();
