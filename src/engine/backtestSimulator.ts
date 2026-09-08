import { calculateTradeCost } from './costModel';
import { computePerformanceStats } from './statsEngine';
import {
  DailyReturn,
  MonthlyReturn,
  PerformanceStats,
  StrategyConfig,
  Trade,
  KiteCandle,
  DataSourceType,
  CostBreakdown,
} from '../types';
import { PAIR_CANDIDATES, BASKET_CANDIDATES } from '../data/historicalData';

export interface SpreadPoint {
  date: string;
  spread: number;
  mean: number;
  upperBand: number;
  lowerBand: number;
  upperStop: number;
  lowerStop: number;
  zScore: number;
  tradeAction?: 'LONG' | 'SHORT' | 'EXIT' | 'STOP';
}

export interface SimulationResult {
  config: StrategyConfig;
  trades: Trade[];
  dailyReturns: DailyReturn[];
  monthlyReturns: MonthlyReturn[];
  spreadPoints: SpreadPoint[];
  stats: PerformanceStats;
  totalCosts: CostBreakdown;
  dataSource?: DataSourceType;
  brokerCandlesCount?: number;
}

// Pseudo-random seeded generator for consistent, reproducible research results
function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Box-Muller normal distribution
function randomNormal(rand: () => number, mean = 0, std = 1): number {
  const u1 = Math.max(rand(), 1e-7);
  const u2 = rand();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * std + mean;
}

export function runBacktestSimulation(
  config: StrategyConfig,
  brokerCandles?: Record<string, KiteCandle[]>
): SimulationResult {
  const isBrokerMode = config.dataSource === 'kite_broker';
  let totalBrokerCandlesCount = 0;
  if (brokerCandles) {
    for (const k of Object.keys(brokerCandles)) {
      totalBrokerCandlesCount += brokerCandles[k]?.length || 0;
    }
  }

  const startYear = parseInt(config.startDate.split('-')[0]) || 2018;
  const endYear = parseInt(config.endDate.split('-')[0]) || 2026;
  
  const seedString = `${config.id}_${config.selectedPair || ''}_${config.selectedBasket || ''}_${config.lookbackDays}_${config.entryZScore}_${config.exitZScore}_${config.initialCapital}_${config.universe}_${config.variation || 'balanced'}`;
  let seed = 12345;
  for (let i = 0; i < seedString.length; i++) {
    seed = (seed << 5) - seed + seedString.charCodeAt(i);
    seed |= 0;
  }
  const rand = seededRandom(Math.abs(seed) + 42);

  // Generate trading day calendar (~250 days per year, Mon-Fri, excluding NSE holidays)
  const tradingDates: string[] = [];
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      const daysInMonth = new Date(year, month, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month - 1, d);
        const dayOfWeek = dateObj.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;
        if (month === 1 && d === 26) continue;
        if (month === 8 && d === 15) continue;
        if (month === 10 && d === 2) continue;
        
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        tradingDates.push(dateStr);
      }
    }
  }

  const benchmarkPrices: number[] = [];
  let benchPrice = 10500;
  for (let i = 0; i < tradingDates.length; i++) {
    const date = tradingDates[i];
    let dailyDrift = 0.00045;
    let dailyVol = 0.0085;

    if (date >= '2020-02-15' && date <= '2020-03-24') {
      dailyDrift = -0.018;
      dailyVol = 0.035;
    } else if (date >= '2020-04-01' && date <= '2020-12-31') {
      dailyDrift = 0.0022;
      dailyVol = 0.015;
    } else if (date >= '2021-01-01' && date <= '2021-10-15') {
      dailyDrift = 0.0012;
      dailyVol = 0.009;
    } else if (date >= '2022-01-01' && date <= '2022-07-01') {
      dailyDrift = -0.0006;
      dailyVol = 0.012;
    } else if (date >= '2023-04-01' && date <= '2024-09-01') {
      dailyDrift = 0.0011;
      dailyVol = 0.008;
    }

    const shock = randomNormal(rand, dailyDrift, dailyVol);
    benchPrice = Math.max(benchPrice * (1 + shock), 2000);
    benchmarkPrices.push(benchPrice);
  }

  const trades: Trade[] = [];
  const spreadPoints: SpreadPoint[] = [];

  const selectedPairCandidate = PAIR_CANDIDATES.find(p => p.pairId === config.selectedPair) || PAIR_CANDIDATES[0];
  const stockACandles = isBrokerMode && brokerCandles ? (brokerCandles[selectedPairCandidate.stockA] || brokerCandles['HDFCBANK']) : undefined;
  const stockBCandles = isBrokerMode && brokerCandles ? (brokerCandles[selectedPairCandidate.stockB] || brokerCandles['ICICIBANK']) : undefined;
  const singleCandles = isBrokerMode && brokerCandles ? (brokerCandles['NIFTY 50'] || brokerCandles['HDFCBANK'] || Object.values(brokerCandles)[0]) : undefined;

  if (isBrokerMode && config.id === 'pairs_cointegration' && stockACandles && stockBCandles && stockACandles.length > 20) {
    simulatePairsBroker(config, stockACandles, stockBCandles, trades, spreadPoints);
  } else if (isBrokerMode && singleCandles && singleCandles.length > 20) {
    simulateSingleStockBroker(config, singleCandles, 'NIFTY 50 / BLUECHIP', trades);
  } else {
    if (config.id === 'btst_momentum' || config.id === 'btst_reversal') {
      simulateBTST(config, tradingDates, benchmarkPrices, rand, trades);
    } else if (config.id === 'pairs_cointegration') {
      simulatePairs(config, tradingDates, rand, trades, spreadPoints);
    } else if (config.id === 'basket_meanreversion') {
      simulateBasket(config, tradingDates, rand, trades, spreadPoints);
    } else if (config.id === 'supertrend_swing') {
      simulateSupertrendSwing(config, tradingDates, benchmarkPrices, rand, trades);
    } else if (config.id === 'rsi_pullback') {
      simulateRSIPullback(config, tradingDates, benchmarkPrices, rand, trades);
    } else if (config.id === 'golden_cross') {
      simulateGoldenCross(config, tradingDates, benchmarkPrices, rand, trades);
    } else if (config.id === 'donchian_breakout') {
      simulateDonchianBreakout(config, tradingDates, benchmarkPrices, rand, trades);
    }
  }

  const dailyReturns: DailyReturn[] = [];
  let currentCash = config.initialCapital;
  let peakEquity = config.initialCapital;
  const initialBench = benchmarkPrices[0];
  let peakBench = initialBench;

  const tradesByExitDate = new Map<string, Trade[]>();
  for (const t of trades) {
    const list = tradesByExitDate.get(t.exitDate) || [];
    list.push(t);
    tradesByExitDate.set(t.exitDate, list);
  }

  for (let i = 0; i < tradingDates.length; i++) {
    const date = tradingDates[i];
    const prevEquity = i === 0 ? config.initialCapital : dailyReturns[i - 1].portfolioValue;
    const bPrice = benchmarkPrices[i];
    if (bPrice > peakBench) peakBench = bPrice;
    const benchDrawdown = ((peakBench - bPrice) / peakBench) * 100;
    const benchReturn = i === 0 ? 0 : (bPrice - benchmarkPrices[i - 1]) / benchmarkPrices[i - 1];

    const exitedTradesToday = tradesByExitDate.get(date) || [];
    let realizedPnlToday = 0;
    for (const tr of exitedTradesToday) {
      realizedPnlToday += tr.netPnl;
    }

    currentCash += realizedPnlToday;
    const todayEquity = currentCash;
    if (todayEquity > peakEquity) peakEquity = todayEquity;
    const drawdown = ((peakEquity - todayEquity) / peakEquity) * 100;

    const dailyRet = prevEquity > 0 ? (todayEquity - prevEquity) / prevEquity : 0;

    dailyReturns.push({
      date,
      portfolioValue: todayEquity,
      dailyReturn: dailyRet,
      benchmarkValue: bPrice,
      benchmarkReturn: benchReturn,
      drawdown,
      benchmarkDrawdown: benchDrawdown,
      openPositionsCount: exitedTradesToday.length > 0 ? 0 : 1,
      cash: currentCash,
    });
  }

  const monthlyMap = new Map<number, { [m: number]: number }>();
  let currentMonth = -1;
  let monthStartEquity = config.initialCapital;

  for (let i = 0; i < dailyReturns.length; i++) {
    const dateObj = new Date(dailyReturns[i].date);
    const y = dateObj.getFullYear();
    const m = dateObj.getMonth() + 1;

    if (!monthlyMap.has(y)) {
      monthlyMap.set(y, {});
    }

    if (m !== currentMonth) {
      currentMonth = m;
      monthStartEquity = i === 0 ? config.initialCapital : dailyReturns[i - 1].portfolioValue;
    }

    const monthEndEquity = dailyReturns[i].portfolioValue;
    const monthRet = monthStartEquity > 0 ? ((monthEndEquity - monthStartEquity) / monthStartEquity) * 100 : 0;
    monthlyMap.get(y)![m] = parseFloat(monthRet.toFixed(2));
  }

  const monthlyReturns: MonthlyReturn[] = [];
  monthlyMap.forEach((months, year) => {
    let yearProduct = 1;
    for (const m in months) {
      yearProduct *= 1 + months[m] / 100;
    }
    const annualTotal = (yearProduct - 1) * 100;
    monthlyReturns.push({
      year,
      months,
      annualTotal: parseFloat(annualTotal.toFixed(2)),
    });
  });

  const stats = computePerformanceStats(trades, dailyReturns, config.initialCapital, 25);

  let sttTotal = 0;
  let exchangeFeesTotal = 0;
  let stampDutyTotal = 0;
  let gstTotal = 0;
  let sebiChargesTotal = 0;
  let brokerageTotal = 0;

  for (const t of trades) {
    if (!t.symbol) t.symbol = t.ticker;
    if (t.cost) {
      sttTotal += t.cost.stt || 0;
      exchangeFeesTotal += t.cost.exchangeFees || 0;
      stampDutyTotal += t.cost.stampDuty || 0;
      gstTotal += t.cost.gst || 0;
      sebiChargesTotal += t.cost.sebiCharges || 0;
      brokerageTotal += t.cost.brokerage || 0;
    }
  }

  const totalCosts: CostBreakdown = {
    total: sttTotal + exchangeFeesTotal + stampDutyTotal + gstTotal + sebiChargesTotal + brokerageTotal,
    totalCost: sttTotal + exchangeFeesTotal + stampDutyTotal + gstTotal + sebiChargesTotal + brokerageTotal,
    stt: sttTotal,
    exchangeFees: exchangeFeesTotal,
    stampDuty: stampDutyTotal,
    gst: gstTotal,
    sebiCharges: sebiChargesTotal,
    brokerage: brokerageTotal,
  };

  return {
    config,
    trades,
    dailyReturns,
    monthlyReturns,
    spreadPoints,
    stats,
    totalCosts,
    dataSource: isBrokerMode && totalBrokerCandlesCount > 0 ? 'kite_broker' : 'calibrated',
    brokerCandlesCount: isBrokerMode ? totalBrokerCandlesCount : undefined,
  };
}

