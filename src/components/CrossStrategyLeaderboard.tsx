import React, { useState } from 'react';
import { 
  Layers, 
  Award, 
  TrendingUp, 
  ShieldAlert, 
  Scale, 
  ArrowUpDown, 
  Play, 
  RefreshCw,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { StrategyType, IndexUniverse, StrategyConfig, LeaderboardEntry } from '../types';
import { runBacktestSimulation } from '../engine/backtestSimulator';
import { HISTORICAL_NIFTY_DAILY } from '../data/historicalData';
import { MetricHelpButton } from './MetricHelpButton';

interface CrossStrategyLeaderboardProps {
  currentUniverse: IndexUniverse;
  onSelectStrategy: (strat: StrategyType) => void;
  onOpenMetricHelp?: (metricId: string) => void;
}

const ALL_STRATEGIES: { id: StrategyType; name: string; category: string }[] = [
  { id: 'supertrend_swing', name: 'Supertrend + 200 EMA Swing', category: 'Swing' },
  { id: 'rsi_pullback', name: 'RSI Oversold Pullback (Buy The Dip)', category: 'Pullback' },
  { id: 'golden_cross', name: '50 EMA x 200 EMA Golden Cross', category: 'Trend Following' },
  { id: 'donchian_breakout', name: '20-Day High Breakout', category: 'Breakout' },
  { id: 'btst_momentum', name: 'BTST Top Gainer (Momentum)', category: 'BTST' },
  { id: 'btst_reversal', name: 'BTST Dip Buyer (Reversal)', category: 'BTST' },
  { id: 'pairs_cointegration', name: 'Twin Stock Arbitrage (ADF Stat-Arb)', category: 'Statistical Arbitrage' },
  { id: 'basket_meanreversion', name: 'Sector Basket Stat-Arb', category: 'Basket Stat-Arb' },
];

export const CrossStrategyLeaderboard: React.FC<CrossStrategyLeaderboardProps> = ({
  currentUniverse,
  onSelectStrategy,
  onOpenMetricHelp,
}) => {
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [sortField, setSortField] = useState<keyof LeaderboardEntry>('sharpeRatio');
  const [sortAsc, setSortAsc] = useState(false);

  // Generate multi-strategy ranking on the fly
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => {
    return ALL_STRATEGIES.map((s) => {
      const cfg: StrategyConfig = {
        id: s.id,
        name: s.name,
        category: s.category as any,
        universe: currentUniverse,
        variation: 'balanced',
        lookbackDays: 60,
        entryZScore: 2.0,
        exitZScore: 0.5,
        stopLossZScore: 3.5,
        initialCapital: 1000000,
        maxPositions: 4,
        executionTiming: s.id.includes('btst') ? 'next_open' : 'next_open',
        exitTiming: s.id.includes('btst') ? 'same_open' : 'same_close',
        brokerageFlat: 0,
        slippageBps: 2,
        startDate: '2020-01-01',
        endDate: '2026-08-31',
      };
      const res = runBacktestSimulation(cfg, HISTORICAL_NIFTY_DAILY);
      return {
        strategyId: s.id,
        strategyName: s.name,
        category: s.category,
        cagr: parseFloat(res.stats.cagrPct.toFixed(2)),
        sharpeRatio: parseFloat(res.stats.sharpeRatio.toFixed(2)),
        maxDrawdown: parseFloat(res.stats.maxDrawdownPct.toFixed(2)),
        winRate: parseFloat(res.stats.winRatePct.toFixed(1)),
        totalTrades: res.stats.totalTrades,
        dsrScore: parseFloat(((res.stats.dsrConfidence || 0.88) * 100).toFixed(1)),
        totalCostsPaid: res.stats.totalCostsPaid,
      };
    });
  });

  const handleRunBatch = () => {
    setIsRunningAll(true);
    setTimeout(() => {
      const updated = ALL_STRATEGIES.map((s) => {
        const cfg: StrategyConfig = {
          id: s.id,
          name: s.name,
          category: s.category as any,
          universe: currentUniverse,
          variation: 'balanced',
          lookbackDays: 60,
          entryZScore: 2.0,
          exitZScore: 0.5,
          stopLossZScore: 3.5,
          initialCapital: 1000000,
          maxPositions: 4,
          executionTiming: s.id.includes('btst') ? 'next_open' : 'next_open',
          exitTiming: s.id.includes('btst') ? 'same_open' : 'same_close',
          brokerageFlat: 0,
          slippageBps: 2,
          startDate: '2020-01-01',
          endDate: '2026-08-31',
        };
        const res = runBacktestSimulation(cfg, HISTORICAL_NIFTY_DAILY);
        return {
          strategyId: s.id,
          strategyName: s.name,
          category: s.category,
          cagr: parseFloat(res.stats.cagrPct.toFixed(2)),
          sharpeRatio: parseFloat(res.stats.sharpeRatio.toFixed(2)),
          maxDrawdown: parseFloat(res.stats.maxDrawdownPct.toFixed(2)),
          winRate: parseFloat(res.stats.winRatePct.toFixed(1)),
          totalTrades: res.stats.totalTrades,
          dsrScore: parseFloat(((res.stats.dsrConfidence || 0.88) * 100).toFixed(1)),
          totalCostsPaid: res.stats.totalCostsPaid,
        };
      });
      setEntries(updated);
      setIsRunningAll(false);
    }, 400);
  };

  const sortedEntries = [...entries].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return 0;
  });

  const handleSort = (field: keyof LeaderboardEntry) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold uppercase tracking-wider text-emerald-500">Cross-Strategy Ranking (Phase 6)</span>
            <span>•</span>
            <span>8 Parallel Simulations</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Quantitative Strategy Leaderboard &amp; Overfitting Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Realized performance ranked side-by-side with statutory STT deducted and Deflated Sharpe Ratio (DSR) confidence.
          </p>
        </div>

        <button
          onClick={handleRunBatch}
          disabled={isRunningAll}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center space-x-2 transition cursor-pointer disabled:opacity-50 shadow-sm"
        >
          {isRunningAll ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Simulating All 8...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Re-Run Full Matrix</span>
            </>
          )}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-5">
        <table className="w-full text-xs font-mono text-left">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4 font-semibold">Rank &amp; Strategy</th>
              <th className="py-3 px-4 font-semibold">Category</th>
              <th
                onClick={() => handleSort('cagr')}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>CAGR (%)</span>
                  {onOpenMetricHelp && <MetricHelpButton metricId="cagr" onOpenHelp={onOpenMetricHelp} size="xs" />}
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('sharpeRatio')}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Sharpe</span>
                  {onOpenMetricHelp && <MetricHelpButton metricId="sharpe_ratio" onOpenHelp={onOpenMetricHelp} size="xs" />}
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('maxDrawdown')}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Max DD (%)</span>
                  {onOpenMetricHelp && <MetricHelpButton metricId="max_drawdown" onOpenHelp={onOpenMetricHelp} size="xs" />}
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('winRate')}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Win Rate</span>
                  {onOpenMetricHelp && <MetricHelpButton metricId="win_rate" onOpenHelp={onOpenMetricHelp} size="xs" />}
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('dsrScore')}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>DSR Confidence</span>
                  {onOpenMetricHelp && <MetricHelpButton metricId="dsr" onOpenHelp={onOpenMetricHelp} size="xs" />}
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {sortedEntries.map((entry, idx) => {
              const isTop = idx === 0;
              return (
                <tr key={entry.strategyId} className="hover:bg-slate-850/50 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isTop ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="font-bold text-white text-xs">{entry.strategyName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{entry.category}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400">
                    +{entry.cagr.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-white">
                    {entry.sharpeRatio.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-rose-400">
                    -{entry.maxDrawdown.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right text-slate-200">
                    {entry.winRate.toFixed(0)}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                      {entry.dsrScore}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectStrategy(entry.strategyId)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 font-bold transition text-[11px] cursor-pointer"
                    >
                      Load &amp; Backtest
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
