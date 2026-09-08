import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { NIFTY_500_STOCKS, NIFTY_INDICES, getUniverseStocks } from './src/data/niftyUniverses';
import { generateDateChunks, downloadInstrumentFullHistory } from './src/cli/downloadKiteData';

// Load environment variables from .env
dotenv.config();

const PORT = 3000;

// In-memory active session token store for local dev
let sessionAccessToken = process.env.KITE_ACCESS_TOKEN || '';
let sessionUserProfile: any = null;

// NSE instruments reference map covering all Nifty indices up to Nifty 500 and constituent stocks
const NSE_INSTRUMENT_MAP: Record<string, { token: number; name: string; sector: string }> = {};

// Register all Nifty indices up to Nifty 500
NIFTY_INDICES.forEach(index => {
  NSE_INSTRUMENT_MAP[index.id] = { token: index.token, name: index.name, sector: index.category };
  NSE_INSTRUMENT_MAP[index.name] = { token: index.token, name: index.name, sector: index.category };
  NSE_INSTRUMENT_MAP[index.shortName] = { token: index.token, name: index.name, sector: index.category };
});

// Register all constituent stocks across Nifty 500
NIFTY_500_STOCKS.forEach(stock => {
  NSE_INSTRUMENT_MAP[stock.symbol] = { token: stock.token, name: stock.name, sector: stock.sector };
});

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ----------------------------------------------------
  // API Routes
  // ----------------------------------------------------
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      platform: 'Nifty Multi-Strategy Engine (Express + Vite)',
    });
  });

  /**
   * Status of Zerodha Kite Connect credentials
   */
  app.get('/api/kite/status', (req, res) => {
    const apiKey = process.env.KITE_API_KEY || '';
    const apiSecret = process.env.KITE_API_SECRET || '';
    const activeToken = sessionAccessToken || process.env.KITE_ACCESS_TOKEN || '';

    const baseLogin = 'https://kite.zerodha.com/connect/login?v=3';
    const loginUrl = apiKey ? `${baseLogin}&api_key=${encodeURIComponent(apiKey)}` : baseLogin;

    res.json({
      isConfigured: !!(apiKey && activeToken),
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      hasAccessToken: !!activeToken,
      apiKeyMasked: apiKey ? `${apiKey.slice(0, 4)}••••` : null,
      loginUrl,
      userProfile: sessionUserProfile,
    });
  });

  /**
   * Get login URL
   */
  app.get('/api/kite/login-url', (req, res) => {
    const apiKey = process.env.KITE_API_KEY || '';
    const baseLogin = 'https://kite.zerodha.com/connect/login?v=3';
    const loginUrl = apiKey ? `${baseLogin}&api_key=${encodeURIComponent(apiKey)}` : baseLogin;
    res.json({ loginUrl, hasApiKey: !!apiKey });
  });

  /**
   * OAuth Callback handler from Zerodha Kite Connect:
   * When a user logs into Kite, Zerodha redirects to:
   * /api/kite/callback?request_token=XXXXX&action=login&status=success
   */
  app.get('/api/kite/callback', async (req, res) => {
    const requestToken = (req.query.request_token as string) || '';
    const status = (req.query.status as string) || '';
    const apiKey = process.env.KITE_API_KEY || '';
    const apiSecret = process.env.KITE_API_SECRET || '';

    if (!requestToken || status !== 'success') {
      return res.redirect('/?kite_auth_error=Request+token+missing+or+status+unsuccessful');
    }

    if (!apiKey || !apiSecret) {
      return res.redirect('/?kite_auth_error=KITE_API_KEY+or+KITE_API_SECRET+missing+in+.env');
    }

    try {
      // Calculate SHA256(api_key + request_token + api_secret)
      const checksumInput = `${apiKey}${requestToken}${apiSecret}`;
      const checksum = crypto.createHash('sha256').update(checksumInput).digest('hex');

      const formData = new URLSearchParams();
      formData.append('api_key', apiKey);
      formData.append('request_token', requestToken);
      formData.append('checksum', checksum);

      const kiteRes = await fetch('https://api.kite.trade/session/token', {
        method: 'POST',
        headers: {
          'X-Kite-Version': '3',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data: any = await kiteRes.json();

      if (data.status === 'success' && data.data?.access_token) {
        sessionAccessToken = data.data.access_token;
        sessionUserProfile = {
          user_id: data.data.user_id,
          user_name: data.data.user_name,
          user_shortname: data.data.user_shortname,
          email: data.data.email,
          broker: data.data.broker,
        };
        console.log(`[Kite Connect] Successfully authenticated user: ${data.data.user_name} (${data.data.user_id})`);
        return res.redirect('/?kite_auth=success&user=' + encodeURIComponent(data.data.user_name || 'Trader'));
      } else {
        const errorMsg = encodeURIComponent(data.message || 'Token exchange failed');
        return res.redirect(`/?kite_auth_error=${errorMsg}`);
      }
    } catch (err: any) {
      console.error('[Kite Callback Error]', err);
      return res.redirect(`/?kite_auth_error=${encodeURIComponent(err.message)}`);
    }
  });

  /**
   * Set or override session access token manually (e.g. from UI testing or CLI)
   */
  app.post('/api/kite/session', (req, res) => {
    const { accessToken, userProfile } = req.body;
    if (!accessToken) {
      return res.status(400).json({ error: 'accessToken is required' });
    }
    sessionAccessToken = accessToken;
    if (userProfile) {
      sessionUserProfile = userProfile;
    }
    res.json({ status: 'ok', message: 'Session access token updated successfully' });
  });

  /**
   * Get supported instruments dictionary
   */
  app.get('/api/kite/instruments', (req, res) => {
    res.json({ instruments: NSE_INSTRUMENT_MAP });
  });

  /**
   * Historical Candle Ingestion Endpoint
   * Supports multi-decade queries (10, 20, 30 years) with auto-chunking to bypass Kite's 365-day cap.
   * Also checks local file cache (market_data_cache/) for instant offline-first responses.
   */
  app.post('/api/kite/historical', async (req, res) => {
    const { instrumentToken, symbol, from, to, interval = 'day', forceRefresh = false } = req.body;

    let token = instrumentToken;
    let symName = symbol;
    if (!token && symbol && NSE_INSTRUMENT_MAP[symbol]) {
      token = NSE_INSTRUMENT_MAP[symbol].token;
    }
    if (!symName && token) {
      const found = Object.entries(NSE_INSTRUMENT_MAP).find(([k, v]) => v.token === token);
      if (found) symName = found[0];
    }

    if (!token && !symName) {
      return res.status(400).json({ error: 'Valid instrumentToken or recognized symbol is required' });
    }

    const safeSym = (symName || `Token_${token}`).toUpperCase().trim();
    const cacheDir = path.join(process.cwd(), 'market_data_cache');
    const cacheFile = path.join(cacheDir, `${safeSym}_${interval}.json`);

    // 1. Check local cache if forceRefresh is not requested
    if (!forceRefresh && fs.existsSync(cacheFile)) {
      try {
        const cachedRaw = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        if (Array.isArray(cachedRaw) && cachedRaw.length > 0) {
          let filtered = cachedRaw;
          if (from) filtered = filtered.filter(c => c.date >= from);
          if (to) filtered = filtered.filter(c => c.date <= to);

          return res.json({
            status: 'success',
            source: 'local_cache',
            symbol: safeSym,
            instrumentToken: token,
            interval,
            count: filtered.length,
            candles: filtered,
          });
        }
      } catch (err) {
        console.warn(`Could not read cached file for ${safeSym}:`, err);
      }
    }

    const apiKey = process.env.KITE_API_KEY || '';
    const activeToken = sessionAccessToken || process.env.KITE_ACCESS_TOKEN || '';

    if (!apiKey || !activeToken) {
      return res.status(400).json({
        status: 'unconfigured',
        error: 'KITE_API_KEY and KITE_ACCESS_TOKEN must be configured in .env or via session login',
        instructions: [
          '1. Set KITE_API_KEY and KITE_API_SECRET in your .env file',
          '2. Complete login via /api/kite/login-url or insert KITE_ACCESS_TOKEN in .env',
          '3. Run backtest against live broker candles',
        ],
      });
    }

    try {
      // Check if date span is > 365 days
      const startDate = new Date(from || '2000-01-01');
      const endDate = new Date(to || new Date().toISOString().split('T')[0]);
      const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      let candles: any[] = [];

      if (diffDays > 365) {
        // Multi-decade request: Chunk into 365-day slices
        const chunks = generateDateChunks(
          from || startDate.toISOString().split('T')[0],
          to || endDate.toISOString().split('T')[0],
          365
        );

        candles = await downloadInstrumentFullHistory(
          apiKey,
          activeToken,
          token,
          safeSym,
          interval,
          chunks
        );
      } else {
        // Single slice <= 365 days
        const url = `https://api.kite.trade/instruments/historical/${token}/${interval}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
        const response = await fetch(url, {
          headers: {
            'X-Kite-Version': '3',
            'Authorization': `token ${apiKey}:${activeToken}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          return res.status(response.status).json({
            status: 'error',
            error: `Kite API returned HTTP ${response.status}`,
            details: errorText,
          });
        }

        const json: any = await response.json();
        if (json.status !== 'success' || !json.data?.candles) {
          return res.status(500).json({
            status: 'error',
            error: json.message || 'No candle data returned from Kite',
          });
        }

        candles = json.data.candles.map((c: any) => ({
          date: typeof c[0] === 'string' ? c[0].split('T')[0] : String(c[0]),
          open: Number(c[1]),
          high: Number(c[2]),
          low: Number(c[3]),
          close: Number(c[4]),
          volume: Number(c[5] || 0),
        }));
      }

      // Save to disk cache for instantaneous future access
      try {
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }
        fs.writeFileSync(cacheFile, JSON.stringify(candles, null, 2), 'utf8');
      } catch (saveErr) {
        console.warn('Could not cache candles to disk:', saveErr);
      }

      res.json({
        status: 'success',
        source: 'kite_api_live',
        symbol: safeSym,
        instrumentToken: token,
        interval,
        count: candles.length,
        candles,
      });
    } catch (err: any) {
      res.status(500).json({ status: 'error', error: err.message });
    }
  });

  /**
   * Local Market Data Cache Status Endpoint
   * Returns details of locally cached historical instruments (10, 20, 30 years)
   */
  app.get('/api/kite/cache-status', (req, res) => {
    const cacheDir = path.join(process.cwd(), 'market_data_cache');
    if (!fs.existsSync(cacheDir)) {
      return res.json({
        exists: false,
        totalFiles: 0,
        symbols: [],
        totalCandles: 0,
        minDate: null,
        maxDate: null,
        yearsCovered: 0,
      });
    }

    try {
      const files = fs.readdirSync(cacheDir).filter(f => f.endsWith('.json') && f !== 'manifest.json');
      const symbols: string[] = [];
      let totalCandles = 0;
      let minDate: string | null = null;
      let maxDate: string | null = null;

      for (const file of files) {
        const sym = file.replace(/_day\.json|_minute\.json|\.json/, '');
        symbols.push(sym);
        try {
          const content = JSON.parse(fs.readFileSync(path.join(cacheDir, file), 'utf8'));
          if (Array.isArray(content) && content.length > 0) {
            totalCandles += content.length;
            const firstDate = content[0]?.date;
            const lastDate = content[content.length - 1]?.date;
            if (firstDate && (!minDate || firstDate < minDate)) minDate = firstDate;
            if (lastDate && (!maxDate || lastDate > maxDate)) maxDate = lastDate;
          }
        } catch {
          // ignore corrupted single file
        }
      }

      let yearsCovered = 0;
      if (minDate && maxDate) {
        const start = new Date(minDate).getTime();
        const end = new Date(maxDate).getTime();
        yearsCovered = Number(((end - start) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1));
      }

      res.json({
        exists: true,
        totalFiles: files.length,
        symbols,
        totalCandles,
        minDate,
        maxDate,
        yearsCovered,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * Batch Sync Endpoint: downloads candles for multiple symbols at once
   */
  app.post('/api/kite/sync-all', async (req, res) => {
    const { symbols = ['NIFTY 50', 'HDFCBANK', 'ICICIBANK', 'TCS', 'INFY'], from = '2023-01-01', to = '2024-12-31' } = req.body;
    const apiKey = process.env.KITE_API_KEY || '';
    const activeToken = sessionAccessToken || process.env.KITE_ACCESS_TOKEN || '';

    if (!apiKey || !activeToken) {
      return res.status(400).json({
        status: 'unconfigured',
        error: 'Kite credentials missing. Please set KITE_API_KEY and KITE_ACCESS_TOKEN.',
      });
    }

    const results: Record<string, any[]> = {};
    const errors: Record<string, string> = {};

    for (const sym of symbols) {
      const entry = NSE_INSTRUMENT_MAP[sym];
      if (!entry) {
        errors[sym] = 'Unknown symbol token';
        continue;
      }

      try {
        const url = `https://api.kite.trade/instruments/historical/${entry.token}/day?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
        const response = await fetch(url, {
          headers: {
            'X-Kite-Version': '3',
            'Authorization': `token ${apiKey}:${activeToken}`,
          },
        });

        if (response.ok) {
          const json: any = await response.json();
          if (json.status === 'success' && json.data?.candles) {
            results[sym] = json.data.candles.map((c: any) => ({
              date: typeof c[0] === 'string' ? c[0].split('T')[0] : String(c[0]),
              open: Number(c[1]),
              high: Number(c[2]),
              low: Number(c[3]),
              close: Number(c[4]),
              volume: Number(c[5] || 0),
            }));
          }
        } else {
          errors[sym] = `HTTP ${response.status}`;
        }
      } catch (err: any) {
        errors[sym] = err.message;
      }
    }

    res.json({
      status: 'completed',
      syncedSymbols: Object.keys(results),
      totalCandles: Object.values(results).reduce((acc, c) => acc + c.length, 0),
      errors,
      data: results,
    });
  });

  // ----------------------------------------------------
  // Vite Middleware / Static Serving
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Nifty Engine] Server listening on port ${PORT} (host 0.0.0.0)`);
    console.log(`[Nifty Engine] Kite Auth Hub active at /api/kite/status`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
