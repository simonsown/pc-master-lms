const puppeteer = require('puppeteer');
(async () => {
    try {
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('BROWSER_LOG:', msg.type().toUpperCase(), msg.text()));
        page.on('pageerror', err => console.log('BROWSER_PAGE_ERROR:', err.toString()));
        page.on('requestfailed', request => console.log('BROWSER_REQUEST_FAILED:', request.url(), request.failure()?.errorText));

        await page.goto('https://one-mission-pj-main.vercel.app', { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 5000));
        await browser.close();
    } catch(e) {
        console.error('SCRIPT_ERROR:', e);
    }
})();
