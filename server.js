// server.js
const express = require('express');
const cors = require('cors');
const pa11y = require('pa11y');

// CORS
app.use(cors());

// Pour les données JSON
app.use(express.json());

// Route de test
app.post('/run', (req, res) => {
    // Ton code de l'audit ici
});

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware pour parser le JSON
app.use(express.json());

// POST /run : lance un audit Pa11y
app.post('/run', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.json({ error: 'Missing URL' });
    }

    try {
        const results = await pa11y(url, {
            standard: 'WCAG2AA',
            timeout: 30000,
            chromeLaunchConfig: {
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
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