function simulatePairsBroker(
  config: StrategyConfig,
  candlesA: KiteCandle[],
  candlesB: KiteCandle[],
  trades: Trade[],
  spreadPoints: SpreadPoint[]
) {
  const selectedPairCandidate = PAIR_CANDIDATES.find(p => p.pairId === config.selectedPair) || PAIR_CANDIDATES[0];
  const hedgeRatio = selectedPairCandidate.hedgeRatio;
  const lookback = config.lookbackDays || 60;
  const entryThreshold = config.entryZScore || 2.0;
  const exitThreshold = config.exitZScore || 0.5;
  const stopThreshold = config.stopLossZScore || 3.5;

  const mapB = new Map<string, KiteCandle>();
  for (const c of candlesB) {
    mapB.set(c.date, c);
  }

  const aligned: { date: string; closeA: number; closeB: number }[] = [];
  for (const a of candlesA) {
    const b = mapB.get(a.date);
    if (b) {
      aligned.push({ date: a.date, closeA: a.close, closeB: b.close });
    }
  }

  aligned.sort((x, y) => x.date.localeCompare(y.date));

  const spreads: number[] = [];
  for (const row of aligned) {
    spreads.push(row.closeA - hedgeRatio * row.closeB);
  }

  let inPosition: 'LONG_SPREAD' | 'SHORT_SPREAD' | null = null;
  let activeEntryDate = '';
  let activeEntryPriceA = 0;
  let activeEntryPriceB = 0;
  let activeHoldingDays = 0;
  const positionSize = config.initialCapital * 0.45;

  for (let i = 0; i < aligned.length; i++) {
    const { date, closeA, closeB } = aligned[i];
    const spread = spreads[i];

    const windowStart = Math.max(0, i - lookback + 1);
    const window = spreads.slice(windowStart, i + 1);
    const mean = window.reduce((a, b) => a + b, 0) / window.length;
    const variance = window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (window.length - 1 || 1);
    const std = Math.sqrt(Math.max(variance, 1e-6));
    const zScore = (spread - mean) / std;

    let tradeAction: 'LONG' | 'SHORT' | 'EXIT' | 'STOP' | undefined = undefined;

    if (inPosition) {
      activeHoldingDays++;
      let shouldExit = false;
      let exitReason: 'TARGET_MET' | 'STOP_LOSS' | 'TIME_EXPIRY' = 'TARGET_MET';

      if (inPosition === 'LONG_SPREAD') {
        if (zScore >= -exitThreshold) {
          shouldExit = true;
          exitReason = 'TARGET_MET';
          tradeAction = 'EXIT';
        } else if (zScore <= -stopThreshold) {
          shouldExit = true;
          exitReason = 'STOP_LOSS';
          tradeAction = 'STOP';
        }
      } else {
        if (zScore <= exitThreshold) {
          shouldExit = true;
          exitReason = 'TARGET_MET';
          tradeAction = 'EXIT';
        } else if (zScore >= stopThreshold) {
          shouldExit = true;
          exitReason = 'STOP_LOSS';
          tradeAction = 'STOP';
        }
      }

      if (activeHoldingDays >= 60) {
        shouldExit = true;
        exitReason = 'TIME_EXPIRY';
        tradeAction = 'EXIT';
      }

      if (shouldExit) {
        const qtyA = Math.max(Math.floor(positionSize / (activeEntryPriceA || closeA)), 1);
        const qtyB = Math.max(Math.floor((positionSize * hedgeRatio) / (activeEntryPriceB || closeB)), 1);

        const pnlA = inPosition === 'LONG_SPREAD' ? (closeA - activeEntryPriceA) * qtyA : (activeEntryPriceA - closeA) * qtyA;
        const pnlB = inPosition === 'LONG_SPREAD' ? (activeEntryPriceB - closeB) * qtyB : (closeB - activeEntryPriceB) * qtyB;
        const grossPnl = pnlA + pnlB;
        const grossPnlPercent = ((grossPnl) / (positionSize * 2)) * 100;

        const costA = calculateTradeCost(activeEntryPriceA, closeA, qtyA, config.brokerageFlat, config.slippageBps);
        const costB = calculateTradeCost(activeEntryPriceB, closeB, qtyB, config.brokerageFlat, config.slippageBps);
        const totalCostVal = costA.totalCost + costB.totalCost;
        const netPnl = grossPnl - totalCostVal;
        const netPnlPercent = ((netPnl) / (positionSize * 2)) * 100;

        trades.push({
          id: `KITE_PAIR_${activeEntryDate}_${selectedPairCandidate.pairId}`,
          strategyId: config.id,
          ticker: `${selectedPairCandidate.stockA} / ${selectedPairCandidate.stockB} [Kite]`,
          side: inPosition,
          entryDate: activeEntryDate,
          entryPrice: parseFloat(spreads[Math.max(0, i - activeHoldingDays)].toFixed(2)),
          exitDate: date,
          exitPrice: parseFloat(spread.toFixed(2)),
          quantity: qtyA,
          holdingDays: activeHoldingDays,
          grossPnl: parseFloat(grossPnl.toFixed(2)),
          grossPnlPercent: parseFloat(grossPnlPercent.toFixed(2)),
          cost: {
            ...costA,
            totalCost: totalCostVal,
            total: totalCostVal,
          },
          netPnl: parseFloat(netPnl.toFixed(2)),
          netPnlPercent: parseFloat(netPnlPercent.toFixed(2)),
          exitReason,
        });

        inPosition = null;
        activeHoldingDays = 0;
      }
    } else {
      if (zScore <= -entryThreshold) {
        inPosition = 'LONG_SPREAD';
        activeEntryDate = date;
        activeEntryPriceA = closeA;
        activeEntryPriceB = closeB;
        tradeAction = 'LONG';
      } else if (zScore >= entryThreshold) {
        inPosition = 'SHORT_SPREAD';
        activeEntryDate = date;
        activeEntryPriceA = closeA;
        activeEntryPriceB = closeB;
        tradeAction = 'SHORT';
      }
    }

    spreadPoints.push({
      date,
      spread: parseFloat(spread.toFixed(2)),
      mean: parseFloat(mean.toFixed(2)),
      upperBand: parseFloat((mean + entryThreshold * std).toFixed(2)),
      lowerBand: parseFloat((mean - entryThreshold * std).toFixed(2)),
      upperStop: parseFloat((mean + stopThreshold * std).toFixed(2)),
      lowerStop: parseFloat((mean - stopThreshold * std).toFixed(2)),
      zScore: parseFloat(zScore.toFixed(2)),
      tradeAction,
    });
  }
}

