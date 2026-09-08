/**
 * Zerodha Kite Connect v3 Historical Data Fetcher CLI
 * 
 * Fetches real point-in-time OHLCV historical candle data from Zerodha Kite Connect API
 * for any single stock or entire NIFTY universe up to NIFTY 500.
 * 
 * Usage Examples:
 *   npx tsx src/cli/fetchKiteHistorical.ts --symbol RELIANCE --from 2023-01-01 --to 2024-12-31
 *   npx tsx src/cli/fetchKiteHistorical.ts --universe NIFTY_500 --limit 20 --from 2023-01-01 --to 2024-12-31
 *   npx tsx src/cli/fetchKiteHistorical.ts --universe NIFTY_50 --from 2020-01-01 --to 2024-12-31
 *   npx tsx src/cli/fetchKiteHistorical.ts --universe NIFTY_MIDCAP_100 --limit 15
 *   npx tsx src/cli/fetchKiteHistorical.ts --symbols TCS,INFY,HDFCBANK,ICICIBANK
 */

import { runKiteDownloader } from './downloadKiteData';

// Delegate directly to the master multi-decade historical downloader
runKiteDownloader().catch(console.error);

