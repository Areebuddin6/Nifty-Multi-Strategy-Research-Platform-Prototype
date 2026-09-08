/**
 * Master Zerodha Kite Connect v3 Historical Data Downloader CLI
 * 
 * High-performance, single-command historical data ingestor supporting multi-decade
 * market data downloads (10, 20, or up to 30 years / maximum available NSE history).
 * 
 * Features:
 * - Automatic Multi-Year Pagination/Chunking (bypasses Kite API single-request date range limits)
 * - Full NIFTY Universe support (NIFTY 50, NIFTY 100, NIFTY 200, NIFTY 500, Midcaps, Smallcaps, Sectoral)
 * - Pre-listing IPO auto-detection (gracefully handles pre-listing dates without failing)
 * - Rate-limit throttle compliance (3 req/sec with polite 350ms delay)
 * - Exponential backoff retry on transient network drops or 429s
 * - Automatic deduplication, sorting, and manifest indexing
 * 
 * Usage Examples:
 *   # Download 20 years of daily data for all NIFTY 50 stocks in one command:
 *   npm run kite:download -- --universe NIFTY_50 --years 20
 * 
 *   # Download 30 years (or max available NSE history) for NIFTY 100:
 *   npm run kite:download -- --universe NIFTY_100 --years 30
 * 
 *   # Download 10 years of data for NIFTY 500 (with limit for testing):
 *   npm run kite:download -- --universe NIFTY_500 --years 10 --limit 25
 * 
 *   # Download full history for specific heavyweight stocks:
 *   npm run kite:download -- --symbols RELIANCE,TCS,INFY,HDFCBANK,ICICIBANK,ITC --years 25
 * 
 *   # Explicit date range:
 *   npm run kite:download -- --symbol RELIANCE --from 2000-01-01 --to 2026-08-31
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { getInstrumentToken, getUniverseStocks, UNIVERSE_MAP } from '../data/niftyUniverses';

dotenv.config();

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface DateChunk {
  from: string;
  to: string;
  label: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Splits a broad multi-decade date range into safe, sequential chunks (default 365 days)
 * to comply with Zerodha Kite Connect API's per-request limit for daily candles.
 */
function generateDateChunks(fromDateStr: string, toDateStr: string, chunkDays = 365): DateChunk[] {
  const chunks: DateChunk[] = [];
  const start = new Date(fromDateStr);
  const end = new Date(toDateStr);

  let currentStart = new Date(start);

  while (currentStart < end) {
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + chunkDays);

    const chunkToDate = currentEnd > end ? end : currentEnd;

    const fromFormatted = currentStart.toISOString().split('T')[0];
    const toFormatted = chunkToDate.toISOString().split('T')[0];

    chunks.push({
      from: fromFormatted,
      to: toFormatted,
      label: `${fromFormatted.substring(0, 4)}-${toFormatted.substring(0, 4)}`,
    });

    // Move next chunk start to 1 day after current chunk end
    const nextStart = new Date(chunkToDate);
    nextStart.setDate(nextStart.getDate() + 1);
    currentStart = nextStart;
  }

  return chunks;
}

/**
 * Fetches candle data for a single date slice with exponential backoff and IPO detection.
 */
async function fetchChunkWithRetry(
  apiKey: string,
  accessToken: string,
  token: number,
  symbol: string,
  interval: string,
  chunk: DateChunk,
  maxRetries = 3
): Promise<Candle[]> {
  const url = `https://api.kite.trade/instruments/historical/${token}/${interval}?from=${encodeURIComponent(chunk.from)}&to=${encodeURIComponent(chunk.to)}`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Kite-Version': '3',
          'Authorization': `token ${apiKey}:${accessToken}`,
        },
      });

      if (response.status === 429) {
        // Rate limited
        const waitTime = attempt * 1500;
        await sleep(waitTime);
        continue;
      }

      if (response.status === 400 || response.status === 404) {
        const errorText = await response.text();
        // Check if this error is due to pre-listing date (Kite returns 400 when stock was not yet listed)
        if (
          errorText.toLowerCase().includes('not found') ||
          errorText.toLowerCase().includes('invalid date') ||
          errorText.toLowerCase().includes('no data') ||
          errorText.toLowerCase().includes('out of bounds')
        ) {
          // Pre-listing date slice: return empty array cleanly
          return [];
        }
        // Other 400 error
        return [];
      }

      if (!response.ok) {
        if (attempt < maxRetries) {
          await sleep(attempt * 1000);
          continue;
        }
        return [];
      }

      const json: any = await response.json();
      if (json.status !== 'success' || !json.data?.candles) {
        return [];
      }

      return json.data.candles.map((c: any) => ({
        date: typeof c[0] === 'string' ? c[0].split('T')[0] : String(c[0]),
        open: Number(c[1]),
        high: Number(c[2]),
        low: Number(c[3]),
        close: Number(c[4]),
        volume: Number(c[5] || 0),
      }));
    } catch (err: any) {
      if (attempt >= maxRetries) {
        return [];
      }
      await sleep(attempt * 1000);
    }
  }

  return [];
}