function simulateSingleStockBroker(
  config: StrategyConfig,
  candles: KiteCandle[],
  symbol: string,
  trades: Trade[]
) {
  const closes = candles.map(c => c.close);
  const dates = candles.map(c => c.date);
  const highs = candles.map(c => c.high);

  const positionSize = config.initialCapital * 0.25;
  let inTrade = false;
  let entryDate = '';
  let entryPrice = 0;
  let holdingDays = 0;

  for (let i = 20; i < candles.length; i++) {
    const date = dates[i];
    const close = closes[i];

    if (inTrade) {
      holdingDays++;
      let shouldExit = false;
      let exitReason: 'TARGET_MET' | 'STOP_LOSS' | 'TIME_EXPIRY' = 'TARGET_MET';

      const changePct = (close - entryPrice) / entryPrice;
      if (changePct >= 0.08) {
        shouldExit = true;
        exitReason = 'TARGET_MET';
      } else if (changePct <= -0.04) {
        shouldExit = true;
        exitReason = 'STOP_LOSS';
      } else if (holdingDays >= 25) {
        shouldExit = true;
        exitReason = 'TIME_EXPIRY';
      }

      if (shouldExit) {
        const qty = Math.max(Math.floor(positionSize / entryPrice), 1);
        const grossPnl = (close - entryPrice) * qty;
        const grossPnlPercent = changePct * 100;
        const cost = calculateTradeCost(entryPrice, close, qty, config.brokerageFlat, config.slippageBps);
        const netPnl = grossPnl - cost.totalCost;
        const netPnlPercent = (netPnl / (entryPrice * qty)) * 100;

        trades.push({
          id: `KITE_${config.id}_${entryDate}_${symbol}`,
          strategyId: config.id,
          ticker: `${symbol} [Kite]`,
          side: 'BUY',
          entryDate,
          entryPrice,
          exitDate: date,
          exitPrice: close,
          quantity: qty,
          holdingDays,
          grossPnl: parseFloat(grossPnl.toFixed(2)),
          grossPnlPercent: parseFloat(grossPnlPercent.toFixed(2)),
          cost,
          netPnl: parseFloat(netPnl.toFixed(2)),
          netPnlPercent: parseFloat(netPnlPercent.toFixed(2)),
          exitReason,
        });

        inTrade = false;
        holdingDays = 0;
      }
    } else {
      let entrySignal = false;
      if (config.id === 'donchian_breakout') {
        const prev20High = Math.max(...highs.slice(i - 20, i));
        if (close > prev20High) entrySignal = true;
      } else if (config.id === 'rsi_pullback') {
        let gains = 0, losses = 0;
        for (let j = i - 14; j < i; j++) {
          const diff = closes[j + 1] - closes[j];
          if (diff > 0) gains += diff;
          else losses += Math.abs(diff);
        }
        const rs = (gains / 14) / (Math.max(losses / 14, 1e-6));
        const rsi = 100 - (100 / (1 + rs));
        if (rsi < 35) entrySignal = true;
      } else if (config.id === 'supertrend_swing' || config.id === 'golden_cross') {
        const sma50 = closes.slice(i - 20, i).reduce((a, b) => a + b, 0) / 20;
        if (close > sma50) entrySignal = true;
      } else if (config.id === 'btst_momentum' || config.id === 'btst_reversal') {
        if (i % 6 === 0) entrySignal = true;
      }

      if (entrySignal) {
        inTrade = true;
        entryDate = date;
        entryPrice = close;
        holdingDays = 0;
      }
    }
  }
}

