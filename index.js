const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'No query provided' });

  try {
    const url = `https://uk.webuy.com/search?q=${query}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.5',
      }
    });
    const html = await response.text();

    // Extract price data from the page
    const cashMatch = html.match(/"cashPriceCalculated":([\d.]+)/);
    const voucherMatch = html.match(/"exchangePriceCalculated":([\d.]+)/);
    const sellMatch = html.match(/"sellPrice":([\d.]+)/);
    const nameMatch = html.match(/"boxName":"([^"]+)"/);

    if (nameMatch) {
      res.json({
        name: nameMatch[1],
        cashPrice: cashMatch ? parseFloat(cashMatch[1]) : null,
        voucherPrice: voucherMatch ? parseFloat(voucherMatch[1]) : null,
        sellPrice: sellMatch ? parseFloat(sellMatch[1]) : null,
      });
    } else {
      res.json({ error: 'Item not found' });
    }
  } catch (e) {
    res.status(500).json({ error: 'Server error', detail: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CeX proxy running on port ${PORT}`));
