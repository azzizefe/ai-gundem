const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('requestfailed', request => {
        console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText);
    });

    console.log("Navigating to https://azzizefe.github.io/ai-gundem/");
    try {
        await page.goto('https://azzizefe.github.io/ai-gundem/', { waitUntil: 'networkidle0' });
        console.log("Navigation finished.");

        // Check if root is empty
        const rootContent = await page.evaluate(() => document.getElementById('root').innerHTML);
        console.log("Root content length:", rootContent.length);
        if (rootContent.length === 0) {
            console.log("Root is completely empty! Looking for window errors...");
            const winErrors = await page.evaluate(() => window.__errors || []);
            console.log("Window Errors:", winErrors);
        }
    } catch (err) {
        console.log("Navigation Error:", err.message);
    }

    await browser.close();
})();