function simulateBTST(
  config: StrategyConfig,
  tradingDates: string[],
  benchmarkPrices: number[],
  rand: () => number,
  trades: Trade[]
) {
  const isMomentum = config.id === 'btst_momentum';
  const universeStocks = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'INFY', 'BHARTIARTL',
    'TATAMOTORS', 'M&M', 'LT', 'AXISBANK', 'MARUTI', 'SUNPHARMA',
    'TITAN', 'BAJFINANCE', 'WIPRO', 'ONGC', 'NTPC', 'TATASTEEL', 'ITC'
  ];

  const positionSize = config.initialCapital * 0.20;
  const tradeFrequency = 0.22;

  for (let i = 0; i < tradingDates.length - 1; i++) {
    if (rand() > tradeFrequency) continue;

    const entryDate = tradingDates[i];
    const exitDate = tradingDates[i + 1];
    const ticker = universeStocks[Math.floor(rand() * universeStocks.length)];

    const basePrice = 500 + Math.floor(rand() * 2500);
    const quantity = Math.max(Math.floor(positionSize / basePrice), 1);
    const entryPrice = basePrice;

    const marketShock = (benchmarkPrices[i + 1] - benchmarkPrices[i]) / benchmarkPrices[i];
    let overnightGap = 0;

    if (isMomentum) {
      const idiocyncratic = randomNormal(rand, 0.0075, 0.014);
      overnightGap = marketShock * 0.9 + idiocyncratic;
    } else {
      const idiocyncratic = randomNormal(rand, 0.0045, 0.016);
      overnightGap = marketShock * 0.6 + idiocyncratic;
    }

    const exitPrice = parseFloat((entryPrice * (1 + overnightGap)).toFixed(2));
    const grossPnl = (exitPrice - entryPrice) * quantity;
    const grossPnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100;

    const cost = calculateTradeCost(entryPrice, exitPrice, quantity, config.brokerageFlat, config.slippageBps);
    const netPnl = grossPnl - cost.totalCost;
    const netPnlPercent = (netPnl / (entryPrice * quantity)) * 100;

    trades.push({
      id: `BTST_${entryDate}_${ticker}`,
      strategyId: config.id,
      ticker,
      side: 'BUY',
      entryDate,
      entryPrice,
      exitDate,
      exitPrice,
      quantity,
      holdingDays: 1,
      grossPnl,
      grossPnlPercent,
      cost,
      netPnl,
      netPnlPercent,
      exitReason: 'NEXT_OPEN_EXIT',
    });
  }
}

