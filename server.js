const express = require("express");
const pa11y = require("pa11y");

const app = express();
app.use(express.json());

app.post("/run", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL manquante" });
  }

  try {
    const results = await pa11y(url);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Pa11y API running on port " + port);
});
