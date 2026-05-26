const { chromium } = require('playwright');

(async () => {
  const pages = ['/parent', '/parent/link-child', '/parent/children', '/parent/dashboard'];
  const base = 'https://pc-master-lms.vercel.app';
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const results = [];

  for (const p of pages) {
    const url = base + p;
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
      results.push({ path: p, url, error: String(e) });
      await page.close();
      continue;
    }

    // wait a moment for client JS mounts
    await page.waitForTimeout(800);

    // capture visible text and look for keywords
    const text = await page.evaluate(() => document.body.innerText || '');
    const keywords = ['Thêm', 'Thêm con', 'Thêm học sinh', 'Add child', 'Add', 'Liên kết', 'Link child', 'Kết nối'];
    const found = [];
    for (const kw of keywords) {
      if (text.includes(kw)) found.push(kw);
    }

    // also check for common add buttons
    const buttonSelectors = ['button', '[role="button"]', 'a[role="button"]', 'input[type=button]'];
    const buttons = [];
    for (const sel of buttonSelectors) {
      const els = await page.$$(sel);
      for (const el of els) {
        try {
          const t = (await el.innerText()) || '';
          if (t && /Thêm|Add|Liên kết|Link/i.test(t)) buttons.push(t.trim());
        } catch (e) {
          // ignore
        }
      }
    }

    results.push({ path: p, url, status: 'ok', foundKeywords: found, matchingButtons: buttons });
    await page.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
})();
