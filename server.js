// server.js
const express = require('express');
const pa11y = require('pa11y');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware pour parser le JSON
app.use(express.json());

// Fonction pour obtenir le chemin Chrome de Puppeteer
async function getChromePath() {
    // Télécharge Chrome si nécessaire
    const browserFetcher = puppeteer.createBrowserFetcher();
    const revisionInfo = await browserFetcher.download(puppeteer._preferredRevision);
    return revisionInfo.executablePath;
}

// POST /run : lance un audit Pa11y
app.post('/run', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.json({ error: 'Missing URL' });
    }

    try {
        const chromePath = await getChromePath();

        const results = await pa11y(url, {
            standard: 'WCAG2AA',
            timeout: 30000,
            chromeLaunchConfig: {
                executablePath: chromePath,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });

        res.json({
            url,
            count: results.issues.length,
            issues: results.issues
        });
    } catch (err) {
        res.json({ error: 'Pa11y audit failed', message: err.message });
    }
});

// Route GET racine pour info
app.get('/', (req, res) => {
    res.send('Pa11y API is running. Use POST /run with {"url":"..."} to audit a page.');
});

// Démarrage du serveur
app.listen(PORT, () => console.log(`Pa11y API running on port ${PORT}`));