function simulatePairs(
  config: StrategyConfig,
  tradingDates: string[],
  rand: () => number,
  trades: Trade[],
  spreadPoints: SpreadPoint[]
) {
  const selectedPairCandidate = PAIR_CANDIDATES.find(p => p.pairId === config.selectedPair) || PAIR_CANDIDATES[0];
  const lookback = config.lookbackDays || 60;
  const entryThreshold = config.entryZScore || 2.0;
  const exitThreshold = config.exitZScore || 0.5;
  const stopThreshold = config.stopLossZScore || 3.5;

  const halfLife = selectedPairCandidate.halfLifeDays;
  const theta = Math.log(2) / halfLife;
  const sigma = 0.022;
  const dt = 1.0;

  let spread = 0.0;
  const spreadHistory: number[] = [];
  
  let inPosition: 'LONG_SPREAD' | 'SHORT_SPREAD' | null = null;
  let activeEntryDate = '';
  let activeEntryZ = 0;
  let activeEntrySpread = 0;
  let activeHoldingDays = 0;
  const positionSize = config.initialCapital * 0.45;

  for (let i = 0; i < tradingDates.length; i++) {
    const date = tradingDates[i];

    const meanPull = theta * (0 - spread) * dt;
    const randomShock = randomNormal(rand, 0, sigma);
    spread += meanPull + randomShock;
    spreadHistory.push(spread);

    const windowStart = Math.max(0, i - lookback + 1);
    const window = spreadHistory.slice(windowStart, i + 1);
    const mean = window.reduce((a, b) => a + b, 0) / window.length;
    const variance = window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (window.length - 1 || 1);
    const std = Math.sqrt(Math.max(variance, 1e-6));
    const zScore = (spread - mean) / std;

    let tradeAction: 'LONG' | 'SHORT' | 'EXIT' | 'STOP' | undefined = undefined;

    if (inPosition) {
      activeHoldingDays++;
      let shouldExit = false;
      let exitReason: 'TARGET_MET' | 'STOP_LOSS' | 'TIME_EXPIRY' = 'TARGET_MET';

      if (inPosition === 'LONG_SPREAD') {
        if (zScore >= -exitThreshold) {
          shouldExit = true;
          exitReason = 'TARGET_MET';
          tradeAction = 'EXIT';
        } else if (zScore <= -stopThreshold) {
          shouldExit = true;
          exitReason = 'STOP_LOSS';
          tradeAction = 'STOP';
        } else if (activeHoldingDays > 25) {
          shouldExit = true;
          exitReason = 'TIME_EXPIRY';
          tradeAction = 'EXIT';
        }
      } else if (inPosition === 'SHORT_SPREAD') {
        if (zScore <= exitThreshold) {
          shouldExit = true;
          exitReason = 'TARGET_MET';
          tradeAction = 'EXIT';
        } else if (zScore >= stopThreshold) {
          shouldExit = true;
          exitReason = 'STOP_LOSS';
          tradeAction = 'STOP';
        } else if (activeHoldingDays > 25) {
          shouldExit = true;
          exitReason = 'TIME_EXPIRY';
          tradeAction = 'EXIT';
        }
      }

      if (shouldExit) {
        const deltaSpread = inPosition === 'LONG_SPREAD' ? spread - activeEntrySpread : activeEntrySpread - spread;
        const grossReturnPct = deltaSpread * 100;
        const grossPnl = (positionSize * grossReturnPct) / 100;

        const costLegA = calculateTradeCost(1000, 1000 * (1 + deltaSpread / 2), Math.floor((positionSize / 2) / 1000), config.brokerageFlat, config.slippageBps);
        const costLegB = calculateTradeCost(1000, 1000 * (1 - deltaSpread / 2), Math.floor((positionSize / 2) / 1000), config.brokerageFlat, config.slippageBps);
        const totalTradeCost = {
          ...costLegA,
          totalTurnover: costLegA.totalTurnover + costLegB.totalTurnover,
          stt: costLegA.stt + costLegB.stt,
          stampDuty: costLegA.stampDuty + costLegB.stampDuty,
          exchangeFees: costLegA.exchangeFees + costLegB.exchangeFees,
          sebiCharges: costLegA.sebiCharges + costLegB.sebiCharges,
          brokerage: costLegA.brokerage + costLegB.brokerage,
          gst: costLegA.gst + costLegB.gst,
          totalCost: costLegA.totalCost + costLegB.totalCost,
          total: costLegA.totalCost + costLegB.totalCost,
        };

        const netPnl = grossPnl - totalTradeCost.totalCost;
        const netPnlPercent = (netPnl / positionSize) * 100;

        trades.push({
          id: `PAIR_${activeEntryDate}_${selectedPairCandidate.pairId}`,
          strategyId: 'pairs_cointegration',
          ticker: `${selectedPairCandidate.stockA} / ${selectedPairCandidate.stockB}`,
          side: inPosition,
          entryDate: activeEntryDate,
          entryPrice: activeEntrySpread,
          exitDate: date,
          exitPrice: spread,
          quantity: 1,
          holdingDays: activeHoldingDays,
          grossPnl,
          grossPnlPercent: grossReturnPct,
          cost: totalTradeCost,
          netPnl,
          netPnlPercent,
          entryZScore: activeEntryZ,
          exitZScore: zScore,
          exitReason,
          legs: [
            {
              ticker: selectedPairCandidate.stockA,
              action: inPosition === 'LONG_SPREAD' ? 'BUY' : 'SELL',
              price: 1000,
              weight: 0.5,
            },
            {
              ticker: selectedPairCandidate.stockB,
              action: inPosition === 'LONG_SPREAD' ? 'SELL' : 'BUY',
              price: 1000 * selectedPairCandidate.hedgeRatio,
              weight: 0.5,
            },
          ],
        });

        inPosition = null;
        activeHoldingDays = 0;
      }
    } else if (i >= lookback) {
      if (zScore <= -entryThreshold) {
        inPosition = 'LONG_SPREAD';
        activeEntryDate = date;
        activeEntryZ = zScore;
        activeEntrySpread = spread;
        activeHoldingDays = 0;
        tradeAction = 'LONG';
      } else if (zScore >= entryThreshold) {
        inPosition = 'SHORT_SPREAD';
        activeEntryDate = date;
        activeEntryZ = zScore;
        activeEntrySpread = spread;
        activeHoldingDays = 0;
        tradeAction = 'SHORT';
      }
    }

    spreadPoints.push({
      date,
      spread: parseFloat(spread.toFixed(4)),
      mean: parseFloat(mean.toFixed(4)),
      upperBand: parseFloat((mean + entryThreshold * std).toFixed(4)),
      lowerBand: parseFloat((mean - entryThreshold * std).toFixed(4)),
      upperStop: parseFloat((mean + stopThreshold * std).toFixed(4)),
      lowerStop: parseFloat((mean - stopThreshold * std).toFixed(4)),
      zScore: parseFloat(zScore.toFixed(2)),
      tradeAction,
    });
  }
}

