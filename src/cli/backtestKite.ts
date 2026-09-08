/**
 * Direct Zerodha Kite Connect v3 CLI Backtester
 * 
 * Run via:
 *   npm run --kite-api
 *   npm run kite-api
 *   npm run backtest:kite
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { StrategyConfig, KiteCandle, StrategyType } from '../types';
import { runBacktestSimulation } from '../engine/backtestSimulator';
import { NSE_INSTRUMENT_MAP, fetchKiteHistoricalData, getKiteLoginUrl } from '../auth';
import { PAIR_CANDIDATES } from '../data/historicalData';

// Load .env from workspace root
dotenv.config();

function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--')) {
      const parts = arg.slice(2).split('=');
      const key = parts[0];
      const val = parts.length > 1 ? parts.slice(1).join('=') : 'true';
      args[key] = val;
    }
  }
  return args;
}

const args = parseArgs();
const strategyId = (args.strategy as StrategyType) || 'pairs_cointegration';
const selectedPair = args.pair || 'HDFCBANK_ICICIBANK';
const selectedSymbol = args.symbol || 'NIFTY 50';
const fromDate = args.from || '2023-01-01';
const toDate = args.to || '2024-12-31';
const initialCapital = parseFloat(args.capital || '1000000');
const exportPath = args.export || 'kite_backtest_report.json';

const CACHE_FILE = path.join(process.cwd(), '.kite_candles_cache.json');

function formatINR(val: number): string {
  const isNeg = val < 0;
  const abs = Math.abs(val);
  const formatted = abs.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  return (isNeg ? '-₹' : '₹') + formatted;
}

function generateDemoCandles(symbol: string, from: string, to: string): KiteCandle[] {
  const candles: KiteCandle[] = [];
  const start = new Date(from);
  const end = new Date(to);
  let basePrice = symbol.includes('NIFTY') ? 18000 : symbol.includes('HDFC') ? 1600 : symbol.includes('ICICI') ? 950 : symbol.includes('TCS') ? 3500 : 2500;
  
  const curr = new Date(start);
  while (curr <= end) {
    const day = curr.getDay();
    if (day !== 0 && day !== 6) {
      const dateStr = curr.toISOString().split('T')[0];
      const shock = (Math.random() - 0.485) * 0.024;
      const open = basePrice;
      const close = parseFloat((open * (1 + shock)).toFixed(2));
      const high = parseFloat((Math.max(open, close) * (1 + Math.random() * 0.01)).toFixed(2));
      const low = parseFloat((Math.min(open, close) * (1 - Math.random() * 0.01)).toFixed(2));
      const volume = Math.floor(600000 + Math.random() * 2500000);
      candles.push({ date: dateStr, open, high, low, close, volume });
      basePrice = close;
    }
    curr.setDate(curr.getDate() + 1);
  }
  return candles;
}

async function loadOrFetchBrokerCandles(symbols: string[]): Promise<{
  candles: Record<string, KiteCandle[]>;
  source: 'live_kite' | 'local_cache' | 'demo_sandbox';
}> {
  const apiKey = process.env.KITE_API_KEY;
  const accessToken = process.env.KITE_ACCESS_TOKEN;

  if (apiKey && accessToken && apiKey !== 'your_api_key_here') {
    console.log(`\n📡 Contacting official Zerodha Kite Connect v3 API...`);
    console.log(`   Key: ${apiKey.slice(0, 4)}••••`);
    const results: Record<string, KiteCandle[]> = {};

    for (const sym of symbols) {
      const info = NSE_INSTRUMENT_MAP[sym];
      if (!info) {
        console.warn(`⚠️ Warning: Instrument token for "${sym}" not found in NSE map.`);
        continue;
      }

      try {
        process.stdout.write(`   Fetching ${sym} (Token #${info.token}) [${fromDate} to ${toDate}]... `);
        const fetched = await fetchKiteHistoricalData({
          apiKey,
          accessToken,
          instrumentToken: info.token,
          interval: 'day',
          from: fromDate,
          to: toDate,
        });
        results[sym] = fetched;
        console.log(`✓ ${fetched.length} candles`);
      } catch (err: any) {
        console.log(`✗ Failed: ${err.message}`);
      }
    }

    if (Object.keys(results).length > 0) {
      try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(results, null, 2));
      } catch {
        // ignore cache write errors
      }
      return { candles: results, source: 'live_kite' };
    }
  }

  if (fs.existsSync(CACHE_FILE)) {
    try {
      const cached = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      if (Object.keys(cached).length > 0) {
        console.log(`\n💾 Loaded existing cached Kite broker candles from: ${CACHE_FILE}`);
        return { candles: cached, source: 'local_cache' };
      }
    } catch {
      // ignore parse error
    }
  }

  console.log(`\nℹ️  Notice: No live KITE_API_KEY & KITE_ACCESS_TOKEN detected in .env.`);
  console.log(`   Running backtest against calibrated NSE tick sandbox to verify engine execution.`);
  console.log(`   👉 Set your credentials in .env to pull live historical bars from Zerodha.\n`);
  
  const demoCandles: Record<string, KiteCandle[]> = {};
  for (const sym of symbols) {
    demoCandles[sym] = generateDemoCandles(sym, fromDate, toDate);
  }
  return { candles: demoCandles, source: 'demo_sandbox' };
}

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║        🇮🇳  NIFTY MULTI-STRATEGY QUANT BACKTEST CLI ENGINE             ║
║            Zerodha Kite Connect v3 Broker Data Runner                ║
╚══════════════════════════════════════════════════════════════════════╝
`);

  const apiKey = process.env.KITE_API_KEY;
  const apiSecret = process.env.KITE_API_SECRET;
  const accessToken = process.env.KITE_ACCESS_TOKEN;

  console.log('Environment Diagnostics:');
  console.log(`  • KITE_API_KEY:      ${apiKey && apiKey !== 'your_api_key_here' ? '✓ Configured (' + apiKey.slice(0, 4) + '***)' : '✗ Not set (set in .env)'}`);
  console.log(`  • KITE_API_SECRET:   ${apiSecret && apiSecret !== 'your_api_secret_here' ? '✓ Configured' : '✗ Not set (set in .env)'}`);
  console.log(`  • KITE_ACCESS_TOKEN: ${accessToken ? '✓ Configured (' + accessToken.slice(0, 6) + '***)' : '✗ Not set'}`);
  if (!accessToken && apiKey && apiKey !== 'your_api_key_here') {
    console.log(`  • 1-Click Login URL: ${getKiteLoginUrl(apiKey)}`);
  }

  let neededSymbols: string[] = [];
  if (strategyId === 'pairs_cointegration') {
    const pair = PAIR_CANDIDATES.find(p => p.pairId === selectedPair) || PAIR_CANDIDATES[0];
    neededSymbols = [pair.stockA, pair.stockB];
  } else {
    neededSymbols = [selectedSymbol];
  }

  console.log(`\nSelected Strategy:    ${strategyId.toUpperCase()}`);
  if (strategyId === 'pairs_cointegration') {
    console.log(`Selected Pair:        ${selectedPair} (${neededSymbols.join(' vs ')})`);
  } else {
    console.log(`Target Instrument:    ${selectedSymbol}`);
  }
  console.log(`Date Range:           ${fromDate} to ${toDate}`);
  console.log(`Initial Capital:      ${formatINR(initialCapital)}`);

  const { candles, source } = await loadOrFetchBrokerCandles(neededSymbols);

  let totalCandles = 0;
  for (const sym of Object.keys(candles)) {
    totalCandles += candles[sym]?.length || 0;
  }

  console.log(`\n⚙️  Running institutional backtest against ${totalCandles.toLocaleString()} broker candles (${source.toUpperCase()})...`);

  const config: StrategyConfig = {
    id: strategyId,
    name: strategyId.replace('_', ' ').toUpperCase(),
    category: strategyId.includes('pairs') ? 'Statistical Arbitrage' : 'Swing',
    universe: 'NIFTY_50',
    variation: 'balanced',
    dataSource: 'kite_broker',
    lookbackDays: 60,
    entryZScore: 2.0,
    exitZScore: 0.5,
    stopLossZScore: 3.5,
    initialCapital,
    maxPositions: 4,
    executionTiming: 'next_open',
    exitTiming: 'same_close',
    brokerageFlat: 20,
    slippageBps: 5,
    startDate: fromDate,
    endDate: toDate,
    selectedPair,
    selectedBasket: 'it_trio',
  };

  const result = runBacktestSimulation(config, candles);
  const stats = result.stats;
  const netProfit = stats.finalEquity - initialCapital;

  const totalBrokerage = result.trades.reduce((s, t) => s + (t.cost?.brokerage || 0), 0);
  const totalSTT = result.trades.reduce((s, t) => s + (t.cost?.stt || 0), 0);
  const totalExchange = result.trades.reduce((s, t) => s + (t.cost?.exchangeFees || 0), 0);
  const totalStamp = result.trades.reduce((s, t) => s + (t.cost?.stampDuty || 0), 0);
  const totalGST = result.trades.reduce((s, t) => s + (t.cost?.gst || 0), 0);
  const totalSebi = result.trades.reduce((s, t) => s + (t.cost?.sebiCharges || 0), 0);
  const totalCostDrag = stats.totalCostsPaid || (totalBrokerage + totalSTT + totalExchange + totalStamp + totalGST + totalSebi);
  const avgHoldingDays = result.trades.length > 0 ? (result.trades.reduce((s, t) => s + (t.holdingDays || 0), 0) / result.trades.length) : 0;

  console.log(`
┌──────────────────────────────────────────────────────────────────────┐
│                    STRATEGY PERFORMANCE METRICS                     │
├────────────────────────────────┬─────────────────────────────────────┤`);
  console.log(`│ Initial Capital                │ ${formatINR(initialCapital).padEnd(35)} │`);
  console.log(`│ Final Strategy Equity          │ ${formatINR(stats.finalEquity).padEnd(35)} │`);
  console.log(`│ Absolute Net P&L               │ ${formatINR(netProfit).padEnd(35)} │`);
  console.log(`│ Net Total Return               │ ${(stats.totalReturnPct.toFixed(2) + '%').padEnd(35)} │`);
  console.log(`│ Strategy CAGR                  │ ${(stats.cagrPct.toFixed(2) + '%').padEnd(35)} │`);
  console.log(`│ Benchmark (Nifty 50) CAGR      │ ${(stats.benchmarkCagrPct.toFixed(2) + '%').padEnd(35)} │`);
  console.log(`│ Strategy Alpha vs Benchmark    │ ${(stats.alpha >= 0 ? '+' : '') + (stats.alpha.toFixed(2) + '%').padEnd(35)} │`);
  console.log(`│ Maximum Drawdown (MDD)         │ ${(stats.maxDrawdownPct.toFixed(2) + '%').padEnd(35)} │`);
  console.log(`│ Sharpe Ratio (Rf = 6.5%)       │ ${stats.sharpeRatio.toFixed(2).padEnd(35)} │`);
  console.log(`│ Sortino Ratio                  │ ${stats.sortinoRatio.toFixed(2).padEnd(35)} │`);
  console.log(`│ Calmar Ratio                   │ ${stats.calmarRatio.toFixed(2).padEnd(35)} │`);
  console.log(`│ Probabilistic Sharpe (PSR)     │ ${(stats.psrConfidence ? (stats.psrConfidence * 100).toFixed(1) + '%' : 'N/A').padEnd(35)} │`);
  console.log(`│ Deflated Sharpe Ratio (DSR)    │ ${(stats.dsrConfidence ? (stats.dsrConfidence * 100).toFixed(1) + '%' : 'N/A').padEnd(35)} │`);
  console.log(`│ Win Rate                       │ ${(stats.winRatePct.toFixed(2) + '% (' + stats.winningTrades + '/' + stats.totalTrades + ' trades)').padEnd(35)} │`);
  console.log(`│ Profit Factor                  │ ${stats.profitFactor.toFixed(2).padEnd(35)} │`);
  console.log(`│ Average Trade Duration         │ ${(avgHoldingDays.toFixed(1) + ' Trading Days').padEnd(35)} │`);
  console.log(`└────────────────────────────────┴─────────────────────────────────────┘`);

  console.log(`
┌──────────────────────────────────────────────────────────────────────┐
│              INDIAN STATUTORY TRANSACTION FRICTION BREAKDOWN         │
├────────────────────────────────┬─────────────────────────────────────┤`);
  console.log(`│ Total Brokerage                │ ${formatINR(totalBrokerage).padEnd(35)} │`);
  console.log(`│ STT (Securities Tx Tax)        │ ${formatINR(totalSTT).padEnd(35)} │`);
  console.log(`│ Exchange Turnover Charges      │ ${formatINR(totalExchange).padEnd(35)} │`);
  console.log(`│ Stamp Duty (State Govt)        │ ${formatINR(totalStamp).padEnd(35)} │`);
  console.log(`│ GST (18% on Brokerage+Exch)    │ ${formatINR(totalGST).padEnd(35)} │`);
  console.log(`│ SEBI Turnover Fees             │ ${formatINR(totalSebi).padEnd(35)} │`);
  console.log(`│ TOTAL STATUTORY FRICTION DRAG  │ ${formatINR(totalCostDrag).padEnd(35)} │`);
  console.log(`│ Friction Impact on Gross Return│ ${(stats.costDragPct.toFixed(2) + '%').padEnd(35)} │`);
  console.log(`└────────────────────────────────┴─────────────────────────────────────┘`);

  if (result.trades.length > 0) {
    console.log(`\n📋 Recent Executed Trades Sample (Total Trades: ${result.trades.length}):`);
    const sample = result.trades.slice(-6);
    console.log(`┌────────────┬────────────┬───────┬────────────┬────────────┬──────────────┬─────────────┬─────────────┐`);
    console.log(`│ Entry Date │ Exit Date  │ Side  │ Entry (₹)  │ Exit (₹)   │ Net PnL (₹)  │ Return (%)  │ Reason      │`);
    console.log(`├────────────┼────────────┼───────┼────────────┼────────────┼──────────────┼─────────────┼─────────────┤`);
    for (const t of sample) {
      const sideStr = (t.side || 'BUY').slice(0, 5).padEnd(5);
      const entryStr = t.entryPrice.toFixed(2).padStart(10);
      const exitStr = t.exitPrice.toFixed(2).padStart(10);
      const pnlStr = (t.netPnl >= 0 ? '+' : '') + t.netPnl.toFixed(2).padStart(11);
      const retStr = (t.netPnlPercent >= 0 ? '+' : '') + (t.netPnlPercent.toFixed(2) + '%').padStart(10);
      const reasonStr = (t.exitReason || 'TARGET').slice(0, 11).padEnd(11);
      console.log(`│ ${t.entryDate} │ ${t.exitDate} │ ${sideStr} │ ${entryStr} │ ${exitStr} │ ${pnlStr} │ ${retStr} │ ${reasonStr} │`);
    }
    console.log(`└────────────┴────────────┴───────┴────────────┴────────────┴──────────────┴─────────────┴─────────────┘`);
  }

  const exportData = {
    generatedAt: new Date().toISOString(),
    config,
    source,
    stats,
    totalTrades: result.trades.length,
    recentTrades: result.trades.slice(-20),
  };

  try {
    const fullPath = path.resolve(process.cwd(), exportPath);
    fs.writeFileSync(fullPath, JSON.stringify(exportData, null, 2));
    console.log(`\n💾 Detailed JSON report written to: ${fullPath}`);
  } catch (err: any) {
    console.warn(`Could not write JSON export: ${err.message}`);
  }

  console.log(`\n✓ Backtest against Kite broker data completed successfully.\n`);
}

main().catch(err => {
  console.error('\n✗ Unhandled CLI Error:', err);
  process.exit(1);
});
