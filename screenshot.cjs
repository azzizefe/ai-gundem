const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    console.log("Navigating to https://azzizefe.github.io/ai-gundem/");
    try {
        await page.goto('https://azzizefe.github.io/ai-gundem/', { waitUntil: 'networkidle0' });
        await page.screenshot({ path: 'live_site_screenshot.png' });
        console.log("Screenshot saved.");
    } catch (err) {
        console.log("Navigation Error:", err.message);
    }

    await browser.close();
})();
