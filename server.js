const express = require('express');
const cors = require('cors');
const pa11y = require('pa11y');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.post('/run', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.json({ error: 'Missing URL' });

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

app.get('/', (req, res) => {
    res.send('Pa11y API is running. Use POST /run with {"url":"..."} to audit a page.');
});

app.listen(PORT, () => console.log(`Pa11y API running on port ${PORT}`));
