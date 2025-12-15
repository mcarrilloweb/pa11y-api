const express = require('express');
const pa11y = require('pa11y');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/run', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL' });
  }

  try {
    const results = await pa11y(url, {
      standard: 'WCAG2AA',
      timeout: 30000,
      chromeLaunchConfig: {
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

app.get('/', (req, res) => {
  res.send('Pa11y API is running');
});

app.listen(PORT, () => {
  console.log(`Pa11y API running on port ${PORT}`);
});