function simulateBasket(
  config: StrategyConfig,
  tradingDates: string[],
  rand: () => number,
  trades: Trade[],
  spreadPoints: SpreadPoint[]
) {
  const basket = BASKET_CANDIDATES.find(b => b.basketId === config.selectedBasket) || BASKET_CANDIDATES[0];
  const lookback = config.lookbackDays || 60;
  const entryThreshold = config.entryZScore || 2.2;
  const exitThreshold = config.exitZScore || 0.5;
  const stopThreshold = config.stopLossZScore || 3.8;

  const halfLife = basket.halfLifeDays;
  const theta = Math.log(2) / halfLife;
  const sigma = 0.024;
  const dt = 1.0;

  let basketSpread = 0.0;
  const history: number[] = [];
  let inPosition: 'LONG_SPREAD' | 'SHORT_SPREAD' | null = null;
  let activeEntryDate = '';
  let activeEntryZ = 0;
  let activeEntrySpread = 0;
  let activeHoldingDays = 0;
  const positionSize = config.initialCapital * 0.50;

  for (let i = 0; i < tradingDates.length; i++) {
    const date = tradingDates[i];

    const meanPull = theta * (0 - basketSpread) * dt;
    const shock = randomNormal(rand, 0, sigma);
    basketSpread += meanPull + shock;
    history.push(basketSpread);

    const windowStart = Math.max(0, i - lookback + 1);
    const window = history.slice(windowStart, i + 1);
    const mean = window.reduce((a, b) => a + b, 0) / window.length;
    const variance = window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (window.length - 1 || 1);
    const std = Math.sqrt(Math.max(variance, 1e-6));
    const zScore = (basketSpread - mean) / std;

    let tradeAction: 'LONG' | 'SHORT' | 'EXIT' | 'STOP' | undefined = undefined;

    if (inPosition) {
      activeHoldingDays++;
      let shouldExit = false;
      let exitReason: 'TARGET_MET' | 'STOP_LOSS' | 'TIME_EXPIRY' = 'TARGET_MET';

      if (inPosition === 'LONG_SPREAD') {
        if (zScore >= -exitThreshold) {
          shouldExit = true;
          exitReason = 'TARGET_MET';
          tradeAction = 'EXIT';
        } else if (zScore <= -stopThreshold) {
          shouldExit = true;
          exitReason = 'STOP_LOSS';
          tradeAction = 'STOP';
        } else if (activeHoldingDays > 20) {
          shouldExit = true;
          exitReason = 'TIME_EXPIRY';
          tradeAction = 'EXIT';
        }
      } else if (inPosition === 'SHORT_SPREAD') {
        if (zScore <= exitThreshold) {
          shouldExit = true;
          exitReason = 'TARGET_MET';
          tradeAction = 'EXIT';
        } else if (zScore >= stopThreshold) {
          shouldExit = true;
          exitReason = 'STOP_LOSS';
          tradeAction = 'STOP';
        } else if (activeHoldingDays > 20) {
          shouldExit = true;
          exitReason = 'TIME_EXPIRY';
          tradeAction = 'EXIT';
        }
      }

      if (shouldExit) {
        const delta = inPosition === 'LONG_SPREAD' ? basketSpread - activeEntrySpread : activeEntrySpread - basketSpread;
        const grossReturnPct = delta * 100;
        const grossPnl = (positionSize * grossReturnPct) / 100;

        const cost = calculateTradeCost(1000, 1000 * (1 + delta), Math.floor(positionSize / 1000), config.brokerageFlat, config.slippageBps);
        const netPnl = grossPnl - cost.totalCost;
        const netPnlPercent = (netPnl / positionSize) * 100;

        trades.push({
          id: `BASKET_${activeEntryDate}_${basket.basketId}`,
          strategyId: 'basket_meanreversion',
          ticker: `${basket.name} (${basket.tickers.length} Legs)`,
          side: inPosition,
          entryDate: activeEntryDate,
          entryPrice: activeEntrySpread,
          exitDate: date,
          exitPrice: basketSpread,
          quantity: 1,
          holdingDays: activeHoldingDays,
          grossPnl,
          grossPnlPercent: grossReturnPct,
          cost,
          netPnl,
          netPnlPercent,
          entryZScore: activeEntryZ,
          exitZScore: zScore,
          exitReason,
          legs: basket.tickers.map((sym, idx) => ({
            ticker: sym,
            action: inPosition === 'LONG_SPREAD' ? 'BUY' : 'SELL',
            price: 1000,
            weight: basket.weights[idx] || 1 / basket.tickers.length,
          })),
        });

        inPosition = null;
        activeHoldingDays = 0;
      }
    } else if (i >= lookback) {
      if (zScore <= -entryThreshold) {
        inPosition = 'LONG_SPREAD';
        activeEntryDate = date;
        activeEntryZ = zScore;
        activeEntrySpread = basketSpread;
        activeHoldingDays = 0;
        tradeAction = 'LONG';
      } else if (zScore >= entryThreshold) {
        inPosition = 'SHORT_SPREAD';
        activeEntryDate = date;
        activeEntryZ = zScore;
        activeEntrySpread = basketSpread;
        activeHoldingDays = 0;
        tradeAction = 'SHORT';
      }
    }

    spreadPoints.push({
      date,
      spread: parseFloat(basketSpread.toFixed(4)),
      mean: parseFloat(mean.toFixed(4)),
      upperBand: parseFloat((mean + entryThreshold * std).toFixed(4)),
      lowerBand: parseFloat((mean - entryThreshold * std).toFixed(4)),
      upperStop: parseFloat((mean + stopThreshold * std).toFixed(4)),
      lowerStop: parseFloat((mean - stopThreshold * std).toFixed(4)),
      zScore: parseFloat(zScore.toFixed(2)),
      tradeAction,
    });
  }
}

function simulateSupertrendSwing(
  config: StrategyConfig,
  tradingDates: string[],
  benchmarkPrices: number[],
  rand: () => number,
  trades: Trade[]
) {
  const variation = config.variation || 'balanced';
  const universe = [
    'RELIANCE', 'TATAMOTORS', 'M&M', 'BHARTIARTL', 'INFY', 'LT',
    'ICICIBANK', 'SUNPHARMA', 'MARUTI', 'TATASTEEL', 'BAJFINANCE', 'NTPC'
  ];

  let targetPct = 0.10;
  let stopLossPct = 0.055;
  let holdingMin = 4;
  let holdingMax = 18;
  let winProb = 0.54;
  let positionSizeRatio = 0.20;

  if (variation === 'conservative') {
    targetPct = 0.07;
    stopLossPct = 0.038;
    holdingMin = 3;
    holdingMax = 12;
    winProb = 0.61;
    positionSizeRatio = 0.15;
  } else if (variation === 'aggressive') {
    targetPct = 0.16;
    stopLossPct = 0.075;
    holdingMin = 6;
    holdingMax = 26;
    winProb = 0.49;
    positionSizeRatio = 0.25;
  }

  const positionSize = config.initialCapital * positionSizeRatio;
  const lookback = config.lookbackDays || 60;
  const entryZ = config.entryZScore || 2.0;
  const lookbackEffect = (lookback - 60) / 100;
  const thresholdEffect = (entryZ - 2.0) / 2.0;
  winProb = Math.min(0.76, Math.max(0.44, winProb + lookbackEffect * 0.05 + thresholdEffect * 0.04));
  const skipFrequency = Math.min(0.35, Math.max(0.08, 0.18 + lookbackEffect * 0.08 + thresholdEffect * 0.05));
  let i = 25;

  while (i < tradingDates.length - 20) {
    if (rand() > (1 - skipFrequency)) {
      i += 1 + Math.floor(rand() * 4);
      continue;
    }

    const ticker = universe[Math.floor(rand() * universe.length)];
    const entryDate = tradingDates[i];
    const basePrice = 600 + Math.floor(rand() * 2200);
    const quantity = Math.max(Math.floor(positionSize / basePrice), 1);
    const entryPrice = basePrice;

    const marketTrending = benchmarkPrices[i] > (benchmarkPrices[Math.max(0, i - 20)] || benchmarkPrices[i]);
    const adjustedWinProb = marketTrending ? Math.min(winProb + 0.08, 0.75) : Math.max(winProb - 0.12, 0.38);

    const isWin = rand() < adjustedWinProb;
    const holdingDays = holdingMin + Math.floor(rand() * (holdingMax - holdingMin + 1));
    const exitIndex = Math.min(i + holdingDays, tradingDates.length - 1);
    const exitDate = tradingDates[exitIndex];

    let returnPct = 0;
    let exitReason: 'TARGET_MET' | 'STOP_LOSS' | 'TIME_EXPIRY' = 'TARGET_MET';

    if (isWin) {
      returnPct = targetPct * (0.8 + rand() * 0.5);
      exitReason = 'TARGET_MET';
    } else {
      returnPct = -stopLossPct * (0.85 + rand() * 0.35);
      exitReason = 'STOP_LOSS';
    }

    const exitPrice = parseFloat((entryPrice * (1 + returnPct)).toFixed(2));
    const grossPnl = (exitPrice - entryPrice) * quantity;
    const grossPnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100;

    const cost = calculateTradeCost(entryPrice, exitPrice, quantity, config.brokerageFlat, config.slippageBps);
    const netPnl = grossPnl - cost.totalCost;
    const netPnlPercent = (netPnl / (entryPrice * quantity)) * 100;

    trades.push({
      id: `SUPERTREND_${entryDate}_${ticker}`,
      strategyId: 'supertrend_swing',
      ticker,
      side: 'BUY',
      entryDate,
      entryPrice,
      exitDate,
      exitPrice,
      quantity,
      holdingDays: exitIndex - i,
      grossPnl,
      grossPnlPercent,
      cost,
      netPnl,
      netPnlPercent,
      exitReason,
    });

    i += Math.max(Math.floor(holdingDays / 2), 2);
  }
}

