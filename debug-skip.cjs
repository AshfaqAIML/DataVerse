const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto("http://localhost:3000/#/lesson/a-01", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  // what is the first tabbable element in DOM order?
  const firstTab = await page.evaluate(() => {
    const sel = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const el = document.querySelector(sel);
    return { tag: el?.tagName, cls: (el?.className || "").toString().slice(0, 40), text: el?.textContent?.slice(0, 30) };
  });
  console.log("first tabbable in DOM:", JSON.stringify(firstTab));
  await page.keyboard.press("Tab");
  const after = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    cls: (document.activeElement?.className || "").toString().slice(0, 50),
    opacity: document.activeElement ? getComputedStyle(document.activeElement).opacity : null,
    transform: document.activeElement ? getComputedStyle(document.activeElement).transform : null,
  }));
  console.log("after 1 Tab:", JSON.stringify(after));
  await browser.close();
})();
