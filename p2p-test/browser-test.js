const puppeteer = require('puppeteer');
// Use the server running on port 8030
const targetUrl = 'http://localhost:8030'; // Your Flask server URL
// const targetUrl = 'http://localhost:8030/index_without_p2p.html';
const numTabs = 10; // Number of tabs to open


// Helper function to pause execution
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function openTabsAndPlayVideo(url, numTabs) {
    const browser = await puppeteer.launch({
        headless: false, // Set to true for headless mode
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--window-size=1920,1080', // Custom window size
            '--disable-background-timer-throttling', // Prevent background tab throttling
            '--disable-backgrounding-occluded-windows', // Keep tabs active
            '--disable-renderer-backgrounding', // Prevent pausing of rendering
        ],
        defaultViewport: null, // Matches the custom window size
    });

    const tabs = [];
    for (let i = 0; i < numTabs; i++) {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Continuously play the video in the page context
        await page.evaluate(() => {
            const video = document.getElementById('videoPlayer');
            if (video) {
                video.muted = true; // Ensure video is muted for autoplay policies
                video.play();

                // // Ensure the video continues playing
                // setInterval(() => {
                //     if (video.paused) {
                //         video.play();
                //     }
                // }, 100); // Check every second if the video is paused
            }
        });

        console.log(`Tab ${i + 1} loaded.`);
        tabs.push(page);

        // // Wait 1 second before opening the next tab
        // await sleep(2000);
    }

    return { browser, tabs };
}


(async () => {
    try {
        const { browser } = await openTabsAndPlayVideo(targetUrl, numTabs);

        // Keep tabs open for 4 minutes (240,000 ms)
        console.log("Running the test for 4 minutes...");
        await sleep(240000); // 4 minutes in milliseconds

        console.log("Closing the browser...");
        await browser.close();
        console.log("Test completed.");
    } catch (err) {
        console.error("An error occurred:", err);
    }
})();
