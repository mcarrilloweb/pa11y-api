// server.js
const express = require('express');
const cors = require('cors');  // <-- on importe cors
const pa11y = require('pa11y');

const app = express();
const PORT = process.env.PORT || 10000;

// 1️⃣ Activer CORS pour toutes les requêtes
app.use(cors());

// 2️⃣ Parser le JSON
app.use(express.json());

// 3️⃣ Route POST /run pour lancer l'audit
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

// 4️⃣ Route GET / pour info
app.get('/', (req, res) => {
    res.send('Pa11y API is running. Use POST /run with {"url":"..."} to audit a page.');
});

// 5️⃣ Démarrer le serveur
app.listen(PORT, () => console.log(`Pa11y API running on port ${PORT}`));
