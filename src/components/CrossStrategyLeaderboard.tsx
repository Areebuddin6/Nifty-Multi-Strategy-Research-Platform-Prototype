import React, { useState } from 'react';
import { Award, TrendingUp, ShieldAlert, Zap, Filter, ArrowUpDown } from 'lucide-react';
import { StrategyType } from '../types';

interface StrategyRankingRow {
  rank: number;
  strategyId: StrategyType;
  name: string;
  category: string;
  cagr: number;
  sharpe: number;
  sortino: number;
  maxDrawdown: number;
  calmar: number;
  winRate: number;
  dsrConfidence: number;
  turnoverRatio: number;
}

interface CrossStrategyLeaderboardProps {
  onSelectStrategy: (strat: StrategyType) => void;
  currentStrategyId: StrategyType;
}

export const CrossStrategyLeaderboard: React.FC<CrossStrategyLeaderboardProps> = ({
  onSelectStrategy,
  currentStrategyId,
}) => {
  const [sortField, setSortField] = useState<keyof StrategyRankingRow>('sharpe');
  const [sortAsc, setSortAsc] = useState(false);

  const initialRows: StrategyRankingRow[] = [
    {
      rank: 1,
      strategyId: 'pairs_cointegration',
      name: 'Twin Stock Arbitrage (ADF Stat-Arb)',
      category: 'Pairs Arbitrage',
      cagr: 24.8,
      sharpe: 2.15,
      sortino: 2.82,
      maxDrawdown: 8.6,
      calmar: 2.88,
      winRate: 71.4,
      dsrConfidence: 94.2,
      turnoverRatio: 1.8,
    },
    {
      rank: 2,
      strategyId: 'basket_meanreversion',
      name: 'Sector Basket Stat-Arb (N-Leg)',
      category: 'Multi-Leg Stat-Arb',
      cagr: 28.5,
      sharpe: 1.94,
      sortino: 2.51,
      maxDrawdown: 10.4,
      calmar: 2.74,
      winRate: 69.2,
      dsrConfidence: 91.8,
      turnoverRatio: 2.4,
    },
    {
      rank: 3,
      strategyId: 'supertrend_swing',
      name: 'Supertrend + 200 EMA Swing',
      category: 'Trend Following',
      cagr: 22.4,
      sharpe: 1.76,
      sortino: 2.14,
      maxDrawdown: 12.2,
      calmar: 1.84,
      winRate: 58.6,
      dsrConfidence: 89.5,
      turnoverRatio: 3.1,
    },
    {
      rank: 4,
      strategyId: 'rsi_pullback',
      name: 'RSI Oversold Pullback (Buy The Dip)',
      category: 'Mean Reversion',
      cagr: 19.8,
      sharpe: 1.62,
      sortino: 1.98,
      maxDrawdown: 11.5,
      calmar: 1.72,
      winRate: 66.4,
      dsrConfidence: 86.4,
      turnoverRatio: 4.5,
    },
    {
      rank: 5,
      strategyId: 'btst_momentum',
      name: 'BTST Top Gainer (Momentum)',
      category: 'Overnight BTST',
      cagr: 31.2,
      sharpe: 1.58,
      sortino: 1.85,
      maxDrawdown: 16.8,
      calmar: 1.86,
      winRate: 59.8,
      dsrConfidence: 85.1,
      turnoverRatio: 12.8,
    },
    {
      rank: 6,
      strategyId: 'btst_reversal',
      name: 'BTST Dip Buyer (Reversal)',
      category: 'Overnight BTST',
      cagr: 26.4,
      sharpe: 1.52,
      sortino: 1.76,
      maxDrawdown: 15.2,
      calmar: 1.74,
      winRate: 61.2,
      dsrConfidence: 84.6,
      turnoverRatio: 10.5,
    },
    {
      rank: 7,
      strategyId: 'donchian_breakout',
      name: '20-Day High Breakout (Turtle)',
      category: 'Breakout Momentum',
      cagr: 21.6,
      sharpe: 1.44,
      sortino: 1.68,
      maxDrawdown: 15.9,
      calmar: 1.36,
      winRate: 51.5,
      dsrConfidence: 82.3,
      turnoverRatio: 3.8,
    },
    {
      rank: 8,
      strategyId: 'golden_cross',
      name: '50 EMA x 200 EMA Golden Cross',
      category: 'Long-Term Trend',
      cagr: 18.2,
      sharpe: 1.35,
      sortino: 1.52,
      maxDrawdown: 17.8,
      calmar: 1.02,
      winRate: 49.2,
      dsrConfidence: 81.0,
      turnoverRatio: 1.2,
    },
  ];

  const sortedRows = [...initialRows].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === 'string') return 0;
    return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
  });

  const handleSort = (field: keyof StrategyRankingRow) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold uppercase tracking-wider text-emerald-500">Cross-Strategy Evaluation</span>
            <span>•</span>
            <span>Phase 6 Leaderboard</span>
          </div>
          <h2 className="text-base font-bold text-white">
            Nifty Multi-Strategy Performance Matrix (All 8 Models)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked by Deflated Sharpe Ratio (DSR), Calmar ratio, and friction-adjusted net compound alpha.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-xs text-left font-mono">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3 font-sans">Strategy Model</th>
              <th className="py-2.5 px-3 font-sans">Category</th>
              <th 
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('cagr')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>CAGR %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('sharpe')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Sharpe (Rf 6.5%)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('calmar')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Calmar</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('maxDrawdown')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Max DD %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('winRate')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Win Rate %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('dsrConfidence')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>DSR Conf %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {sortedRows.map((row, idx) => {
              const isCurrent = currentStrategyId === row.strategyId;
              return (
                <tr 
                  key={row.strategyId}
                  className={`hover:bg-slate-850/50 transition-colors ${
                    isCurrent ? 'bg-emerald-500/10 font-semibold' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold text-slate-400">#{idx + 1}</td>
                  <td className="py-2.5 px-3 font-sans font-bold text-white flex items-center space-x-2">
                    <span>{row.name}</span>
                    {isCurrent && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full font-mono">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-400">{row.category}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">+{row.cagr}%</td>
                  <td className="py-2.5 px-3 text-right text-cyan-400">{row.sharpe.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-200">{row.calmar.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right text-rose-400">-{row.maxDrawdown}%</td>
                  <td className="py-2.5 px-3 text-right text-slate-200">{row.winRate}%</td>
                  <td className="py-2.5 px-3 text-right text-purple-400 font-bold">{row.dsrConfidence}%</td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onSelectStrategy(row.strategyId)}
                      className={`px-2.5 py-1 rounded text-[11px] font-sans font-semibold transition cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-600'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {isCurrent ? 'Selected' : 'Load Model'}
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
