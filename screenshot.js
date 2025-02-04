const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const websites = [
    {
        url: 'https://legalloans.co.uk/',
        filename: 'legal-loans.jpg'
    },
    {
        url: 'https://letshelp.guide',
        filename: 'lets-help.jpg'
    },
    {
        url: 'https://pipform.com',
        filename: 'pipform.jpg'
    },
    {
        url: 'https://hodl-dashboard.netlify.app',
        filename: 'hodl-dashboard.jpg'
    }
];

async function captureScreenshots() {
    const browser = await puppeteer.launch({
        headless: 'new',
        defaultViewport: {
            width: 1920,
            height: 1080
        }
    });

    const imagesDir = path.join(__dirname, 'images');
    try {
        await fs.mkdir(imagesDir, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }

    for (const site of websites) {
        try {
            console.log(`Capturing ${site.url}...`);
            const page = await browser.newPage();
            
            // Set user agent to avoid blocking
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            
            // Navigate to the page
            await page.goto(site.url, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            // Wait for any lazy-loaded content
            await page.evaluate(() => new Promise((resolve) => {
                setTimeout(resolve, 2000);
            }));

            // Take screenshot
            await page.screenshot({
                path: path.join(imagesDir, site.filename),
                type: 'jpeg',
                quality: 90,
                fullPage: false
            });

            await page.close();
            console.log(`✓ Captured ${site.filename}`);
        } catch (error) {
            console.error(`Error capturing ${site.url}:`, error.message);
            // Create a placeholder image for failed screenshots
            await createPlaceholderImage(path.join(imagesDir, site.filename));
        }
    }

    await browser.close();
    console.log('Done capturing screenshots!');
}

async function createPlaceholderImage(filepath) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(`
        <div style="width: 1920px; height: 1080px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; font-family: Arial;">
            <div style="text-align: center;">
                <h1 style="color: #333; margin: 0;">Website Preview Unavailable</h1>
                <p style="color: #666; margin-top: 10px;">Please click to visit the website directly</p>
            </div>
        </div>
    `);
    await page.screenshot({
        path: filepath,
        type: 'jpeg',
        quality: 80
    });
    await browser.close();
}

captureScreenshots().catch(console.error);
