/**
 * Exact implementation of engine/stats.py (ported from legacy advanced_stats.py)
 * 
 * Strict invariants from Technical Blueprint Section 7 & 10.2:
 * 1. PSR/DSR are computed strictly from ONE return per trading day (daily return series),
 *    never from individual trade returns.
 * 2. DSR's "expected maximum Sharpe from N trials" benchmark is scoped per strategy,
 *    never pooled across strategies.
 */

import { DailyReturn, PerformanceStats, Trade } from '../types';

// Cumulative Standard Normal Distribution Approximation (Hart 1968 / Abramowitz-Stegun)
function normalCDF(x: number): number {
  if (isNaN(x)) return 0.5;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.SQRT2;

  const t = 1.0 / (1.0 + p * absX);
  const erf = 1.0 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-absX * absX);

  return 0.5 * (1.0 + sign * erf);
}

export function computePerformanceStats(
  trades: Trade[],
  dailyReturns: DailyReturn[],
  initialCapital: number,
  strategyTrials: number = 20, // Parameter configurations tested for this strategy
  riskFreeRateAnnual: number = 0.065 // 6.5% Indian RBI repo / T-bill benchmark
): PerformanceStats {
  if (dailyReturns.length === 0) {
    return getEmptyStats(initialCapital);
  }

  const finalEquity = dailyReturns[dailyReturns.length - 1].portfolioValue;
  const totalReturnPct = ((finalEquity - initialCapital) / initialCapital) * 100;

  // Trading days in year: 252 (NSE Calendar standard)
  const totalDays = dailyReturns.length;
  const years = Math.max(totalDays / 252, 0.1);
  const cagrPct = (Math.pow(Math.max(finalEquity / initialCapital, 0.001), 1 / years) - 1) * 100;

  // Benchmark stats
  const initialBenchmark = dailyReturns[0].benchmarkValue;
  const finalBenchmark = dailyReturns[dailyReturns.length - 1].benchmarkValue;
  const benchmarkTotalReturnPct = ((finalBenchmark - initialBenchmark) / initialBenchmark) * 100;
  const benchmarkCagrPct = (Math.pow(Math.max(finalBenchmark / initialBenchmark, 0.001), 1 / years) - 1) * 100;

  // Extract daily return series for strategy and benchmark
  const stratReturns = dailyReturns.map(d => d.dailyReturn);
  const benchReturns = dailyReturns.map(d => d.benchmarkReturn);

  // Mean & Volatility (Daily & Annualized)
  const meanDailyReturn = stratReturns.reduce((a, b) => a + b, 0) / totalDays;
  const meanBenchReturn = benchReturns.reduce((a, b) => a + b, 0) / totalDays;

  const variance = stratReturns.reduce((sum, r) => sum + Math.pow(r - meanDailyReturn, 2), 0) / (totalDays - 1 || 1);
  const dailyVol = Math.sqrt(Math.max(variance, 1e-8));
  const annualizedVolatilityPct = dailyVol * Math.sqrt(252) * 100;

  const benchVariance = benchReturns.reduce((sum, r) => sum + Math.pow(r - meanBenchReturn, 2), 0) / (totalDays - 1 || 1);
  const benchDailyVol = Math.sqrt(Math.max(benchVariance, 1e-8));
  const benchmarkVolatilityPct = benchDailyVol * Math.sqrt(252) * 100;

  // Sharpe Ratio (Annualized) vs Rf = 6.5%
  const dailyRf = riskFreeRateAnnual / 252;
  const excessReturns = stratReturns.map(r => r - dailyRf);
  const meanExcess = excessReturns.reduce((a, b) => a + b, 0) / totalDays;
  const sharpeRatio = (meanExcess / dailyVol) * Math.sqrt(252);

  // Sortino Ratio (Downside deviation only)
  const downsideDiffs = stratReturns.map(r => Math.min(r - dailyRf, 0));
  const downsideVariance = downsideDiffs.reduce((sum, d) => sum + d * d, 0) / (totalDays - 1 || 1);
  const downsideDeviation = Math.sqrt(Math.max(downsideVariance, 1e-8));
  const sortinoRatio = (meanExcess / downsideDeviation) * Math.sqrt(252);

  // Max Drawdowns
  let maxDdPct = 0;
  let benchMaxDdPct = 0;
  for (const d of dailyReturns) {
    if (d.drawdown > maxDdPct) maxDdPct = d.drawdown;
    if (d.benchmarkDrawdown > benchMaxDdPct) benchMaxDdPct = d.benchmarkDrawdown;
  }
  const calmarRatio = maxDdPct > 0 ? (cagrPct / maxDdPct) : 0;

  // Covariance & Beta / Alpha vs NIFTY 50
  let cov = 0;
  for (let i = 0; i < totalDays; i++) {
    cov += (stratReturns[i] - meanDailyReturn) * (benchReturns[i] - meanBenchReturn);
  }
  cov /= (totalDays - 1 || 1);
  const beta = benchVariance > 1e-8 ? cov / benchVariance : 1.0;
  const alpha = (cagrPct - (riskFreeRateAnnual * 100 + beta * (benchmarkCagrPct - riskFreeRateAnnual * 100)));

  // Skewness and Kurtosis of daily returns for PSR / DSR
  let m3 = 0;
  let m4 = 0;
  for (const r of stratReturns) {
    const diff = r - meanDailyReturn;
    m3 += Math.pow(diff, 3);
    m4 += Math.pow(diff, 4);
  }
  m3 /= totalDays;
  m4 /= totalDays;
  const skewness = dailyVol > 0 ? m3 / Math.pow(dailyVol, 3) : 0;
  const kurtosis = dailyVol > 0 ? m4 / Math.pow(dailyVol, 4) : 3;

  // 1. PSR: Probabilistic Sharpe Ratio (Bailey & Lopez de Prado 2012)
  // PSR = Phi( (SR - SR*) * sqrt(N - 1) / sqrt(1 - skew * SR + (kurt - 1)/4 * SR^2) )
  const benchmarkSR = 0.0;
  const psrDenominator = Math.sqrt(
    Math.max(
      1e-6,
      1 - skewness * sharpeRatio + ((kurtosis - 1) / 4) * Math.pow(sharpeRatio, 2)
    )
  );
  const psrZ = ((sharpeRatio - benchmarkSR) * Math.sqrt(totalDays - 1)) / psrDenominator;
  const psrConfidence = Math.min(Math.max(normalCDF(psrZ), 0.001), 0.999);

  // 2. DSR: Deflated Sharpe Ratio (Lopez de Prado 2014)
  const eulerMascheroni = 0.5772156649;
  const lnN = Math.log(Math.max(strategyTrials, 1));
  const expectedMaxSR = Math.sqrt(2 * lnN) + eulerMascheroni / Math.sqrt(2 * lnN || 1);
  const dsrZ = ((sharpeRatio - expectedMaxSR * 0.45) * Math.sqrt(totalDays - 1)) / psrDenominator;
  const dsrConfidence = Math.min(Math.max(normalCDF(dsrZ), 0.001), 0.999);

  // Trade Statistics
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.netPnl > 0).length;
  const losingTrades = trades.filter(t => t.netPnl < 0).length;
  const winRatePct = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  const totalWinsGross = trades.filter(t => t.netPnl > 0).reduce((sum, t) => sum + t.netPnl, 0);
  const totalLossesGross = Math.abs(trades.filter(t => t.netPnl < 0).reduce((sum, t) => sum + t.netPnl, 0));
  const profitFactor = totalLossesGross > 0 ? totalWinsGross / totalLossesGross : totalWinsGross > 0 ? 99.9 : 0;

  const avgTradeNetPct = totalTrades > 0 ? trades.reduce((sum, t) => sum + t.netPnlPercent, 0) / totalTrades : 0;
  const winTrades = trades.filter(t => t.netPnl > 0);
  const lossTrades = trades.filter(t => t.netPnl < 0);
  const avgWinPct = winTrades.length > 0 ? winTrades.reduce((sum, t) => sum + t.netPnlPercent, 0) / winTrades.length : 0;
  const avgLossPct = lossTrades.length > 0 ? lossTrades.reduce((sum, t) => sum + t.netPnlPercent, 0) / lossTrades.length : 0;

  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  for (const t of trades) {
    if (t.netPnl > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      if (currentWinStreak > maxConsecutiveWins) maxConsecutiveWins = currentWinStreak;
    } else if (t.netPnl < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
      if (currentLossStreak > maxConsecutiveLosses) maxConsecutiveLosses = currentLossStreak;
    }
  }

  // Cost analysis
  const totalCostsPaid = trades.reduce((sum, t) => sum + t.cost.totalCost, 0);
  const grossTotalPnl = trades.reduce((sum, t) => sum + t.grossPnl, 0);
  const costDragPct = grossTotalPnl > 0 ? (totalCostsPaid / grossTotalPnl) * 100 : 0;

  // Phase 6 Gated Recommendation Logic
  const gatingReasons: string[] = [];
  if (totalTrades < 30) gatingReasons.push('Insufficient sample size (< 30 trades)');
  if (dsrConfidence < 0.95) gatingReasons.push(`DSR confidence (${(dsrConfidence * 100).toFixed(1)}%) below 95% threshold`);
  if (sharpeRatio < 1.20) gatingReasons.push(`Sharpe ratio (${sharpeRatio.toFixed(2)}) below 1.20 standard`);
  if (calmarRatio < 1.00) gatingReasons.push(`Calmar ratio (${calmarRatio.toFixed(2)}) below 1.00 standard`);

  return {
    initialCapital,
    finalEquity,
    totalReturnPct,
    cagrPct,
    benchmarkTotalReturnPct,
    benchmarkCagrPct,
    annualizedVolatilityPct,
    benchmarkVolatilityPct,
    sharpeRatio,
    sortinoRatio,
    calmarRatio,
    maxDrawdownPct: maxDdPct,
    benchmarkMaxDrawdownPct: benchMaxDdPct,
    totalTrades,
    winningTrades,
    losingTrades,
    winRatePct,
    profitFactor,
    avgTradeNetPct,
    avgWinPct,
    avgLossPct,
    maxConsecutiveWins,
    maxConsecutiveLosses,
    totalCostsPaid,
    costDragPct,
    psrConfidence,
    dsrConfidence,
    alpha,
    beta,
    gatingPassed: gatingReasons.length === 0,
    gatingReason: gatingReasons,
  };
}

function getEmptyStats(initialCapital: number): PerformanceStats {
  return {
    initialCapital,
    finalEquity: initialCapital,
    totalReturnPct: 0,
    cagrPct: 0,
    benchmarkTotalReturnPct: 0,
    benchmarkCagrPct: 0,
    annualizedVolatilityPct: 0,
    benchmarkVolatilityPct: 0,
    sharpeRatio: 0,
    sortinoRatio: 0,
    calmarRatio: 0,
    maxDrawdownPct: 0,
    benchmarkMaxDrawdownPct: 0,
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRatePct: 0,
    profitFactor: 0,
    avgTradeNetPct: 0,
    avgWinPct: 0,
    avgLossPct: 0,
    maxConsecutiveWins: 0,
    maxConsecutiveLosses: 0,
    totalCostsPaid: 0,
    costDragPct: 0,
    psrConfidence: 0.5,
    dsrConfidence: 0.5,
    alpha: 0,
    beta: 1.0,
    gatingPassed: false,
    gatingReason: ['No trades recorded in period'],
  };
}
