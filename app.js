// server.js
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

// /?url=https://google.com
app.get('/', async (req, res) => {
    const { url } = req.query;
    if (!url || url.length === 0) {
        return res.json({ error: 'url query parameter is required' });
    }

    const imageData = await Screenshot(url);

    res.set('Content-Type', 'image/jpeg');
    res.set('Content-Length', imageData.length);
    res.send(imageData);
});

app.listen(PORT, () => console.log(`***** PoC Chrome Headless - Listening on ${ PORT } *****`));

async function Screenshot(url) {
    // -> Para correr localmente con npm run dev
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-gpu",
        ]
    });

    //-> Para correr en un contenedor buscando el path del binario 
    /**
     * const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/chromium-browser',
        args: [
            "--no-sandbox",
            "--disable-gpu",
        ]
    });
     */

    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
      });
    await page.goto(url, {
        timeout: 0,
        waitUntil: 'networkidle0',
    });
    const screenData = await page.screenshot({ encoding: 'binary', type: 'jpeg', quality: 30 });

    await page.close();
    await browser.close();

    // Binary data of an image
    return screenData;
}