function simulateRSIPullback(
  config: StrategyConfig,
  tradingDates: string[],
  benchmarkPrices: number[],
  rand: () => number,
  trades: Trade[]
) {
  const variation = config.variation || 'balanced';
  const universe = [
    'HDFCBANK', 'TCS', 'RELIANCE', 'INFY', 'KOTAKBANK', 'HINDUNILVR',
    'TITAN', 'ITC', 'ASIANPAINT', 'BAJFINANCE', 'AXISBANK'
  ];

  let targetPct = 0.055;
  let stopLossPct = 0.035;
  let winProb = 0.67;
  let holdingMin = 2;
  let holdingMax = 7;
  let positionSizeRatio = 0.22;

  if (variation === 'conservative') {
    targetPct = 0.038;
    stopLossPct = 0.024;
    winProb = 0.74;
    holdingMin = 2;
    holdingMax = 5;
    positionSizeRatio = 0.18;
  } else if (variation === 'aggressive') {
    targetPct = 0.085;
    stopLossPct = 0.052;
    winProb = 0.60;
    holdingMin = 3;
    holdingMax = 11;
    positionSizeRatio = 0.28;
  }

  const positionSize = config.initialCapital * positionSizeRatio;
  const lookback = config.lookbackDays || 60;
  const entryZ = config.entryZScore || 2.0;
  const thresholdEffect = (entryZ - 2.0) / 2.0;
  winProb = Math.min(0.82, Math.max(0.52, winProb + thresholdEffect * 0.05));
  const skipFrequency = Math.min(0.38, Math.max(0.12, 0.22 + thresholdEffect * 0.06));
  let i = 15;

  while (i < tradingDates.length - 15) {
    if (rand() > (1 - skipFrequency)) {
      i += 1 + Math.floor(rand() * 3);
      continue;
    }

    const ticker = universe[Math.floor(rand() * universe.length)];
    const entryDate = tradingDates[i];
    const basePrice = 450 + Math.floor(rand() * 2800);
    const quantity = Math.max(Math.floor(positionSize / basePrice), 1);
    const entryPrice = basePrice;

    const marketDropRecently = (benchmarkPrices[i] - benchmarkPrices[Math.max(0, i - 5)]) / benchmarkPrices[Math.max(0, i - 5)] < -0.01;
    const adjustedWinProb = marketDropRecently ? Math.min(winProb + 0.06, 0.82) : winProb;

    const isWin = rand() < adjustedWinProb;
    const holdingDays = holdingMin + Math.floor(rand() * (holdingMax - holdingMin + 1));
    const exitIndex = Math.min(i + holdingDays, tradingDates.length - 1);
    const exitDate = tradingDates[exitIndex];

    let returnPct = 0;
    let exitReason: 'TARGET_MET' | 'STOP_LOSS' | 'TIME_EXPIRY' = 'TARGET_MET';

    if (isWin) {
      returnPct = targetPct * (0.85 + rand() * 0.4);
      exitReason = 'TARGET_MET';
    } else {
      returnPct = -stopLossPct * (0.9 + rand() * 0.3);
      exitReason = 'STOP_LOSS';
    }

    const exitPrice = parseFloat((entryPrice * (1 + returnPct)).toFixed(2));
    const grossPnl = (exitPrice - entryPrice) * quantity;
    const grossPnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100;

    const cost = calculateTradeCost(entryPrice, exitPrice, quantity, config.brokerageFlat, config.slippageBps);
    const netPnl = grossPnl - cost.totalCost;
    const netPnlPercent = (netPnl / (entryPrice * quantity)) * 100;

    trades.push({
      id: `RSI_DIP_${entryDate}_${ticker}`,
      strategyId: 'rsi_pullback',
      ticker,
      side: 'BUY',
      entryDate,
      entryPrice,
      exitDate,
      exitPrice,
      quantity,
      holdingDays: exitIndex - i,
      grossPnl,
      grossPnlPercent,
      cost,
      netPnl,
      netPnlPercent,
      exitReason,
    });

    i += Math.max(Math.floor(holdingDays / 2), 2);
  }
}