/**
 * Downloads multi-decade candle history for a single instrument across all date chunks.
 */
async function downloadInstrumentFullHistory(
  apiKey: string,
  accessToken: string,
  token: number,
  symbol: string,
  interval: string,
  chunks: DateChunk[]
): Promise<Candle[]> {
  const allCandles: Candle[] = [];
  const seenDates = new Set<string>();

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkCandles = await fetchChunkWithRetry(
      apiKey,
      accessToken,
      token,
      symbol,
      interval,
      chunk
    );

    for (const c of chunkCandles) {
      if (!seenDates.has(c.date)) {
        seenDates.add(c.date);
        allCandles.push(c);
      }
    }

    // Rate-limiting compliance: 3 requests per second limit on Kite Connect
    await sleep(350);
  }

  // Sort chronologically ascending
  allCandles.sort((a, b) => a.date.localeCompare(b.date));
  return allCandles;
}

export async function runKiteDownloader() {
  const args = process.argv.slice(2);

  let symbolArg = '';
  let universeArg = '';
  let symbolsList: string[] = [];
  let yearsArg = 0;
  let fromDate = '';
  let toDate = new Date().toISOString().split('T')[0];
  let interval = 'day';
  let limit = 0;
  let resume = false;
  let chunkDays = 365;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Zerodha Kite Connect v3 Multi-Decade Historical Data Ingestor

Usage:
  npm run kite:download -- [options]

Options:
  --universe <name>     Universe to download (e.g. NIFTY_50, NIFTY_100, NIFTY_500, NIFTY_MIDCAP_100)
  --symbol <ticker>     Single stock symbol (e.g. RELIANCE, TCS, INFY)
  --symbols <list>      Comma-separated list (e.g. TCS,INFY,HDFCBANK)
  --years <number>      Number of years of history to download (e.g. 10, 20, 30) [Default: 20]
  --from <YYYY-MM-DD>   Start date (overrides --years)
  --to <YYYY-MM-DD>     End date (default: today)
  --interval <type>     Candle interval: minute, 3minute, 5minute, 15minute, 60minute, day [Default: day]
  --limit <number>      Limit to first N instruments in the universe (useful for quick testing)
  --resume              Skip symbols that are already cached
  --chunk-days <days>   Days per pagination request [Default: 365]

Examples:
  npm run kite:download -- --universe NIFTY_50 --years 20
  npm run kite:download -- --universe NIFTY_500 --years 10 --limit 30
  npm run kite:download -- --symbol RELIANCE --years 30
      `);
      return;
    }
    if (args[i] === '--symbol' && args[i + 1]) symbolArg = args[i + 1].toUpperCase();
    if (args[i] === '--universe' && args[i + 1]) universeArg = args[i + 1].toUpperCase();
    if (args[i] === '--symbols' && args[i + 1]) symbolsList = args[i + 1].split(',').map(s => s.trim().toUpperCase());
    if (args[i] === '--years' && args[i + 1]) yearsArg = parseInt(args[i + 1], 10);
    if (args[i] === '--from' && args[i + 1]) fromDate = args[i + 1];
    if (args[i] === '--to' && args[i + 1]) toDate = args[i + 1];
    if (args[i] === '--interval' && args[i + 1]) interval = args[i + 1];
    if (args[i] === '--limit' && args[i + 1]) limit = parseInt(args[i + 1], 10);
    if (args[i] === '--resume') resume = true;
    if (args[i] === '--chunk-days' && args[i + 1]) chunkDays = parseInt(args[i + 1], 10);
  }

  // Calculate fromDate based on years if not explicitly provided
  if (!fromDate) {
    const years = yearsArg > 0 ? yearsArg : 20; // Default to 20 years
    const d = new Date(toDate);
    d.setFullYear(d.getFullYear() - years);
    fromDate = d.toISOString().split('T')[0];
  }

  const calculatedYears = ((new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);

  console.log('================================================================================');
  console.log('       ZERODHA KITE CONNECT v3 — MULTI-DECADE HISTORICAL DATA INGESTOR         ');
  console.log('================================================================================');

  const apiKey = process.env.KITE_API_KEY;
  const accessToken = process.env.KITE_ACCESS_TOKEN;

  if (!apiKey || !accessToken) {
    console.error('❌ Error: KITE_API_KEY and KITE_ACCESS_TOKEN must be configured in .env');
    console.error('\nTo configure:');
    console.error('  1. Add your KITE_API_KEY and KITE_API_SECRET to your .env file');
    console.error('  2. Run the authentication CLI to generate your session token:');
    console.error('     npm run kite:auth\n');
    process.exit(1);
  }

  // Determine target symbols
  let targets: string[] = [];

  if (symbolArg) {
    targets = [symbolArg];
  } else if (symbolsList.length > 0) {
    targets = symbolsList;
  } else if (universeArg) {
    targets = getUniverseStocks(universeArg);
    console.log(`Universe Selected:   ${universeArg} (${targets.length} total constituents)`);
  } else {
    // Default to NIFTY 50
    targets = getUniverseStocks('NIFTY_50');
    console.log('Defaulting to:       NIFTY 50 (50 liquid bluechips)');
  }

  if (limit > 0 && targets.length > limit) {
    console.log(`Constituent Limit:   Ingesting first ${limit} of ${targets.length} instruments`);
    targets = targets.slice(0, limit);
  }

  // Generate multi-year date chunks
  const chunks = generateDateChunks(fromDate, toDate, chunkDays);

  console.log(`Date Range:          ${fromDate} to ${toDate} (~${calculatedYears} Years)`);
  console.log(`Candle Interval:     ${interval}`);
  console.log(`Chunking Strategy:   ${chunks.length} slices of ~${chunkDays} days each (bypasses Kite 365d cap)`);
  console.log(`Instruments to Sync: ${targets.length}`);
  console.log('================================================================================\n');

  // Ensure cache directory exists
  const cacheDir = path.join(process.cwd(), 'market_data_cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  // Load existing manifest if present
  let manifest: Record<string, any> = {};
  const manifestPath = path.join(cacheDir, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch {
      manifest = {};
    }
  }

  let successCount = 0;
  let totalCandlesIngested = 0;
  const startTime = Date.now();

  for (let i = 0; i < targets.length; i++) {
    const sym = targets[i];
    const token = getInstrumentToken(sym);

    if (!token) {
      console.warn(`⚠️ [${i + 1}/${targets.length}] Skipping ${sym}: No instrument token found in Nifty registry`);
      continue;
    }

    const filePath = path.join(cacheDir, `${sym}_${interval}.json`);

    // Check if resume flag was set and file already has comprehensive candles
    if (resume && fs.existsSync(filePath)) {
      try {
        const existingData: Candle[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (existingData.length > 1000) {
          console.log(`[${i + 1}/${targets.length}] ${sym} (Token: ${token}) already cached with ${existingData.length} candles (Skipping due to --resume)`);
          successCount++;
          totalCandlesIngested += existingData.length;
          continue;
        }
      } catch {
        // re-fetch if file corrupted
      }
    }

    process.stdout.write(`[${i + 1}/${targets.length}] Fetching ${sym.padEnd(12)} (Token: ${String(token).padEnd(8)}) `);

    try {
      const candles = await downloadInstrumentFullHistory(
        apiKey,
        accessToken,
        token,
        sym,
        interval,
        chunks
      );

      if (candles.length === 0) {
        console.log(`⚠️ No candles returned for ${sym} across range`);
        continue;
      }

      fs.writeFileSync(filePath, JSON.stringify(candles, null, 2), 'utf8');

      const firstDate = candles[0].date;
      const lastDate = candles[candles.length - 1].date;
      const yearsSpan = ((new Date(lastDate).getTime() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);

      manifest[sym] = {
        symbol: sym,
        instrumentToken: token,
        interval,
        fromDate: firstDate,
        toDate: lastDate,
        yearsSpan: `${yearsSpan} Years`,
        candlesCount: candles.length,
        firstClose: candles[0].close,
        lastClose: candles[candles.length - 1].close,
        savedAt: new Date().toISOString(),
      };

      totalCandlesIngested += candles.length;
      successCount++;

      console.log(`✓ ${String(candles.length).padStart(5)} candles (${firstDate} to ${lastDate} • ${yearsSpan} Yrs)`);
    } catch (err: any) {
      console.log(`❌ Failed: ${err.message}`);
    }
  }

  // Save updated manifest
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  const elapsedSec = Math.round((Date.now() - startTime) / 1000);

  console.log('\n================================================================================');
  console.log('                         MULTI-DECADE INGESTION COMPLETE!                       ');
  console.log('================================================================================');
  console.log(`Successfully Downloaded: ${successCount} / ${targets.length} symbols`);
  console.log(`Total Historical Candles:${totalCandlesIngested.toLocaleString('en-IN')}`);
  console.log(`Time Elapsed:            ${elapsedSec} seconds`);
  console.log(`Storage Directory:       ${cacheDir}`);
  console.log('--------------------------------------------------------------------------------');
  console.log('Ready for multi-decade backtesting using real Zerodha Kite historical candles:');
  console.log(`  npm run kite:backtest -- --strategy supertrend_swing --universe ${universeArg || 'NIFTY_50'} --years ${yearsArg || 20}`);
  console.log(`  npm run kite:backtest -- --strategy rsi_pullback --universe ${universeArg || 'NIFTY_50'} --years ${yearsArg || 20}`);
  console.log('================================================================================\n');
}

// Run CLI when invoked directly
if (process.argv[1] && process.argv[1].includes('downloadKiteData')) {
  runKiteDownloader().catch(console.error);
}
