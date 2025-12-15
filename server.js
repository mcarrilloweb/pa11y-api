const express = require('express');
const pa11y = require('pa11y');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Configurer le cache Puppeteer pour Render
const browserFetcher = puppeteer.createBrowserFetcher({
  path: process.env.PUPPETEER_CACHE_DIR || puppeteer.defaultDownloadPath()
});

// Fonction pour récupérer le chemin de Chrome
const getChromePath = async () => {
  const localRevisions = await browserFetcher.localRevisions();
  if (!localRevisions.length) {
    throw new Error('No Chrome revisions found. Run `npx puppeteer browsers install chrome`.');
  }
  return browserFetcher.revisionInfo(localRevisions[0]).executablePath;
};

// Endpoint POST /run pour exécuter un audit Pa11y
app.post('/run', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL' });
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
      issues: results.issues,
      count: results.issues.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Pa11y audit failed',
      message: error.message
    });
  }
});

// Endpoint GET / pour vérifier que le serveur tourne
app.get('/', (req, res) => {
  res.send('Pa11y API is running');
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Pa11y API running on port ${PORT}`);
});