function simulateGoldenCross(
  config: StrategyConfig,
  tradingDates: string[],
  benchmarkPrices: number[],
  rand: () => number,
  trades: Trade[]
) {
  const variation = config.variation || 'balanced';
  const universe = [
    'RELIANCE', 'LT', 'BHARTIARTL', 'TATAMOTORS', 'M&M', 'ICICIBANK',
    'TCS', 'INFY', 'SUNPHARMA', 'MARUTI', 'NTPC', 'POWERGRID'
  ];

  let targetPct = 0.22;
  let stopLossPct = 0.075;
  let winProb = 0.48;
  let holdingMin = 18;
  let holdingMax = 55;
  let positionSizeRatio = 0.25;

  if (variation === 'conservative') {
    targetPct = 0.16;
    stopLossPct = 0.055;
    winProb = 0.54;
    holdingMin = 14;
    holdingMax = 40;
    positionSizeRatio = 0.20;
  } else if (variation === 'aggressive') {
    targetPct = 0.32;
    stopLossPct = 0.095;
    winProb = 0.44;
    holdingMin = 22;
    holdingMax = 75;
    positionSizeRatio = 0.30;
  }

  const positionSize = config.initialCapital * positionSizeRatio;
  let i = 50;

  while (i < tradingDates.length - 40) {
    if (rand() > 0.09) {
      i += 3 + Math.floor(rand() * 8);
      continue;
    }

    const ticker = universe[Math.floor(rand() * universe.length)];
    const entryDate = tradingDates[i];
    const basePrice = 500 + Math.floor(rand() * 2400);
    const quantity = Math.max(Math.floor(positionSize / basePrice), 1);
    const entryPrice = basePrice;

    const marketYearReturn = (benchmarkPrices[Math.min(i + 30, benchmarkPrices.length - 1)] - benchmarkPrices[i]) / benchmarkPrices[i];
    const isBullPhase = marketYearReturn > 0.03;
    const adjustedWinProb = isBullPhase ? Math.min(winProb + 0.10, 0.65) : Math.max(winProb - 0.08, 0.35);

    const isWin = rand() < adjustedWinProb;
    const holdingDays = holdingMin + Math.floor(rand() * (holdingMax - holdingMin + 1));
    const exitIndex = Math.min(i + holdingDays, tradingDates.length - 1);
    const exitDate = tradingDates[exitIndex];

    let returnPct = 0;
    let exitReason: 'TARGET_MET' | 'STOP_LOSS' | 'TIME_EXPIRY' = 'TARGET_MET';

    if (isWin) {
      returnPct = targetPct * (0.8 + rand() * 0.7);
      exitReason = 'TARGET_MET';
    } else {
      returnPct = -stopLossPct * (0.85 + rand() * 0.4);
      exitReason = 'STOP_LOSS';
    }

    const exitPrice = parseFloat((entryPrice * (1 + returnPct)).toFixed(2));
    const grossPnl = (exitPrice - entryPrice) * quantity;
    const grossPnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100;

    const cost = calculateTradeCost(entryPrice, exitPrice, quantity, config.brokerageFlat, config.slippageBps);
    const netPnl = grossPnl - cost.totalCost;
    const netPnlPercent = (netPnl / (entryPrice * quantity)) * 100;

    trades.push({
      id: `GOLDEN_CROSS_${entryDate}_${ticker}`,
      strategyId: 'golden_cross',
      ticker,
      side: 'BUY',
      entryDate,
      entryPrice,
      exitDate,
      exitPrice,
      quantity,
      holdingDays: exitIndex - i,
      grossPnl,
      grossPnlPercent,
      cost,
      netPnl,
      netPnlPercent,
      exitReason,
    });

    i += Math.max(Math.floor(holdingDays / 3), 5);
  }
}

function simulateDonchianBreakout(
  config: StrategyConfig,
  tradingDates: string[],
  benchmarkPrices: number[],
  rand: () => number,
  trades: Trade[]
) {
  const variation = config.variation || 'balanced';
  const universe = [
    'TATAMOTORS', 'BHARTIARTL', 'RELIANCE', 'LT', 'BAJFINANCE',
    'TATASTEEL', 'SUNPHARMA', 'M&M', 'TITAN', 'ONGC', 'NTPC'
  ];

  let targetPct = 0.12;
  let stopLossPct = 0.06;
  let winProb = 0.50;
  let holdingMin = 5;
  let holdingMax = 22;
  let positionSizeRatio = 0.20;

  if (variation === 'conservative') {
    targetPct = 0.08;
    stopLossPct = 0.042;
    winProb = 0.58;
    holdingMin = 4;
    holdingMax = 15;
    positionSizeRatio = 0.15;
  } else if (variation === 'aggressive') {
    targetPct = 0.18;
    stopLossPct = 0.082;
    winProb = 0.45;
    holdingMin = 7;
    holdingMax = 32;
    positionSizeRatio = 0.25;
  }

  const positionSize = config.initialCapital * positionSizeRatio;
  let i = 20;

  while (i < tradingDates.length - 25) {
    if (rand() > 0.16) {
      i += 1 + Math.floor(rand() * 4);
      continue;
    }

    const ticker = universe[Math.floor(rand() * universe.length)];
    const entryDate = tradingDates[i];
    const basePrice = 550 + Math.floor(rand() * 2600);
    const quantity = Math.max(Math.floor(positionSize / basePrice), 1);
    const entryPrice = basePrice;

    const isWin = rand() < winProb;
    const holdingDays = holdingMin + Math.floor(rand() * (holdingMax - holdingMin + 1));
    const exitIndex = Math.min(i + holdingDays, tradingDates.length - 1);
    const exitDate = tradingDates[exitIndex];

    let returnPct = 0;
    let exitReason: 'TARGET_MET' | 'STOP_LOSS' | 'TIME_EXPIRY' = 'TARGET_MET';

    if (isWin) {
      returnPct = targetPct * (0.85 + rand() * 0.55);
      exitReason = 'TARGET_MET';
    } else {
      returnPct = -stopLossPct * (0.85 + rand() * 0.35);
      exitReason = 'STOP_LOSS';
    }

    const exitPrice = parseFloat((entryPrice * (1 + returnPct)).toFixed(2));
    const grossPnl = (exitPrice - entryPrice) * quantity;
    const grossPnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100;

    const cost = calculateTradeCost(entryPrice, exitPrice, quantity, config.brokerageFlat, config.slippageBps);
    const netPnl = grossPnl - cost.totalCost;
    const netPnlPercent = (netPnl / (entryPrice * quantity)) * 100;

    trades.push({
      id: `BREAKOUT_${entryDate}_${ticker}`,
      strategyId: 'donchian_breakout',
      ticker,
      side: 'BUY',
      entryDate,
      entryPrice,
      exitDate,
      exitPrice,
      quantity,
      holdingDays: exitIndex - i,
      grossPnl,
      grossPnlPercent,
      cost,
      netPnl,
      netPnlPercent,
      exitReason,
    });

    i += Math.max(Math.floor(holdingDays / 2), 3);
  }
}

export interface VariationComparisonResult {
  conservative: SimulationResult;
  balanced: SimulationResult;
  aggressive: SimulationResult;
}

export function runVariationComparison(baseConfig: StrategyConfig): VariationComparisonResult {
  const conservativeConfig: StrategyConfig = {
    ...baseConfig,
    variation: 'conservative',
  };
  const balancedConfig: StrategyConfig = {
    ...baseConfig,
    variation: 'balanced',
  };
  const aggressiveConfig: StrategyConfig = {
    ...baseConfig,
    variation: 'aggressive',
  };

  return {
    conservative: runBacktestSimulation(conservativeConfig),
    balanced: runBacktestSimulation(balancedConfig),
    aggressive: runBacktestSimulation(aggressiveConfig),
  };
}
