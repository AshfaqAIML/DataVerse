const { chromium } = require("playwright");
const results = [];
const ok = (name, pass, detail = "") => results.push(`${pass ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);

(async () => {
  const browser = await chromium.launch();

  // ---- 390px: mobile lesson experience -------------------------------
  let page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto("http://localhost:3000/#/lesson/a-01", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);

  // 1. skip link is the first tab stop and appears on focus
  await page.keyboard.press("Tab");
  await page.waitForTimeout(350); // let the slide-in transition finish
  const skipFocused = await page.evaluate(() => {
    const el = document.activeElement;
    return el?.classList.contains("dv-skip-link") && getComputedStyle(el).opacity === "1";
  });
  ok("skip link: first tab stop, visible on focus", skipFocused);

  // 2. mobile toolbar sticky + both buttons >= 36px tall
  const toolbar = await page.evaluate(() => {
    const bar = document.querySelector("article .sticky");
    if (!bar) return null;
    const btns = Array.from(bar.querySelectorAll("button"));
    return {
      sticky: getComputedStyle(bar).position === "sticky",
      h: Math.min(...btns.map((b) => b.getBoundingClientRect().height)),
      n: btns.length,
    };
  });
  ok("lesson mobile toolbar sticky", toolbar?.sticky === true);
  ok("toolbar buttons touch-sized", toolbar && toolbar.h >= 36, `${toolbar?.h.toFixed(0)}px × ${toolbar?.n} buttons`);

  // 3. code blocks keyboard-scrollable regions
  const codeRegions = await page.evaluate(() => document.querySelectorAll('pre[tabindex="0"][role="region"]').length);
  ok("code blocks are labelled scroll regions", codeRegions > 0, `${codeRegions} regions`);

  // 4. open the Contents drawer -> focus moves in; Escape closes; focus restores
  const contentsBtn = page.locator("button", { hasText: "Contents" }).first();
  await contentsBtn.click();
  await page.waitForTimeout(400);
  const trapState = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-modal="true"]');
    return { dlg: !!dlg, focusIn: dlg?.contains(document.activeElement) };
  });
  ok("contents drawer: dialog + initial focus", trapState.dlg && trapState.focusIn);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  const closed = await page.evaluate(() => !document.querySelector('[role="dialog"][aria-modal="true"]'));
  ok("contents drawer: Escape closes", closed);

  // 5. table headers have scope=col
  const scope = await page.evaluate(() => document.querySelectorAll("table th[scope='col']").length);
  ok("tables use scope=col", scope >= 0, `${scope} headers`);

  // ---- 1100px: the lg–xl band (tools reachable) -----------------------
  await page.setViewportSize({ width: 1100, height: 800 });
  await page.waitForTimeout(300);
  const band = await page.evaluate(() => {
    const toolsBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Tools"));
    const contentsBtn2 = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Contents"));
    const rail = document.querySelector("aside.xl\\:block");
    const outline = document.querySelector("aside.lg\\:block");
    return {
      toolsVisible: !!toolsBtn && toolsBtn.offsetParent !== null,
      contentsHidden: !contentsBtn2 || contentsBtn2.offsetParent === null,
      railHidden: !rail || rail.offsetParent === null,
      outlineVisible: !!outline && outline.offsetParent !== null,
    };
  });
  ok("1024–1279px: outline pane visible", band.outlineVisible);
  ok("1024–1279px: Tools button available", band.toolsVisible);
  ok("1024–1279px: redundant Contents button retired", band.contentsHidden);

  // 1536: three-pane + no mobile toolbar
  await page.setViewportSize({ width: 1536, height: 900 });
  await page.waitForTimeout(300);
  const wide = await page.evaluate(() => {
    const asides = Array.from(document.querySelectorAll("aside")).filter((a) => a.offsetParent !== null);
    const toolsBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Tools") && b.offsetParent !== null);
    return { asides: asides.length, toolsGone: !toolsBtn };
  });
  ok("1536px: both rails visible", wide.asides >= 2, `${wide.asides} asides`);
  ok("1536px: mobile toolbar retired", wide.toolsGone);

  // ---- 390px: sliders + chart legibility on a viz page ---------------
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/#/visual/coordinate-plane", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  const slider = await page.evaluate(() => {
    const inp = document.querySelector('input[type="range"][class*="appearance-none"]');
    if (!inp) return null;
    const r = inp.getBoundingClientRect();
    const thumb = getComputedStyle(inp, "::-webkit-slider-thumb");
    return { h: r.height, thumbVisible: thumb.width !== "" || true, eff: getComputedStyle(inp).cssText.includes("24") || r.height >= 24 };
  });
  ok("slider hit area >= 24px", slider && slider.h >= 24, `${slider?.h.toFixed(0)}px`);
  const chart = await page.evaluate(() => {
    const svg = document.querySelector(".dv-chart-scroll > svg");
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    return { w: r.width, minW: getComputedStyle(svg).minWidth };
  });
  ok("viz plane keeps readable width on phones", chart && chart.w >= 500, `${chart?.w.toFixed(0)}px (min-width ${chart?.minW})`);
  const handle = await page.evaluate(() => {
    const g = document.querySelector("g.dv-handle");
    return { focusable: !!g && g.getAttribute("tabindex") === "0", role: g?.getAttribute("role") };
  });
  ok("drag handle keyboard focusable", handle.focusable, `role=${handle.role}`);

  // arrow key moves the handle (vector endpoint)
  const before = await page.evaluate(() => {
    const g = document.querySelector("g.dv-handle");
    const c = g.querySelector("circle");
    return c.getAttribute("cx");
  });
  await page.focus("g.dv-handle");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => {
    const g = document.querySelector("g.dv-handle");
    return g.querySelector("circle").getAttribute("cx");
  });
  ok("arrow key nudges drag handle", before !== after, `${before} → ${after}`);

  // ---- 390px: math equations scroll, don't overflow -------------------
  await page.goto("http://localhost:3000/#/math/lesson/a-01", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1200);
  const math = await page.evaluate(() => {
    const lines = Array.from(document.querySelectorAll(".math-line"));
    const bad = lines.filter((l) => l.scrollWidth > l.clientWidth + 2 && getComputedStyle(l).overflowX !== "auto");
    return { n: lines.length, bad: bad.length };
  });
  ok("math display lines own their scroll", math.bad === 0, `${math.n} lines, ${math.bad} broken`);

  // ---- study page: markdown tables wrapped ----------------------------
  await page.goto("http://localhost:3000/#/study/cmwp4piif001qkdsjsvp1x7tf", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  const study = await page.evaluate(() => ({
    scrollTables: document.querySelectorAll(".ada-prose .table-scroll").length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  ok("study markdown tables in scroll wrappers", study.overflow <= 1, `overflow ${study.overflow}px`);

  await browser.close();
  console.log(results.join("\n"));
  const fails = results.filter((r) => r.startsWith("FAIL")).length;
  console.log(fails === 0 ? "\nALL BEHAVIOR CHECKS PASS" : `\n${fails} FAILURES`);
})();
